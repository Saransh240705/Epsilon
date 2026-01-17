# Epsilon Backend

AI-powered brand intelligence backend for the Epsilon application.

## Features

- **Brand DNA Audit** - Analyze brand guidelines and detect drift categories
- **Drift Analysis** - Deep analysis with executive summaries
- **Brand Comparison** - Compare two brand subjects with symmetry metrics
- **Reel Generation** - AI-enhanced video prompt generation

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status
- `GET /api/health/ready` - Readiness check

### Brand Analysis
- `POST /api/brand/audit` - Perform brand DNA audit
- `POST /api/brand/analyze-drifts` - Deep drift analysis

### Comparison
- `POST /api/comparison/brands` - Compare two brand subjects

### Reel Generation
- `POST /api/reel/enhance-prompt` - Enhance video prompt
- `POST /api/reel/generate` - Generate video reel
- `GET /api/reel/status/:operationId` - Check generation status

### Analysis
- `GET /api/analysis/status` - Service availability
- `POST /api/analysis/comprehensive` - Full brand analysis

## API Examples

### Brand Audit
```bash
curl -X POST http://localhost:3001/api/brand/audit \
  -H "Content-Type: application/json" \
  -d '{"brandDna": "Minimalist, aggressive red palette, bold typography."}'
```

### Brand Comparison
```bash
curl -X POST http://localhost:3001/api/comparison/brands \
  -H "Content-Type: application/json" \
  -d '{"subject1": "Epsilon AI", "subject2": "Generic Agency"}'
```

## Architecture

```
src/
├── server.js          # Entry point
├── app.js             # Express app configuration
├── controllers/       # Request handlers
├── routes/           # API route definitions
├── services/         # Business logic & AI integration
├── middleware/       # Error handling & validation
└── utils/            # Helpers & utilities
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 60000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Rate Limiting

API endpoints are rate-limited to 100 requests per minute by default.
