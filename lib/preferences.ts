export const THEME_OPTIONS = ["light", "dark", "system"] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

export const COST_BASIS_OPTIONS = [
  {
    value: "fifo",
    label: "FIFO",
    description: "Sells oldest lots first. Often preferred for tax-efficiency.",
  },
  {
    value: "lifo",
    label: "LIFO",
    description: "Sells newest lots first. Useful when tracking recent trades.",
  },
  {
    value: "bep",
    label: "BEP",
    description: "Uses the average cost of all shares to simplify reporting.",
  },
] as const;
export type PortfolioCostBasis = (typeof COST_BASIS_OPTIONS)[number]["value"];

export const FEE_RECOGNITION_OPTIONS = [
  {
    value: "cash",
    label: "Cash",
    description:
      "Fees hit cash immediately and impact P&L at the time incurred.",
  },
  {
    value: "accrual",
    label: "Accrual",
    description:
      "Fees roll into cost basis and affect P&L when the asset closes.",
  },
] as const;
export type FeeRecognitionMethod =
  (typeof FEE_RECOGNITION_OPTIONS)[number]["value"];

export const FX_PNL_METHOD_OPTIONS = [
  {
    value: "complex",
    label: "Comprehensive FX (Default)",
    description:
      "Values every position directly in your display currency with full historical FX context.",
  },
  {
    value: "simple_product",
    label: "Simplified FX (Product Level)",
    description:
      "Applies today’s FX rate at the product level for unrealized P&L. Realized P&L keeps historic FX.",
  },
  {
    value: "simple_account",
    label: "Simplified FX (Account Level)",
    description:
      "Applies today’s FX rate at the account level for unrealized P&L. Realized P&L keeps historic FX.",
  },
] as const;
export type FxPnlMethod = (typeof FX_PNL_METHOD_OPTIONS)[number]["value"];

export const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
] as const;
export type CurrencyOption = (typeof CURRENCY_OPTIONS)[number];

export type PersonalizationPreferences = {
  preInstructions: string;
  investmentStyle: number;
};

export type UserPreferences = {
  theme: ThemeOption;
  portfolio_currency: string;
  portfolio_agg_cost_basis: PortfolioCostBasis;
  portfolio_agg_fee_recognition: FeeRecognitionMethod;
  portfolio_fx_pnl_method: FxPnlMethod;
  assistant: PersonalizationPreferences;
};

export type PreferencesUpdateInput = Partial<
  Omit<UserPreferences, "assistant">
> & {
  assistant?: Partial<PersonalizationPreferences>;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  portfolio_currency: "USD",
  portfolio_agg_cost_basis: "bep",
  portfolio_agg_fee_recognition: "cash",
  portfolio_fx_pnl_method: "complex",
  assistant: {
    preInstructions: "",
    investmentStyle: 50,
  },
};

export function mergePreferences(
  overrides?: PreferencesUpdateInput
): UserPreferences {
  if (!overrides) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    ...DEFAULT_PREFERENCES,
    ...overrides,
    assistant: {
      ...DEFAULT_PREFERENCES.assistant,
      ...(overrides.assistant ?? {}),
    },
  };
}

export function isThemeOption(value: unknown): value is ThemeOption {
  return (
    typeof value === "string" && THEME_OPTIONS.includes(value as ThemeOption)
  );
}

export function getThemeFromValue(value?: string | null): ThemeOption | null {
  if (!value) {
    return null;
  }

  return isThemeOption(value) ? value : null;
}

export function isCostBasisOption(value: unknown): value is PortfolioCostBasis {
  return (
    typeof value === "string" &&
    COST_BASIS_OPTIONS.some((option) => option.value === value)
  );
}

export function isFeeRecognitionOption(
  value: unknown
): value is FeeRecognitionMethod {
  return (
    typeof value === "string" &&
    FEE_RECOGNITION_OPTIONS.some((option) => option.value === value)
  );
}

export function isFxMethodOption(value: unknown): value is FxPnlMethod {
  return (
    typeof value === "string" &&
    FX_PNL_METHOD_OPTIONS.some((option) => option.value === value)
  );
}

export function serializePreferences(value: UserPreferences): string {
  return JSON.stringify({
    ...value,
    assistant: {
      preInstructions: value.assistant.preInstructions,
      investmentStyle: value.assistant.investmentStyle,
    },
  });
}
