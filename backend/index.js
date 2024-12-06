const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { sequelize, User } = require("./models");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieParser = require('cookie-parser');

dotenv.config();

// Variabel konfigurasi
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware dasar
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Konfigurasi session (PENTING: setelah CORS)
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60, // 1 jam
    },
  })
);

// Inisialisasi Passport (PENTING: setelah session)
app.use(passport.initialize());
app.use(passport.session());

// Konfigurasi Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.SERVER_URL + "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Cari atau buat user
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            role: "User",
            is_verified: true,
            is_suspended: false,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google strategy error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialisasi user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => done(null, user))
    .catch((error) => done(error, null));
});

// Rute autentikasi Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback autentikasi Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {
      console.log('Google auth callback - User:', req.user);
      
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role || 'User',
          username: req.user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Simpan token ke cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 jam
      });

      console.log('Token set in cookie');
      res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect('/auth/error');
    }
  }
);

// // Rute ambil session
// app.get("/session", (req, res) => {
//   if (req.session && req.session.token) {
//     res.json({
//       success: true,
//       token: req.session.token,
//     });
//   } else {
//     res.status(401).json({
//       success: false,
//       message: "Tidak ada token sesi",
//     });
//   }
// });

app.get("/auth/check", (req, res) => {
  try {
    const token = req.cookies.token;
    console.log('Checking auth - Token exists:', !!token);

    if (!token) {
      return res.status(401).json({ 
        authenticated: false,
        message: "No token found" 
      });
    }

    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ 
          authenticated: false,
          message: "Invalid token" 
        });
      }

      console.log('Token verified - User:', decoded);
      res.json({ 
        authenticated: true,
        user: decoded 
      });
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      authenticated: false,
      message: "Server error" 
    });
  }
});

// Rute logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ message: "Gagal logout" });
      }
      res.redirect("/");
    });
  });
});

// Tambahkan rute lain
app.use("/api", require("./routes/drama"));
app.use("/auth", require("./routes/auth"));

// Konfigurasi port
const PORT = process.env.NODE_ENV === "test" ? 0 : 3001;

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
