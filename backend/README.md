# SMART QR PRINT — Backend API Engine

**Intelligent self-service printing combining QR access, AI assistance, and automated print-job management.**  
**Team VisionX Debug**: Gufran, Kunal, Nirmiti, Mahek  
**Domain**: HealthTech · Software / Hardware

---

## 🏗️ Architecture Stack
- **Framework**: Express.js with Helmet, CORS, and Express-Rate-Limit
- **Database**: SQLite with `better-sqlite3` in WAL mode
- **Document Processing**: `pdf-lib` magic-byte (`%PDF-`), `%%EOF` check, and stream analysis
- **QR Generation**: `qrcode` generating payload, data URLs, and SVG
- **AI Layer**: Gemini 2.5 Flash / OpenAI compatible client + deterministic English & Hinglish NLP parser
- **Validation**: Zod schema validation
- **Execution Spooler**: SimulationPrinter adapter interface

---

## 🚀 Quick Start

### 1. Install & Run Locally
```bash
cd backend
npm install
npm start
```
Server starts on `http://127.0.0.1:4000`.

### 2. Run Test Suite
```bash
npm test
```

---

## 📡 Full API Reference & cURL Samples

### 1. System Health
```bash
curl http://127.0.0.1:4000/api/health
```

### 2. Session Initiation (Step 1: QR Scan)
```bash
curl -X POST http://127.0.0.1:4000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"kioskCode": "LIB-4091"}'
```

### 3. Retrieve Kiosk QR Code
```bash
curl http://127.0.0.1:4000/api/sessions/kiosk/LIB-4091/qr
```

### 4. Upload Document (Step 2: Document Layer)
```bash
curl -X POST http://127.0.0.1:4000/api/upload \
  -H "X-Session-Id: <SESSION_ID>" \
  -F "document=@./path/to/file.pdf"
```

### 5. AI Print Intent Interpretation (Step 3: Intelligence Layer)
```bash
curl -X POST http://127.0.0.1:4000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Print pages 2 to 5, two copies in black and white"}'
```

### 6. Calculate Authoritative Pricing (Step 5: Cost Calculation)
```bash
curl -X POST http://127.0.0.1:4000/api/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "<DOC_ID>",
    "settings": {
      "pageSelection": "custom",
      "customRange": "2-5",
      "copies": 2,
      "colorMode": "bw",
      "duplex": "duplex",
      "paperSize": "A4",
      "orientation": "portrait",
      "quality": "normal",
      "staple": false
    }
  }'
```

### 7. Create Print Job (Step 6: Review & Lock)
```bash
curl -X POST http://127.0.0.1:4000/api/print \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: <SESSION_ID>" \
  -d '{
    "documentId": "<DOC_ID>",
    "settings": {
      "pageSelection": "all",
      "copies": 1,
      "colorMode": "bw",
      "duplex": "duplex"
    }
  }'
```

### 8. Verify Payment (Step 7: Payment Verification)
```bash
curl -X POST http://127.0.0.1:4000/api/payments/<JOB_ID>/pay \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "upi", "amount": 6.80}'
```

### 9. Dispatch to Connected Printer (Step 8 & 9: Execution)
```bash
curl -X POST http://127.0.0.1:4000/api/print/<JOB_ID>/execute
```

### 10. Query Job Status by ID or Claim PIN
```bash
curl http://127.0.0.1:4000/api/jobs/<JOB_ID>
curl http://127.0.0.1:4000/api/jobs/pin/<CLAIM_PIN>
```

### 11. Admin Fleet Dashboard (Constant-Time Auth)
```bash
curl http://127.0.0.1:4000/api/admin/dashboard \
  -H "X-Admin-Key: visionx-admin-secure-key-2026"
```

### 12. Admin Refill Kiosk Supplies
```bash
curl -X POST http://127.0.0.1:4000/api/admin/kiosk/kiosk-01/refill \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: visionx-admin-secure-key-2026" \
  -d '{"paper": 500, "tonerBw": 100, "tonerColor": 100}'
```
