import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "./db";
import { siteSettings } from "@shared/schema";

export type ApiSettingKind = "url" | "secret" | "text";

export type ApiSettingDefinition = {
  key: string;
  label: string;
  description: string;
  kind: ApiSettingKind;
  envKey?: string;
  defaultValue?: string;
  required?: boolean;
};

export const API_SETTING_DEFINITIONS: ApiSettingDefinition[] = [
  {
    key: "nowpayments_api_url",
    label: "NOWPayments API URL",
    description: "Base URL used for hosted crypto invoices and payment status checks.",
    kind: "url",
    envKey: "NOWPAYMENTS_API_BASE_URL",
    defaultValue: "https://api.nowpayments.io/v1",
  },
  {
    key: "nowpayments_api_key",
    label: "NOWPayments API Key",
    description: "Server-side API key used to create and check crypto invoices.",
    kind: "secret",
    envKey: "NOWPAYMENTS_API_KEY",
    required: true,
  },
  {
    key: "nowpayments_ipn_secret",
    label: "NOWPayments IPN Secret",
    description: "Secret used to verify payment webhook signatures.",
    kind: "secret",
    envKey: "NOWPAYMENTS_IPN_SECRET",
    required: true,
  },
];

const definitionsByKey = new Map(API_SETTING_DEFINITIONS.map((definition) => [definition.key, definition]));
const ENCRYPTED_PREFIX = "enc:v1:";
const RETIRED_API_SETTING_KEYS = [
  "telegram_bot_token",
  "telegram_group_id",
  "stripe_secret_key",
  "stripe_webhook_secret",
  "forebit_account_id",
  "smtp_host",
  "smtp_port",
  "smtp_email",
  "smtp_password",
];

export function getApiSettingDefinition(key: string): ApiSettingDefinition | undefined {
  return definitionsByKey.get(key);
}

export function isKnownSecretKey(key: string): boolean {
  return getApiSettingDefinition(key)?.kind === "secret";
}

export function hasSettingsEncryptionKey(): boolean {
  return Boolean(process.env.SETTINGS_ENCRYPTION_KEY || process.env.SESSION_SECRET);
}

function getEncryptionKey(): Buffer {
  const masterSecret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!masterSecret) {
    throw new Error("Settings encryption is unavailable. Configure SETTINGS_ENCRYPTION_KEY or SESSION_SECRET.");
  }
  return createHash("sha256").update(masterSecret).digest();
}

export function encryptSettingValue(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTED_PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSettingValue(value: string): string {
  if (!value.startsWith(ENCRYPTED_PREFIX)) return value;

  const [, , ivEncoded, tagEncoded, dataEncoded] = value.split(":");
  if (!ivEncoded || !tagEncoded || !dataEncoded) {
    throw new Error("Stored setting has an invalid encrypted format.");
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivEncoded, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataEncoded, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Stored setting could not be decrypted. Check the settings encryption key.");
  }
}

export async function ensureApiSettingsSchema(): Promise<void> {
  await pool.query(`
    ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS is_secret BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'text',
      ADD COLUMN IF NOT EXISTS label TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  `);
}

export async function migrateLegacySecretSettings(): Promise<void> {
  const secretKeys = API_SETTING_DEFINITIONS
    .filter((definition) => definition.kind === "secret")
    .map((definition) => definition.key);
  const rows = await db.select().from(siteSettings);

  const legacyRows = rows.filter((row) => secretKeys.includes(row.key) && !row.isSecret && Boolean(row.value));
  if (legacyRows.length > 0 && !hasSettingsEncryptionKey()) {
    console.warn("[settings] Legacy secret migration skipped because no settings encryption key is configured.");
    return;
  }

  for (const row of legacyRows) {
    const encrypted = encryptSettingValue(row.value);
    await db
      .update(siteSettings)
      .set({ value: encrypted, isSecret: true, kind: "secret", updatedAt: new Date() })
      .where(eq(siteSettings.key, row.key));
  }
}

export async function removeRetiredApiSettings(): Promise<void> {
  for (const key of RETIRED_API_SETTING_KEYS) {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }
}

export async function getStoredApiSetting(key: string) {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return row;
}

export async function getRuntimeSetting(key: string, fallback?: string): Promise<string | undefined> {
  const row = await getStoredApiSetting(key);
  if (row) {
    if (!row.enabled) return undefined;
    if (isKnownSecretKey(key) && !row.isSecret) {
      throw new Error("A legacy secret must be encrypted before it can be used. Configure SETTINGS_ENCRYPTION_KEY or SESSION_SECRET and restart.");
    }
    return row.isSecret ? decryptSettingValue(row.value) : row.value;
  }

  const definition = getApiSettingDefinition(key);
  if (definition?.envKey && process.env[definition.envKey] !== undefined) {
    return process.env[definition.envKey];
  }
  return definition?.defaultValue ?? fallback;
}

function maskValue(value: string): string {
  return value ? "••••••••" : "";
}

function sourceFor(
  row: typeof siteSettings.$inferSelect | undefined,
  definition: ApiSettingDefinition | undefined,
): "database" | "environment" | "default" | "none" {
  if (row) return "database";
  if (definition?.envKey && process.env[definition.envKey]) return "environment";
  if (definition?.defaultValue !== undefined) return "default";
  return "none";
}

export async function listApiSettings() {
  const rows = await db.select().from(siteSettings);
  const rowsByKey = new Map(rows.map((row) => [row.key, row]));

  const known = API_SETTING_DEFINITIONS.map((definition) => {
    const row = rowsByKey.get(definition.key);
    const configured = row
      ? Boolean(row.value)
      : Boolean((definition.envKey && process.env[definition.envKey]) || definition.defaultValue);
    const effectiveEnabled = row ? row.enabled : true;
    const value = definition.kind === "secret"
      ? undefined
      : row?.value ?? (definition.envKey ? process.env[definition.envKey] : undefined) ?? definition.defaultValue ?? "";

    return {
      key: definition.key,
      label: definition.label,
      description: definition.description,
      kind: definition.kind,
      required: definition.required ?? false,
      configured,
      enabled: effectiveEnabled,
      source: sourceFor(row, definition),
      value,
      maskedValue: definition.kind === "secret" && configured ? maskValue("configured") : "",
      envKey: definition.envKey,
      custom: false,
    };
  });

  return known;
}

function validateValue(key: string, kind: ApiSettingKind, value: string): string {
  const trimmed = value.trim();
  if (kind === "url" && trimmed) {
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error("API URL must be a valid http or https URL.");
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("API URL must use http or https.");
    }
    if (key === "nowpayments_api_url") {
      if (parsed.hostname !== "api.nowpayments.io") {
        throw new Error("The NOWPayments API URL must use the official api.nowpayments.io host.");
      }
      if (parsed.protocol !== "https:") {
        throw new Error("The NOWPayments API URL must use HTTPS.");
      }
    }
    return trimmed.replace(/\/+$/, "");
  }
  return kind === "secret" ? value : trimmed;
}

export async function saveApiSetting(params: {
  key: string;
  value?: string;
  kind: ApiSettingKind;
  label?: string;
  enabled?: boolean;
}): Promise<void> {
  const definition = getApiSettingDefinition(params.key);
  const kind = definition?.kind ?? params.kind;
  const existing = await getStoredApiSetting(params.key);
  const nextValue = params.value === undefined
    ? existing?.value ?? ""
    : validateValue(params.key, kind, params.value);
  const shouldEncrypt = kind === "secret";
  const persistedValue = params.value === undefined
    ? shouldEncrypt && Boolean(nextValue) && !existing?.isSecret
      ? encryptSettingValue(nextValue)
      : nextValue
    : shouldEncrypt
      ? encryptSettingValue(nextValue)
      : nextValue;

  await db
    .insert(siteSettings)
    .values({
      key: params.key,
      value: persistedValue,
      isSecret: shouldEncrypt,
      enabled: params.enabled ?? existing?.enabled ?? true,
      kind,
      label: definition?.label ?? params.label ?? existing?.label ?? params.key,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: persistedValue,
        isSecret: shouldEncrypt,
        enabled: params.enabled ?? existing?.enabled ?? true,
        kind,
        label: definition?.label ?? params.label ?? existing?.label ?? params.key,
        updatedAt: new Date(),
      },
    });
}

export async function setApiSettingEnabled(key: string, enabled: boolean): Promise<void> {
  const existing = await getStoredApiSetting(key);
  if (!existing) {
    const definition = getApiSettingDefinition(key);
    if (!definition) throw new Error("Setting not found.");
    await saveApiSetting({ key, kind: definition.kind, enabled });
    return;
  }
  await db.update(siteSettings).set({ enabled, updatedAt: new Date() }).where(eq(siteSettings.key, key));
}

export async function deleteApiSetting(key: string): Promise<void> {
  await db.delete(siteSettings).where(eq(siteSettings.key, key));
}
