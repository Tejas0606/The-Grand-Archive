const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'grand_archive_secret_key_literature_2026_super_secure', {
    expiresIn: '30d'
  });
};

// Helper to send response with token and cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('token', token, cookieOptions);

  // Exclude password from response
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj
  });
};

// @desc    Register a new user (Reader or Author)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, username, email, password, bio, role, penName, genreSpecialty, avatar } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, email, and password are required to register.'
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === cleanEmail 
          ? 'An archival ledger entry with this email already exists.' 
          : 'This username is already inscribed in the library rolls.'
      });
    }

    const assignedRole = role === 'author' ? 'author' : 'reader';

    const newUser = await User.create({
      name,
      username: cleanUsername,
      email: cleanEmail,
      password,
      bio: bio || (assignedRole === 'author' ? 'Author of literary works inscribed in the Grand Archive.' : 'Devoted reader and literary explorer.'),
      role: assignedRole,
      penName: assignedRole === 'author' ? (penName || name) : '',
      genreSpecialty: assignedRole === 'author' ? (genreSpecialty || 'General Literature') : '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    });

    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { credential, password } = req.body; // credential can be email or username

    if (!credential || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your library ledger identifier and secret key.'
      });
    }

    const cleanCred = credential.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanCred }, { username: cleanCred }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No record found under these credentials in the archive.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid key. Credentials do not match the ledger.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Login error: ${error.message}`
    });
  }
};

// @desc    Demo 1-Click Login (Reader or Author)
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'reader' or 'author'

    let user;
    if (role === 'author') {
      user = await User.findOne({ role: 'author' }).select('+password');
    } else {
      user = await User.findOne({ role: 'reader' }).select('+password');
    }

    if (!user) {
      // Fallback: get any first user
      user = await User.findOne().select('+password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No seeded demo users found. Please run "npm run seed" first.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Demo login failed: ${error.message}`
    });
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('readingShelf.book')
      .populate('followers', 'name username avatar role penName')
      .populate('following', 'name username avatar role penName');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Could not retrieve user profile: ${error.message}`
    });
  }
};

// @desc    Log out user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Library pass returned. You are logged out.'
  });
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
  logout
};
