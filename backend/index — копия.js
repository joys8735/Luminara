import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const users = new Map();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// ✅ Найпростіші CORS налаштування для dev
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Сесія
app.use(session({
  name: 'auth_session',
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  },
  store: new session.MemoryStore()
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport налаштування
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user || null);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${BACKEND_URL}/auth/google/callback`,
  passReqToCallback: false
}, (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.photos?.[0]?.value,
      provider: 'google',
      tokensClaimed: 0,
      createdAt: new Date()
    };

    users.set(user.id, user);
    console.log(`✅ Google user logged in: ${user.email}`);
    
    return done(null, user);
  } catch (error) {
    console.error('Google strategy error:', error);
    return done(error, null);
  }
}));

// Логування
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Google login
app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

// Google callback
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login-error`
  }),
  (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Success</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            color: white;
          }
          .container {
            text-align: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>✅ Authentication Successful!</h2>
          <p>You can close this window.</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                success: true
              }, '*');
            }
          } catch (e) {
            console.log(e);
          }
          setTimeout(() => window.close(), 5000);
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  }
);

// Перевірка користувача
app.get("/auth/user", (req, res) => {
  if (!req.user) {
    return res.json({ loggedIn: false });
  }
  
  res.json({
    loggedIn: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      tokensClaimed: req.user.tokensClaimed || 0
    }
  });
});

// Logout
app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    
    req.session.destroy(() => {
      res.clearCookie("auth_session");
      res.json({ success: true });
    });
  });
});

// Test endpoint
app.get("/auth/test", (req, res) => {
  res.json({
    status: "OK",
    user: req.user || null
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  console.log(`✅ Frontend: ${FRONTEND_URL}`);
});