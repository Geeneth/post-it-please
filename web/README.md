# Post It Please Frontend

Simple Next.js frontend for uploading a short-form video, entering a caption, selecting platforms, and sending the post request to the NestJS backend.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs at `http://localhost:3000` by default.

## Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The frontend only calls your backend. Do not put `ZERNIO_API_KEY` in this project.

## Test The Form

1. Start the backend on `http://localhost:4000`.
2. Start this frontend with `npm run dev`.
3. Open `http://localhost:3000`.
4. Choose a video file, enter a caption, select at least one platform, and click `Post`.
5. The page will show either the backend success response or a friendly error message.
6. The analytics section calls `GET /analytics` on the backend and displays TikTok and Instagram views, comments, likes, and shares when Zernio credentials are configured.
