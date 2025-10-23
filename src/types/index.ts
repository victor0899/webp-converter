export interface ConversionResult {
  original: string;
  output: string;
  status: "success" | "error" | "converting";
  message?: string;
  conversionTime?: number;
}
