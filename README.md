# ER Triage Backend

A minimal Express backend that:

1. Accepts patient submissions (`POST /api/triage`).
2. Uses the OpenAI ChatGPT API to assign an **Emergency Severity Index (ESI 1–5)**.
3. Sends an *immediate* Gmail alert for **ESI 1 (Resuscitation)** cases.
4. Persists every patient to `patients.json`.
5. Exposes a lightweight **admin dashboard** at `/admin.html` where staff can mark a patient as `ongoing` or `done`.

## Quick Start

```bash
git clone <repo>
cd triage-backend
cp .env.example .env                  # fill in your secrets
npm install
npm start
```

- The API runs on **http://localhost:4000** by default.
- The dashboard is available at **http://localhost:4000/admin.html**.

## Environment Variables (`.env`)

| Key               | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `OPENAI_API_KEY`  | Your OpenAI secret key                                  |
| `ALERT_EMAIL_USER`| Gmail address used to send alerts                       |
| `ALERT_EMAIL_PASS`| 16‑character Google App Password (not your Gmail login) |
| `ALERT_EMAIL_TO`  | Where critical‑patient emails should be delivered       |
| `PORT`            | (optional) Port to run the server                       |

> **Google security:** Create an *App Password* under **Google Account → Security → App Passwords** and paste it as `ALERT_EMAIL_PASS`.

## API Reference

### `POST /api/triage`

```json
{
  "name": "Kira Losorata",
  "age": 18,
  "complaint": "I have sudden difficulty speaking…"
}
```

Response:

```json
{
  "id": "8c2…",
  "name": "Kira Losorata",
  "age": 18,
  "complaint": "I have sudden difficulty speaking…",
  "esi": 1,
  "reason": "Possible stroke, life‑threatening",
  "queue": "A556",
  "status": "waiting",
  "createdAt": 1714292000000
}
```

### `GET /api/admin/patients`

Returns **all** stored patients.

### `PATCH /api/admin/patients/:id/status`

```json
{ "status": "done" }
```

## License

MIT
