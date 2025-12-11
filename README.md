<h1 align="center">🔒 HiSecure</h1>
<p align="center"><strong>One-line security for Express.js</strong></p>

<p align="center">
HiSecure replaces <strong>10+ common Express security libraries</strong> with one unified API.<br/>
It provides hashing, authentication, validation, sanitization, rate-limiting, CORS,<br/>
security headers, compression, JSON parsing, query parsing and logging — all in a single layer.
</p>

<hr/>

<h2>🚀 Overview</h2>

<p>A traditional Express app requires installing & configuring:</p>

<ul>
  <li><code>argon2</code> / <code>bcrypt</code> — password hashing</li>
  <li><code>express-validator</code> / <code>zod</code> — validation</li>
  <li><code>sanitize-html</code> / <code>xss</code> — sanitization</li>
  <li><code>helmet</code> — security headers</li>
  <li><code>hpp</code> — HTTP parameter pollution protection</li>
  <li><code>cors</code> — Cross-Origin configuration</li>
  <li><code>express-rate-limit</code> — primary rate limiting</li>
  <li><code>rate-limiter-flexible</code> — fallback rate limiting</li>
  <li><code>compression</code> — gzip enablement</li>
  <li><code>body-parser</code> — JSON & urlencoded (now replaced by Express)</li>
  <li><code>qs</code> — secure query parsing</li>
</ul>

<p><strong>HiSecure replaces all of them with one API.</strong></p>

<hr/>

<h2>✨ Feature Matrix</h2>

<table>
  <tr>
    <th>Capability</th>
    <th>Status</th>
    <th>Notes</th>
  </tr>

  <tr>
    <td>🔐 Authentication (JWT + Google OAuth)<br/><small>HiSecure.jwt.sign() / verify()</small></td>
    <td>✅ Stable</td>
    <td>Built-in issuer, audience, expiry, subject. Google ID-token adapter included.</td>
  </tr>

  <tr>
    <td>🔑 Password Hashing (Argon2 + bcrypt fallback)<br/><small>HiSecure.hash() / verify()</small></td>
    <td>✅ Stable</td>
    <td>Argon2-first architecture with bcrypt fallback. Zero-config, secure API.</td>
  </tr>

  <tr>
    <td>🛡 Route Protection<br/><small>HiSecure.auth()</small></td>
    <td>✅ Stable</td>
    <td>Lightweight auth guard + optional roles (RBAC ready).</td>
  </tr>

  <tr>
    <td>📏 Validation (Zod + express-validator)<br/><small>HiSecure.validate()</small></td>
    <td>✅ Stable</td>
    <td>Primary Zod adapter; express-validator fallback. Uniform error shape.</td>
  </tr>

  <tr>
    <td>🧼 Sanitization (HTML + XSS)<br/><small>sanitize-html + xss</small></td>
    <td>✅ Stable</td>
    <td>Sanitizes body, query, params. Protects against HTML injection & XSS.</td>
  </tr>

  <tr>
    <td>⏱ Rate Limiting<br/><small>strict / relaxed / api / custom</small></td>
    <td>✅ Stable</td>
    <td>
      Primary: express-rate-limit<br/>
      Fallback: <strong>rate-limiter-flexible</strong><br/>
      Presets + per-route overrides supported.
    </td>
  </tr>

  <tr>
    <td>🌐 CORS</td>
    <td>✅ Stable</td>
    <td>Dynamic allowlist + full custom configuration.</td>
  </tr>

  <tr>
    <td>🧱 Security Headers<br/><small>helmet + hpp</small></td>
    <td>✅ Stable</td>
    <td>Automatically applies essential security headers + HPP protection.</td>
  </tr>

  <tr>
    <td>📦 JSON & URL Parsing</td>
    <td>✅ Stable</td>
    <td>Express JSON + urlencoded toggle via one option.</td>
  </tr>

  <tr>
    <td>🔍 Query Parsing (qs)</td>
    <td>✅ Stable</td>
    <td>Secure deep query parsing built-in.</td>
  </tr>

  <tr>
    <td>🌀 Compression<br/><small>gzip</small></td>
    <td>✅ Stable</td>
    <td>One-flag toggle: <code>compression: true</code>.</td>
  </tr>

  <tr>
    <td>📊 Structured Logging</td>
    <td>⚠️ Beta</td>
    <td>Unified logs across all adapters and internal systems.</td>
  </tr>

  <tr>
    <td>🔧 Adapter System</td>
    <td>✅ Stable</td>
    <td>Replace hashing, validation, sanitizer logic without rewriting routes.</td>
  </tr>
</table>

<hr/>

<h2>⚡ Developer Experience Highlights</h2>

<ul>
  <li>✨ One-line global security with <strong>HiSecure.middleware()</strong></li>

  <li>🔐 Password utilities:
    <br/>• <strong>HiSecure.hash()</strong> for Argon2-based hashing  
    <br/>• <strong>HiSecure.verify()</strong> for unified password checks  
    <small>No salts, no configs, no manual imports.</small>
  </li>

  <li>🔑 Token utilities:
    <br/>• <strong>HiSecure.jwt.sign()</strong>  
    <br/>• <strong>HiSecure.jwt.verify()</strong>  
    <small>Issuer, audience, expiry, subject handling built-in.</small>
  </li>

  <li>📏 Developer-friendly validation with <strong>HiSecure.validate()</strong></li>
  <li>🛡 Route protection simplified with <strong>HiSecure.auth()</strong></li>
  <li>⏱ Per-route & global rate limiting via <strong>HiSecure.rateLimit()</strong></li>

  <li>🧼 Auto-sanitization (HTML + XSS) without writing custom middleware</li>
  <li>🔧 Configure everything from one object</li>
  <li>🛠 Removes the need for configuring 10+ libraries manually</li>
  <li>🛡 Guarantees consistent security across all environments</li>
  <li>📦 Works with both new & existing Express apps</li>
  <li>⚙️ Perfect for production REST APIs & microservices</li>
</ul>

<hr/>

<h2>📌 Summary</h2>

<p>HiSecure provides a complete security layer:</p>

<ul>
  <li><strong>JWT Authentication</strong> (issuer, audience, Google OAuth)</li>
  <li><strong>Password Hashing</strong> (Argon2 + bcrypt fallback)</li>
  <li><strong>Validation</strong> (Zod + express-validator)</li>
  <li><strong>Sanitization</strong> (HTML & XSS protection)</li>
  <li><strong>Rate Limiting</strong> (express-rate-limit + rate-limiter-flexible)</li>
  <li><strong>CORS + Security Headers + Compression</strong></li>
  <li><strong>JSON & Query Parsing</strong> (body + qs)</li>
</ul>

<p align="center"><strong>
Security without complexity.<br/>
A single dependency — complete Express security.
</strong></p>
