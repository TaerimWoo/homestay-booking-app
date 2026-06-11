import { Box, Typography } from "@mui/material";
import { brand } from "../theme";
import illustrationUrl from "../assets/balik-kampung-illustration.svg";

const features = [
  { icon: "🏡", text: "Penginapan kampung tulen" },
  { icon: "🌿", text: "Suasana alam semula jadi" },
  { icon: "🤝", text: "Tuan rumah yang mesra" },
];

export default function BrandPanel() {
  return (
    <Box sx={{
      flex: 1,
      minWidth: 0,
      backgroundColor: brand.panelCream,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: { xs: 4, md: 5 },
    }}>
      <Box sx={{ width: "100%", maxWidth: 380, mb: 3.5 }}>
        <img
          src={illustrationUrl}
          alt="Keluarga tiba di kampung"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      <Typography sx={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: { xs: "1.8rem", md: "2.15rem" },
        fontWeight: 700,
        color: brand.deepGreen,
        textAlign: "center",
        lineHeight: 1.3,
        mb: 1.2,
        maxWidth: 340,
      }}>
        Rasa macam balik kampung
      </Typography>

      <Typography sx={{
        fontSize: "0.9rem",
        color: brand.muted,
        textAlign: "center",
        mb: 3.5,
        maxWidth: 300,
        lineHeight: 1.75,
      }}>
        Pengalaman menginap di rumah kampung yang asli — tenang, mesra, dan penuh kenangan.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%", maxWidth: 320 }}>
        {features.map(({ icon, text }) => (
          <Box key={text} sx={{
            backgroundColor: "white",
            border: `0.5px solid ${brand.border}`,
            borderRadius: "10px",
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}>
            <Typography sx={{ fontSize: "1.15rem", lineHeight: 1 }}>{icon}</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: brand.text, fontWeight: 500 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
