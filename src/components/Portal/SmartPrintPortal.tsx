import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';
import {
  Printer,
  LayoutDashboard,
  Bot,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Plus,
  Files,
  CheckCircle,
  Clock,
  ArrowUpRight,
  UploadCloud,
  FileText,
  Lock,
  Send,
  Info,
  Check,
  Receipt,
  Eye,
  Download,
  ShieldCheck
} from 'lucide-react';
import { BillInvoiceModal, BillData } from './BillInvoiceModal';
import '../../portal.css';

export type PortalView = 'dashboard' | 'ai-assistant' | 'payment' | 'tracking' | 'payment-history';

export interface SmartPrintPortalProps {
  onSwitchToAdmin?: () => void;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

function parsePageRange(type: 'all' | 'custom', customStr: string, total: number) {
  if (type === 'all') return { count: total, error: '' };
  if (!customStr.trim()) return { count: 0, error: 'Please enter page numbers.' };
  const pages = new Set<number>();
  for (const part of customStr.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) return { count: 0, error: 'Invalid page range format.' };
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < start || (total > 0 && end > total)) {
      return { count: 0, error: `Enter pages between 1 and ${total || 100}.` };
    }
    for (let p = start; p <= end; p++) pages.add(p);
  }
  return { count: pages.size, error: '' };
}

export const SmartPrintPortal: React.FC<SmartPrintPortalProps> = ({ onSwitchToAdmin }) => {
  // Navigation State
  const [view, setView] = useState<PortalView>('dashboard');

  // File & Document State
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);

  // Print Configuration State
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [copies, setCopies] = useState<number>(1);
  const [pageRangeType, setPageRangeType] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('');
  const [paperSize, setPaperSize] = useState<string>('A4');
  const [sides, setSides] = useState<'single' | 'double'>('single');

  // Optional Bill / Tax Invoice State
  const [wantBill, setWantBill] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerGstin, setCustomerGstin] = useState<string>('');
  const [showBillModal, setShowBillModal] = useState<boolean>(false);
  const [activeBillData, setActiveBillData] = useState<BillData | null>(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<string>('Google Pay');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>(() => 'PRN-' + Math.floor(1000 + Math.random() * 9000));

  // AI Assistant Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hello! I'm your AI Print Assistant. Upload your PDF or ask me how to save printing costs." }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const effectiveTotalPages = totalPages > 0 ? totalPages : (file ? 1 : 0);
  const rangeInfo = parsePageRange(pageRangeType, customRange, effectiveTotalPages);
  const selectedPagesCount = rangeInfo.count;
  const physicalSheets = Math.ceil(selectedPagesCount / (sides === 'double' ? 2 : 1));

  let ratePerPage = 2;
  let calculationUnitCount = selectedPagesCount;

  if (colorMode === 'bw' && sides === 'single') {
    ratePerPage = 2;
    calculationUnitCount = selectedPagesCount;
  } else if (colorMode === 'bw' && sides === 'double') {
    ratePerPage = 3;
    calculationUnitCount = physicalSheets;
  } else if (colorMode === 'color') {
    ratePerPage = 10;
    calculationUnitCount = selectedPagesCount;
  }

  const totalCost = calculationUnitCount * ratePerPage * copies;

  // Helper to construct current bill data
  const getCurrentBillData = (overrides?: Partial<BillData>): BillData => {
    return {
      invoiceNo: `INV-2026-${orderId}`,
      orderId: orderId,
      dateStr: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerGstin: customerGstin.trim() || undefined,
      fileName: file ? file.name : 'Document.pdf',
      fileSizeStr: fileSizeStr || '245 KB',
      colorMode,
      sides,
      paperSize,
      pagesCount: selectedPagesCount || 1,
      physicalSheets: physicalSheets || 1,
      copies,
      ratePerPage,
      totalAmount: totalCost > 0 ? totalCost : 20.00,
      paymentMethod,
      printerName: 'Kiosk #01 - University Library Station',
      ...(overrides || {})
    };
  };

  const openBillModal = (overrides?: Partial<BillData>) => {
    setActiveBillData(getCurrentBillData(overrides));
    setShowBillModal(true);
  };

  // Generate UPI QR Code for payment view
  useEffect(() => {
    if (view === 'payment') {
      const upiString = `upi://pay?pa=smartprint@upi&pn=SMART_QR_PRINT&am=${totalCost.toFixed(2)}&cu=INR&tn=Job-${orderId}`;
      QRCode.toDataURL(upiString, { width: 150, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(() => setQrCodeUrl(''));
    }
  }, [view, totalCost, orderId]);

  // Handle PDF file selection
  const handleFileProcess = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file only!');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPageCount();

      setFile(selectedFile);
      setFileSizeStr((selectedFile.size / 1024).toFixed(2) + ' KB');
      setTotalPages(pages);
      setCustomRange('');
      setPageRangeType('all');
    } catch (err) {
      console.error('PDF parsing error:', err);
      // Fallback rough estimate
      setFile(selectedFile);
      setFileSizeStr((selectedFile.size / 1024).toFixed(2) + ' KB');
      setTotalPages(1);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAiChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const queryLower = query.toLowerCase();

    let botResponse = '';
    if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('save') || queryLower.includes('rate')) {
      botResponse = `Your current estimated printing cost is ₹${totalCost.toFixed(2)} for ${selectedPagesCount} pages (${copies} copy). ` +
        (colorMode === 'bw'
          ? (sides === 'double' ? 'Black & White double-sided is already the most economical option (₹3/sheet)!' : 'Tip: Switching to double-sided Black & White will save you up to 25% on paper cost!')
          : 'Tip: For text documents, switching from Colour (₹10/page) to Black & White (₹2/page) will save you 80% on this print job!');
    } else if (queryLower.includes('bill') || queryLower.includes('invoice') || queryLower.includes('gst') || queryLower.includes('receipt')) {
      botResponse = `Yes! SMART QR PRINT provides official GST-compliant tax invoices and cash receipts. You can turn on "Generate Official Bill" under Print Settings, enter your name/GSTIN, and preview or download the invoice anytime.`;
    } else if (queryLower.includes('setting') || queryLower.includes('page') || queryLower.includes('double') || queryLower.includes('side')) {
      botResponse = `Current settings: ${selectedPagesCount} pages selected, ${copies} copies, ${colorMode === 'bw' ? 'Black & White' : 'Colour'}, ${paperSize} paper, ${sides === 'single' ? 'Single-sided' : 'Double-sided'}. Total estimated cost is ₹${totalCost.toFixed(2)}.`;
    } else {
      botResponse = `I can help optimize your print job! Your document "${file ? file.name : 'Sample PDF'}" has ${effectiveTotalPages} pages. Currently set to ${colorMode === 'bw' ? 'Black & White' : 'Colour'} at ₹${totalCost.toFixed(2)}. You can also request an official invoice receipt. Would you like suggestions?`;
    }

    setChatMessages(prev => [
      ...prev,
      { role: 'user', text: query },
      { role: 'assistant', text: botResponse }
    ]);
    setChatInput('');
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    setTimeout(() => {
      setView('tracking');
    }, 600);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Printer size={25} color="#fff" />
          </div>
          <div>
            <h2>SMART QR</h2>
            <span>PRINT</span>
          </div>
        </div>

        {/* Main Menu */}
        <div className="sidebar-menu">
          <p className="menu-heading">MAIN MENU</p>
          <button
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${view === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => setView('ai-assistant')}
          >
            <Bot size={20} />
            <span>AI Print Assistant</span>
          </button>

          <button
            className={`nav-item ${view === 'payment-history' ? 'active' : ''}`}
            onClick={() => setView('payment-history')}
          >
            <CreditCard size={20} />
            <span>Payment History</span>
          </button>

          <button
            className={`nav-item ${view === 'tracking' ? 'active' : ''}`}
            onClick={() => setView('tracking')}
          >
            <Activity size={20} />
            <span>Print Tracking</span>
          </button>
        </div>

        {/* Bottom Menu */}
        <div className="sidebar-bottom">
          {onSwitchToAdmin && (
            <button
              className="nav-item"
              onClick={onSwitchToAdmin}
              style={{
                background: 'rgba(37, 133, 237, 0.12)',
                border: '1px solid rgba(37, 133, 237, 0.3)',
                color: '#60a5fa',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                marginBottom: 6
              }}
              title="Open Store Owner & Fleet Console"
            >
              <ShieldCheck size={18} color="#60a5fa" />
              <span style={{ fontWeight: 700, fontSize: 13 }}>Admin Desktop →</span>
            </button>
          )}

          <a
            className="nav-item"
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              alert('SMART QR PRINT is connected to Cloud PostgreSQL & Hardware Printer Agents.');
            }}
          >
            <Settings size={20} />
            <span>Settings</span>
          </a>
          <a
            className="nav-item"
            href="#logout"
            onClick={(e) => {
              e.preventDefault();
              if (confirm('Clear current session?')) {
                setFile(null);
                setTotalPages(0);
                setView('dashboard');
              }
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      {view === 'dashboard' && (
        <main className="main-content">
          {/* Dashboard Header */}
          <header className="dashboard-header">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back! Here's your printing overview.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 9,
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  title="Switch to Store Owner & Hardware Fleet Desktop"
                >
                  <ShieldCheck size={16} color="#2585ed" />
                  <span>Admin Desktop</span>
                </button>
              )}
              <button
                className="new-print-btn"
                onClick={() => {
                  document.getElementById('quick-access-section')?.scrollIntoView({ behavior: 'smooth' });
                  fileInputRef.current?.click();
                }}
              >
                <Plus size={18} />
                New Print
              </button>
            </div>
          </header>

          {/* Welcome Banner */}
          <section className="welcome-banner">
            <div>
              <span className="welcome-tag">
                <Bot size={15} /> AI POWERED PRINTING
              </span>
              <h2>Welcome to SMART QR PRINT 👋</h2>
              <p>Your intelligent printing assistant is ready to manage your printing workflow.</p>
            </div>
            <div className="welcome-icon">
              <Printer size={65} />
            </div>
          </section>

          {/* Printing Overview Stats Section */}
          <section className="stats-section">
            <div className="section-heading">
              <h2>Printing Overview</h2>
              <span>All time</span>
            </div>

            <div className="stats-grid">
              {/* Stat 1 */}
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon blue">
                    <Files size={23} />
                  </div>
                  <ArrowUpRight size={18} className="trend-icon" />
                </div>
                <h3>1,248</h3>
                <p>Total Documents Printed</p>
                <span className="stat-note">Your printing activity</span>
              </div>

              {/* Stat 2 */}
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon orange">
                    <Printer size={23} />
                  </div>
                  <ArrowUpRight size={18} className="trend-icon" />
                </div>
                <h3>08</h3>
                <p>Active Print Jobs</p>
                <span className="stat-note">Jobs in progress</span>
              </div>

              {/* Stat 3 */}
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon green">
                    <CheckCircle size={23} />
                  </div>
                  <ArrowUpRight size={18} className="trend-icon" />
                </div>
                <h3>1,120</h3>
                <p>Completed Jobs</p>
                <span className="stat-note">Successfully printed</span>
              </div>

              {/* Stat 4 */}
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon purple">
                    <Clock size={23} />
                  </div>
                  <ArrowUpRight size={18} className="trend-icon" />
                </div>
                <h3>120</h3>
                <p>Recent Print Jobs</p>
                <span className="stat-note">Your recent activity</span>
              </div>
            </div>
          </section>

          {/* Quick Access PDF Upload Section */}
          <section className="quick-print-section" id="quick-access-section">
            <div className="section-heading">
              <h2>Quick Access</h2>
            </div>

            <div
              className="quick-print-card"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="quick-print-icon">
                <UploadCloud size={28} />
              </div>
              <div className="quick-print-info">
                <h3>Quick Print Document</h3>
                <p>Upload your document and let our AI Agent prepare your print job.</p>
              </div>

              <input
                ref={fileInputRef}
                id="document-upload"
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              <label htmlFor="document-upload" className="upload-btn">
                <UploadCloud size={17} />
                Upload Document
              </label>

              {file && (
                <div className="selected-file">
                  <p>📄 {file.name}</p>
                  <p>File Size: {fileSizeStr}</p>
                  <p>Total Pages: {totalPages}</p>
                </div>
              )}

              <button
                className="continue-btn"
                disabled={!file}
                onClick={() => {
                  document.getElementById('print-settings')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Continue →
              </button>
            </div>
          </section>

          {/* Print Settings Section */}
          <section className="print-settings-section" id="print-settings">
            <div className="section-heading">
              <h2>Print Settings</h2>
              <p>Customize your printing preferences</p>
            </div>

            <div className="print-settings-card">
              {/* Colour Mode */}
              <div className="setting-group">
                <label>Colour Mode</label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value as 'bw' | 'color')}
                >
                  <option value="bw">Black & White</option>
                  <option value="color">Colour</option>
                </select>
              </div>

              {/* Number of Copies */}
              <div className="setting-group">
                <label>Number of Copies</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                />
              </div>

              {/* Page Range */}
              <div className="setting-group">
                <label>Page Range</label>
                <select
                  value={pageRangeType}
                  onChange={(e) => setPageRangeType(e.target.value as 'all' | 'custom')}
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Pages</option>
                </select>
                {pageRangeType === 'custom' && (
                  <input
                    type="text"
                    placeholder="Example: 1-5, 8, 10"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                  />
                )}
              </div>

              {/* Paper Size */}
              <div className="setting-group">
                <label>Paper Size</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>

              {/* Printing Sides */}
              <div className="setting-group">
                <label>Printing Sides</label>
                <select
                  value={sides}
                  onChange={(e) => setSides(e.target.value as 'single' | 'double')}
                >
                  <option value="single">Single-sided</option>
                  <option value="double">Double-sided</option>
                </select>
              </div>

              {/* OPTIONAL BILL / INVOICE SECTION (User-requested) */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '16px 20px',
                  marginTop: 10,
                  marginBottom: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: wantBill ? '#dbeafe' : '#f1f5f9',
                        color: wantBill ? '#2585ed' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Receipt size={22} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: '#142440', display: 'block' }}>
                        Generate Official Bill / Tax Invoice (Optional)
                      </strong>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        Need a formal receipt for GST claim, office expense, or college reimbursement?
                      </span>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={wantBill}
                      onChange={(e) => setWantBill(e.target.checked)}
                      style={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        accentColor: '#2585ed'
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: wantBill ? '#2585ed' : '#64748b' }}>
                      {wantBill ? '✓ Bill Enabled' : 'Optional Bill (Off)'}
                    </span>
                  </label>
                </div>

                {/* Optional Customer Billing Form */}
                {wantBill && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                          Customer / Student Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            fontSize: 13,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            outline: 'none',
                            background: '#fff'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            fontSize: 13,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            outline: 'none',
                            background: '#fff'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                          GSTIN / Roll No (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 27AAAAA0000A1Z5"
                          value={customerGstin}
                          onChange={(e) => setCustomerGstin(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            fontSize: 13,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            outline: 'none',
                            background: '#fff'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                        ✓ Official GST-compliant Cash Receipt with SAC 998912 will be generated.
                      </span>

                      <button
                        type="button"
                        onClick={() => openBillModal()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#eff6ff',
                          color: '#2585ed',
                          border: '1px solid #bfdbfe',
                          borderRadius: 8,
                          padding: '7px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                        Preview Bill Format
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Estimated Printing Cost */}
              <div className="estimated-cost-section">
                <h3>Estimated Printing Cost</h3>
                <div className="cost-details">
                  <div>
                    <span>Selected Pages</span>
                    <strong>{selectedPagesCount}</strong>
                  </div>
                  <div>
                    <span>Physical Sheets</span>
                    <strong>{physicalSheets}</strong>
                  </div>
                  <div>
                    <span>Printing Rate</span>
                    <strong>₹{ratePerPage} / {colorMode === 'bw' && sides === 'double' ? 'sheet' : 'page'}</strong>
                  </div>
                  <div>
                    <span>Number of Copies</span>
                    <strong>{copies}</strong>
                  </div>
                  <div className="total-cost">
                    <span>Total Estimated Cost</span>
                    <strong>{rangeInfo.error ? '₹ --' : `₹ ${totalCost.toFixed(2)}`}</strong>
                  </div>
                  {rangeInfo.error && <p className="error-message">{rangeInfo.error}</p>}
                </div>
              </div>

              <button
                className="continue-btn"
                onClick={() => {
                  if (selectedPagesCount <= 0 && !file) {
                    alert('Please upload a PDF document first.');
                    document.getElementById('quick-access-section')?.scrollIntoView({ behavior: 'smooth' });
                    return;
                  }
                  if (selectedPagesCount <= 0) {
                    alert('Please select valid pages before continuing.');
                    return;
                  }
                  setView('payment');
                }}
              >
                Continue →
              </button>
            </div>
          </section>

          {/* Recent Printing History Section */}
          <section className="history-section">
            <div className="section-heading">
              <h2>Recent Printing History</h2>
              <button className="view-all-btn" onClick={() => setView('payment-history')}>
                View All
              </button>
            </div>

            <div className="history-card">
              <div className="history-item">
                <div className="file-icon">
                  <FileText size={22} />
                </div>
                <div className="file-info">
                  <h4>Assignment.pdf</h4>
                  <p>10 pages • Black & White</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => openBillModal({
                      fileName: 'Assignment.pdf',
                      pagesCount: 10,
                      totalAmount: 20.00,
                      colorMode: 'bw',
                      sides: 'single',
                      orderId: 'PRN-1082'
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="View Tax Invoice"
                  >
                    <Receipt size={13} color="#2585ed" />
                    Bill
                  </button>
                  <span className="status completed">Completed</span>
                </div>
              </div>

              <div className="history-item">
                <div className="file-icon">
                  <FileText size={22} />
                </div>
                <div className="file-info">
                  <h4>Project_Report.pdf</h4>
                  <p>25 pages • Colour</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => openBillModal({
                      fileName: 'Project_Report.pdf',
                      pagesCount: 25,
                      totalAmount: 250.00,
                      colorMode: 'color',
                      sides: 'single',
                      orderId: 'PRN-1094'
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="View Tax Invoice"
                  >
                    <Receipt size={13} color="#2585ed" />
                    Bill
                  </button>
                  <span className="status printing">Printing</span>
                </div>
              </div>

              <div className="history-item">
                <div className="file-icon">
                  <FileText size={22} />
                </div>
                <div className="file-info">
                  <h4>Notes.pdf</h4>
                  <p>15 pages • Black & White</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => openBillModal({
                      fileName: 'Notes.pdf',
                      pagesCount: 15,
                      totalAmount: 30.00,
                      colorMode: 'bw',
                      sides: 'single',
                      orderId: 'PRN-1077'
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="View Tax Invoice"
                  >
                    <Receipt size={13} color="#2585ed" />
                    Bill
                  </button>
                  <span className="status completed">Completed</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* AI Assistant View */}
      {view === 'ai-assistant' && (
        <main className="main-content">
          <header className="dashboard-header">
            <div>
              <h1>AI Print Assistant</h1>
              <p>Your intelligent printing companion.</p>
            </div>
            <span className="online-status">● Online</span>
          </header>

          <div className="ai-assistant-container">
            <div className="ai-welcome-card">
              <h2>🤖 Hello! How can I help you?</h2>
              <p>Ask me about printing settings, print costs, PDF pages, official bills and ways to save money.</p>
            </div>

            <div className="pdf-analysis-card">
              <h2>📄 PDF Analysis</h2>
              {file ? (
                <>
                  <h3>{file.name}</h3>
                  <p>File Size: {fileSizeStr}</p>
                  <p>Total Pages: {totalPages}</p>
                  <span className="pdf-status">✓ PDF Analyzed</span>
                </>
              ) : (
                <p>No PDF uploaded yet. Please upload your PDF from the Dashboard to analyze it.</p>
              )}
            </div>

            <div className="ai-chat-box">
              <div className="ai-chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <strong>{msg.role === 'assistant' ? 'AI Assistant' : 'You'}</strong>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <form className="ai-chat-input-area" onSubmit={handleAiChatSubmit}>
                <input
                  type="text"
                  placeholder="Ask anything about printing or bills..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit">
                  Send <Send size={14} style={{ display: 'inline', marginLeft: 4 }} />
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* Payment View */}
      {view === 'payment' && (
        <main className="main-content payment-page">
          <header className="dashboard-header">
            <div>
              <h1>Complete Your Payment</h1>
              <p>Review your order and proceed with secure checkout.</p>
            </div>
            <span className="online-status">● Secure Checkout</span>
          </header>

          {/* Progress Indicator */}
          <div className="payment-progress">
            <div className="progress-step completed">
              <span>✓</span>
              <small>Upload</small>
            </div>
            <div className="progress-line active"></div>
            <div className="progress-step completed">
              <span>✓</span>
              <small>Settings</small>
            </div>
            <div className="progress-line active"></div>
            <div className="progress-step active">
              <span>3</span>
              <small>Payment</small>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <span>4</span>
              <small>Print</small>
            </div>
          </div>

          <div className="payment-layout">
            {/* Order Summary Card */}
            <section className="order-card">
              <div className="payment-card-heading">
                <div>
                  <h2>Order Summary</h2>
                  <p>Your selected printing details</p>
                </div>
                <span className="summary-icon">📄</span>
              </div>

              <div className="order-file">
                <div className="file-icon">
                  <span>PDF</span>
                </div>
                <div className="order-file-info">
                  <strong>{file ? file.name : 'Sample Document.pdf'}</strong>
                  <small>{effectiveTotalPages} pages in document</small>
                </div>
              </div>

              <div className="order-details">
                <div>
                  <span>Selected Pages</span>
                  <strong>{selectedPagesCount}</strong>
                </div>
                <div>
                  <span>Number of Copies</span>
                  <strong>{copies}</strong>
                </div>
                <div>
                  <span>Print Mode</span>
                  <strong>{colorMode === 'bw' ? 'Black & White' : 'Colour'}</strong>
                </div>
                <div>
                  <span>Paper Size</span>
                  <strong>{paperSize}</strong>
                </div>
                <div>
                  <span>Print Sides</span>
                  <strong>{sides === 'single' ? 'Single Side' : 'Double Side'}</strong>
                </div>
              </div>

              {/* Optional Bill Badge in Summary */}
              {wantBill ? (
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Receipt size={16} color="#2585ed" />
                    <div>
                      <strong style={{ fontSize: 12, color: '#1e3a8a', display: 'block' }}>Official Bill Requested</strong>
                      <small style={{ fontSize: 11, color: '#3b82f6' }}>#INV-2026-{orderId} · {customerName || 'Walk-in'}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBillModal()}
                    style={{ background: '#2585ed', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    View Bill
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setWantBill(true)}
                    style={{ background: 'transparent', border: 'none', color: '#2585ed', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    + Need an official bill / tax receipt?
                  </button>
                </div>
              )}

              <div className="payment-total-box">
                <div>
                  <span>Total Amount</span>
                  <small>Estimated printing charges (Tax incl.)</small>
                </div>
                <h2>₹{totalCost.toFixed(2)}</h2>
              </div>

              <p className="order-note">
                <span>🔒</span> Your order details are ready for checkout.
              </p>
            </section>

            {/* Checkout & QR Payment Card */}
            <section className="checkout-card">
              <div className="payment-card-heading">
                <div>
                  <h2>Choose Payment Method</h2>
                  <p>Select your preferred UPI application.</p>
                </div>
                <span className="summary-icon">💳</span>
              </div>

              <div className="payment-method-grid">
                {[
                  { name: 'Google Pay', icon: 'G', color: '#4285F4', bg: '#E8F0FE' },
                  { name: 'PhonePe', icon: 'पे', color: '#6739B7', bg: '#EEE5FF' },
                  { name: 'Paytm', icon: 'P', color: '#00A5DF', bg: '#E0F2FE' },
                  { name: 'Other UPI', icon: 'UPI', color: '#15803D', bg: '#DCFCE7' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`payment-method-card ${paymentMethod === item.name ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(item.name)}
                  >
                    <span
                      className="payment-brand-icon"
                      style={{
                        background: item.bg,
                        color: item.color,
                        fontSize: item.name === 'Other UPI' ? '11px' : '18px'
                      }}
                    >
                      {item.icon}
                    </span>
                    <strong>{item.name}</strong>
                    {paymentMethod === item.name && <span className="payment-check">✓</span>}
                  </button>
                ))}
              </div>

              <div className="qr-payment-area">
                <div className="qr-heading">
                  <h3>Scan & Pay</h3>
                  <span>UPI PAYMENT</span>
                </div>

                <div className="qr-placeholder" style={{ padding: 10, background: '#fff' }}>
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      style={{ width: 130, height: 130, objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <span className="qr-symbol">▦</span>
                      <strong>QR Code</strong>
                      <small>Generating UPI QR...</small>
                    </>
                  )}
                </div>
                <p className="qr-instruction">
                  Scan this UPI QR code with {paymentMethod} to complete payment of ₹{totalCost.toFixed(2)}.
                </p>
              </div>

              <div className="payment-status-box">
                <span
                  className="status-dot"
                  style={{ background: paymentConfirmed ? '#22c55e' : '#f59e0b' }}
                ></span>
                <div>
                  <strong>Payment Status</strong>
                  <small>{paymentConfirmed ? 'Payment Verified!' : 'Ready for payment verification'}</small>
                </div>
                <span
                  className="pending-label"
                  style={{
                    background: paymentConfirmed ? '#dcfce7' : '#fef3c7',
                    color: paymentConfirmed ? '#15803d' : '#b45309'
                  }}
                >
                  {paymentConfirmed ? 'Verified' : 'Pending'}
                </span>
              </div>

              <button
                type="button"
                className="confirm-payment-btn"
                style={{
                  cursor: 'pointer',
                  opacity: 1,
                  background: paymentConfirmed ? '#16a34a' : '#2563eb'
                }}
                onClick={handleConfirmPayment}
              >
                <Lock size={16} style={{ display: 'inline', marginRight: 6 }} />
                {paymentConfirmed ? 'Payment Confirmed! Proceeding...' : 'Confirm Payment & Print'}
              </button>

              <p className="payment-footer-note">
                🔒 Fast 256-bit SSL encrypted & instant hardware queue verification.
              </p>
            </section>
          </div>
        </main>
      )}

      {/* Print Tracking View */}
      {view === 'tracking' && (
        <main className="main-content tracking-page">
          <header className="dashboard-header">
            <div>
              <h1>Print Tracking</h1>
              <p>Track your printing order and its current status.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => openBillModal()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                }}
              >
                <Receipt size={16} />
                <span>View / Print Bill</span>
              </button>
              <span className="online-status">● Live Tracking</span>
            </div>
          </header>

          <div className="tracking-welcome-card">
            <div>
              <span className="tracking-label">YOUR PRINT ORDER #{orderId}</span>
              <h2>Track Your Print Job</h2>
              <p>Monitor your order progress from payment to physical printing.</p>
            </div>
            <div className="tracking-main-icon">🖨️</div>
          </div>

          <div className="tracking-stats">
            <div className="tracking-stat-card">
              <span className="tracking-stat-icon">📄</span>
              <p>Total Pages</p>
              <h2>{selectedPagesCount || 1}</h2>
            </div>
            <div className="tracking-stat-card">
              <span className="tracking-stat-icon">📑</span>
              <p>Copies</p>
              <h2>{copies}</h2>
            </div>
            <div className="tracking-stat-card">
              <span className="tracking-stat-icon">💰</span>
              <p>Order Amount</p>
              <h2>₹{totalCost.toFixed(2)}</h2>
            </div>
          </div>

          <section className="tracking-order-card">
            <div className="tracking-order-header">
              <div>
                <h2>Order Details</h2>
                <p>Your current print job information</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => openBillModal()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2585ed',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Receipt size={14} />
                  Download Invoice
                </button>
                <span className="tracking-pending" style={{ background: '#dcfce7', color: '#15803d' }}>
                  Printing in Progress
                </span>
              </div>
            </div>

            <div className="tracking-info-grid">
              <div>
                <small>Document Name</small>
                <strong>{file ? file.name : 'Assignment.pdf'}</strong>
              </div>
              <div>
                <small>Order Status</small>
                <strong style={{ color: '#2585ed' }}>Job Dispatched</strong>
              </div>
              <div>
                <small>Payment Status</small>
                <strong style={{ color: '#16a34a' }}>Verified (₹{totalCost.toFixed(2)})</strong>
              </div>
              <div>
                <small>Hardware Printer</small>
                <strong>Kiosk #01 (Lab-Mono-01)</strong>
              </div>
            </div>

            <div className="tracking-divider"></div>
            <h3>Print Progress</h3>
            <p className="tracking-description">Your order moves through automated verification and hardware spooling.</p>

            <div className="tracking-timeline">
              <div className="timeline-step completed">
                <div className="timeline-icon">✓</div>
                <div>
                  <strong>Document Uploaded</strong>
                  <small>PDF received & verified</small>
                </div>
              </div>

              <div className="timeline-step completed">
                <div className="timeline-icon">✓</div>
                <div>
                  <strong>Payment Verification</strong>
                  <small>UPI transaction confirmed</small>
                </div>
              </div>

              <div className="timeline-step completed">
                <div className="timeline-icon" style={{ background: '#2585ed', color: '#fff' }}>
                  🖨️
                </div>
                <div>
                  <strong>Printing in Progress</strong>
                  <small>Printer heating & feeding pages</small>
                </div>
              </div>

              <div className="timeline-step">
                <div className="timeline-icon">4</div>
                <div>
                  <strong>Print Completed</strong>
                  <small>Ready for pickup at Kiosk #01 tray</small>
                </div>
              </div>
            </div>

            <div className="tracking-notice" style={{ marginTop: 24 }}>
              <span>ℹ️</span>
              <p>
                Order #{orderId} is currently being printed. Your pickup code is <strong>{orderId}</strong>.
              </p>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => openBillModal()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Receipt size={16} color="#2585ed" />
                View Detailed Tax Invoice
              </button>

              <button
                className="new-print-btn"
                style={{ display: 'inline-flex' }}
                onClick={() => {
                  setFile(null);
                  setTotalPages(0);
                  setPaymentConfirmed(false);
                  setOrderId('PRN-' + Math.floor(1000 + Math.random() * 9000));
                  setView('dashboard');
                }}
              >
                Start Another Print
              </button>
            </div>
          </section>
        </main>
      )}

      {/* Payment History View */}
      {view === 'payment-history' && (
        <main className="main-content">
          <header className="dashboard-header">
            <div>
              <h1>Payment History</h1>
              <p>View your previous printing transactions and download bills.</p>
            </div>
            <button className="new-print-btn" onClick={() => setView('dashboard')}>
              <Plus size={18} />
              New Print
            </button>
          </header>

          <section className="history-stats">
            <div className="history-stat-card">
              <h3>Total Transactions</h3>
              <h2>14</h2>
            </div>
            <div className="history-stat-card">
              <h3>Total Amount Spent</h3>
              <h2>₹285.00</h2>
            </div>
            <div className="history-stat-card">
              <h3>Successful Payments</h3>
              <h2>14</h2>
            </div>
          </section>

          <section className="history-table-card">
            <h2>Recent Transactions</h2>
            <div className="history-card" style={{ border: 'none', padding: 0 }}>
              {[
                { name: 'Assignment_Final.pdf', date: 'Today, 04:12 PM', amount: '₹20.00', status: 'Completed', pages: 10, mode: 'bw' as const, sides: 'single' as const, id: 'PRN-9021', num: 20 },
                { name: 'Project_Report_Color.pdf', date: 'Yesterday, 02:45 PM', amount: '₹120.00', status: 'Completed', pages: 12, mode: 'color' as const, sides: 'single' as const, id: 'PRN-9018', num: 120 },
                { name: 'Lab_Manual_Ch3.pdf', date: '10 Nov 2026', amount: '₹45.00', status: 'Completed', pages: 15, mode: 'bw' as const, sides: 'double' as const, id: 'PRN-8992', num: 45 },
                { name: 'Semester_Admit_Card.pdf', date: '08 Nov 2026', amount: '₹10.00', status: 'Completed', pages: 1, mode: 'color' as const, sides: 'single' as const, id: 'PRN-8854', num: 10 },
              ].map((tx, idx) => (
                <div key={idx} className="history-item">
                  <div className="file-icon" style={{ background: '#eff6ff', color: '#2585ed' }}>
                    <FileText size={22} />
                  </div>
                  <div className="file-info">
                    <h4>{tx.name}</h4>
                    <p>{tx.pages} pages • {tx.mode === 'bw' ? 'B&W' : 'Colour'} • {tx.date}</p>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 16 }}>
                    <strong style={{ color: '#142440', fontSize: 15, display: 'block' }}>{tx.amount}</strong>
                    <button
                      type="button"
                      onClick={() => openBillModal({
                        fileName: tx.name,
                        pagesCount: tx.pages,
                        totalAmount: tx.num,
                        colorMode: tx.mode,
                        sides: tx.sides,
                        orderId: tx.id,
                        dateStr: tx.date
                      })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2585ed',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        marginTop: 2
                      }}
                    >
                      <Receipt size={12} />
                      View Bill
                    </button>
                  </div>
                  <span className="status completed">{tx.status}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* RENDER BILL / TAX INVOICE MODAL WHEN TRIGGERED */}
      {showBillModal && activeBillData && (
        <BillInvoiceModal
          isOpen={showBillModal}
          onClose={() => setShowBillModal(false)}
          data={activeBillData}
        />
      )}
    </div>
  );
};

export default SmartPrintPortal;
