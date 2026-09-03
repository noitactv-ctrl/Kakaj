import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { scrypt, randomBytes, randomInt, createHash, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, userIps, users } from "@shared/schema";
import type { PublicUser } from "@shared/routes";
import pgSession from "connect-pg-simple";
import { pool, db } from "./db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

declare module "express-session" {
  interface SessionData {
    captcha?: {
      answerHash: string;
      expiresAt: number;
    };
  }
}

function generateCaptchaCode(length = 5): string {
  return Array.from({ length }, () => CAPTCHA_CHARS[randomInt(CAPTCHA_CHARS.length)]).join("");
}

function captchaHash(value: string): Buffer {
  return createHash("sha256").update(value.trim().toLowerCase()).digest();
}

function generateCaptchaSvg(code: string): string {
  const lines = Array.from({ length: 6 }, () => {
    const x1 = randomInt(0, 120);
    const y1 = randomInt(0, 52);
    const x2 = randomInt(0, 120);
    const y2 = randomInt(0, 52);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9b6c4b" stroke-width="1.2" opacity=".5"/>`;
  }).join("");
  const chars = code.split("").map((char, index) => {
    const x = index * 24 + 12 + randomInt(-2, 3);
    const y = 26 + randomInt(-4, 5);
    const rotate = randomInt(-22, 23);
    const size = randomInt(20, 29);
    return `<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" font-size="${size}" fill="#5f3826" font-weight="bold" font-family="Georgia,serif" transform="rotate(${rotate},${x},${y})">${char}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="44" viewBox="0 0 120 52"><rect width="120" height="52" fill="#f8f8f6" rx="4"/>${lines}${chars}</svg>`;
}

export function publicUser(user: User): PublicUser {
  const { password, loginCode, telegramNameSignature, ...safeUser } = user;
  return { ...safeUser, isOwner: isFounderIdentity(user.email) };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePassword(supplied: string, stored: string) {
  if (!stored || !stored.includes(".")) return false;
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  if (hashedBuf.length !== 64 || !salt) return false;
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  if (hashedBuf.length !== suppliedBuf.length) return false;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateAnonUsername(): string {
  return "anon-" + randomBytes(4).toString("hex");
}

function emailsFromEnvironment(name: string): string[] {
  return (process.env[name] || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isFounderIdentity(email: string): boolean {
  return emailsFromEnvironment("OWNER_EMAILS").includes(email.trim().toLowerCase());
}

function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return isFounderIdentity(normalized) || emailsFromEnvironment("ADMIN_EMAILS").includes(normalized);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Too many accounts created from this IP. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export function setupAuth(app: Express) {
  const PGStore = pgSession(session);

  const sessionSecret = process.env.SESSION_SECRET;
  const insecureSessionSecrets = new Set([
    "",
    "replace-with-a-long-random-secret",
    "rulf_fallback_dev_secret_change_in_prod",
  ]);
  if (app.get("env") === "production" && insecureSessionSecrets.has(sessionSecret?.trim() ?? "")) {
    throw new Error("SESSION_SECRET must be set to a unique, non-template value in production.");
  }
  if (!sessionSecret) {
    console.warn("[SECURITY] SESSION_SECRET env var is not set — using insecure fallback. Set it in production.");
  }

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret || "rulf_fallback_dev_secret_change_in_prod",
    resave: false,
    saveUninitialized: false,
    store: new PGStore({ pool, createTableIfMissing: false }),
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, (user as User).id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      // If the user row was deleted (DB reset, manual delete, etc.) treat the
      // session as invalid so Passport clears it rather than serving a ghost user.
      if (!user) return done(null, false);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.get("/api/captcha", (req, res) => {
    const code = generateCaptchaCode();
    req.session.captcha = {
      answerHash: captchaHash(code).toString("hex"),
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    const image = `data:image/svg+xml;base64,${Buffer.from(generateCaptchaSvg(code)).toString("base64")}`;
    res.set("Cache-Control", "no-store");
    res.json({ image });
  });

  // Login — email + password + one-time CAPTCHA
  app.post("/api/login", loginLimiter, async (req, res, next) => {
    try {
      const { email, password, captcha } = req.body;
      if (!email || typeof email !== "string") return res.status(400).json({ message: "Email required" });
      if (!password || typeof password !== "string") return res.status(400).json({ message: "Password required" });
      const challenge = req.session.captcha;
      delete req.session.captcha;
      if (typeof captcha !== "string" || !challenge || challenge.expiresAt < Date.now()) {
        return res.status(400).json({ message: "CAPTCHA expired. Please refresh it." });
      }
      const expected = Buffer.from(challenge.answerHash, "hex");
      const supplied = captchaHash(captcha);
      if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
        return res.status(400).json({ message: "Incorrect CAPTCHA" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      if (user.isBanned) return res.status(401).json({ message: "This account has been suspended" });

      const valid = await comparePassword(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid email or password" });

      // Ensure server-configured owner/admin emails always have admin role.
      if (isAdminEmail(email) && user.role !== "admin") {
        await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
        user.role = "admin";
      }

      req.login(user, async (err) => {
        if (err) return next(err);
        try {
          const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
          await db.insert(userIps).values({ userId: user.id, ip });
        } catch {}
        res.status(200).json(publicUser(user));
      });
    } catch (err) {
      next(err);
    }
  });

  // Register — email + password, auto-generate username
  app.post("/api/register", registerLimiter, async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email required" });
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const normalEmail = email.trim().toLowerCase();

      // Check if email already taken
      const [existing] = await db.select().from(users).where(eq(users.email, normalEmail));
      if (existing) return res.status(400).json({ message: "An account with this email already exists" });

      const username = generateAnonUsername();
      const hashed = await hashPassword(password);

      const role = isAdminEmail(normalEmail) ? "admin" : "user";

      const user = await storage.createUser({
        username,
        email: normalEmail,
        password: hashed,
        loginCode: "",
        role,
      } as any);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(publicUser(user));
      });
    } catch (err: any) {
      if (err.code === "23505") {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      next(err);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(publicUser(req.user as User));
  });

  app.get("/api/user/login-code", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json({ loginCode: (req.user as User).loginCode ?? "" });
  });
}
