export const colorPresets = [
  { name: "Ocean Blue", primary: "#3b82f6", buttonBg: "#3b82f6", navbarBg: "#0f172a" },
  { name: "Emerald Luxe", primary: "#10b981", buttonBg: "#10b981", navbarBg: "#064e3b" },
  { name: "Royal Violet", primary: "#8b5cf6", buttonBg: "#8b5cf6", navbarBg: "#2e1065" },
  { name: "Rose Crimson", primary: "#f43f5e", buttonBg: "#f43f5e", navbarBg: "#4c0519" },
  { name: "Amber Sunset", primary: "#f97316", buttonBg: "#f97316", navbarBg: "#431407" },
  { name: "Midnight Teal", primary: "#06b6d4", buttonBg: "#06b6d4", navbarBg: "#083344" },
];

export const supportedFonts = [
  { id: "Inter", name: "Inter (Clean & Modern)" },
  { id: "Poppins", name: "Poppins (Geometric & Trendy)" },
  { id: "Roboto", name: "Roboto (Neutral & Legible)" },
  { id: "Playfair Display", name: "Playfair Display (Editorial & Luxury)" },
  { id: "Montserrat", name: "Montserrat (Bold & Contemporary)" },
];

export const getStockLabel = (type: string | null, colorSubType?: string | null) => {
  if (type === "AVAILABILITY") return "Option 1: Manage Stock Availability";
  if (type === "QUANTITY") return "Option 2: Manage Stock Quantity";
  if (type === "COLOR_WISE") {
    return colorSubType === "QUANTITY"
      ? "Option 3: Color-wise Inventory & Image Upload (Quantity Mode)"
      : "Option 3: Color-wise Inventory & Image Upload (Availability Mode)";
  }
  return "Not Configured";
};
