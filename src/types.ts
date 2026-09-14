export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number; // จุดแจ้งเตือนของใกล้หมด
  recommendedStock: number; // จำนวนที่ควรมีในสต๊อก (เป้าหมาย)
  imageUrl?: string;
  usageCount: number; // สถิติการหยิบใช้ (ใช้จัดอันดับของที่หยิบบ่อย)
  lastUsedAt?: string;
  updatedAt: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  type: TransactionType;
  quantity: number;
  date: string; // วันที่ทำรายการ (YYYY-MM-DD หรือ YYYY-MM-DD HH:mm)
  location?: string; // สถานที่เบิกใช้ ตอนของออก
  imageUrl?: string; // รูปสินค้า ตอนของเข้า
  note?: string;
  operator: string;
  createdAt: number;
  syncedToSheets?: boolean;
}

export interface SheetsConfig {
  spreadsheetId: string | null;
  spreadsheetName: string;
  spreadsheetUrl: string | null;
  autoSync: boolean;
  lastSyncAt: string | null;
}

export interface AuthState {
  isAdmin: boolean;
  googleUser: {
    name: string;
    email: string;
    photoURL?: string;
  } | null;
}
