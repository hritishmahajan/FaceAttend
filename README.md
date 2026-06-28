# FaceAttend — On-Device Facial Attendance App

> **Geofenced · Face-Recognition · Real-Time · Mobile-First**

A production-ready attendance system built with **Vue 3 + Quasar + Cordova** (frontend) and **Node.js + Express + SQLite** (backend). Employees punch in and out using facial recognition — only when physically inside the office boundary.

---

## Live Demo & Download

| Resource | Link |
|---|---|
| **Install as app (PWA)** ⭐ | [Open in Chrome →](https://hritishmahajan.github.io/FaceAttend/) then **⋮ → Install app** |
| Web App (SPA) | [GitHub Pages →](https://hritishmahajan.github.io/FaceAttend/) |
| Backend API | [Render →](https://dekho-mai-aagya-api.onrender.com) |
| API Health | [/health →](https://dekho-mai-aagya-api.onrender.com/health) |
| APK Download | [Releases →](../../releases/latest) |

> **Recommended: install as a PWA.** Open the link in Chrome on your phone and
> tap **⋮ → Install app** (or *Add to Home Screen*). You get the app icon, a
> fullscreen standalone window, native camera/GPS permission prompts, and
> **automatic updates** — every new deploy reaches installed apps on next open,
> no reinstall. The APK is available too, but UI updates there require
> reinstalling a new build.


---

## Features

### Employee Flow
```
Register → Verify OTP → Register Face → (Daily) Check Geofence → Face Scan → Punch In
                                                                  Face Scan → Punch Out
```

| Step | Description |
|---|---|
| **Registration** | Name, email, phone, password → account created |
| **OTP Verification** | 6-digit code sent to email (10-min expiry) |
| **Face Registration** | Front camera captures 128-dimension face descriptor via `face-api.js` |
| **Geofencing** | Device GPS checked against office coordinates + radius (server-side Haversine formula) |
| **Punch In** | Face scan matches registered descriptor → punch-in photo + timestamp saved |
| **Punch Out** | Same face scan → shift duration automatically calculated |

### Admin Dashboard
- Real-time stats: Total / Present / Absent / Punched-Out counts
- Full attendance table filterable by date or employee
- **Punch-in & punch-out photos** viewable inline
- **Shift duration** shown per record (time between first punch-in and last punch-out)
- Employee roster with face-registration status

---

## Architecture

```
┌──────────────────────────────────────────┐
│           Mobile App (Cordova)           │
│   Vue 3 + Quasar + face-api.js           │
│                                          │
│  ┌────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Camera │  │   GPS    │  │ Storage │  │
│  │(WebRTC)│  │ Geofence │  │  (JWT)  │  │
│  └────────┘  └──────────┘  └─────────┘  │
└──────────────────┬───────────────────────┘
                   │ HTTPS / REST API
┌──────────────────▼───────────────────────┐
│           Node.js + Express              │
│                                          │
│  /api/auth      ← OTP, JWT              │
│  /api/face      ← descriptor storage    │
│  /api/attendance← punch in/out + geo    │
│  /api/admin     ← reports & photos      │
│                                          │
│  SQLite (better-sqlite3)                 │
│  Multer uploads (punch photos)           │
└──────────────────────────────────────────┘
```

### Face Recognition Pipeline
```
Video Frame → TinyFaceDetector → FaceLandmark68TinyNet → FaceRecognitionNet
                                                              ↓
                                              128-dim Float32Array descriptor
                                                              ↓
                                          Euclidean distance < 0.5 → ✅ Match
```

All inference runs **on-device** inside the WebView. No face data is sent to external servers.

### Geofence Algorithm
```
Server-side Haversine distance:
  d = 2R · arctan(√a / √(1−a))
  where a = sin²(Δlat/2) + cos(lat₁)·cos(lat₂)·sin²(Δlng/2)

Employee must be within OFFICE_RADIUS_METERS of (OFFICE_LAT, OFFICE_LNG)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Framework | [Quasar v2](https://quasar.dev) (Vue 3) + [Cordova](https://cordova.apache.org) |
| Face Recognition | [face-api.js](https://github.com/justadudewhohacks/face-api.js) (TensorFlow.js) |
| State Management | [Pinia](https://pinia.vuejs.org) |
| HTTP Client | [Axios](https://axios-http.com) |
| Backend | Node.js + [Express 4](https://expressjs.com) |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Auth | JWT + Nodemailer OTP |
| File Storage | Local filesystem (Multer) |
| Hosting | Render (backend) + GitHub Pages (SPA) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
Attendance/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Register, Login, OTP verify/resend
│   │   ├── face.js          # Face descriptor register & verify
│   │   ├── attendance.js    # Punch in/out with geofence check
│   │   └── admin.js         # Admin reports, photos, stats
│   ├── middleware/
│   │   └── auth.js          # JWT + admin guard
│   ├── uploads/             # Punch-in/out photos (gitignored)
│   ├── db.js                # SQLite schema + connection
│   ├── server.js            # Express app entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── boot/
│   │   │   ├── axios.js     # Axios instance + JWT interceptor
│   │   │   └── face-api.js  # Load face-api.js models on app start
│   │   ├── components/
│   │   │   └── FaceScanner.vue  # Reusable camera + face detection component
│   │   ├── layouts/
│   │   │   ├── AuthLayout.vue   # Login/Register/OTP wrapper
│   │   │   └── AppLayout.vue    # Sidebar nav + geofence indicator
│   │   ├── pages/
│   │   │   ├── LoginPage.vue
│   │   │   ├── RegisterPage.vue
│   │   │   ├── OtpPage.vue
│   │   │   ├── FaceSetupPage.vue
│   │   │   ├── DashboardPage.vue
│   │   │   ├── HistoryPage.vue
│   │   │   ├── ProfilePage.vue
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.vue
│   │   │       ├── EmployeesPage.vue
│   │   │       ├── AttendancePage.vue
│   │   │       └── RecordDetailPage.vue
│   │   ├── router/          # Vue Router (hash mode for Cordova)
│   │   ├── services/
│   │   │   └── geofence.js  # Geolocation wrapper
│   │   └── stores/
│   │       └── auth.js      # Pinia auth store (JWT + user)
│   ├── src-cordova/
│   │   └── config.xml       # Cordova config + permissions
│   └── quasar.config.js
│
├── .github/workflows/
│   ├── ci.yml               # Build + smoke test on every PR
│   └── deploy.yml           # Auto-deploy on main push
└── README.md
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Android Studio | Latest (for APK build) |
| Java JDK | 17 |

### 1. Clone

```bash
git clone https://github.com/hritishmahajan/FaceAttend.git
cd FaceAttend
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set email credentials and office coordinates
npm install
npm start
# Server runs on http://localhost:3000
# Admin seeded automatically from ADMIN_EMAIL + ADMIN_PASSWORD
```

**Key `.env` variables:**

```env
JWT_SECRET=change_this_in_production
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_gmail_app_password   # Generate at myaccount.google.com/apppasswords

OFFICE_LAT=28.6139      # Office latitude
OFFICE_LNG=77.2090      # Office longitude
OFFICE_RADIUS_METERS=200
```

> **Development mode** (`NODE_ENV=development`): OTPs are printed to the console — no email needed.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm install -g @quasar/cli@2.3.0

# Set backend URL
echo "API_URL=http://localhost:3000" > .env

# Run in browser
quasar dev

# Build SPA
quasar build

# Build Android APK (requires Android Studio + ANDROID_HOME set)
quasar build -m cordova -T android
```

### 4. Download face-api.js Models

The browser build requires model weights in `frontend/public/models/`. Run:

```bash
cd frontend
node -e "
const fs = require('fs');
const https = require('https');
const path = require('path');
const base = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const models = 'public/models';
fs.mkdirSync(models, { recursive: true });
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
];
files.forEach(f => {
  const out = fs.createWriteStream(path.join(models, f));
  https.get(base + '/' + f, r => r.pipe(out));
  console.log('Downloading', f);
});
"
```

Or download manually from the [face-api.js weights folder](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) into `frontend/public/models/`.

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, phone, password }` | Create account, send OTP |
| POST | `/api/auth/verify-otp` | `{ userId, otp }` | Verify OTP → returns JWT |
| POST | `/api/auth/login` | `{ email, password }` | Login → send OTP |
| POST | `/api/auth/resend-otp` | `{ userId }` | Resend OTP |

### Face

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/face/register` | ✅ | Upload face descriptor + photo |
| POST | `/api/face/verify` | ✅ | Confirm stored descriptor exists |

### Attendance

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/attendance/punch-in` | ✅ | Geofence check + save punch-in |
| POST | `/api/attendance/punch-out` | ✅ | Geofence check + save punch-out |
| GET | `/api/attendance/today` | ✅ | Today's record for current user |
| GET | `/api/attendance/my` | ✅ | Last 30 records for current user |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Present/absent counts for a date |
| GET | `/api/admin/attendance` | Admin | All records (filter by date/user) |
| GET | `/api/admin/attendance/:id` | Admin | Single record with shift duration |
| GET | `/api/admin/employees` | Admin | All employee profiles |
| GET | `/api/admin/photo/:filename` | Admin | Serve punch photo |
| GET | `/api/admin/geofence` | Admin | Current geofence config |

---

## Deployment

### Backend → Render (Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add Environment Variables (from `.env.example`)
7. Copy the deploy hook URL → add as `RENDER_DEPLOY_HOOK` in GitHub Secrets

### Frontend → GitHub Pages

1. Add `API_URL=https://your-service.onrender.com` to GitHub Secrets
2. Push to `main` — GitHub Actions builds and deploys automatically
3. Enable Pages in repo Settings → Pages → `gh-pages` branch

### Build Android APK

```bash
# Install Android platform
cd frontend/src-cordova
cordova platform add android

# Build signed release APK
cd ..
quasar build -m cordova -T android -- --release
```

APK will be at `frontend/src-cordova/platforms/android/app/build/outputs/apk/release/`.

---

## Security Notes

- Face descriptors (128 floats) are stored server-side; no raw facial images leave the device for matching
- Geofence is validated **server-side** — spoofing GPS on the client won't bypass the check
- OTPs expire in 10 minutes and are single-use
- Rate limiting applied to all auth endpoints (30 req / 15 min)
- JWT tokens expire in 7 days

---

## Screenshots

| Login | OTP | Face Setup |
|---|---|---|
| ![Login](docs/login.png) | ![OTP](docs/otp.png) | ![Face Setup](docs/face-setup.png) |

| Dashboard | Punch In Scan | Admin |
|---|---|---|
| ![Dashboard](docs/dashboard.png) | ![Scan](docs/scan.png) | ![Admin](docs/admin.png) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

MIT © 2025 [Mahajan](https://github.com/hritishmahajan)
