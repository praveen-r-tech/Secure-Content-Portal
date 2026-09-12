# Secure Content Portal

A production-ready full-stack web portal for sharing **videos**, **PDFs**, **HTML pages**, and **Markdown documents** with two roles — **Admin** (upload / edit / delete / audit) and **Viewer** (browse / stream / view).

Built for the **Internship Screening Assignment: Secure Content Portal**, fulfilling all core functional requirements, content protection constraints, and bonus objectives.

---

## 1. Project Overview

Secure Content Portal is an enterprise-grade role-based content management and secure delivery system.
- **Admin**: Uploads MP4 videos, PDFs, HTML, and Markdown (.md) documents, edits metadata, deletes content (with two-step confirmation), monitors usage analytics (views and last-viewed timestamps), and inspects an audit trail of administrative actions.
- **Viewer**: Discovers and accesses training and reference material via protected, inline streaming viewers. Viewers cannot see administrative controls or access admin API endpoints.
- **Content Protection**: The application eliminates direct public file URLs. Content is streamed exclusively through an authenticated, token-gated backend proxy endpoint supporting HTTP 206 Range Requests for video, canvas-rendered PDF pages with dynamic security watermarking, sandboxed iframe delivery for HTML, and authenticated reader rendering for Markdown.

---

## 2. Features & Assignment Requirements Met

| Requirement | Implementation Details | Status |
| --- | --- | :---: |
| **Google OAuth Authentication** | Sign-in via Google Identity Services. Google ID token verified server-side with `google-auth-library`. | ✅ Satisfied |
| **Default Viewer Role** | First-time users default to `viewer`. Role elevation to `admin` is controlled via `ADMIN_EMAILS` allow-list. | ✅ Satisfied |
| **Secure Session Handling** | Sessions handled exclusively via **`HttpOnly` cookies** signed with JWT. No tokens stored in `localStorage`. Seamless session restoration across browser reloads. | ✅ Satisfied |
| **Admin CRUD** | Upload videos (MP4), PDFs, HTML, and Markdown (.md) with title, description, category; edit metadata; delete with confirmation dialog. | ✅ Satisfied |
| **Strict Authorization** | RBAC enforced strictly server-side (`requireAdmin` middleware returns 403). Viewers cannot reach admin APIs even by guessing URLs. | ✅ Satisfied |
| **Content Protection** | Token-gated streaming route (`/api/content/:id/stream`). Storage URLs never exposed to frontend. Native HTTP 206 Range Requests for video seeking. | ✅ Satisfied |
| **PDF Page Rendering** | Rendered page-by-page onto an HTML5 `<canvas>` via PDF.js with bundled offline worker; download affordances disabled; dynamic watermark applied. | ✅ Satisfied |
| **Sandboxed HTML** | Served with `text/html; charset=utf-8` and strict `Content-Security-Policy` inside an `iframe` with `sandbox="allow-scripts"`. | ✅ Satisfied |
| **Markdown Document Viewer** | Streamed safely and rendered as formatted HTML with source/rendered toggling and watermark overlay. | ✅ Satisfied |
| **File Validation** | Multer fileFilter and backend magic-byte sniffing (`%PDF-`, `ftyp`, `<`, `.md`) with strict file-size limits (MP4: 100MB, PDF: 30MB, HTML: 5MB, MD: 5MB). | ✅ Satisfied |
| **Responsive UI** | Mobile-friendly and desktop-optimized layout with loading states and comprehensive error handling. | ✅ Satisfied |
| **Bonus: Usage Tracking** | Per-item view count and last-viewed timestamps visible to admins only. | 🌟 Bonus |
| **Bonus: Search & Filter** | Search by title/description and filter by content type (Video, PDF, HTML, Markdown) and categories. | 🌟 Bonus |
| **Bonus: Dynamic Watermarking** | Viewer email and timestamp subtly overlaid on video and PDF views as deterrent against screen capture. | 🌟 Bonus |
| **Bonus: Audit Logging** | Audit log tracking admin upload, edit, and delete operations with actor email and timestamp. | 🌟 Bonus |

---

## 3. Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React 19, Vite, React Router 7, Axios, Lucide Icons | Client-side SPA with responsive UI |
| **Backend** | Node.js (Express 5), Multer, Cookie-Parser, Helmet | REST API, streaming proxy, and RBAC |
| **Auth** | Google Identity Services, Google Auth Library, JWT | Google OAuth & HttpOnly cookie sessions |
| **Database** | MongoDB Atlas / Mongoose | Metadata, users, usage stats, and audit logs |
| **Storage** | Cloudinary (Free Tier) | Encrypted cloud object storage with signed URLs |
| **PDF Viewer** | PDF.js (`pdfjs-dist`) | Canvas rendering without native PDF download controls |
| **Video Engine** | HTML5 Video + HTTP 206 Partial Content | Streaming playback and seeking without raw file URLs |

---

## 4. Architecture

```text
[ Browser Client ]
       │
       ├─ (1) Sign-in with Google OAuth
       │      ───► POST /api/auth/google
       │           └─ Verify Google ID Token (google-auth-library)
       │           └─ Find/Create User in MongoDB (default role: viewer)
       │           └─ Set HttpOnly session_token Cookie
       │
       ├─ (2) Browse Content Metadata
       │      ───► GET /api/content  (Cookie verified via authMiddleware)
       │           └─ Returns metadata only (no storage URLs)
       │           └─ Returns view count / last viewed metrics to Admins only
       │
       ├─ (3) Stream Protected Content
       │      ───► GET /api/content/:id/stream
       │           └─ Verifies HttpOnly session cookie
       │           └─ Increments viewCount & updates lastViewedAt
       │           └─ Video: Proxies HTTP 206 Partial Content Range Requests
       │           └─ PDF: Streams binary to PDF.js canvas renderer
       │           └─ HTML: Serves sandboxed text/html into iframe
       │
       └─ (4) Admin CRUD Operations
              ───► POST / PUT / DELETE /api/content/:id
                   └─ Checks requireAdmin (returns 403 if role != admin)
                   └─ Performs file validation & storage management
                   └─ Records entry in AuditLog collection
```

---

## 5. Security Architecture & Trade-Offs

### Security Protections Implemented
1. **No Permanent Public Links**: Permanent Cloudinary storage URLs are never transmitted to the client. The browser network tab only sees requests to the application's own `/api/content/:id/stream` endpoint.
2. **Token-Gated Access**: The streaming endpoint requires a valid, authenticated session. If an unauthorized party copies the stream URL, the request is rejected with `401 Unauthorized`.
3. **HTTP 206 Range Request Streaming**: Videos are streamed incrementally rather than served as full downloadable files. The `<video>` player includes `controlsList="nodownload"` and right-click context menu prevention.
4. **Canvas-Rendered PDFs**: PDFs are rendered page-by-page directly onto HTML5 `<canvas>` elements using PDF.js. No browser-native PDF viewer (with download/print buttons) is ever shown.
5. **Sandboxed HTML**: HTML content is served with strict Content-Security-Policy headers inside an iframe configured with `sandbox="allow-scripts"`, preventing cross-site scripting or parent window manipulation.
6. **HttpOnly Cookie Sessions**: Session tokens are transmitted exclusively in `HttpOnly`, `SameSite=Lax` cookies, neutralizing token theft via XSS. No tokens are stored in `localStorage`.
7. **Deep File Validation**: Uploaded files are inspected for real magic bytes (`%PDF-`, `ftyp`, `<`) and enforce hard size limits.
8. **Subtle Security Watermarking**: The viewer's authenticated email and timestamp are stamped diagonally across PDF pages and overlaid over videos to deter unauthorized screen captures.

### Real Boundaries vs. Deterrents
- **Real Boundaries**: Server-side RBAC, HttpOnly session cookies, token-gated backend proxying, backend file signature sniffing, and sandboxed HTML iframes. A non-admin cannot perform admin operations even if they craft custom HTTP requests. An unauthenticated user cannot access content bytes.
- **Deterrents**: UI right-click suppression, `controlsList="nodownload"`, and watermark overlays. In any web application, bytes that reach the client's screen can theoretically be recorded or captured by a determined actor with screen recording tools or root debugger access.
- **Future Enhancements for Enterprise Production**: Expiring session-bound streaming tokens with DRM (e.g. Apple FairPlay / Widevine via HLS/DASH), dynamic stenographic watermarking, and IP/geolocation anomaly detection.

---

## 6. Environment Configuration

### Server Configuration (`server/.env`)

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/secure-content-portal?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ADMIN_EMAILS=rajupraveen.2005@gmail.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
```

### Client Configuration (`client/.env`)

```ini
VITE_API_BASE_URL=
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 7. Localhost Setup & Running

### Prerequisites
- Node.js 18+
- Active MongoDB database (local or Atlas)
- Cloudinary free-tier credentials

### Setup Steps
1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   npm run install:all
   ```

2. **Configure environment files**:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```
   - Frontend is available at: **<http://localhost:5173>**
   - Backend API is available at: **<http://localhost:5000/api/health>**

---

## 8. Free-Tier Deployment Guide

| Component | Recommended Platform | Deployment Steps |
| --- | --- | --- |
| **Frontend** | Vercel / Netlify | Root directory: `client`. Build command: `npm run build`. Output directory: `dist`. Env vars: `VITE_GOOGLE_CLIENT_ID`, `VITE_API_BASE_URL` (points to backend URL). |
| **Backend** | Render / Railway | Root directory: `server`. Build command: `npm install`. Start command: `node server.js`. Add environment variables from `server/.env.example`. |
| **Database** | MongoDB Atlas | Free M0 sandbox cluster. Set Network Access to `0.0.0.0/0`. |
| **Storage** | Cloudinary | Free tier account for image, raw, and video storage. |
| **Auth** | Google Cloud Console | Create OAuth 2.0 Client ID. Add deployed frontend URL to *Authorized JavaScript origins*. |
