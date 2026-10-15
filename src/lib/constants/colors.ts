export interface ColorOption {
  name: string;
  hex: string;
  id?: string;
  isCustom?: boolean;
}

export const PRODUCT_COLORS: ColorOption[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Purple", hex: "#800080" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Grey", hex: "#808080" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Navy", hex: "#000080" },
  { name: "Maroon", hex: "#800000" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Teal", hex: "#008080" },
  { name: "Olive", hex: "#808000" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Burgundy", hex: "#800020" },
];

/**
 * Resolve hex code from color name or hex
 */
export function getColorHex(
  colorNameOrHex: string,
  customColors?: Array<{ name: string; hex: string }>
): string {
  if (!colorNameOrHex) return "#94a3b8";
  if (colorNameOrHex.startsWith("#")) return colorNameOrHex;

  const lower = colorNameOrHex.trim().toLowerCase();

  // Check custom colors first
  if (customColors && customColors.length > 0) {
    const foundCustom = customColors.find((c) => c.name.toLowerCase() === lower);
    if (foundCustom) return foundCustom.hex;
  }

  // Check default palette
  const found = PRODUCT_COLORS.find((c) => c.name.toLowerCase() === lower);
  return found ? found.hex : "#64748b";
}
