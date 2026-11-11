export type ColorMode = 'bw' | 'color' | 'smart_mixed';
export type DuplexMode = 'simplex' | 'duplex';
export type PaperSize = 'A4' | 'Letter' | 'Legal';
export type PageSelection = 'all' | 'custom' | 'odd' | 'even';
export type PrintQuality = 'draft' | 'normal' | 'best';

export interface PageInfo {
  pageNumber: number;
  title: string;
  hasColor: boolean;
  type: 'text' | 'chart' | 'diagram' | 'table';
  snippet: string;
}

export interface DocumentMeta {
  id: string;
  name: string;
  sizeFormatted: string;
  totalPages: number;
  colorPages: number[];
  bwPages: number[];
  pages: PageInfo[];
  rawFileUrl?: string;
}

export interface PrintSettings {
  pageSelection: PageSelection;
  customRange: string;
  copies: number;
  colorMode: ColorMode;
  duplex: DuplexMode;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  quality: PrintQuality;
  staple: boolean;
}

export interface PriceBreakdown {
  totalPagesToPrint: number;
  bwPagesCount: number;
  colorPagesCount: number;
  bwUnitPrice: number;
  colorUnitPrice: number;
  bwSubtotal: number;
  colorSubtotal: number;
  duplexDiscount: number;
  bulkDiscount: number;
  grossTotal: number;
  netTotal: number;
  currency: string;
}

export type JobStatus =
  | 'draft'
  | 'validating'
  | 'pending_payment'
  | 'paid'
  | 'spooling'
  | 'printing'
  | 'completed'
  | 'error';

export interface PrintJob {
  id: string;
  claimPin: string;
  kioskId: string;
  kioskName: string;
  document: DocumentMeta;
  settings: PrintSettings;
  pricing: PriceBreakdown;
  status: JobStatus;
  progress: number;
  currentPage: number;
  totalPages: number;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  paymentMethod?: string;
  aiInterpretationNote?: string;
  aiRecommendation?: string;
}

export interface Kiosk {
  id: string;
  name: string;
  location: string;
  code: string;
  status: 'online' | 'busy' | 'paper_low' | 'offline';
  paperCount: number;
  maxPaper: number;
  tonerBlack: number;
  tonerColor: number;
  supportedSizes: PaperSize[];
  supportsColor: boolean;
  supportsDuplex: boolean;
  ipAddress: string;
  currentJob?: PrintJob;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  extractedSettings?: Partial<PrintSettings>;
  recommendation?: string;
}
