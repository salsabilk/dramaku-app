const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

// Middleware untuk memvalidasi token JWT
const authenticateToken = (req, res, next) => {
  // Cek berbagai kemungkinan lokasi token
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token;
  
  if (authHeader) {
      token = authHeader.split(' ')[1];
  } else {
      // Cek token di cookie jika tidak ada di header
      token = req.cookies?.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan' 
    });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  } catch (err) {
      return res.status(403).json({ 
          success: false,
          message: 'Token tidak valid atau kadaluarsa' 
      });
  }
};
  
  
module.exports = authenticateToken;
