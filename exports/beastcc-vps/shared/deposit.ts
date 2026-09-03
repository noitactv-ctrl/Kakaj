export const DEPOSIT_BONUS_TIERS = [
  { minCents: 10_000, maxCents: 24_999, bonusPercent: 10 },
  { minCents: 25_000, maxCents: 49_999, bonusPercent: 13 },
  { minCents: 50_000, maxCents: 99_999, bonusPercent: 16 },
  { minCents: 100_000, maxCents: 249_999, bonusPercent: 20 },
  { minCents: 250_000, maxCents: 499_999, bonusPercent: 25 },
  { minCents: 500_000, maxCents: null, bonusPercent: 30 },
] as const;

export function getDepositBonusPercent(amountCents: number): number {
  const amount = Math.max(0, Math.round(amountCents));
  return DEPOSIT_BONUS_TIERS.find(tier =>
    amount >= tier.minCents && (tier.maxCents === null || amount <= tier.maxCents)
  )?.bonusPercent ?? 0;
}

export function calculateDepositCredit(grossCents: number, feePercent = 0) {
  const gross = Math.max(0, Math.round(grossCents));
  const feeRate = Math.max(0, Math.min(100, Number(feePercent) || 0));
  const feeCents = Math.round(gross * feeRate / 100);
  const bonusPercent = getDepositBonusPercent(gross);
  const bonusCents = Math.round(gross * bonusPercent / 100);

  return {
    grossCents: gross,
    feeCents,
    bonusCents,
    bonusPercent,
    creditCents: Math.max(0, gross - feeCents + bonusCents),
  };
}