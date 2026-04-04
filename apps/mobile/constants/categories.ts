export const CATEGORIES = [
  { key: "clothing", label: "Clothing", icon: "shirt" },
  { key: "gear", label: "Gear & Equipment", icon: "baby" },
  { key: "toys", label: "Toys & Books", icon: "blocks" },
  { key: "nursery", label: "Nursery & Furniture", icon: "lamp" },
  { key: "feeding", label: "Feeding & Nursing", icon: "cup-soda" },
  { key: "bath", label: "Bath & Diapering", icon: "bath" },
  { key: "maternity", label: "Maternity", icon: "heart" },
  { key: "other", label: "Other", icon: "package" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
