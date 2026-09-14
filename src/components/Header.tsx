import React from 'react';
import {
  Wrench,
  Shield,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { SheetsConfig } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  sheetsConfig: SheetsConfig;
  lowStockCount: number;
  hasLatestTransaction: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenSheetsModal: () => void;
  onOpenReplenishModal: () => void;
  onOpenHistoryModal: () => void;
  onUndoLastTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  sheetsConfig,
  lowStockCount,
  hasLatestTransaction,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenSheetsModal,
  onOpenReplenishModal,
  onOpenHistoryModal,
  onUndoLastTransaction,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-3.5 py-2.5 sm:px-4 sm:py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight truncate">
                สต๊อกอุปกรณ์ช่าง
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                บันทึกเข้า-ออก & แจ้งเตือนของหมด
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Google Sheets Status */}
            <button
              type="button"
              id="btn-open-sheets"
              onClick={onOpenSheetsModal}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                sheetsConfig.spreadsheetId
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Google Sheets ซิงค์"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xs:inline text-[11px] sm:text-xs">
                {sheetsConfig.spreadsheetId ? 'เชื่อมต่อ Sheets แล้ว' : 'ต่อ Sheets'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sheetsConfig.spreadsheetId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
            </button>

            {/* Admin Login / Logout */}
            {isAdmin ? (
              <button
                type="button"
                id="btn-admin-status"
                onClick={onLogoutAdmin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition"
                title="คลิกเพื่อออกจากระบบ Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">แอดมิน</span>
                <span className="text-[10px] text-amber-700 underline ml-0.5">ออก</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-admin-login"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] sm:text-xs">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Utilities bar (Mobile optimized) */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {/* Quick Replenish Check Button */}
            <button
              type="button"
              id="btn-quick-replenish"
              onClick={onOpenReplenishModal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-[11px] sm:text-xs transition ${
                lowStockCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
              <span>ของต้องเติม</span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {lowStockCount}
                </span>
              )}
            </button>

            {/* History Button */}
            <button
              type="button"
              id="btn-open-history"
              onClick={onOpenHistoryModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>ประวัติเข้า-ออก</span>
            </button>
          </div>

          {/* Quick Undo Button (If mistake was made) */}
          {hasLatestTransaction && (
            <button
              type="button"
              id="btn-header-undo"
              onClick={onUndoLastTransaction}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-200 transition"
              title="ย้อนรายการล่าสุดหากกรอกผิด"
            >
              <RotateCcw className="w-3 h-3 text-amber-700" />
              <span>ย้อนรายการล่าสุด</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
