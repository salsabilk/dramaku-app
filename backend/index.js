const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { sequelize, User } = require("./models");
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Tambah paket Google OAuth 2.0

dotenv.config();

// Gunakan variabel dari .env
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET; // JWT_SECRET untuk session

// Konfigurasi express-session untuk mengelola sesi
app.use(
  session({
    secret: JWT_SECRET, // Gunakan JWT_SECRET untuk session secret
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware express
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json());

// Inisialisasi Passport dan sesi
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
        // Cek apakah pengguna sudah ada berdasarkan googleId atau email
        const existingUser = await User.findOne({
          where: { googleId: profile.id },
        });

        if (existingUser) {
          // Jika sudah ada, login user
          return done(null, existingUser);
        }

        // Jika belum ada, buat user baru di database
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value, // Ambil email pengguna dari Google
          photo: profile.photos[0].value, // Simpan foto profil jika diperlukan
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

// Route autentikasi Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback setelah login sukses dari Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;
    // console.log(req.session);

    res.redirect(process.env.CLIENT_URL);
  }
);

// Route logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/session", (req, res) => {
  // console.log(req.session);
  if (req.session.token) {
    const token = req.session.token; // Ambil token dari session
    res.json({ token }); // Kirim token ke client
  } else {
    res.status(401).json({ message: "Unauthorized", token: req.session.token });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    req.logout(); // Jika menggunakan passport.js
    res.redirect("/"); // Redirect ke halaman utama setelah logout
  });
});

app.use("/api", require("./routes/drama"));
app.use("/auth", require("./routes/auth"));

// const PORT = 3000;
const PORT = process.env.NODE_ENV === "test" ? 0 : 3001;

app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});

module.exports = app;
