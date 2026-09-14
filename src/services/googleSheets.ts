import type { StockItem, Transaction } from '../types';
import { getAccessToken } from './firebaseAuth';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

interface CreateSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function createInventorySpreadsheet(title: string = 'ระบบสต๊อกอุปกรณ์งานช่างซ่อม'): Promise<CreateSpreadsheetResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google เพื่อเชื่อมต่อ Google Sheets');

  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'รายการสต๊อกคงเหลือ',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'ประวัติเข้า-ออก',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const res = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `สร้าง Google Sheet ไม่สำเร็จ (${res.status})`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header rows for both sheets
  await initializeHeaders(spreadsheetId, token);

  return { spreadsheetId, spreadsheetUrl };
}

async function initializeHeaders(spreadsheetId: string, token: string) {
  const inventoryHeaders = [
    ['รหัสสินค้า', 'ชื่อสินค้า', 'หมวดหมู่', 'จำนวนคงเหลือ', 'หน่วยนับ', 'จุดเตือนขั้นต่ำ', 'จำนวนแนะนำมีในสต๊อก', 'สถานะ', 'อัปเดตล่าสุด']
  ];
  const historyHeaders = [
    ['รหัสทำรายการ', 'วัน-เวลา', 'ประเภท', 'รหัสสินค้า', 'ชื่อสินค้า', 'จำนวน', 'หน่วยนับ', 'สถานที่เบิกใช้', 'ผู้บันทึก', 'หมายเหตุ', 'สถานะรูปภาพ']
  ];

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/รายการสต๊อกคงเหลือ!A1:I1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: inventoryHeaders }),
  });

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/ประวัติเข้า-ออก!A1:K1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: historyHeaders }),
  });
}

export async function syncAllToSheets(
  spreadsheetId: string,
  items: StockItem[],
  transactions: Transaction[]
): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google เพื่อซิงค์ข้อมูล');

  // Format inventory rows
  const inventoryRows = items.map((item) => {
    const isLow = item.quantity <= item.minThreshold;
    const isOut = item.quantity === 0;
    const status = isOut ? 'สินค้าหมดเกลี้ยง' : isLow ? 'เหลือน้อยกว่าจุดเตือน' : 'ปกติ';
    return [
      item.code,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.minThreshold,
      item.recommendedStock,
      status,
      new Date(item.updatedAt).toLocaleString('th-TH'),
    ];
  });

  // 1. Clear existing inventory values below header
  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/รายการสต๊อกคงเหลือ!A2:I1000:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => {});

  // 2. Put fresh inventory rows
  if (inventoryRows.length > 0) {
    const putRes = await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/รายการสต๊อกคงเหลือ!A2:I${inventoryRows.length + 1}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: inventoryRows }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'ไม่สามารถบันทึกรายการสินค้าลง Google Sheet');
    }
  }

  // 3. Sync history rows
  const historyRows = transactions.map((tx) => [
    tx.id,
    new Date(tx.date).toLocaleString('th-TH'),
    tx.type === 'IN' ? 'รับเข้า (+)' : 'เบิกออก (-)',
    tx.itemCode,
    tx.itemName,
    tx.quantity,
    '',
    tx.location || '-',
    tx.operator,
    tx.note || '-',
    tx.imageUrl ? 'มีรูปภาพแนบ' : 'ไม่มี',
  ]);

  // Clear and rewrite history to keep in exact sync
  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/ประวัติเข้า-ออก!A2:K2000:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => {});

  if (historyRows.length > 0) {
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/ประวัติเข้า-ออก!A2:K${historyRows.length + 1}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: historyRows }),
      }
    );
  }

  return { success: true, message: 'บันทึกข้อมูลไปยัง Google Sheets เรียบร้อยแล้ว' };
}

export async function appendTransactionToSheets(
  spreadsheetId: string,
  tx: Transaction,
  itemUnit: string = ''
): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;

  const row = [
    tx.id,
    new Date(tx.date).toLocaleString('th-TH'),
    tx.type === 'IN' ? 'รับเข้า (+)' : 'เบิกออก (-)',
    tx.itemCode,
    tx.itemName,
    tx.quantity,
    itemUnit,
    tx.location || '-',
    tx.operator,
    tx.note || '-',
    tx.imageUrl ? 'มีรูปภาพแนบ' : 'ไม่มี',
  ];

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/ประวัติเข้า-ออก!A:K:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  }).catch((err) => {
    console.warn('Append to sheets failed:', err);
  });
}
