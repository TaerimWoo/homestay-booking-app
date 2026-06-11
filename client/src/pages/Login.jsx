import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import EmailIcon         from "@mui/icons-material/Email";
import LockOutlinedIcon  from "@mui/icons-material/LockOutlined";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon     from "@mui/icons-material/ArrowBack";
import { LOGIN_USER, REQUEST_PASSWORD_RESET, RESET_PASSWORD } from "../graphql";
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
  const reset      = ()    => { setReal("");   setPeeking(false); clearTimeout(timer.current); };
  return { real, masked, onMasked, onRevealed, peeking, reset };
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

/* ── Shared input style ── */
const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px",
    backgroundColor: "white",
    "& fieldset":          { borderColor: "#E2D4B6" },
    "&:hover fieldset":    { borderColor: "#C0532A70" },
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
export default function Login({ setCurrentUser, setShowRegister }) {
  const pass = useLastCharPeek();

  /* login state */
  const [email,      setEmail]      = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loginError, setLoginError] = useState("");
  const [passFocused, setPassFocused] = useState(false);

  /* forgot-password state */
  const [forgotStep,    setForgotStep]    = useState(null);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotOtp,     setForgotOtp]     = useState("");
  const [forgotError,   setForgotError]   = useState("");
  const [forgotMsg,     setForgotMsg]     = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const newPass     = useLastCharPeek();
  const confirmPass = useLastCharPeek();
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const charTimer = useRef(null);

  const [loginUser]    = useMutation(LOGIN_USER);
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET);
  const [resetPassword] = useMutation(RESET_PASSWORD);

  const hideCharacter = passFocused && !showPass;

  /* ── handlers ── */
  const handlePassChange = (e) => {
    setLoginError("");
    showPass ? pass.onRevealed(e.target.value) : pass.onMasked(e);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const r = await loginUser({ variables: { email, password: pass.real } });
      setCurrentUser(r.data.login);
    } catch {
      setLoginError("E-mel atau kata laluan tidak tepat. Sila cuba lagi.");
    }
  };

  const openForgot = () => {
    setForgotStep("email"); setForgotEmail(""); setForgotOtp("");
    setForgotError(""); setForgotMsg("");
    newPass.reset(); confirmPass.reset();
  };
  const closeForgot = () => { setForgotStep(null); setForgotError(""); setForgotMsg(""); };

  const handleSendOtp = async (e) => {
    e.preventDefault(); setForgotError("");
    if (!forgotEmail) { setForgotError("Sila masukkan e-mel anda."); return; }
    setForgotLoading(true);
    try {
      await requestReset({ variables: { email: forgotEmail } });
      setForgotMsg("OTP telah dihantar! Semak peti masuk e-mel anda.");
      setForgotStep("otp");
    } catch (err) { setForgotError(err.message || "Gagal menghantar OTP."); }
    finally      { setForgotLoading(false); }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault(); setForgotError("");
    if (forgotOtp.length !== 6) { setForgotError("Sila masukkan OTP 6 digit."); return; }
    setForgotStep("newpass"); setForgotMsg("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setForgotError("");
    if (newPass.real.length < 6) { setForgotError("Kata laluan mestilah sekurang-kurangnya 6 aksara."); return; }
    if (newPass.real !== confirmPass.real) { setForgotError("Kata laluan tidak sepadan."); return; }
    setForgotLoading(true);
    try {
      await resetPassword({ variables: { email: forgotEmail, otp: forgotOtp, newPassword: newPass.real } });
      setForgotMsg("Kata laluan berjaya ditetapkan semula! Sila log masuk.");
      setForgotStep("done");
    } catch (err) { setForgotError(err.message || "Gagal menetapkan semula kata laluan."); }
    finally      { setForgotLoading(false); }
  };

  const makePeekChange = (hook, isRevealed) => (e) => {
    setForgotError("");
    isRevealed ? hook.onRevealed(e.target.value) : hook.onMasked(e);
    clearTimeout(charTimer.current);
    charTimer.current = setTimeout(() => {}, 800);
  };

  const displayVal = showPass ? pass.real : pass.masked;

  /* ── header subtitle per step ── */
  const headerSub = forgotStep === "email"   ? "Masukkan e-mel berdaftar anda"
                  : forgotStep === "otp"     ? "Masukkan OTP yang dihantar ke e-mel"
                  : forgotStep === "newpass" ? "Tetapkan kata laluan baharu"
                  : forgotStep === "done"    ? "Berjaya!"
                  : "Selamat datang — sila log masuk";

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
          maxWidth: { md:980 },
          minHeight: { xs:"100vh", md:"auto" },
          borderRadius: { xs:0, md:"20px" },
          overflow: "hidden",
          boxShadow: { xs:"none", md:"0 8px 52px rgba(31,77,63,0.16)" },
          animation: "cardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>
          <BrandPanel />

          {/* ── Auth side ── */}
          <Box sx={{
            width: { xs:"100%", md:500 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}>

            {/* ── Green header ── */}
            <Box sx={{
              backgroundColor:"#2A5547",
              pt:4, pb:3, px:3,
              textAlign:"center",
            }}>
              <AnjungLogo hideCharacter={hideCharacter} />
              <Typography sx={{
                fontFamily:"'Playfair Display', Georgia, serif",
                fontSize:"1.2rem", fontWeight:600,
                color:"#FBF7EC", mt:1.8, letterSpacing:0.3,
              }}>
                Anjung Kampung
              </Typography>
              <Typography sx={{
                color:"#C0532A", fontSize:"0.68rem",
                letterSpacing:"3px", fontWeight:600, mt:0.4,
              }}>
                KAMPUNG HOMESTAY
              </Typography>
              <Typography sx={{ color:"#A9C6B8", fontSize:"0.8rem", mt:0.8 }}>
                {headerSub}
              </Typography>
            </Box>

            {/* ── Form body ── */}
            <Box sx={{ backgroundColor:"white", px:{ xs:3, md:4 }, pt:3.5, pb:4, flex:1 }}>

              {/* ── Normal login ── */}
              {!forgotStep && (
                <Box component="form" onSubmit={handleLogin}>
                  {loginError && (
                    <Alert severity="error" sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>
                      {loginError}
                    </Alert>
                  )}

                  <Box sx={{ mb:2.5 }}>
                    <FieldLabel htmlFor="login-email">Email address</FieldLabel>
                    <TextField id="login-email" hiddenLabel type="email"
                      placeholder="you@email.com" value={email} fullWidth required
                      onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                      sx={INPUT_SX}
                      slotProps={{ input: { startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color:"#C0532A", fontSize:18 }}/>
                        </InputAdornment>
                      )}}}
                    />
                  </Box>

                  <Box sx={{ mb:3 }}>
                    <FieldLabel htmlFor="login-pass">Password</FieldLabel>
                    <TextField id="login-pass" hiddenLabel type="text"
                      placeholder="Kata laluan" value={displayVal} fullWidth required
                      onChange={handlePassChange}
                      onFocus={() => setPassFocused(true)}
                      onBlur={() => setPassFocused(false)}
                      inputProps={{ "aria-label":"Password" }}
                      sx={{ ...INPUT_SX, "& input":{ letterSpacing: showPass ? "normal" : "0.18em", fontFamily:"monospace", py:"11px" } }}
                      slotProps={{ input: { startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color:"#C0532A", fontSize:18 }}/>
                        </InputAdornment>
                      ), endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" aria-label={showPass ? "Sembunyikan kata laluan" : "Paparkan kata laluan"}
                            onClick={() => setShowPass(v => !v)}>
                            {showPass
                              ? <VisibilityOffIcon sx={{ fontSize:19, color:"#8A8578" }}/>
                              : <VisibilityIcon   sx={{ fontSize:19, color:"#8A8578" }}/>}
                          </IconButton>
                        </InputAdornment>
                      )}}}
                    />
                  </Box>

                  <Button type="submit" variant="contained" fullWidth sx={{ ...BTN_PRIMARY, mb:2 }}>
                    Log masuk
                  </Button>

                  <Box sx={{ textAlign:"center", mb:2 }}>
                    <Button onClick={openForgot} sx={{
                      color:"#8A8578", textTransform:"none", fontSize:"0.83rem",
                      p:0, minWidth:"auto",
                      "&:hover":{ backgroundColor:"transparent", color:"#C0532A" },
                    }}>
                      Lupa kata laluan?
                    </Button>
                  </Box>

                  <Box sx={{ textAlign:"center" }}>
                    <Typography component="span" sx={{ color:"#8A8578", fontSize:"0.83rem" }}>
                      Tiada akaun?{" "}
                    </Typography>
                    <Button onClick={() => setShowRegister(true)} sx={{
                      color:"#C0532A", fontWeight:600, p:0, minWidth:"auto",
                      fontSize:"0.83rem", textTransform:"none",
                      "&:hover":{ backgroundColor:"transparent", textDecoration:"underline" },
                    }}>
                      Daftar di sini
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ── Step 1: email ── */}
              {forgotStep === "email" && (
                <Box component="form" onSubmit={handleSendOtp}>
                  {forgotError && <Alert severity="error" sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>{forgotError}</Alert>}
                  <Box sx={{ mb:3 }}>
                    <FieldLabel htmlFor="frgt-email">Alamat e-mel</FieldLabel>
                    <TextField id="frgt-email" hiddenLabel type="email"
                      placeholder="you@email.com" value={forgotEmail} fullWidth required
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                      sx={INPUT_SX}
                      slotProps={{ input: { startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color:"#C0532A", fontSize:18 }}/>
                        </InputAdornment>
                      )}}}
                    />
                  </Box>
                  <Button type="submit" variant="contained" fullWidth disabled={forgotLoading}
                    sx={{ ...BTN_PRIMARY, mb:2 }}>
                    {forgotLoading ? "Menghantar…" : "Hantar OTP"}
                  </Button>
                  <Box sx={{ textAlign:"center" }}>
                    <Button startIcon={<ArrowBackIcon/>} onClick={closeForgot} sx={{
                      color:"#8A8578", textTransform:"none", fontSize:"0.83rem",
                      "&:hover":{ backgroundColor:"transparent", color:"#1F4D3F" },
                    }}>
                      Kembali ke log masuk
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ── Step 2: OTP ── */}
              {forgotStep === "otp" && (
                <Box component="form" onSubmit={handleVerifyOtp}>
                  {forgotMsg   && <Alert severity="success" sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>{forgotMsg}</Alert>}
                  {forgotError && <Alert severity="error"   sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>{forgotError}</Alert>}
                  <Typography sx={{ fontSize:"0.82rem", color:"#8A8578", mb:2.5, textAlign:"center", lineHeight:1.7 }}>
                    OTP 6 digit telah dihantar ke{" "}
                    <strong style={{ color:"#1F4D3F" }}>{forgotEmail}</strong>
                  </Typography>
                  <Box sx={{ mb:3 }}>
                    <FieldLabel htmlFor="frgt-otp">Kod OTP</FieldLabel>
                    <TextField id="frgt-otp" hiddenLabel value={forgotOtp} fullWidth required
                      placeholder="• • • • • •"
                      onChange={(e) => { setForgotOtp(e.target.value.replace(/\D/g,"").slice(0,6)); setForgotError(""); }}
                      inputProps={{ inputMode:"numeric", maxLength:6 }}
                      sx={{ ...INPUT_SX, "& input":{ letterSpacing:"0.6em", fontWeight:"bold", fontSize:"1.25rem", textAlign:"center", py:"11px" } }}
                    />
                  </Box>
                  <Button type="submit" variant="contained" fullWidth sx={{ ...BTN_PRIMARY, mb:2 }}>
                    Sahkan OTP
                  </Button>
                  <Box sx={{ textAlign:"center", display:"flex", justifyContent:"center", gap:2 }}>
                    <Button onClick={() => { setForgotStep("email"); setForgotMsg(""); setForgotError(""); }}
                      sx={{ color:"#8A8578", textTransform:"none", fontSize:"0.83rem", "&:hover":{ backgroundColor:"transparent", color:"#C0532A" } }}>
                      Hantar semula OTP
                    </Button>
                    <Button startIcon={<ArrowBackIcon/>} onClick={closeForgot}
                      sx={{ color:"#8A8578", textTransform:"none", fontSize:"0.83rem", "&:hover":{ backgroundColor:"transparent", color:"#1F4D3F" } }}>
                      Kembali
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ── Step 3: new password ── */}
              {forgotStep === "newpass" && (
                <Box component="form" onSubmit={handleResetPassword}>
                  {forgotError && <Alert severity="error" sx={{ mb:2, borderRadius:"8px", fontSize:"0.82rem" }}>{forgotError}</Alert>}
                  <Box sx={{ mb:2.5 }}>
                    <FieldLabel htmlFor="frgt-np">Kata laluan baharu</FieldLabel>
                    <TextField id="frgt-np" hiddenLabel type="text" fullWidth required
                      placeholder="Min 6 aksara"
                      value={showNew ? newPass.real : newPass.masked}
                      onChange={makePeekChange(newPass, showNew)}
                      sx={{ ...INPUT_SX, "& input":{ letterSpacing: showNew ? "normal" : "0.18em", fontFamily:"monospace", py:"11px" } }}
                      slotProps={{ input: { startAdornment: (
                        <InputAdornment position="start"><LockOutlinedIcon sx={{ color:"#C0532A", fontSize:18 }}/></InputAdornment>
                      ), endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowNew(v => !v)}>
                            {showNew ? <VisibilityOffIcon sx={{ fontSize:19, color:"#8A8578" }}/> : <VisibilityIcon sx={{ fontSize:19, color:"#8A8578" }}/>}
                          </IconButton>
                        </InputAdornment>
                      )}}}
                    />
                  </Box>
                  <Box sx={{ mb:3 }}>
                    <FieldLabel htmlFor="frgt-cp">Sahkan kata laluan</FieldLabel>
                    <TextField id="frgt-cp" hiddenLabel type="text" fullWidth required
                      placeholder="Ulang kata laluan baharu"
                      value={showConfirm ? confirmPass.real : confirmPass.masked}
                      onChange={makePeekChange(confirmPass, showConfirm)}
                      sx={{ ...INPUT_SX, "& input":{ letterSpacing: showConfirm ? "normal" : "0.18em", fontFamily:"monospace", py:"11px" } }}
                      slotProps={{ input: { startAdornment: (
                        <InputAdornment position="start"><LockOutlinedIcon sx={{ color:"#C0532A", fontSize:18 }}/></InputAdornment>
                      ), endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm(v => !v)}>
                            {showConfirm ? <VisibilityOffIcon sx={{ fontSize:19, color:"#8A8578" }}/> : <VisibilityIcon sx={{ fontSize:19, color:"#8A8578" }}/>}
                          </IconButton>
                        </InputAdornment>
                      )}}}
                    />
                  </Box>
                  <Button type="submit" variant="contained" fullWidth disabled={forgotLoading}
                    sx={{ ...BTN_PRIMARY, mb:2 }}>
                    {forgotLoading ? "Menetapkan…" : "Tetapkan semula kata laluan"}
                  </Button>
                  <Box sx={{ textAlign:"center" }}>
                    <Button startIcon={<ArrowBackIcon/>} onClick={closeForgot}
                      sx={{ color:"#8A8578", textTransform:"none", fontSize:"0.83rem", "&:hover":{ backgroundColor:"transparent", color:"#1F4D3F" } }}>
                      Kembali ke log masuk
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ── Done ── */}
              {forgotStep === "done" && (
                <Box>
                  <Alert severity="success" sx={{ mb:3, borderRadius:"8px" }}>{forgotMsg}</Alert>
                  <Button variant="contained" fullWidth onClick={closeForgot} sx={BTN_PRIMARY}>
                    Kembali ke log masuk
                  </Button>
                </Box>
              )}

            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
