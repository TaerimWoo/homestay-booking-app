import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import PersonIcon        from "@mui/icons-material/Person";
import EmailIcon         from "@mui/icons-material/Email";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { REGISTER_USER } from "../graphql";
import BrandPanel from "../components/BrandPanel";

function useLastCharPeek() {
  const [real, setReal] = useState("");
  const [peeking, setPeeking] = useState(false);
  const timer = useRef(null);

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

  const onRevealed = (val) => {
    setReal(val); setPeeking(false); clearTimeout(timer.current);
  };

  return { real, masked, onMasked, onRevealed, peeking };
}

function Bear({ state }) {
  const armY   = { watching: 56, hiding: 0, peeking: 13 };
  const pupilY = { watching: 4,  hiding: 0, peeking: -4 };
  const t  = armY[state];
  const dy = pupilY[state];
  const spring = "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";

  return (
    <svg
      width="130" height="115"
      viewBox="0 0 120 115"
      style={{ overflow: "visible", display: "block", margin: "0 auto" }}
    >
      <circle cx="21"  cy="28" r="17" fill="#D4956A"/>
      <circle cx="21"  cy="28" r="11" fill="#C0784A"/>
      <circle cx="99"  cy="28" r="17" fill="#D4956A"/>
      <circle cx="99"  cy="28" r="11" fill="#C0784A"/>
      <circle cx="60"  cy="63" r="42" fill="#F2C272"/>
      <circle cx="29"  cy="75" r="13" fill="rgba(255,120,120,0.22)"/>
      <circle cx="91"  cy="75" r="13" fill="rgba(255,120,120,0.22)"/>
      <circle cx="43"  cy="55" r="11" fill="white"/>
      <circle cx="77"  cy="55" r="11" fill="white"/>
      <circle cx="45" cy={56 + dy} r="7"   fill="#1a0f08" style={{ transition: "all 0.3s ease" }}/>
      <circle cx="79" cy={56 + dy} r="7"   fill="#1a0f08" style={{ transition: "all 0.3s ease" }}/>
      <circle cx="42" cy={52 + dy} r="2.2" fill="white"   style={{ transition: "all 0.3s ease" }}/>
      <circle cx="76" cy={52 + dy} r="2.2" fill="white"   style={{ transition: "all 0.3s ease" }}/>
      <ellipse cx="60" cy="75" rx="17" ry="12" fill="#E8A060"/>
      <ellipse cx="60" cy="70" rx="7"  ry="4.5" fill="#5C2E1A"/>
      {state === "hiding"
        ? <path d="M 52 80 Q 60 78 68 80" stroke="#5C2E1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        : <path d="M 51 80 Q 60 90 69 80" stroke="#5C2E1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      }
      <g style={{ transform: `translateY(${t}px)`, transition: spring }}>
        <rect x="1"  y="46" width="44" height="28" rx="14" fill="#D4956A"/>
        <circle cx="11" cy="41" r="9"  fill="#D4956A"/>
        <circle cx="23" cy="37" r="10" fill="#D4956A"/>
        <circle cx="36" cy="41" r="9"  fill="#D4956A"/>
        <rect x="75" y="46" width="44" height="28" rx="14" fill="#D4956A"/>
        <circle cx="84"  cy="41" r="9"  fill="#D4956A"/>
        <circle cx="97"  cy="37" r="10" fill="#D4956A"/>
        <circle cx="109" cy="41" r="9"  fill="#D4956A"/>
      </g>
    </svg>
  );
}

export default function Register({ setShowRegister }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const pass    = useLastCharPeek();
  const confirm = useLastCharPeek();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError,   setFormError]   = useState("");
  const [success,     setSuccess]     = useState(false);
  const [charState,   setCharState]   = useState("watching");

  const charTimer = useRef(null);
  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const watchNow  = () => setCharState("watching");
  const hideNow   = () => setCharState("hiding");

  const makePassChange = (hook, isRevealed) => (e) => {
    setFormError("");
    isRevealed ? hook.onRevealed(e.target.value) : hook.onMasked(e);
    setCharState("peeking");
    clearTimeout(charTimer.current);
    charTimer.current = setTimeout(() => setCharState("hiding"), 800);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    if (pass.real.length < 6) { setFormError("Password must be at least 6 characters."); return; }
    if (pass.real !== confirm.real) { setFormError("Passwords do not match."); return; }
    try {
      await registerUser({ variables: { name, email, password: pass.real } });
      setSuccess(true);
      setTimeout(() => setShowRegister(false), 1800);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
    }
  };

  const passDisplay    = showPass    ? pass.real    : pass.masked;
  const confirmDisplay = showConfirm ? confirm.real : confirm.masked;

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform: translateY(20px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <BrandPanel />

        {/* Right panel */}
        <Box sx={{
          width: { xs: "100%", md: 500 },
          flexShrink: 0,
          backgroundColor: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          p: 3,
          overflowY: "auto",
        }}>
        <Box sx={{
          width: "100%", maxWidth: 420,
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
          animation: "cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>

          {/* header with bear */}
          <Box sx={{
            background: "linear-gradient(160deg, #0f1f3d 0%, #1d4ed8 100%)",
            pt: 4, pb: 3, px: 3,
            textAlign: "center",
            overflow: "hidden",
          }}>
            <Bear state={charState} />
            <Typography variant="h6" fontWeight="bold" color="white" letterSpacing={2} sx={{ mt: 2 }}>
              CREATE ACCOUNT
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", mt: 0.3 }}>
              Join Homestay System today
            </Typography>
          </Box>

          {/* form */}
          <Box component="form" onSubmit={handleRegister}
            sx={{ backgroundColor: "white", px: 4, pt: 3.5, pb: 4 }}>

            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>{formError}</Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>
                Registration successful! Redirecting to login…
              </Alert>
            )}

            <TextField
              label="Full Name" value={name}
              onChange={(e) => { setName(e.target.value); setFormError(""); }}
              onFocus={watchNow}
              fullWidth required sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#2563eb", fontSize: 19 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Email Address" type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
              onFocus={watchNow}
              fullWidth required sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#2563eb", fontSize: 19 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* password */}
            <TextField
              label="Password" type="text"
              value={passDisplay}
              onChange={makePassChange(pass, showPass)}
              onFocus={hideNow} onBlur={watchNow}
              fullWidth required
              sx={{ mb: 2, "& input": { letterSpacing: showPass ? "normal" : "0.18em", fontFamily: "monospace" } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setShowPass((v) => !v)}>
                        {showPass
                          ? <VisibilityOffIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                          : <VisibilityIcon   sx={{ fontSize: 20, color: "#2563eb" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* confirm password */}
            <TextField
              label="Confirm Password" type="text"
              value={confirmDisplay}
              onChange={makePassChange(confirm, showConfirm)}
              onFocus={hideNow} onBlur={watchNow}
              fullWidth required
              sx={{ mb: 3.5, "& input": { letterSpacing: showConfirm ? "normal" : "0.18em", fontFamily: "monospace" } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm
                          ? <VisibilityOffIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                          : <VisibilityIcon   sx={{ fontSize: 20, color: "#2563eb" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit" variant="contained" size="large" fullWidth
              disabled={loading || success}
              sx={{
                backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" },
                py: 1.5, borderRadius: 2.5,
                fontWeight: "bold", fontSize: "0.95rem", letterSpacing: 1.8,
                mb: 3, boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
              }}
            >
              {loading ? "Creating account…" : "REGISTER"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography component="span" color="text.secondary" fontSize="0.85rem">
                Already have an account?{" "}
              </Typography>
              <Button size="small" onClick={() => setShowRegister(false)}
                sx={{
                  color: "#2563eb", fontWeight: "bold", p: 0, minWidth: "auto",
                  fontSize: "0.85rem", textTransform: "none",
                  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                }}
              >
                Login here
              </Button>
            </Box>
          </Box>
        </Box>
        </Box> {/* right panel */}
      </Box>
    </>
  );
}
