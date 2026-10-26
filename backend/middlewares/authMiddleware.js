const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  let token;

  // Check Bearer token in header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Library pass (token) missing. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grand_archive_secret_key_literature_2026_super_secure');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The member record corresponding to this library pass was not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Library pass has expired or is invalid. Please sign the ledger again.'
    });
  }
};

const verifyAuthor = (req, res, next) => {
  if (!req.user || req.user.role !== 'author') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Only verified Authors are permitted to publish works or host official AMAs.'
    });
  }
  next();
};

const optionalToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grand_archive_secret_key_literature_2026_super_secure');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore token failure for optional middleware
      req.user = null;
    }
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAuthor,
  optionalToken
};
