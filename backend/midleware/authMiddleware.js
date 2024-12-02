const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

// Middleware untuk memvalidasi token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ambil token dari header
  
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
  
      req.user = user; // Simpan user di request
      next(); // Lanjutkan ke rute berikutnya
    });
  };
  
  
module.exports = authenticateToken;
