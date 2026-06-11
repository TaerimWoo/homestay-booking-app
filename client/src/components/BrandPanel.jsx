import { Box, Typography, Divider } from "@mui/material";
import { brand } from "../theme";
import illustrationUrl from "../assets/balik-kampung-illustration.svg";
import iconUrl         from "../assets/anjung-kampung-icon.svg";

const features = [
  { icon: "🏡", text: "Penginapan kampung tulen" },
  { icon: "🌿", text: "Suasana alam semula jadi" },
  { icon: "🤝", text: "Tuan rumah yang mesra" },
];

const DOT_COLORS = ["#FF5F57", "#FEBC2E", "#28C840"];

export default function BrandPanel() {
  return (
    <Box sx={{
      flex: 3,
      minWidth: 0,
      backgroundColor: brand.panelCream,
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Dots strip (slightly darker) ── */}
      <Box sx={{
        backgroundColor: "#EDE0CC",
        px: 2.8,
        pt: 2.6,
        pb: 2.4,
        display: "flex",
        gap: "8px",
      }}>
        {DOT_COLORS.map((color) => (
          <Box key={color} sx={{
            width: 14, height: 14,
            borderRadius: "50%",
            backgroundColor: color,
            flexShrink: 0,
          }} />
        ))}
      </Box>

      {/* Divider between dots and logo */}
      <Divider sx={{ borderColor: brand.border }} />

      {/* ── Logo row ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, px: 2.8, py: 2 }}>
        <img
          src={iconUrl}
          alt="Anjung Kampung"
          style={{ width: 52, height: "auto", display: "block" }}
        />
        <Box sx={{ lineHeight: 1 }}>
          <Typography sx={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: brand.terracotta,
            letterSpacing: "2.5px",
            lineHeight: 1.3,
          }}>
            ANJUNG
          </Typography>
          <Typography sx={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: brand.deepGreen,
            letterSpacing: "2.5px",
            lineHeight: 1.3,
          }}>
            KAMPUNG
          </Typography>
        </Box>
      </Box>

      {/* Divider below logo */}
      <Divider sx={{ borderColor: brand.border, mx: 2.8 }} />

      {/* ── Centred content ── */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 4, md: 5 },
        pb: { xs: 4, md: 5 },
        pt: 3,
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
          fontSize: { xs: "1.8rem", md: "2.1rem" },
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
    </Box>
  );
}
