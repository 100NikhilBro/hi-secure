<h1 align="center">🔒 HiSecure</h1>
<p align="center"><strong>One-line security for Express.js</strong></p>

<p align="center">
HiSecure unifies authentication, validation, sanitization, rate-limiting, headers and parsing<br/>
into a single, consistent security layer for Express applications.
</p>

<hr/>

<h2>Overview</h2>

<p>
Modern Express applications require multiple security libraries to handle authentication,
password hashing, validation, sanitization, rate limiting, headers, compression and parsing.
Managing these separately leads to duplicated logic, configuration drift and subtle bugs.
</p>

<p>
<strong>HiSecure solves this by acting as a single orchestration layer.</strong>
</p>

<ul>
  <li>Password hashing (Argon2 with bcrypt fallback)</li>
  <li>JWT authentication and route protection</li>
  <li>Google login (ID token verification)</li>
  <li>Request validation and sanitization</li>
  <li>Rate limiting and abuse prevention</li>
  <li>CORS, security headers and compression</li>
  <li>JSON, URL and query parsing</li>
</ul>

<hr/>

<h2>Feature Matrix</h2>

<table width="100%">
  <tr>
    <th align="left">Capability</th>
    <th align="left">Status</th>
    <th align="left">Notes</th>
  </tr>

  <tr>
    <td>JWT Authentication</td>
    <td>Stable</td>
    <td>Issuer, audience, expiry and subject supported</td>
  </tr>

  <tr>
    <td>Password Hashing</td>
    <td>Stable</td>
    <td>Argon2 primary with bcrypt fallback</td>
  </tr>

  <tr>
    <td>Google Login</td>
    <td>Stable</td>
    <td>ID token verification adapter included</td>
  </tr>

  <tr>
    <td>Route Protection (RBAC)</td>
    <td>Stable</td>
    <td>Role-based access via JWT payload</td>
  </tr>

  <tr>
    <td>Validation</td>
    <td>Stable</td>
    <td>Zod and express-validator supported</td>
  </tr>

  <tr>
    <td>Sanitization</td>
    <td>Stable</td>
    <td>HTML injection and XSS protection</td>
  </tr>

  <tr>
    <td>Rate Limiting</td>
    <td>Stable</td>
    <td>Presets and per-route configuration</td>
  </tr>

  <tr>
    <td>CORS & Headers</td>
    <td>Stable</td>
    <td>Helmet, HPP and CORS integrated</td>
  </tr>

  <tr>
    <td>Compression</td>
    <td>Stable</td>
    <td>gzip via a single flag</td>
  </tr>

  <tr>
  <td>Logging</td>
  <td>Improved (v1.0.20)</td>
  <td>
    Structured, lifecycle-aware logs with adapter, manager and fallback visibility.
    Designed for production debugging without leaking sensitive data.
  </td>
</tr>


</table>

<hr/>


<hr/>

<h2>What’s New in v1.0.20</h2>

<ul>
  <li>Improved structured logging across core lifecycle</li>
  <li>Clear visibility into adapter initialization and fallbacks</li>
  <li>Layer-based logs (core, managers, adapters) for easier debugging</li>
  <li>No public API changes (safe patch release)</li>
</ul>


<h2>Developer Experience</h2>

<ul>
  <li>Single global middleware for security</li>
  <li>No manual wiring of multiple packages</li>
 <li>Consistent error handling and lifecycle-aware logging</li>
  <li>Safe defaults with escape hatches</li>
  <li>Beginner-friendly, production-ready</li>
</ul>

<hr/>

<h2>Quick Start</h2>

<pre><code>npm install hi-secure</code></pre>

<pre><code>import express from "express";
import { HiSecure } from "hi-secure";

const app = express();

app.use(HiSecure.middleware("api"));

app.listen(3000);
</code></pre>

<hr/>

<h2>Core Helpers</h2>

<h3>Password Hashing</h3>

<pre><code>const hash = await HiSecure.hash(password);
const isValid = await HiSecure.verify(password, hash);
</code></pre>




<h3>Input Validation</h3>

<pre><code>router.post(
  "/register",
  HiSecure.validate([...]),
  controller
);
</code></pre>

<h3>Rate Limiting</h3>

<pre><code>HiSecure.rateLimit({ max: 5, windowMs: 15 * 60 * 1000 });
</code></pre>



<hr/>

<h2>Global CORS Configuration</h2>

<p>
Global CORS defines the baseline access rules for your entire application.
These rules apply to all routes unless explicitly overridden at the route level.
</p>

<p>
This is ideal for standard APIs where most endpoints share the same access policy.
</p>

<hr/>

<h3>Basic Global CORS</h3>

<p>
Enable CORS globally using default configuration.
</p>

<pre><code>app.use(
  HiSecure.middleware({
    cors: true
  })
);
</code></pre>

<hr/>

<h3>Custom Global CORS</h3>

<p>
Define explicit CORS rules for all routes.
</p>

<pre><code>app.use(
  HiSecure.middleware({
    cors: {
      origin: ["https://app.example.com"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    }
  })
);
</code></pre>

<hr/>

<h3>Multiple Client Applications</h3>

<p>
Allow multiple frontends (web, admin, mobile) to access the same API.
</p>

<pre><code>app.use(
  HiSecure.middleware({
    cors: {
      origin: [
        "https://web.example.com",
        "https://admin.example.com",
        "https://mobile.example.com"
      ],
      credentials: true
    }
  })
);
</code></pre>

<hr/>

<h3>Public API (Open Read Access)</h3>

<p>
Use open CORS rules for public or read-only APIs.
</p>

<pre><code>app.use(
  HiSecure.middleware({
    cors: {
      origin: "*",
      methods: ["GET"]
    }
  })
);
</code></pre>

<hr/>

<h2> Route-Level Security (Advanced & Real-World Usage)</h2>

<p>
HiSecure supports fine-grained security control at the route level.
Each capability can be configured independently without affecting global middleware.
</p>

<p>
This allows you to apply strict security where needed (auth, payments, admin)
and relaxed rules for public or internal endpoints.
</p>

<hr/>

<h3>Custom CORS (Deep Control)</h3>

<p>
Route-level CORS is useful when different consumers access different endpoints
(e.g. web app, admin panel, third-party services).
</p>

<p><strong>Example: Webhook endpoint (single trusted origin)</strong></p>

<pre><code>router.post(
  "/webhook",
  HiSecure.cors({
    origin: ["https://trusted-client.com"],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }),
  controller
);
</code></pre>

<p><strong>Example: Admin dashboard with restricted origins</strong></p>

<pre><code>router.get(
  "/admin/stats",
  HiSecure.cors({
    origin: [
      "https://admin.example.com",
      "https://internal.example.com"
    ],
    credentials: true
  }),
  controller
);
</code></pre>

<p><strong>Example: Public API with open read access</strong></p>

<pre><code>router.get(
  "/public/feed",
  HiSecure.cors({ origin: "*" }),
  controller
);
</code></pre>

<hr/>

<h3>Validation (Schema vs Rules — When to Use What)</h3>

<p>
HiSecure automatically detects validation strategy based on input type.
Choose the style based on complexity and ownership.
</p>

<ul>
  <li><strong>express-validator</strong> — quick, form-like validation</li>
  <li><strong>Zod</strong> — complex schemas, reuse, shared contracts</li>
</ul>

<h4>express-validator (Rule-Based, Inline)</h4>

<pre><code>import { HiSecure , body } from "hi-secure";

router.post(
  "/register",
  HiSecure.validate([
    body("email")
      .notEmpty()
      .isEmail(),

    body("password")
      .isLength({ min: 6 }),

    body("role")
      .optional()
      .isIn(["user", "admin"])
  ]),
  controller
);
</code></pre>

<h4>Zod (Schema-Based, Reusable)</h4>

<pre><code>import { HiSecure , z } from "hi-secure";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional()
});

router.post(
  "/register",
  HiSecure.validate(registerSchema),
  controller
);
</code></pre>

<p>
Both approaches produce a unified error response format.
</p>

<hr/>

<h3>Sanitization (Trust Boundaries)</h3>

<p>
Sanitization should reflect trust boundaries.
Not all routes require the same level of strictness.
</p>

<p><strong>User-generated content (allow formatting)</strong></p>

<pre><code>router.post(
  "/comment",
  HiSecure.sanitize({
    allowedTags: ["b", "i", "strong", "em", "a"],
    allowedAttributes: {
      a: ["href"]
    }
  }),
  controller
);
</code></pre>

<p><strong>Strict input (no HTML allowed)</strong></p>

<pre><code>router.post(
  "/feedback",
  HiSecure.sanitize({
    allowedTags: [],
    allowedAttributes: {}
  }),
  controller
);
</code></pre>

<p><strong>Trusted internal pipeline (disable sanitization)</strong></p>

<pre><code>router.post(
  "/internal/import",
  HiSecure.sanitize(false),
  controller
);
</code></pre>

<hr/>

<h3>Full Route-Level Security Composition</h3>

<p>
A real-world admin route combining multiple security layers.
Execution order is deterministic and isolated to the route.
</p>

<pre><code>router.post(
  "/admin/create-user",
  HiSecure.auth({ roles: ["admin"] }),
  HiSecure.rateLimit({ max: 3, windowMs: 10 * 60 * 1000 }),
  HiSecure.cors({
    origin: ["https://admin.example.com"]
  }),
  HiSecure.sanitize(),
  HiSecure.validate([
    body("email").isEmail(),
    body("password").isLength({ min: 8 })
  ]),
  controller
);
</code></pre>



<h2>JWT Mode</h2>

<p>
JWT support is optional. Enable it only if you want authentication features.
</p>

<pre><code>HiSecure.resetInstance();

HiSecure.getInstance({
  auth: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: "1d"
  }
});
</code></pre>

<hr/>


<h2>🔐 Final Authentication Setup</h2>

<p>
This section demonstrates a complete, production-ready authentication setup using HiSecure.
It covers signup, JWT login, Google login, role-based access control, and proper initialization.
</p>

<h3>Features Covered</h3>
<ul>
  <li>Signup using email and password</li>
  <li>Login using email and password (JWT-based)</li>
  <li>Login with Google (ID token verification)</li>
  <li>Role-based protected routes</li>
  <li>Optional authentication support</li>
  <li>Correct HiSecure bootstrap with reset rules</li>
</ul>

<hr/>

<h3>Application Bootstrap (server.js / app.js)</h3>

<pre><code>import express from "express";
import dotenv from "dotenv";
import { HiSecure } from "hi-secure";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

HiSecure.resetInstance();

HiSecure.getInstance({
  auth: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET || "supersecret_32_chars_minimum",
    jwtExpiresIn: "1d",
    googleClientId: process.env.GOOGLE_CLIENT_ID
  }
});

app.use(HiSecure.middleware("api"));

app.use("/auth", authRoutes);

app.listen(3000);
</code></pre>

<p>
<em>Note:</em> <code>resetInstance()</code> is recommended only for tests or starter templates.
It should not be used repeatedly in production runtime.
</p>

<hr/>

<h3>Authentication Routes</h3>

<pre><code>import { Router } from "express";
import {
  signup,
  loginWithJwt,
  loginWithGoogle
} from "../controllers/auth.controller.js";
import { HiSecure } from "hi-secure";

const router = Router();

router.post("/signup", signup);
router.post("/login", loginWithJwt);
router.post("/google", loginWithGoogle);

router.get(
  "/me",
  HiSecure.auth(),
  (req, res) => res.json({ user: req.user })
);

export default router;
</code></pre>

<hr/>

<h3>Authentication Controllers</h3>

<h4>Signup (Email and Password)</h4>

<pre><code>import { HiSecure } from "hi-secure";
import { HttpError } from "../core/errors/HttpError.js";
import User from "../models/User.js";

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      throw HttpError.BadRequest("Email and password required");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw HttpError.Conflict("User already exists");
    }

    const passwordHash = await HiSecure.hash(password);

    const user = await User.create({
      email,
      name,
      passwordHash,
      roles: ["user"],
      provider: "local"
    });

    const token = HiSecure.jwt.sign({
      userId: user.id,
      roles: user.roles
    });

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};
</code></pre>

<hr/>

<h4>Login (Email and Password)</h4>

<pre><code>export const loginWithJwt = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      throw HttpError.Unauthorized("Invalid credentials");
    }

    const isValid = await HiSecure.verify(password, user.passwordHash);
    if (!isValid) {
      throw HttpError.Unauthorized("Invalid credentials");
    }

    const token = HiSecure.jwt.sign({
      userId: user.id,
      roles: user.roles
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};
</code></pre>

<hr/>

<h4>Login with Google</h4>

<pre><code>export const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      throw HttpError.BadRequest("Google idToken required");
    }

    const googleUser = await HiSecure.jwt.google.verifyIdToken(idToken);

    if (!googleUser.email_verified) {
      throw HttpError.Unauthorized("Google email not verified");
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        provider: "google",
        providerId: googleUser.sub,
        roles: ["user"]
      });
    }

    const token = HiSecure.jwt.sign({
      userId: user.id,
      roles: user.roles
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};
</code></pre>

<hr/>

<h3>Role-Based Protected Routes</h3>

<pre><code>app.get(
  "/admin",
  HiSecure.auth({ roles: ["admin"] }),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);
</code></pre>

<hr/>

<h3>JWT Options (Optional)</h3>

<p>
HiSecure does not require JWT options for most use cases.
Default configuration provided during initialization is sufficient.
</p>

<pre><code>HiSecure.getInstance({
  auth: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: "1d"
  }
});
</code></pre>

<p>
Advanced JWT options can be provided only when needed:
</p>

<pre><code>HiSecure.jwt.sign(
  {
    userId: user.id,
    roles: user.roles
  },
  {
    issuer: "my-app",
    audience: ["web", "mobile"],
    subject: "user-auth",
    expiresIn: "7d"
  }
);
</code></pre>

<p>
JWT options are optional and intended for advanced authentication scenarios.
</p>

<hr/>

<h3>Rules to Remember</h3>

<ul>
  <li>Initialize HiSecure once during application startup</li>
  <li>Use resetInstance only for tests or starter templates</li>
  <li>Do not initialize HiSecure inside controllers</li>
  <li>Google login is used for identity verification only</li>
  <li>Authorization is enforced using JWT payload and roles</li>
</ul>

<hr/>


<h2>Summary</h2>

<p>
HiSecure provides a complete, opinionated security layer for Express.
It focuses on correctness, safety and developer productivity.
</p>

<p align="center">
<strong>One dependency. One middleware. Complete security.</strong>
</p>

<hr/>

<h2 align="center">Additional Documentation</h2>

<p align="center">
Advanced patterns, RBAC strategies, adapter extensions and deployment guides
will be added over time.
</p>