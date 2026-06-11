import { createTheme } from "@mui/material/styles";

/* ── Anjung Kampung brand tokens ── */
export const brand = {
  deepGreen:       "#1F4D3F",
  headerGreen:     "#2A5547",
  terracotta:      "#C0532A",
  lightTerracotta: "#CF6A3E",
  cream:           "#FBF7EC",
  panelCream:      "#FCF6E9",
  text:            "#33312C",
  muted:           "#8A8578",
  border:          "#E2D4B6",
  sage:            "#A9C6B8",
};

const theme = createTheme({
  palette: {
    brand,
    background: { default: brand.cream },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      "Lato",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
  },
});

export default theme;
