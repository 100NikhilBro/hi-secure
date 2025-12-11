<h1 align="center">🔒 HiSecure</h1>
<p align="center"><strong>One-line security for Express.js</strong></p>

<p align="center">
HiSecure replaces <strong>10+ common Express security libraries</strong> with one unified API.<br/>
It provides hashing, authentication, validation, sanitization, rate-limiting, CORS,<br/>
security headers, compression, JSON parsing, query parsing and logging — all in a single layer.
</p>

<br/>

<hr style="border:0; border-top:2px solid #e5e7eb; margin:32px 0"/>

<h2>🚀 Overview</h2>

<p>
Most Express applications require multiple security packages: hashing, CORS, headers, sanitization,
validation, rate-limits, compression, JSON parsing, query parsing, and authentication.  
Managing all of these separately leads to duplication, bugs, and misconfiguration.
</p>

<p><strong>HiSecure handles all of them for you — with one middleware call.</strong></p>

<ul>
  <li><code>argon2</code> / <code>bcrypt</code> — hashing</li>
  <li><code>sanitize-html</code> / <code>xss</code> — sanitization</li>
  <li><code>express-validator</code> / <code>zod</code> — validation</li>
  <li><code>helmet</code> / <code>hpp</code> — headers + HPP</li>
  <li><code>cors</code> — CORS control</li>
  <li><code>express-rate-limit</code> + <code>rate-limiter-flexible</code> — rate limiting</li>
  <li><code>compression</code> — gzip</li>
  <li><code>json/urlencoded</code> — parsers</li>
  <li><code>qs</code> — secure deep query parsing</li>
</ul>

<p><strong>HiSecure bundles all of these features out-of-the-box.</strong></p>

<br/>
<hr style="border:0; border-top:2px solid #e5e7eb; margin:32px 0"/>

<h2>✨ Feature Matrix</h2>

<p>
A complete list of what HiSecure does.  
Everything is built to work together without configuration.
</p>

<table width="100%">
  <tr>
    <th align="left">Capability</th>
    <th align="left">Status</th>
    <th align="left">Details</th>
  </tr>

  <tr>
    <td>🔐 JWT Authentication</td>
    <td>✅ Stable</td>
    <td>Built-in issuer, audience, expiry and subject support. Google ID-token adapter included.</td>
  </tr>

  <tr>
    <td>🔑 Password Hashing (Argon2 + bcrypt fallback)</td>
    <td>✅ Stable</td>
    <td>Argon2-first approach with bcrypt fallback. No salt configuration required.</td>
  </tr>

  <tr>
    <td>🛡 Route Protection</td>
    <td>✅ Stable</td>
    <td>Authentication guard with support for roles (RBAC).</td>
  </tr>

  <tr>
    <td>📏 Validation (Zod + express-validator)</td>
    <td>✅ Stable</td>
    <td>Automatically detects schema type. Provides a clean error format.</td>
  </tr>

  <tr>
    <td>🧼 Sanitization</td>
    <td>✅ Stable</td>
    <td>Protects against HTML injection & XSS using sanitize-html + xss fallback.</td>
  </tr>

  <tr>
    <td>⏱ Rate Limiting</td>
    <td>✅ Stable</td>
    <td>Presets (strict/relaxed/api) + custom per-route limits. Fallback engine included.</td>
  </tr>

  <tr>
    <td>🌐 CORS</td>
    <td>✅ Stable</td>
    <td>Dynamic origins + full configuration support.</td>
  </tr>

  <tr>
    <td>🧱 Security Headers</td>
    <td>✅ Stable</td>
    <td>Automatic helmet + HPP integration.</td>
  </tr>

  <tr>
    <td>📦 JSON & URL Parsing</td>
    <td>✅ Stable</td>
    <td>Togglable express.json + urlencoded, simple and safe.</td>
  </tr>

  <tr>
    <td>🔍 Query Parsing</td>
    <td>✅ Stable</td>
    <td>Secure <code>qs</code>-based deep parsing out of the box.</td>
  </tr>

  <tr>
    <td>🌀 Compression</td>
    <td>✅ Stable</td>
    <td>gzip enabled via a single flag.</td>
  </tr>

  <tr>
    <td>📊 Structured Logging</td>
    <td>⚠️ Beta</td>
    <td>Unified log output for debugging & monitoring.</td>
  </tr>

  <tr>
    <td>🔧 Adapter System</td>
    <td>✅ Stable</td>
    <td>Swap hashing/validation/sanitization engines easily.</td>
  </tr>
</table>

<br/>
<hr style="border:0; border-top:2px solid #e5e7eb; margin:32px 0"/>

<h2>⚡ Developer Experience Highlights</h2>

<p>
HiSecure is designed so even a beginner can set up security in minutes.
Here’s what makes it simple:
</p>

<ul>
  <li><strong>One-line global security</strong> using <code>HiSecure.middleware()</code></li>

  <li><strong>Password utilities</strong>
    <br/>• <code>HiSecure.hash()</code> — secure Argon2 hashing  
    <br/>• <code>HiSecure.verify()</code> — easy password comparison  
  </li>

  <li><strong>JWT utilities</strong>
    <br/>• <code>HiSecure.jwt.sign()</code> — create tokens  
    <br/>• <code>HiSecure.jwt.verify()</code> — verify tokens  
  </li>

  <li>Automatic sanitization — no extra middleware needed</li>

  <li>Auto-detected validation (Zod or express-validator)</li>

  <li>Clean route protection with <code>HiSecure.auth()</code></li>

  <li>Flexible rate limits for login routes and APIs</li>

  <li>Zero configuration for headers, parsing, gzip, CORS, etc.</li>

  <li>Perfect for beginners and production-grade APIs</li>
</ul>

<br/>
<hr style="border:0; border-top:2px solid #e5e7eb; margin:32px 0"/>

<h2>📌 Summary</h2>

<p>
HiSecure provides a powerful but easy security layer:
</p>

<ul>
  <li><strong>JWT Authentication</strong></li>
  <li><strong>Password Hashing</strong></li>
  <li><strong>Route Protection</strong></li>
  <li><strong>Validation + Sanitization</strong></li>
  <li><strong>Rate Limiting</strong> (primary + fallback)</li>
  <li><strong>CORS + Security Headers + Compression</strong></li>
  <li><strong>JSON + Query Parsing</strong></li>
</ul>

<p align="center"><strong>
Security without complexity.<br/>
One dependency — complete Express protection.
</strong></p>

<br/><br/>

<!-- ─────────────────────────────────────────────────────────────── -->
<h2 align="center">📘 Documentation Sections</h2>
<!-- ─────────────────────────────────────────────────────────────── -->

<hr style="border:0; border-top:2px dashed #d4d4d8; margin:32px 0"/>

<h2>📘 Part 1 — Quick Start</h2>

<p>This section is designed for beginners to get started within seconds.</p>

<strong>Install</strong>
<pre><code>npm install hi-secure</code></pre>

<strong>Basic Usage</strong>
<pre><code>const express = require('express');
const { HiSecure } = require('hi-secure');

const app = express();

// One-line complete security preset
app.use(HiSecure.middleware('api'));

app.listen(3000);
</code></pre>

<p><small>The "api" preset includes CORS, Relaxed Rate Limit, Sanitization and basic headers.</small></p>

<br/>
<hr style="border:0; border-top:2px dashed #d4d4d8; margin:32px 0"/>

<h2>📘 Part 2 — Using Built-In Helpers</h2>

<h3>2.1 Hashing + Verifying Passwords</h3>

<p>Perfect for controllers like register/login.</p>

<pre><code>const hashed = await HiSecure.hash(password);
const valid = await HiSecure.verify(password, user.password);
</code></pre>

<h3>2.2 Validating Inputs in Routes</h3>

<p>HiSecure automatically detects whether you're providing Zod or express-validator rules.</p>

<pre><code>router.post(
  '/register',
  HiSecure.validate([
    body("name").notEmpty().isLength({ min: 3 }),
    body("email").notEmpty().isEmail(),
    body("password").notEmpty().isLength({ min: 6 })
  ]),
  registerUser
);
</code></pre>

<h3>2.3 Login Route with Rate Limiting</h3>

<pre><code>router.post(
  '/login',
  HiSecure.validate([...]),
  HiSecure.rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),
  loginUser
);
</code></pre>

<h3>2.4 Protecting Routes with Auth Middleware</h3>

<pre><code>router.get(
  '/profile',
  HiSecure.auth({ required: true }),
  getProfile
);
</code></pre>

<br/>
<hr style="border:0; border-top:2px dashed #d4d4d8; margin:32px 0"/>

<h2>📘 Part 3 — JWT Mode (Advanced)</h2>

<p>Enable this mode only if you want full control over JWT signing options.</p>

<h3>3.1 Configure JWT Engine</h3>

<pre><code>HiSecure.resetInstance();

HiSecure.getInstance({
  auth: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: "1d"
  }
});
</code></pre>

<h3>3.2 Global Security Middleware</h3>

<pre><code>app.use(HiSecure.middleware({
  cors: true,
  rateLimit: "strict",
  sanitize: true,
  headers: true,
  compression: true,
  json: true
}));
</code></pre>

<br/>
<hr style="border:0; border-top:2px dashed #d4d4d8; margin:32px 0"/>

<h2>📘 Part 4 — Full Example Snapshot</h2>

<p>This gives developers a quick glance at how the entire system fits together.</p>

<pre><code>// server.js
require("dotenv").config();
const express = require("express");
const dbConnect = require("./config/db");
const { HiSecure } = require("hi-secure");

const app = express();
const PORT = process.env.PORT || 3000;

dbConnect();

// ⭐ FORCE NEW INSTANCE WITH CORRECT CONFIG - if use HiSecure.jwt()  
HiSecure.resetInstance();

HiSecure.getInstance({
    auth: {
        enabled: true,
        jwtSecret: process.env.JWT_SECRET || "supersecret123",
        jwtExpiresIn: "1d",
    }
});

// if u don't use our jwt config 
app.use(HiSecure.middleware('api')); // one line setup - along with this u use the HiSecure.validat() and HiSecure.hash() | HiSecure.verify() 

//  Global middleware WITHOUT auth override
app.use(
    HiSecure.middleware({
        cors: true,
        rateLimit: "strict",
        sanitize: true,
        headers: true,
        compression: true,
        json: true
    })
);

//  ROUTES (call builder)
const userRoutes = require("./routes/UserRoutes");
app.use("/api/auth", userRoutes());

app.listen(PORT, () => {
    console.log(`🚀 Server running port ${PORT}`);
});
  
</code></pre>


<pre><code>// controller
const { HiSecure } = require('hi-secure');
const User = require("../models/User");

const JWT_OPTIONS = {
    issuer: 'hi-secure-backend',
    audience: ['web-app', 'mobile-app'], // Array format
    expiresIn: '7d',
    subject: 'user-authentication'
};

exports.registerUser = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await HiSecure.hash(password);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        //  FIXED: JWT sign with ALL required options
        const token = HiSecure.jwt.sign({
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                role: 'user'
            },
            JWT_OPTIONS
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
};

exports.loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isValid = await HiSecure.verify(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        //  FIXED: Same JWT options
        const token = HiSecure.jwt.sign({
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                role: 'user'
            },
            JWT_OPTIONS
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
};

exports.getProfile = async(req, res) => {
    try {
        // req.user is set by HiSecure.auth() middleware
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'Profile data',
            user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            details: error.message
        });
    }
};
</code></pre>


<pre><code>// routes
const express = require('express');
const { body } = require('express-validator');
const { HiSecure } = require('hi-secure');
const { registerUser, loginUser, getProfile } = require('../controllers/UserControllers');




module.exports = function buildRoutes() {
    const router = express.Router();

    router.post(
        '/register',

        HiSecure.validate([
            body("name")
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),

            body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format"),

            body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        ]),

        registerUser
    );

   
    router.post(
        '/login',

        HiSecure.validate([
            body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format"),

            body("password")
            .notEmpty().withMessage("Password is required")
        ]),

        // Apply rate limiter also
        HiSecure.rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),

        loginUser
    );


    router.get(
        '/profile',
        HiSecure.auth({ required: true }),
        getProfile
    );

    return router;
};
</code></pre>

<br/>
<hr style="border:0; border-top:2px dashed #d4d4d8; margin:32px 0"/>

<h2 align="center">📝 Additional Documentation</h2>

<p align="center">
We are actively working on extended documentation:<br/>
<strong>Advanced patterns, RBAC examples, custom adapters, deployment setups & best practices.</strong>
</p>

<p align="center"><i>Updates coming soon.</i></p>
