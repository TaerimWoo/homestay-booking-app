import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailIcon          from "@mui/icons-material/Email";
import LockOutlinedIcon   from "@mui/icons-material/LockOutlined";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import { REGISTER_USER } from "../graphql";
import BrandPanel from "../components/BrandPanel";

/* ── Last-character-only peek (unchanged) ── */
function useLastCharPeek() {
  const [real, setReal]       = useState("");
  const [peeking, setPeeking] = useState(false);
  const timer                 = useRef(null);

  const masked =
    real.length === 0
      ? ""
      : "•".repeat(peeking ? real.length - 1 : real.length) +
        (peeking ? real[real.length - 1] : "");

  const onMasked = (e) => {
    const next = e.target.value, prev = masked;
    if (next.length > prev.length) {
      setReal((r) => r + next.slice(prev.length));
      setPeeking(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPeeking(false), 1000);
    } else if (next.length < prev.length) {
      setReal((r) => r.slice(0, r.length - (prev.length - next.length)));
      setPeeking(false);
      clearTimeout(timer.current);
    }
  };
  const onRevealed = (val) => { setReal(val); setPeeking(false); clearTimeout(timer.current); };
  return { real, masked, onMasked, onRevealed, peeking };
}

/* ── Anjung Kampung logo — exact SVG from assets, inlined for #person.hide animation ── */
function AnjungLogo({ hideCharacter }) {
  return (
    <svg viewBox="0 0 220 130" width="220" height="130" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Anjung Kampung logo"
      style={{ display: "block", margin: "0 auto" }}>
      <style>{`
        #person { transition: transform .32s ease; }
        #person.hide { transform: translate(-44px, 4px); }
      `}</style>

      {/* Minangkabau house mark (curved gonjong roof) */}
      <path d="M16 94 C14 80 13 70 12 62 C21 72 28 77 33 79 C39 72 41 62 44 54 C46 62 49 72 55 79 C60 77 67 72 76 62 C75 70 74 84 72 94 Q44 102 16 94 Z" fill="#CF6A3E"/>
      <line x1="40" y1="56" x2="47" y2="47" stroke="#F4ECD9" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="47" y1="56" x2="40" y2="47" stroke="#F4ECD9" strokeWidth="2.2" strokeLinecap="round"/>
      <rect x="27" y="94" width="24" height="15" rx="2" fill="#F4ECD9"/>
      <rect x="35" y="99" width="8" height="10" rx="1" fill="#234E40"/>
      <rect x="20" y="109" width="44" height="4" rx="2" fill="#F4ECD9"/>

      {/* Person — drawn BEFORE the tree so the tree hides him when .hide is applied */}
      <g id="person" className={hideCharacter ? "hide" : ""}>
        <path d="M184 85 A6 6 0 0 1 196 85 Z" fill="#5A3E28"/>
        <circle cx="190" cy="86" r="6" fill="#E3AC7E"/>
        <circle cx="188" cy="86" r="0.9" fill="#2C2A28"/>
        <circle cx="192" cy="86" r="0.9" fill="#2C2A28"/>
        <path d="M188 89 Q190 91 192 89" fill="none" stroke="#9A6A3A" strokeWidth="0.9" strokeLinecap="round"/>
        <path d="M184 92 L196 92 L194 104 L186 104 Z" fill="#CF6A3E"/>
        <line x1="185" y1="94" x2="180" y2="100" stroke="#CF6A3E" strokeWidth="2.6" strokeLinecap="round"/>
        <line x1="195" y1="94" x2="200" y2="100" stroke="#CF6A3E" strokeWidth="2.6" strokeLinecap="round"/>
        <line x1="188" y1="104" x2="186" y2="112" stroke="#234E40" strokeWidth="2.6" strokeLinecap="round"/>
        <line x1="192" y1="104" x2="194" y2="112" stroke="#234E40" strokeWidth="2.6" strokeLinecap="round"/>
      </g>

      {/* Coconut tree + bush — drawn AFTER person so they occlude him when hidden */}
      <ellipse cx="150" cy="108" rx="24" ry="9" fill="#3E6B5A"/>
      <path d="M150 110 Q152 82 156 54" fill="none" stroke="#F4ECD9" strokeWidth="4" strokeLinecap="round"/>
      <path d="M156 54 C144 44 138 44 132 47" fill="none" stroke="#F4ECD9" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M156 54 C144 54 139 59 135 65" fill="none" stroke="#F4ECD9" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M156 54 C155 40 157 34 160 30" fill="none" stroke="#F4ECD9" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M156 54 C168 44 173 44 177 49" fill="none" stroke="#F4ECD9" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M156 54 C169 54 174 59 177 65" fill="none" stroke="#F4ECD9" strokeWidth="2.6" strokeLinecap="round"/>
      <circle cx="152" cy="60" r="2.2" fill="#CF6A3E"/>
      <circle cx="159" cy="62" r="2.2" fill="#CF6A3E"/>
    </svg>
  );
}

/* ── Shared styles ── */
const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px",
    backgroundColor: "white",
    "& fieldset":             { borderColor: "#E2D4B6" },
    "&:hover fieldset":       { borderColor: "#C0532A70" },
    "&.Mui-focused fieldset": { borderColor: "#1F4D3F", borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input": { py: "11px", fontSize: "0.915rem", color: "#33312C" },
};

function FieldLabel({ htmlFor, children }) {
  return (
    <Typography component="label" htmlFor={htmlFor}
      sx={{ display:"block", mb:0.6, fontSize:"0.82rem", color:"#33312C", fontWeight:500 }}>
      {children}
    </Typography>
  );
}

const BTN_PRIMARY = {
  backgroundColor: "#C0532A",
  color: "#FBF7EC",
  "&:hover": { backgroundColor: "#A84424" },
  borderRadius: "9px",
  py: 1.35,
  fontWeight: 600,
  fontSize: "0.95rem",
  textTransform: "none",
  boxShadow: "0 2px 10px rgba(192,83,42,0.28)",
  letterSpacing: 0.3,
};

/* ─────────────────────────────────────────────── */
export default function Register({ setShowRegister }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const pass    = useLastCharPeek();
  const confirm = useLastCharPeek();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError,   setFormError]   = useState("");
  const [success,     setSuccess]     = useState(false);

  /* which password field is focused (for tree animation) */
  const [passFocused,    setPassFocused]    = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const hideCharacter = (passFocused && !showPass) || (confirmFocused && !showConfirm);

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const makePassChange = (hook, isRevealed) => (e) => {
    setFormError("");
    isRevealed ? hook.onRevealed(e.target.value) : hook.onMasked(e);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    if (pass.real.length < 6) { setFormError("Kata laluan mestilah sekurang-kurangnya 6 aksara."); return; }
    if (pass.real !== confirm.real) { setFormError("Kata laluan tidak sepadan."); return; }
    try {
      await registerUser({ variables: { name, email, password: pass.real } });
      setSuccess(true);
      setTimeout(() => setShowRegister(false), 1800);
    } catch (err) {
      setFormError(err.message || "Pendaftaran gagal. Sila cuba lagi.");
    }
  };

  const passDisplay    = showPass    ? pass.real    : pass.masked;
  const confirmDisplay = showConfirm ? confirm.real : confirm.masked;

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(16px) scale(0.98); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>

      {/* ── Page background ── */}
      <Box sx={{
        minHeight: "100vh",
        backgroundColor: "#FBF7EC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs:0, sm:2, md:3 },
      }}>
        {/* ── Container card ── */}
        <Box sx={{
          display: "flex",
          flexDirection: { xs:"column-reverse", md:"row" },
          width: "100%",
          maxWidth: { md:1060 },
          minHeight: { xs:"100vh", md:"auto" },
          borderRadius: { xs:0, md:"20px" },
          overflow: "hidden",
          boxShadow: { xs:"none", md:"0 8px 52px rgba(31,77,63,0.16)" },
          animation: "cardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>
          <BrandPanel />

          {/* ── Auth side ── */}
          <Box sx={{
            flex: { md: 2 },
            width: { xs:"100%" },
            minWidth: { md: 360 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}>

            {/* ── Green header ── */}
            <Box sx={{ backgroundColor:"#2A5547", pt:4, pb:3, px:3, textAlign:"center" }}>
              <AnjungLogo hideCharacter={hideCharacter} />
              <Typography sx={{
                fontFamily:"'Playfair Display', Georgia, serif",
                fontSize:"1.2rem", fontWeight:600,
                color:"#FBF7EC", mt:1.8, letterSpacing:0.3,
              }}>
                Anjung Kampung
              </Typography>
              <Typography sx={{ color:"#C0532A", fontSize:"0.68rem", letterSpacing:"3px", fontWeight:600, mt:0.4 }}>
                KAMPUNG HOMESTAY
              </Typography>
              <Typography sx={{ color:"#A9C6B8", fontSize:"0.8rem", mt:0.8 }}>
                Sertai kami — buat akaun baharu
              </Typography>
            </Box>

            {/* ── Form body ── */}
            <Box component="form" onSubmit={handleRegister}
              sx={{ backgroundColor:"white", px:{ xs:3, md:4 }, pt:3.5, pb:4, flex:1 }}>

              {formError && (
                <Alert severity="error" sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>{formError}</Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>
                  Pendaftaran berjaya! Mengalihkan ke log masuk…
                </Alert>
              )}

              {/* Full name */}
              <Box sx={{ mb:2.2 }}>
                <FieldLabel htmlFor="reg-name">Full name</FieldLabel>
                <TextField id="reg-name" hiddenLabel placeholder="Nama penuh"
                  value={name} fullWidth required
                  onChange={(e) => { setName(e.target.value); setFormError(""); }}
                  sx={INPUT_SX}
                  slotProps={{ input: { startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ color:"#C0532A", fontSize:18 }}/>
                    </InputAdornment>
                  )}}}
                />
              </Box>

              {/* Email */}
              <Box sx={{ mb:2.2 }}>
                <FieldLabel htmlFor="reg-email">Email address</FieldLabel>
                <TextField id="reg-email" hiddenLabel type="email" placeholder="you@email.com"
                  value={email} fullWidth required
                  onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                  sx={INPUT_SX}
                  slotProps={{ input: { startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color:"#C0532A", fontSize:18 }}/>
                    </InputAdornment>
                  )}}}
                />
              </Box>

              {/* Password */}
              <Box sx={{ mb:2.2 }}>
                <FieldLabel htmlFor="reg-pass">Password</FieldLabel>
                <TextField id="reg-pass" hiddenLabel type="text" placeholder="Min 6 aksara"
                  value={passDisplay} fullWidth required
                  onChange={makePassChange(pass, showPass)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  sx={{ ...INPUT_SX, "& input":{ letterSpacing: showPass ? "normal" : "0.18em", fontFamily:"monospace", py:"11px" } }}
                  slotProps={{ input: { startAdornment: (
                    <InputAdornment position="start"><LockOutlinedIcon sx={{ color:"#C0532A", fontSize:18 }}/></InputAdornment>
                  ), endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label={showPass ? "Sembunyikan" : "Paparkan"}
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? <VisibilityOffIcon sx={{ fontSize:19, color:"#8A8578" }}/> : <VisibilityIcon sx={{ fontSize:19, color:"#8A8578" }}/>}
                      </IconButton>
                    </InputAdornment>
                  )}}}
                />
              </Box>

              {/* Confirm password */}
              <Box sx={{ mb:3 }}>
                <FieldLabel htmlFor="reg-confirm">Confirm password</FieldLabel>
                <TextField id="reg-confirm" hiddenLabel type="text" placeholder="Ulang kata laluan"
                  value={confirmDisplay} fullWidth required
                  onChange={makePassChange(confirm, showConfirm)}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  sx={{ ...INPUT_SX, "& input":{ letterSpacing: showConfirm ? "normal" : "0.18em", fontFamily:"monospace", py:"11px" } }}
                  slotProps={{ input: { startAdornment: (
                    <InputAdornment position="start"><LockOutlinedIcon sx={{ color:"#C0532A", fontSize:18 }}/></InputAdornment>
                  ), endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label={showConfirm ? "Sembunyikan" : "Paparkan"}
                        onClick={() => setShowConfirm(v => !v)}>
                        {showConfirm ? <VisibilityOffIcon sx={{ fontSize:19, color:"#8A8578" }}/> : <VisibilityIcon sx={{ fontSize:19, color:"#8A8578" }}/>}
                      </IconButton>
                    </InputAdornment>
                  )}}}
                />
              </Box>

              <Button type="submit" variant="contained" fullWidth
                disabled={loading || success} sx={{ ...BTN_PRIMARY, mb:2.5 }}>
                {loading ? "Mendaftar…" : "Daftar"}
              </Button>

              <Box sx={{ textAlign:"center" }}>
                <Typography component="span" sx={{ color:"#8A8578", fontSize:"0.83rem" }}>
                  Sudah ada akaun?{" "}
                </Typography>
                <Button onClick={() => setShowRegister(false)} sx={{
                  color:"#C0532A", fontWeight:600, p:0, minWidth:"auto",
                  fontSize:"0.83rem", textTransform:"none",
                  "&:hover":{ backgroundColor:"transparent", textDecoration:"underline" },
                }}>
                  Log masuk di sini
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
