import { randomInt } from "crypto";
import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "./db";
import { decryptSettingValue, encryptSettingValue } from "./settings";
import { telegramLinkTokens, transactions, users, siteSettings, type User } from "@shared/schema";

const TOKEN_SETTING = "credit_bot_telegram_token";
const CHANNEL_SETTING = "credit_bot_channel_id";
const CHANNEL_LINK_SETTING = "credit_bot_channel_link";
const BOT_NAME_SETTING = "credit_bot_name";
const REQUIRED_NAME_SETTING = "credit_bot_required_name";
const ENABLED_SETTING = "credit_bot_enabled";
const REWARD_AMOUNT_SETTING = "credit_bot_reward_cents";
const DEFAULT_REWARD_CENTS = 25;
const REWARD_INTERVAL_MS = 24 * 60 * 60 * 1000;
const BRAND_NAME = "beastcc.xyz";
const DEFAULT_REQUIRED_NAME = BRAND_NAME;
const LINK_TOKEN_TTL_MS = 30 * 60 * 1000;

type TelegramUser = {
  id: number;
  is_bot?: boolean;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TelegramMember = {
  status?: string;
  is_member?: boolean;
  user?: TelegramUser;
};

type TelegramConfig = {
  token: string;
  channelId: string;
  channelLink: string;
  botName: string;
  requiredName: string;
  enabled: boolean;
  rewardCents: number;
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

let pollingStarted = false;
let polling = true;
let updateOffset = 0;

async function readSetting(key: string): Promise<string> {
  const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, key));
  return row?.value ?? "";
}

async function getTelegramConfig(): Promise<TelegramConfig> {
  let storedToken = "";
  try {
    const encrypted = await readSetting(TOKEN_SETTING);
    storedToken = encrypted ? decryptSettingValue(encrypted) : "";
  } catch {
    storedToken = "";
  }

  const storedEnabled = await readSetting(ENABLED_SETTING);
  const storedReward = Number(await readSetting(REWARD_AMOUNT_SETTING));
  return {
    token: storedToken || process.env.TELEGRAM_BOT_TOKEN?.trim() || "",
    channelId: (await readSetting(CHANNEL_SETTING)) || process.env.Telegram_group_id?.trim() || "",
    channelLink: await readSetting(CHANNEL_LINK_SETTING),
    botName: await readSetting(BOT_NAME_SETTING),
    requiredName: (await readSetting(REQUIRED_NAME_SETTING)).trim() || DEFAULT_REQUIRED_NAME,
    enabled: storedEnabled !== "false",
    rewardCents: Number.isInteger(storedReward) && storedReward > 0 && storedReward <= 100000
      ? storedReward
      : DEFAULT_REWARD_CENTS,
  };
}

export async function getTelegramPublicStatus() {
  const config = await getTelegramConfig();
  return {
    enabled: config.enabled,
    configured: Boolean(config.token),
    channelLink: config.channelLink,
    botName: config.botName,
    botUrl: getTelegramBotUrl(config.botName),
    requiredName: config.requiredName,
  };
}

export async function getTelegramBotStatus() {
  const config = await getTelegramConfig();
  const [linked] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(isNotNull(users.telegramChatId));
  return {
    enabled: config.enabled,
    configured: Boolean(config.token),
    channelConfigured: Boolean(config.channelId),
    channelId: config.channelId,
    channelLink: config.channelLink,
    botName: config.botName,
    botUrl: getTelegramBotUrl(config.botName),
    linkedUsers: Number(linked?.count ?? 0),
    rewardCents: config.rewardCents,
    rewardIntervalHours: 24,
    brandName: config.requiredName,
    requiredName: config.requiredName,
  };
}

export async function getTelegramBotUsers() {
  const allUsers = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      balance: users.balance,
      telegramUsername: users.telegramUsername,
      telegramChatId: users.telegramChatId,
      telegramNameSignature: users.telegramNameSignature,
      lastTelegramNameReward: users.lastTelegramNameReward,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return allUsers.map(user => {
    const profileParts = user.telegramNameSignature.split("|");
    const firstName = profileParts[1] ?? "";
    const lastName = profileParts[2] ?? "";
    const telegramName = `${firstName} ${lastName}`.trim();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      telegramUsername: user.telegramUsername || "",
      telegramName: telegramName || (user.telegramUsername ? `@${user.telegramUsername.replace(/^@/, "")}` : ""),
      telegramNameSet: Boolean(telegramName),
      telegramLinked: Boolean(user.telegramChatId),
      lastTelegramNameReward: user.lastTelegramNameReward,
      createdAt: user.createdAt,
    };
  });
}

export async function saveTelegramBotConfig(updates: {
  enabled?: boolean;
  channelId?: string;
  channelLink?: string;
  botName?: string;
  requiredName?: string;
  token?: string;
  rewardCents?: number;
}) {
  if (updates.token?.trim()) {
    await db.insert(siteSettings).values({
      key: TOKEN_SETTING,
      value: encryptSettingValue(updates.token.trim()),
      isSecret: true,
      kind: "secret",
      label: "Credit Bot Telegram Token",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: encryptSettingValue(updates.token.trim()), isSecret: true, kind: "secret", updatedAt: new Date() },
    });
  }
  if (updates.channelId !== undefined) {
    await db.insert(siteSettings).values({
      key: CHANNEL_SETTING,
      value: updates.channelId.trim(),
      isSecret: false,
      kind: "text",
      label: "Credit Bot Main Channel ID",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updates.channelId.trim(), updatedAt: new Date() },
    });
  }
  if (updates.channelLink !== undefined) {
    await db.insert(siteSettings).values({
      key: CHANNEL_LINK_SETTING,
      value: updates.channelLink.trim(),
      isSecret: false,
      kind: "text",
      label: "Credit Bot Main Channel Link",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updates.channelLink.trim(), updatedAt: new Date() },
    });
  }
  if (updates.botName !== undefined) {
    await db.insert(siteSettings).values({
      key: BOT_NAME_SETTING,
      value: updates.botName.trim(),
      isSecret: false,
      kind: "text",
      label: "Credit Bot Name",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updates.botName.trim(), updatedAt: new Date() },
    });
  }
  if (updates.requiredName !== undefined) {
    await db.insert(siteSettings).values({
      key: REQUIRED_NAME_SETTING,
      value: updates.requiredName.trim(),
      isSecret: false,
      kind: "text",
      label: "Credit Bot Required Telegram Name",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updates.requiredName.trim(), updatedAt: new Date() },
    });
  }
  if (updates.enabled !== undefined) {
    await db.insert(siteSettings).values({
      key: ENABLED_SETTING,
      value: updates.enabled ? "true" : "false",
      isSecret: false,
      kind: "text",
      label: "Credit Bot Enabled",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updates.enabled ? "true" : "false", updatedAt: new Date() },
    });
  }
  if (updates.rewardCents !== undefined) {
    await db.insert(siteSettings).values({
      key: REWARD_AMOUNT_SETTING,
      value: String(updates.rewardCents),
      isSecret: false,
      kind: "number",
      label: "Credit Bot Daily Reward",
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: String(updates.rewardCents), updatedAt: new Date() },
    });
  }
  return getTelegramBotStatus();
}

async function telegramApi<T>(method: string, body: Record<string, unknown> = {}, tokenOverride?: string): Promise<T> {
  const token = tokenOverride || (await getTelegramConfig()).token;
  if (!token) throw new Error("Telegram bot token is not configured");

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as TelegramApiResponse<T>;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `Telegram API request failed (${response.status})`);
  }
  return payload.result as T;
}

async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  tokenOverride?: string,
  options?: { replyMarkup?: Record<string, unknown>; parseMode?: "HTML" },
): Promise<void> {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    ...(options?.parseMode ? { parse_mode: options.parseMode } : {}),
  }, tokenOverride);
}

async function getChannelMember(channelId: string, userId: number, token: string): Promise<TelegramMember> {
  return telegramApi<TelegramMember>("getChatMember", { chat_id: channelId, user_id: userId }, token);
}

function profileSignature(user: TelegramUser): string {
  return [
    user.username ?? "",
    user.first_name ?? "",
    user.last_name ?? "",
  ].map(value => value.trim().toLowerCase()).join("|");
}

function hasRequiredName(user: TelegramUser, requiredName: string): boolean {
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase().includes(requiredName.toLowerCase());
}

function isChannelMember(member: TelegramMember): boolean {
  return ["creator", "administrator", "member"].includes(member.status ?? "")
    || (member.status === "restricted" && member.is_member !== false);
}

function formatRemaining(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours}h ${remainder}m` : `${minutes}m`;
}

function getTelegramBotUrl(botName: string): string {
  const value = botName.trim();
  if (!value) return "";
  if (/^https?:\/\/t\.me\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, "")}`;
}

async function findLinkedUser(chatId: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.telegramChatId, chatId));
  return user;
}

export async function createTelegramLinkToken(userId: number): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const token = `${randomInt(1, 10)}${Array.from({ length: 15 }, () => randomInt(0, 10)).join("")}`;
    try {
      const result = await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${userId})`);
        const [existing] = await tx
          .select({ token: telegramLinkTokens.token, createdAt: telegramLinkTokens.createdAt })
          .from(telegramLinkTokens)
          .where(eq(telegramLinkTokens.userId, userId));
        if (existing && Date.now() - existing.createdAt.getTime() <= LINK_TOKEN_TTL_MS) {
          return existing.token;
        }
        if (existing) await tx.delete(telegramLinkTokens).where(eq(telegramLinkTokens.userId, userId));
        await tx.insert(telegramLinkTokens).values({ token, userId });
        return token;
      });
      return result;
    } catch (error: any) {
      if (error?.code === "23505") continue;
      throw error;
    }
  }
  throw new Error("Could not generate an account number. Please try again.");
}

export async function getTelegramLinkToken(userId: number): Promise<{ token: string; createdAt: Date } | undefined> {
  const [row] = await db
    .select({ token: telegramLinkTokens.token, createdAt: telegramLinkTokens.createdAt })
    .from(telegramLinkTokens)
    .where(eq(telegramLinkTokens.userId, userId));
  if (!row || Date.now() - row.createdAt.getTime() > LINK_TOKEN_TTL_MS) {
    if (row) await db.delete(telegramLinkTokens).where(eq(telegramLinkTokens.userId, userId));
    return undefined;
  }
  return row;
}

async function claimLinkToken(token: string, chatId: string, telegramUser: TelegramUser): Promise<User | undefined> {
  const [linked] = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${token}))`);
    const [row] = await tx
      .select()
      .from(telegramLinkTokens)
      .where(eq(telegramLinkTokens.token, token));
    if (!row || Date.now() - row.createdAt.getTime() > LINK_TOKEN_TTL_MS) return [];

    await tx.delete(telegramLinkTokens).where(eq(telegramLinkTokens.id, row.id));
    await tx
      .update(users)
      .set({
        telegramChatId: null,
        telegramUsername: "",
        telegramNameSignature: "",
        lastTelegramNameReward: null,
      })
      .where(and(eq(users.telegramChatId, chatId), ne(users.id, row.userId)));
    return tx
      .update(users)
      .set({
        telegramChatId: chatId,
        telegramUsername: telegramUser.username ?? "",
        telegramNameSignature: profileSignature(telegramUser),
        lastTelegramNameReward: null,
      })
      .where(eq(users.id, row.userId))
      .returning();
  });
  return linked;
}

async function applyRewardIfDue(userId: number, signature: string, rewardCents: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        balance: sql`${users.balance} + ${rewardCents}`,
        lastTelegramNameReward: new Date(),
      })
      .where(and(
        eq(users.id, userId),
        eq(users.telegramNameSignature, signature),
        sql`(${users.lastTelegramNameReward} IS NULL OR ${users.lastTelegramNameReward} <= NOW() - INTERVAL '24 hours')`,
      ))
      .returning({ id: users.id });
    if (!updated) return false;

    await tx.insert(transactions).values({
      userId,
      amount: rewardCents,
      type: "telegram_reward",
      description: "Telegram 24-hour rep reward",
      paymentMethod: "Telegram",
    });
    return true;
  });
}

async function synchronizeUser(
  linkedUser: User,
  telegramUser: TelegramUser,
  config: TelegramConfig,
  memberOverride?: TelegramMember,
): Promise<{ rewarded: boolean; reset: boolean; member: boolean; nameEligible: boolean; error?: string }> {
  const signature = profileSignature(telegramUser);
  const reset = linkedUser.telegramNameSignature !== signature;
  const nameEligible = hasRequiredName(telegramUser, config.requiredName);

  if (!config.channelId) {
    if (reset || linkedUser.telegramNameEligible !== nameEligible) {
      await db.update(users).set({
        telegramUsername: telegramUser.username ?? "",
        telegramNameSignature: signature,
        telegramNameEligible: nameEligible,
        lastTelegramNameReward: reset ? null : linkedUser.lastTelegramNameReward,
      }).where(eq(users.id, linkedUser.id));
    }
    return { rewarded: false, reset, member: false, nameEligible, error: "The main channel is not configured yet." };
  }

  let member: TelegramMember;
  try {
    member = memberOverride ?? await getChannelMember(config.channelId, telegramUser.id, config.token);
  } catch (error: any) {
    return { rewarded: false, reset, member: linkedUser.telegramChannelMember, nameEligible, error: "I could not verify the main channel right now. Please try again later." };
  }

  const joined = isChannelMember(member);
  await db.update(users).set({
    telegramUsername: telegramUser.username ?? "",
    telegramNameSignature: signature,
    telegramChannelMember: joined,
    telegramNameEligible: nameEligible,
    ...(reset ? { lastTelegramNameReward: null } : {}),
  }).where(eq(users.id, linkedUser.id));
  if (!joined || !nameEligible || !config.enabled || reset) {
    return { rewarded: false, reset, member: joined, nameEligible };
  }

  const rewarded = await applyRewardIfDue(linkedUser.id, signature, config.rewardCents);
  return { rewarded, reset: false, member: joined, nameEligible };
}

async function statusMessage(user: User, telegramUser: TelegramUser, config: TelegramConfig, result?: Awaited<ReturnType<typeof synchronizeUser>>): Promise<string> {
  if (!config.enabled) return "The rewards bot is turned off right now. We’ll let you know when it’s back up.";
  if (result?.error) return result.error;
  const member = result?.member ?? false;
  const nameEligible = result?.nameEligible ?? hasRequiredName(telegramUser, config.requiredName);
  const lines = [
    result?.reset
      ? "Your Telegram name changed, so your 24-hour reward timer has restarted."
      : "Your rewards status:",
    `• ${nameEligible ? "Name rule passed" : `Your name must include ${config.requiredName}, please change it back to keep earning.`}`,
    `• ${member ? "Main channel joined" : "You left main channel, please rejoin to keep earning."}`,
  ];
  if (!member && config.channelLink) lines.push(`Rejoin here: ${config.channelLink}`);
  if (result?.rewarded) {
    lines.push(`✅ ${formatCredit(config.rewardCents)} store credit was added.`);
  } else if (nameEligible && member && user.lastTelegramNameReward) {
    const next = user.lastTelegramNameReward.getTime() + REWARD_INTERVAL_MS - Date.now();
    if (next > 0) lines.push(`Next reward in ${formatRemaining(next)}.`);
  } else if (nameEligible && member && !result?.reset) {
    lines.push("✅ You’re eligible. Your next reward will be checked automatically.");
  }
  return lines.join("\n");
}

function formatCredit(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function escapeTelegramHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getStartMessage(config: TelegramConfig): {
  text: string;
  replyMarkup?: Record<string, unknown>;
} {
  const inlineKeyboard: Array<Array<Record<string, unknown>>> = [];
  if (config.channelLink) {
    inlineKeyboard.push([{ text: "Join main channel", url: config.channelLink }]);
  }

  return {
    text: `👋 Welcome to the beastcc.xyz rewards bot!\n\nEarn ${formatCredit(config.rewardCents)} in store credit every 24 hours.\n\nRules:\n• <code>${escapeTelegramHtml(config.requiredName)}</code> must be in your first or last name.\n• You must be part of our main channel.\n\nTo start, send your 16-digit account number from beastcc.xyz/link. If you need to change accounts later, use /relink followed by a new number.`,
    ...(inlineKeyboard.length ? { replyMarkup: { inline_keyboard: inlineKeyboard } } : {}),
  };
}

async function handleMessage(message: any, config: TelegramConfig): Promise<void> {
  const from = message?.from as TelegramUser | undefined;
  const chatId = message?.chat?.id;
  const text = typeof message?.text === "string" ? message.text.trim() : "";
  if (!from || from.is_bot || chatId === undefined) return;

  if (!config.enabled) {
    await sendTelegramMessage(chatId, "The rewards bot is turned off right now. Please check back later.", config.token);
    return;
  }

  const linked = await findLinkedUser(String(chatId));
  const command = text.split(/\s+/)[0]?.toLowerCase();
  if (command === "/start") {
    const startMessage = getStartMessage(config);
    await sendTelegramMessage(chatId, startMessage.text, config.token, {
      replyMarkup: startMessage.replyMarkup,
      parseMode: "HTML",
    });
    return;
  }
  if (command === "/link") {
    await sendTelegramMessage(chatId, linked
      ? "Your Telegram is already linked. Use /relink 1234567890123456 to link a different account."
      : "Open beastcc.xyz/link. Your 16-digit account number is created automatically; copy it and send that number here.", config.token);
    return;
  }
  if (command === "/relink") {
    const relinkToken = text.split(/\s+/)[1] ?? "";
    if (!/^\d{16}$/.test(relinkToken)) {
      await sendTelegramMessage(chatId, "Use /relink followed by the 16-digit account number from beastcc.xyz/link.", config.token);
      return;
    }
    const claimed = await claimLinkToken(relinkToken, String(chatId), from);
    if (!claimed) {
      await sendTelegramMessage(chatId, "That 16-digit account number is invalid, expired, or already used. Generate a new one at beastcc.xyz/link.", config.token);
      return;
    }
    const result = await synchronizeUser(claimed, from, config);
    await sendTelegramMessage(chatId, `✅ Your beastcc.xyz account was relinked.\n\n${await statusMessage(claimed, from, config, result)}`, config.token);
    return;
  }
  if (command === "/status" && linked) {
    const result = await synchronizeUser(linked, from, config);
    await sendTelegramMessage(chatId, await statusMessage(linked, from, config, result), config.token);
    return;
  }

  if (/^\d{16}$/.test(text)) {
    const claimed = await claimLinkToken(text, String(chatId), from);
    if (!claimed) {
       await sendTelegramMessage(chatId, "That 16-digit account number is invalid, expired, or already used. Generate a new one at beastcc.xyz/link.", config.token);
      return;
    }
      const result = await synchronizeUser(claimed, from, config);
      await sendTelegramMessage(chatId, `✅ Your beastcc.xyz account is linked.\n\n${await statusMessage(claimed, from, config, result)}`, config.token);
    return;
  }

  if (linked) {
    const result = await synchronizeUser(linked, from, config);
    await sendTelegramMessage(chatId, await statusMessage(linked, from, config, result), config.token);
  } else {
    await sendTelegramMessage(chatId, "Send /start to begin, then use your 16-digit account number from beastcc.xyz/link.", config.token);
  }
}

export async function broadcastTelegramMessage(text: string): Promise<{ sent: number; failed: number }> {
  const config = await getTelegramConfig();
  if (!config.token) throw new Error("Telegram bot token is not configured");
  const linkedUsers = await db.select({ id: users.id, chatId: users.telegramChatId }).from(users).where(isNotNull(users.telegramChatId));
  let sent = 0;
  let failed = 0;
  for (const user of linkedUsers) {
    if (!user.chatId) continue;
    try {
      await sendTelegramMessage(user.chatId, text, config.token);
      sent++;
    } catch {
      failed++;
    }
  }
  return { sent, failed };
}

async function syncAllLinkedUsers(): Promise<void> {
  const config = await getTelegramConfig();
  if (!config.enabled || !config.token || !config.channelId) return;
  const linkedUsers = await db.select().from(users).where(isNotNull(users.telegramChatId));
  for (const linked of linkedUsers) {
    if (!linked.telegramChatId) continue;
    try {
      const member = await getChannelMember(config.channelId, Number(linked.telegramChatId), config.token);
      const telegramUser = member.user;
      if (!telegramUser) continue;
      const result = await synchronizeUser(linked, telegramUser, config, member);
      const leftChannel = linked.telegramChannelMember && !result.member;
      const nameChanged = linked.telegramNameEligible && !result.nameEligible;
      if (result.rewarded) {
         await sendTelegramMessage(linked.telegramChatId, `✅ ${formatCredit(config.rewardCents)} store credit was added for repping ${config.requiredName}.`, config.token);
      } else if (result.reset || leftChannel || nameChanged) {
        await sendTelegramMessage(linked.telegramChatId, await statusMessage(linked, telegramUser, config, result), config.token);
      }
    } catch {
      // A single user's membership check must not stop the reward sweep.
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollingLoop(): Promise<void> {
  while (polling) {
    const config = await getTelegramConfig();
    if (!config.token) {
      await delay(60_000);
      continue;
    }
    try {
      const updates = await telegramApi<any[]>("getUpdates", {
        offset: updateOffset,
        timeout: 25,
        allowed_updates: ["message"],
      }, config.token);
      for (const update of updates ?? []) {
        updateOffset = Math.max(updateOffset, Number(update.update_id) + 1);
        try {
          await handleMessage(update.message, config);
        } catch {
          // Keep polling even if one malformed update fails.
        }
      }
    } catch {
      await delay(5_000);
    }
  }
}

export function startTelegramBot(): void {
  if (pollingStarted) return;
  pollingStarted = true;
  polling = true;
  void pollingLoop();
  setInterval(() => { void syncAllLinkedUsers(); }, 15 * 60 * 1000);
  void syncAllLinkedUsers();
}

export function stopTelegramBot(): void {
  polling = false;
}

export const telegramBotConstants = {
  rewardCents: DEFAULT_REWARD_CENTS,
  rewardIntervalHours: 24,
  brandName: DEFAULT_REQUIRED_NAME,
};