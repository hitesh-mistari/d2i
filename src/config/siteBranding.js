import { predefinedPalettes } from '@/config/colorPalettes';

export const defaultBrandConfigValues = {
  siteName: "My Infographics",
  articleName: "Infographic Series",
  primaryColor: "#3B82F6", 
  footerColor: "#1F2937", 
  logoUrl: "",
  logoPlacement: "top-right", 
  showLogo: true,
  showFooter: true,
  footerText: "{articleName} | © Copyright {year}",
  font: "Poppins",
  fontWeight: "normal",
  backgroundColor: "#FFFFFF", 
  chartColorPalette: { type: 'predefined', key: 'default', colors: predefinedPalettes.default }, 
  titlePlacement: "top", 
  titleColor: "#333333",
  titleAlignment: "left",
  legendColor: "#333333",
  showGridLines: true,
  predictedNote: "",
  articleNameManuallySet: false,
  showChartBorder: true,
  chartBorderColor: "#cccccc",
  axisTickColor: "#666666",
  axisLabelColor: "#555555",
};

export const guestBrandConfigValues = {
  ...defaultBrandConfigValues,
  siteName: "Guest Session",
  articleName: "My Infographics",
  logoUrl: "",
  showLogo: false,
  showFooter: false,
  footerText: "Generated with DOCX to Infographics | © {year}",
  titleColor: "#333333",
  titleAlignment: "left",
  legendColor: "#4A5568",
  showGridLines: true,
  fontWeight: "normal",
  showChartBorder: true,
  chartBorderColor: "#cccccc",
  axisTickColor: "#666666",
  axisLabelColor: "#555555",
};

export const getFullFooterText = (footerTextTemplate, articleName = "Infographics") => {
  const currentYear = new Date().getFullYear();
  return footerTextTemplate
    .replace("{year}", currentYear)
    .replace("{articleName}", articleName || "Infographics");
};
