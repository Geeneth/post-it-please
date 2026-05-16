# Post It Please Backend

Simple NestJS backend for receiving a multipart post request, uploading media to Zernio, and creating a Zernio post.

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

The API runs at `http://localhost:4000` by default.

## Environment

```bash
PORT=4000
FRONTEND_URL=http://localhost:3000
ZERNIO_API_KEY=your_zernio_api_key_here
ZERNIO_BASE_URL=https://zernio.com/api/v1
ZERNIO_TIMEZONE=UTC
ZERNIO_PLATFORM_ACCOUNT_IDS={"tiktok":"acc_tiktok","instagram":"acc_instagram","youtube":"acc_youtube","twitter":"acc_twitter","linkedin":"acc_linkedin","facebook":"acc_facebook"}
```

`ZERNIO_PLATFORM_ACCOUNT_IDS` maps the platform values selected by the frontend to the connected Zernio account IDs required by the Zernio `platforms` payload.

## Endpoint

### `POST /posts`

Accepts `multipart/form-data`:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `media` | file | Yes | Short-form video file. |
| `caption` | string | Yes | Sent to Zernio as `content`. |
| `platforms` | JSON string array | Yes | Example: `["tiktok","instagram"]`. |
| `scheduledAt` | string | No | Sent to Zernio as `scheduledFor`. If omitted, backend sends `publishNow: true`. |

## Example Curl

```bash
curl -X POST http://localhost:4000/posts \
  -F "media=@/path/to/video.mp4" \
  -F "caption=Launching a new clip from Post It Please" \
  -F 'platforms=["tiktok","instagram"]'
```

With scheduling:

```bash
curl -X POST http://localhost:4000/posts \
  -F "media=@/path/to/video.mp4" \
  -F "caption=Scheduled from Post It Please" \
  -F 'platforms=["twitter","linkedin"]' \
  -F "scheduledAt=2026-03-15T10:00:00Z"
```

### `GET /analytics`

Fetches TikTok and Instagram post analytics from Zernio and returns frontend-ready totals plus daily chart data.

Query params:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `fromDate` | string | No | `YYYY-MM-DD`. Defaults to 29 days before `toDate`. |
| `toDate` | string | No | `YYYY-MM-DD`. Defaults to today. |

Example:

```bash
curl "http://localhost:4000/analytics?fromDate=2026-03-01&toDate=2026-03-31"
```

The backend calls Zernio `GET /analytics` once for TikTok and once for Instagram, using `platform`, `fromDate`, `toDate`, `limit`, `page`, and `sortBy` query params. If `ZERNIO_PLATFORM_ACCOUNT_IDS` contains `tiktok` or `instagram`, the backend also sends the matching `accountId`.

## Zernio Integration Notes

The implementation uses the endpoint and payload names verified from the Zernio docs:

1. `POST /media/presign`
   - Request: `filename`, `contentType`, optional `size`
   - Response: `uploadUrl`, `publicUrl`, `key`, `type`
2. `PUT uploadUrl`
   - Uploads the file bytes directly to storage.
3. `POST /posts`
   - Request: `content`, `mediaItems`, `platforms`, `scheduledFor` or `publishNow`, `timezone`
4. `GET /analytics`
   - Query: `platform`, `fromDate`, `toDate`, `limit`, `page`, `sortBy`

Update the exact Zernio request shape in `src/zernio/zernio.service.ts` if your account or platform-specific requirements need extra fields such as YouTube title, TikTok settings, custom thumbnails, or platform-specific media rules.
