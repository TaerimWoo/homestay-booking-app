import { Box, Typography } from "@mui/material";
import HomeIcon           from "@mui/icons-material/Home";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import StarIcon           from "@mui/icons-material/Star";

function AnjungKampungLogo() {
  return (
    <svg width="290" viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
      {/* Card background */}
      <rect x="22" y="28" width="336" height="156" rx="18" fill="#FBF7EC" stroke="#E2D4B6" strokeWidth="1.5"/>

      {/* X ornament */}
      <line x1="87" y1="68" x2="97" y2="54" stroke="#1F4D3F" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="97" y1="68" x2="87" y2="54" stroke="#1F4D3F" strokeWidth="3.5" strokeLinecap="round"/>

      {/* Building base */}
      <rect x="66" y="120" width="52" height="34" rx="6" fill="#1F4D3F"/>

      {/* Minangkabau roof */}
      <path d="M54 114 C52 98 50 86 48 76 C58 88 66 94 72 96 C80 88 86 76 92 66 C98 76 104 88 112 96 C118 94 130 86 136 76 C134 86 132 102 130 114 Q92 124 54 114 Z" fill="#C0532A"/>

      {/* Door */}
      <path d="M82 154 L82 138 Q82 130 92 130 Q102 130 102 138 L102 154 Z" fill="#C0532A"/>

      {/* Stilts */}
      <line x1="74" y1="154" x2="74" y2="160" stroke="#1F4D3F" strokeWidth="4" strokeLinecap="round"/>
      <line x1="110" y1="154" x2="110" y2="160" stroke="#1F4D3F" strokeWidth="4" strokeLinecap="round"/>

      {/* Platform */}
      <rect x="56" y="160" width="72" height="6" rx="3" fill="#1F4D3F"/>

      {/* Divider */}
      <line x1="158" y1="76" x2="158" y2="158" stroke="#1F4D3F" strokeWidth="2" opacity="0.35"/>

      {/* Wordmark */}
      <text x="176" y="102"  fontFamily="Georgia, serif" fontSize="30" fontWeight="500" fill="#C0532A" letterSpacing="0.5">ANJUNG</text>
      <text x="176" y="134"  fontFamily="Georgia, serif" fontSize="30" fontWeight="500" fill="#1F4D3F" letterSpacing="0.5">KAMPUNG</text>
      <text x="177" y="152"  fontFamily="Georgia, serif" fontSize="10"  fill="#1F4D3F" letterSpacing="4"   opacity="0.75">KAMPUNG HOMESTAY</text>
    </svg>
  );
}

const FEATURES = [
  { icon: <HomeIcon sx={{ fontSize: 18 }} />,           label: "Authentic Kampung Experience" },
  { icon: <EventAvailableIcon sx={{ fontSize: 18 }} />, label: "Easy & Fast Booking"           },
  { icon: <StarIcon sx={{ fontSize: 18 }} />,           label: "Trusted by Families"           },
];

export default function BrandPanel() {
  return (
    <Box sx={{
      flex: 1,
      minWidth: 0,
      background: "linear-gradient(150deg, #163829 0%, #1F4D3F 55%, #245c4a 100%)",
      display: { xs: "none", md: "flex" },
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      p: 6,
    }}>
      {/* Decorative blobs */}
      <Box sx={{ position:"absolute", width:520, height:520, borderRadius:"50%", background:"rgba(192,83,42,0.10)", top:-210, right:-160, pointerEvents:"none" }}/>
      <Box sx={{ position:"absolute", width:360, height:360, borderRadius:"50%", background:"rgba(255,255,255,0.04)", bottom:-110, left:-110, pointerEvents:"none" }}/>
      <Box sx={{ position:"absolute", width:210, height:210, borderRadius:"50%", background:"rgba(192,83,42,0.07)", bottom:90, right:-60, pointerEvents:"none" }}/>

      {/* Logo */}
      <Box sx={{ mb: 4.5, filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.30))" }}>
        <AnjungKampungLogo />
      </Box>

      {/* Headline */}
      <Typography variant="h5" fontWeight="bold" color="white" textAlign="center"
        sx={{ mb: 1.5, letterSpacing: 0.4 }}>
        Rasa Macam Balik Kampung
      </Typography>

      {/* Subtext */}
      <Typography sx={{
        color: "rgba(255,255,255,0.62)", textAlign: "center",
        maxWidth: 320, mb: 4.5, lineHeight: 1.8, fontSize: "0.92rem",
      }}>
        Experience the warmth of traditional kampung living.
        Book your perfect homestay today.
      </Typography>

      {/* Feature pills */}
      <Box sx={{ display:"flex", flexDirection:"column", gap:1.5, width:"100%", maxWidth:320 }}>
        {FEATURES.map(({ icon, label }) => (
          <Box key={label} sx={{
            display:"flex", alignItems:"center", gap:1.5,
            backgroundColor:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.10)",
            borderRadius:3, px:2.5, py:1.4,
            backdropFilter:"blur(4px)",
          }}>
            <Box sx={{ color:"#E8855A", flexShrink:0 }}>{icon}</Box>
            <Typography sx={{ color:"rgba(255,255,255,0.85)", fontSize:"0.875rem" }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
