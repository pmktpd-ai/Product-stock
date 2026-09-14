import type { StockItem, Transaction, SheetsConfig } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'maint_stock_items_v2',
  TRANSACTIONS: 'maint_stock_tx_v2',
  SHEETS_CONFIG: 'maint_sheets_config_v2',
  ADMIN_AUTH: 'maint_admin_auth_v2',
};

export const DEFAULT_ITEMS: StockItem[] = [
  {
    id: 'item-1',
    code: 'ELEC-01',
    name: 'เทปพันสายไฟ 3M เบอร์ 790 (สีดำ)',
    category: 'งานไฟฟ้า',
    quantity: 4,
    unit: 'ม้วน',
    minThreshold: 8,
    recommendedStock: 20,
    usageCount: 42,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    code: 'MAT-01',
    name: 'ใบตัดเหล็ก 4 นิ้ว บาง 1.0 มม.',
    category: 'วัสดุสิ้นเปลือง',
    quantity: 6,
    unit: 'ใบ',
    minThreshold: 15,
    recommendedStock: 30,
    usageCount: 38,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    code: 'PLUMB-02',
    name: 'เทปพันเกลียวท่อประปา ตราท่อน้ำไทย',
    category: 'งานประปา',
    quantity: 2,
    unit: 'ม้วน',
    minThreshold: 5,
    recommendedStock: 15,
    usageCount: 31,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    code: 'ELEC-02',
    name: 'หลอดไฟ LED T8 18W ขั้ว G13 (แสงเดย์ไลท์)',
    category: 'งานไฟฟ้า',
    quantity: 12,
    unit: 'หลอด',
    minThreshold: 10,
    recommendedStock: 25,
    usageCount: 29,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-5',
    code: 'CHEM-01',
    name: 'ซิลิโคนยาแนวกันเชื้อรา สีใส 300ml',
    category: 'สีและเคมีภัณฑ์',
    quantity: 3,
    unit: 'หลอด',
    minThreshold: 6,
    recommendedStock: 12,
    usageCount: 24,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-6',
    code: 'TOOL-01',
    name: 'สว่านกระแทกไร้สาย 18V พร้อมแบตเตอรี่',
    category: 'เครื่องมือช่าง',
    quantity: 2,
    unit: 'ชุด',
    minThreshold: 1,
    recommendedStock: 3,
    usageCount: 18,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-7',
    code: 'MAT-02',
    name: 'พุกพลาสติก เบอร์ 7 พร้อมน็อตเกลียวปล่อย',
    category: 'วัสดุสิ้นเปลือง',
    quantity: 3,
    unit: 'กล่อง (100ตัว)',
    minThreshold: 5,
    recommendedStock: 10,
    usageCount: 22,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-8',
    code: 'PLUMB-01',
    name: 'บอลวาล์ว PVC ขนาด 1/2 นิ้ว แบบสวม',
    category: 'งานประปา',
    quantity: 15,
    unit: 'ตัว',
    minThreshold: 8,
    recommendedStock: 20,
    usageCount: 14,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-9',
    code: 'TOOL-02',
    name: 'ตลับเมตร 5 เมตร หุ้มยางกันกระแทก',
    category: 'เครื่องมือช่าง',
    quantity: 4,
    unit: 'อัน',
    minThreshold: 2,
    recommendedStock: 5,
    usageCount: 9,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-10',
    code: 'SAFE-01',
    name: 'ถุงมือผ้าถักเคลือบยางกันลื่น ไซส์ L',
    category: 'อุปกรณ์ความปลอดภัย',
    quantity: 8,
    unit: 'คู่',
    minThreshold: 12,
    recommendedStock: 25,
    usageCount: 26,
    updatedAt: new Date().toISOString(),
  }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-1001',
    itemId: 'item-1',
    itemName: 'เทปพันสายไฟ 3M เบอร์ 790 (สีดำ)',
    itemCode: 'ELEC-01',
    type: 'OUT',
    quantity: 2,
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    location: 'อาคาร A ชั้น 4 (ห้องเซิร์ฟเวอร์)',
    operator: 'ช่างสมชาย',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'TX-1002',
    itemId: 'item-3',
    itemName: 'เทปพันเกลียวท่อประปา ตราท่อน้ำไทย',
    itemCode: 'PLUMB-02',
    type: 'OUT',
    quantity: 1,
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    location: 'ห้องน้ำชั้น 1 อาคารเรียนรวม',
    operator: 'ช่างวิชัย',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'TX-1003',
    itemId: 'item-4',
    itemName: 'หลอดไฟ LED T8 18W ขั้ว G13 (แสงเดย์ไลท์)',
    itemCode: 'ELEC-02',
    type: 'IN',
    quantity: 10,
    date: new Date(Date.now() - 86400000).toISOString(),
    note: 'สั่งซื้อล็อตประจำเดือน รับของแล้ว',
    operator: 'Admin',
    createdAt: Date.now() - 86400000,
  }
];

export function getStoredItems(): StockItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      saveStoredItems(DEFAULT_ITEMS);
      return DEFAULT_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ITEMS;
  }
}

export function saveStoredItems(items: StockItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage', err);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveStoredTransactions(DEFAULT_TRANSACTIONS);
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveStoredTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
}

export function getStoredSheetsConfig(): SheetsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    spreadsheetId: null,
    spreadsheetName: 'ระบบสต๊อกอุปกรณ์งานช่างซ่อม',
    spreadsheetUrl: null,
    autoSync: true,
    lastSyncAt: null,
  };
}

export function saveStoredSheetsConfig(cfg: SheetsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(cfg));
  } catch (err) {}
}

export function getStoredAdminAuth(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
}

export function saveStoredAdminAuth(isAdmin: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdmin ? 'true' : 'false');
  } catch {}
}
