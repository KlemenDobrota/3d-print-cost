import type { Settings } from "@/types";

export const DEFAULT_SETTINGS: Omit<Settings, "id"> = {
  electricityRate: 0.25,
  labourRate: 15.0,
  defaultMarkup: 200,
  defaultFailureRate: 5,
  pricingMode: "markup",
};
