import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { SheetsConfig, StockItem, Transaction } from '../types';
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  createInventorySpreadsheet,
  syncAllToSheets,
} from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  sheetsConfig: SheetsConfig;
  items: StockItem[];
  transactions: Transaction[];
  onClose: () => void;
  onUpdateConfig: (cfg: SheetsConfig) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  sheetsConfig,
  items,
  transactions,
  onClose,
  onUpdateConfig,
  onShowToast,
}) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [inputSheetId, setInputSheetId] = useState<string>(sheetsConfig.spreadsheetId || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check token on open
  React.useEffect(() => {
    if (isOpen) {
      getAccessToken().then((token) => {
        setIsSignedIn(!!token);
      });
      setInputSheetId(sheetsConfig.spreadsheetId || '');
      setErrorMessage(null);
      setStatusMessage(null);
    }
  }, [isOpen, sheetsConfig.spreadsheetId]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsSignedIn(true);
        setUserName(res.user.displayName);
        setUserEmail(res.user.email);
        setStatusMessage(`เข้าสู่ระบบ Google สำเร็จ: ${res.user.email}`);
        onShowToast('เชื่อมต่อบัญชี Google สำเร็จ', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเข้าสู่ระบบ Google ได้');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setIsSignedIn(false);
    setUserName(null);
    setUserEmail(null);
    onShowToast('ออกจากระบบ Google แล้ว', 'success');
  };

  const handleCreateNewSheet = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('กำลังสร้าง Google Sheet ใหม่...');
    try {
      const res = await createInventorySpreadsheet('ระบบสต๊อกอุปกรณ์งานช่างซ่อม');
      const newConfig: SheetsConfig = {
        ...sheetsConfig,
        spreadsheetId: res.spreadsheetId,
        spreadsheetUrl: res.spreadsheetUrl,
        lastSyncAt: new Date().toISOString(),
      };
      onUpdateConfig(newConfig);
      setInputSheetId(res.spreadsheetId);

      // Immediately sync current data
      setStatusMessage('กำลังซิงค์ข้อมูลลงใน Google Sheet...');
      await syncAllToSheets(res.spreadsheetId, items, transactions);

      setStatusMessage('สร้างและซิงค์ข้อมูลสำเร็จเรียบร้อย!');
      onShowToast('สร้าง Google Sheet สำเร็จและบันทึกข้อมูลเรียบร้อย', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสร้าง Sheet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSync = async () => {
    const targetId = sheetsConfig.spreadsheetId || inputSheetId.trim();
    if (!targetId) {
      setErrorMessage('กรุณาระบุหรือสร้าง Google Sheet ก่อนทำการซิงค์');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('กำลังส่งข้อมูลสต๊อกและประวัติไปยัง Google Sheets...');
    try {
      await syncAllToSheets(targetId, items, transactions);
      const newConfig: SheetsConfig = {
        ...sheetsConfig,
        spreadsheetId: targetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetId}/edit`,
        lastSyncAt: new Date().toISOString(),
      };
      onUpdateConfig(newConfig);
      setStatusMessage('ซิงค์ข้อมูลสำเร็จ! ข้อมูลใน Google Sheets อัปเดตตรงกันแล้ว');
      onShowToast('ซิงค์ข้อมูลลง Google Sheets เรียบร้อย', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการซิงค์');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCustomId = () => {
    const cleanId = inputSheetId.trim();
    if (!cleanId) return;

    // Extract ID if full URL pasted
    let extracted = cleanId;
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extracted = match[1];
    }

    const newConfig: SheetsConfig = {
      ...sheetsConfig,
      spreadsheetId: extracted,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${extracted}/edit`,
    };
    onUpdateConfig(newConfig);
    setInputSheetId(extracted);
    onShowToast('บันทึก Spreadsheet ID แล้ว', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="modal-sheets"
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">เชื่อมต่อ Google Sheets</h2>
              <p className="text-xs text-emerald-100">
                สำรองและบันทึกสต๊อก + ประวัติเข้าออกลงสเปรดชีต
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-sheets-modal"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1. Google Authentication Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              1. บัญชี Google สำหรับเชื่อมต่อ
            </h3>

            {isSignedIn ? (
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    G
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {userName || 'เข้าสู่ระบบแล้ว'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{userEmail || 'สิทธิ์ Google Sheets พร้อมใช้งาน'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded font-medium border border-rose-200 shrink-0"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 mb-2">
                  เข้าสู่ระบบด้วยบัญชี Google เพื่อให้แอปบันทึกข้อมูลลงในสเปรดชีตของคุณได้โดยอัตโนมัติ
                </p>
                {/* Official Material Google Sign-in style button */}
                <button
                  type="button"
                  id="btn-google-signin"
                  disabled={isProcessing}
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition active:scale-[0.99] text-xs font-semibold text-slate-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google (Sign in with Google)</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Spreadsheet Setup Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              2. Google Sheet สำหรับจัดเก็บข้อมูล
            </h3>

            {sheetsConfig.spreadsheetId ? (
              <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      เชื่อมต่อพร้อมใช้งาน
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                      {sheetsConfig.spreadsheetName}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      ID: {sheetsConfig.spreadsheetId}
                    </p>
                  </div>

                  <a
                    href={
                      sheetsConfig.spreadsheetUrl ||
                      `https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}/edit`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
                  >
                    <span>เปิดดู Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {sheetsConfig.lastSyncAt && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    ซิงค์ล่าสุดเมื่อ:{' '}
                    {new Date(sheetsConfig.lastSyncAt).toLocaleString('th-TH')}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  id="btn-create-new-sheet"
                  disabled={isProcessing}
                  onClick={isSignedIn ? handleCreateNewSheet : handleSignIn}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>กดสร้าง Google Sheet ใหม่ให้ทันที (คลิกเดียวพร้อมใช้)</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  ระบบจะสร้างหัวตาราง "รายการสต๊อกคงเหลือ" และ "ประวัติเข้า-ออก" ให้อัตโนมัติ
                </p>
              </div>
            )}

            {/* Custom Sheet ID or URL paste option */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-600 block">
                หรือระบุ Spreadsheet ID หรือลิงก์ Google Sheet ที่มีอยู่แล้ว:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={inputSheetId}
                  onChange={(e) => setInputSheetId(e.target.value)}
                  placeholder="วาง Sheet ID หรือ URL ที่นี่"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomId}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  บันทึก ID
                </button>
              </div>
            </div>
          </div>

          {/* 3. Sync Action */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-sync-now"
              disabled={isProcessing}
              onClick={isSignedIn ? handleManualSync : handleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>
                {isProcessing
                  ? 'กำลังประมวลผล...'
                  : `ซิงค์ข้อมูลทั้งหมดลง Google Sheets (${items.length} สินค้า, ${transactions.length} ประวัติ)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
