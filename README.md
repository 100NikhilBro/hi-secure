<h1 align="center">🔒 HiSecure</h1>
<p align="center"><strong>One-line security for Express.js applications</strong></p>

<p align="center">
HiSecure is an all-in-one security framework for Express.js.<br/>
It bundles hashing, authentication, validation, sanitization, rate-limiting, logging, and security headers —  
all through a <strong>single middleware line</strong>.
</p>

<br/>

<!-- 🌟 FEATURE SECTION -->
<div style="border-left:5px solid #6366F1; padding:20px; border-radius:8px; background:#fafafa;">

<h2>✨ Features</h2>

<h3 style="color:#10B981;">🔐 Password Security</h3>
<ul>
  <li><strong>Argon2</strong> – Industry-leading hashing</li>
  <li><strong>Bcrypt fallback</strong> – Auto-fallback system</li>
  <li>Simple hash + verify utilities</li>
</ul>

<h3 style="color:#3B82F6;">🔑 Authentication</h3>
<ul>
  <li><strong>JWT Authentication</strong> (issuer, audience, expiry)</li>
  <li><strong>Google OAuth</strong> integration</li>
  <li><strong>Route protection middleware</strong></li>
</ul>

<h3 style="color:#F59E0B;">⏱️ Rate Limiting</h3>
<ul>
  <li><strong>express-rate-limit</strong> – (Primary)</li>
  <li><strong>rate-limiter-flexible</strong> – (Fallback)</li>
  <li>Modes:
    <ul>
      <li>🛑 <strong>Strict</strong>: 5 req / 10 sec</li>
      <li>🟡 <strong>Relaxed</strong>: 100 req / 15 min</li>
      <li>⚙️ <strong>API</strong>: Custom config</li>
    </ul>
  </li>
</ul>

<h3 style="color:#EC4899;">🧼 Input Sanitization</h3>
<ul>
  <li><strong>sanitize-html</strong> – HTML sanitization</li>
  <li><strong>xss</strong> – Fallback for XSS</li>
  <li>Auto-cleans request body, query & params</li>
</ul>

<h3 style="color:#8B5CF6;">🛡️ Additional Security Layers</h3>
<ul>
  <li>CORS • Helmet • HPP</li>
  <li>Secure JSON parsing</li>
  <li>Query parser hardening</li>
  <li>Gzip compression</li>
  <li>Structured logging</li>
</ul>

</div>

<br/>

<!-- 🚀 QUICK START SECTION -->
<div style="border-left:5px solid #10B981; padding:20px; border-radius:8px; background:#fafafa;">

<h2>🚀 Quick Start</h2>

<h3>📦 Installation</h3>

```bash
npm install hi-secure
```

<h3>🔥 Basic Setup</h3>

```bash
import express from "express";
import { HiSecure } from "hi-secure";

const app = express();

app.use(
  HiSecure.middleware('api')  
  // { cors: true, rateLimit: "relaxed", sanitize: true }
);

app.listen(3000, () => console.log("Server running"));
```


</div> <br/> <!-- 🔑 JWT SECTION --> <div style="border-left:5px solid #3B82F6; padding:20px; border-radius:8px; background:#fafafa;"> 
<h2>🔑 JWT Authentication Setup</h2> <h3 style="color:#3B82F6;">🟦 Initialize JWT</h3>

```bash

require("dotenv").config();
import { HiSecure } from "hi-secure";

HiSecure.getInstance({
  auth: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET || "dev_secret_12345",
    jwtExpiresIn: "7d",
    jwtIssuer: "hi-secure-backend",
    jwtAudience: "hi-secure-users",
  },
});


import express from "express";
import userRoutes from "./routes/UserRoutes.js";

const app = express();
const PORT = 3000;

app.use(HiSecure.middleware("api"));

app.use(
  HiSecure.middleware({
    compression: true,
    json: true,
    sanitize: true,
    validate: true,
    headers: true,
  })
);

app.use("/api/auth", userRoutes);

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));

```


</div> <br/> <!-- 🧩 FULL AUTH SECTION --> <div style="border-left:5px solid #F43F5E; padding:20px; border-radius:8px; background:#fafafa;">
  
  <h2>🧩 Full Authentication Example</h2>
  
  <h3 style="color:#F43F5E;">🔐 Register User</h3>

  ```bash

  import { HiSecure } from "hi-secure";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "User exists" });

  const hashed = await HiSecure.hash(password);

  const user = await User.create({ name, email, password: hashed });

  const token = HiSecure.jwt.sign({ userId: user._id }, { expiresIn: "7d" });

  res.json({ message: "Registered", token });
};

```

<h3 style="color:#F43F5E;">🔐 Login User</h3>

```bash
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await HiSecure.verify(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = HiSecure.jwt.sign({ userId: user._id }, { expiresIn: "7d" });

  res.json({ message: "Login successful", token });
};
```

<h3 style="color:#F43F5E;">👤 Protected Profile Route</h3>

```bash
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ error: "Not found" });

  res.json({ user });
};
```

</div> <br/> <!-- ROUTES --> <div style="border-left:5px solid #F59E0B; padding:20px; border-radius:8px; background:#fafafa;"> 
<h2>📌 Routes Example</h2>

```bash

import express from "express";
import { HiSecure } from "hi-secure";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/UserControllers.js";

const router = express.Router();

router.post("/register", registerUser);

router.post(
  "/login",
  HiSecure.rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),
  loginUser
);

router.get("/profile", HiSecure.auth({ required: true }), getProfile);

export default router;

```

</div> <br/> <h2 align="center">🛠️ More features & docs coming soon…</h2>
<h3 align="center">Made with 🔒 for secure Node.js apps</h3> 







