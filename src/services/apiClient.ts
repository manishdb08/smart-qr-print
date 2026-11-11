const V1_BASE = '/v1';
const API_BASE = '/api';
const ADMIN_KEY = 'visionx-admin-secure-key-2026';
const AUTH_HEADER = { 'Authorization': 'Bearer test-token-customer' };

export async function apiCheckHealth() {
  try {
    const res = await fetch('/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetPrinters() {
  try {
    const res = await fetch(`${V1_BASE}/printers`, { headers: AUTH_HEADER });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiPresignUpload(file: File, qrSessionToken?: string) {
  try {
    const res = await fetch(`${V1_BASE}/uploads/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: JSON.stringify({
        originalFileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || 'application/pdf',
        qrSessionToken
      })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiUploadBinary(uploadUrl: string, file: File): Promise<boolean> {
  try {
    const targetUrl = uploadUrl.startsWith('http') ? uploadUrl : `${uploadUrl}`;
    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/pdf' },
      body: file
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiCompleteUpload(uploadSessionId: string) {
  try {
    const res = await fetch(`${V1_BASE}/uploads/${uploadSessionId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: JSON.stringify({})
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiCreatePrintJob(params: {
  assetVersionId: string;
  printerId: string;
  copies: number;
  isColor: boolean;
  isDuplex: boolean;
  pageSize?: string;
}) {
  try {
    const res = await fetch(`${V1_BASE}/print-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: JSON.stringify({
        assetVersionId: params.assetVersionId,
        printerId: params.printerId,
        copies: params.copies,
        isColor: params.isColor,
        isDuplex: params.isDuplex,
        pageSize: params.pageSize || 'A4'
      })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiGetQuote(jobId: string) {
  try {
    const res = await fetch(`${V1_BASE}/print-jobs/${jobId}/quote`, {
      method: 'POST',
      headers: AUTH_HEADER
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiCreatePaymentOrder(jobId: string) {
  try {
    const res = await fetch(`${V1_BASE}/payments/razorpay/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: JSON.stringify({ printJobId: jobId })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiVerifyPayment(params: {
  printJobId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const res = await fetch(`${V1_BASE}/payments/razorpay/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: JSON.stringify(params)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiCreateSession(kioskCode: string) {
  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kioskCode })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiInterpretPrompt(prompt: string, documentId?: string, currentSettings?: unknown) {
  try {
    const res = await fetch(`${API_BASE}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, documentId, currentSettings })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiCalculatePricing(documentId: string, settings: unknown) {
  try {
    const res = await fetch(`${API_BASE}/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, settings })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiCreateJob(sessionId: string, documentId: string, settings: unknown) {
  try {
    const res = await fetch(`${API_BASE}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ documentId, settings })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiPayJob(jobId: string, paymentMethod: string, amount: number) {
  try {
    const res = await fetch(`${API_BASE}/payments/${jobId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, amount })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiExecuteJob(jobId: string) {
  try {
    const res = await fetch(`${API_BASE}/print/${jobId}/execute`, {
      method: 'POST'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function apiGetAdminDashboard() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { 'X-Admin-Key': ADMIN_KEY }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
