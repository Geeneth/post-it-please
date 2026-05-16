# Post It Please

A short-form video posting tool that lets you upload a video, write a caption, pick platforms, and publish (or schedule) across TikTok and Instagram through [Zernio](https://zernio.com). Analytics from both platforms are surfaced on the home page.

The repo contains three independent components:

| Component | Stack | Purpose |
|---|---|---|
| `api/` | NestJS | Backend — receives uploads, talks to Zernio |
| `web/` | Next.js 15 | Frontend — upload form + analytics dashboard |
| `video-editor/` | Python (desktop) | Standalone video prep tool *(work in progress — see below)* |

---

## Prerequisites

- **Node.js** 20+ and **npm** (for `api` and `web`)
- **Python** 3.10+ (for `video-editor`)
- **FFmpeg** installed and on your `$PATH` (required by the video editor)
- A **Zernio** account with an API key and connected social accounts

---

## 1. Backend (`api/`)

The NestJS backend receives a multipart upload from the frontend, presigns a Zernio media upload, pushes the file to storage, and creates a Zernio post. It also fetches TikTok and Instagram analytics from Zernio and returns them to the frontend.

### Setup

```bash
cd api
npm install
```

Create a `.env` file in `api/`:

```bash
# api/.env

PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Zernio — required for real posts and analytics
ZERNIO_API_KEY=your_zernio_api_key_here
ZERNIO_BASE_URL=https://zernio.com/api/v1
ZERNIO_TIMEZONE=UTC

# Map each platform name to its connected Zernio account ID.
# Find account IDs in your Zernio dashboard under Connected Accounts.
ZERNIO_PLATFORM_ACCOUNT_IDS={"tiktok":"xxx","instagram":"xxx"}
```

Start the dev server:

```bash
npm run start:dev
```

The API runs at `http://localhost:4000`.

> **Development mode:** When `NODE_ENV=development`, the analytics endpoint returns randomly generated fake data so you can develop the frontend without needing live Zernio credentials. Set `NODE_ENV=production` (or remove it) to fetch real data.

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | Port the API listens on |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin |
| `NODE_ENV` | No | — | Set to `development` for fake analytics data |
| `ZERNIO_API_KEY` | **Yes** | — | Your Zernio API key |
| `ZERNIO_BASE_URL` | No | `https://zernio.com/api/v1` | Zernio API base URL |
| `ZERNIO_TIMEZONE` | No | `UTC` | Timezone sent on post creation |
| `ZERNIO_PLATFORM_ACCOUNT_IDS` | **Yes** | — | JSON object mapping platform names to Zernio account IDs |

---

## 2. Frontend (`web/`)

The Next.js frontend provides the upload form (video file, caption, platform selection, optional schedule) and an analytics dashboard showing views, likes, comments, and shares for TikTok and Instagram.

### Setup

```bash
cd web
npm install
cp .env.example .env.local
```

Edit `web/.env.local`:

```bash
# web/.env.local

NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:4000` | URL of the backend API |

> Do **not** put `ZERNIO_API_KEY` in the frontend. All Zernio calls go through the backend.

---

## 3. Zernio Setup

Zernio is the third-party service that handles social media publishing and analytics. Before the backend can post or fetch data, you need to:

1. **Create a Zernio account** at [zernio.com](https://zernio.com).
2. **Generate an API key** in your Zernio account settings and set it as `ZERNIO_API_KEY` in `api/.env`.
3. **Connect your social accounts** (TikTok, Instagram, etc.) inside the Zernio dashboard.
4. **Find the account IDs** for each connected account (available in the Zernio dashboard under Connected Accounts).
5. **Build the `ZERNIO_PLATFORM_ACCOUNT_IDS` JSON string** mapping each platform key to its account ID and add it to `api/.env`. Example:

```bash
ZERNIO_PLATFORM_ACCOUNT_IDS={"tiktok":"12345","instagram":"67890"}
```

The platform keys must match what the frontend sends (`tiktok`, `instagram`). If a platform is selected in the UI but has no matching entry in this map, the backend will return a `400` error.

### Zernio publish flow (for reference)

1. `POST /media/presign` — backend requests a presigned upload URL from Zernio.
2. `PUT <uploadUrl>` — backend streams the video bytes directly to Zernio's storage.
3. `POST /posts` — backend creates the post with content, media reference, platform account IDs, timezone, and either `scheduledFor` or `publishNow: true`.

---

## Running everything locally

Start the backend and frontend in separate terminals:

```bash
# Terminal 1
cd api && npm run start:dev

# Terminal 2
cd web && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## 4. Video Editor (`video-editor/`) — Work in Progress

> **Note:** The video editor is a work in progress and is a completely separate, standalone tool. It has no connection to the `api` or `web` components. It exists as a quick local utility for preparing daily short-form videos before uploading them through the main app.

The video editor is a Python desktop application (CustomTkinter + MoviePy) that takes a main video clip, an overlay image, and an outro clip and renders them into a single output file ready to upload.

### What it does

- Overlays a branded image on the main clip at a fixed position
- Appends an outro video with a 1-second crossfade transition
- Outputs a single `.mp4` ready for upload via the web form

### Setup

```bash
cd video-editor
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

FFmpeg must be installed separately and available on your `$PATH`:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

Run the app:

```bash
python app.py
```

### Dependencies

| Package | Purpose |
|---|---|
| `customtkinter` | Desktop UI |
| `moviepy` | Video rendering and composition |
| `Pillow` | Image processing for the overlay |
| `imageio` / `imageio-ffmpeg` | FFmpeg bridge for MoviePy |
| `numpy` | Array operations for video frames |

### Notes

- Default file paths in `app.py` are currently hardcoded to a local machine path. Update them to match your own directory before running.
- This tool is standalone — the workflow is: edit locally with the video editor, then upload the exported file through the web form.
- No environment variables are required.
