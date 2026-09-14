import React, { useState } from 'react';
import {
  X,
  History,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  MapPin,
  Image as ImageIcon,
  User,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import type { Transaction } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  transactions: Transaction[];
  onClose: () => void;
  onUndoTransaction: (txId: string) => void;
  onOpenSheets?: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  transactions,
  onClose,
  onUndoTransaction,
  onOpenSheets,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  const latestTransaction = transactions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="modal-history"
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15">
              <History className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">ประวัติบันทึกเข้า-ออก</h2>
              <p className="text-xs text-slate-300">
                รวมทั้งหมด {transactions.length} รายการ (บันทึกลง Sheets ได้)
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-history"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Undo Notice (If latest transaction exists) */}
        {latestTransaction && (
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="text-xs leading-tight truncate">
                <span className="font-semibold text-amber-900">รายการล่าสุด: </span>
                <span className="text-amber-800">
                  {latestTransaction.type === 'IN' ? 'รับเข้า' : 'เบิกออก'} {latestTransaction.quantity} รายการ ({latestTransaction.itemName})
                </span>
              </div>
            </div>
            <button
              type="button"
              id="btn-undo-latest-tx"
              onClick={() => onUndoTransaction(latestTransaction.id)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition flex items-center gap-1 shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ย้อนรายการนี้
            </button>
          </div>
        )}

        {/* Filter chips */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ทั้งหมด ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('OUT')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                filter === 'OUT'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3 text-amber-500" />
              เบิกออก ({transactions.filter((t) => t.type === 'OUT').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('IN')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                filter === 'IN'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              รับเข้า ({transactions.filter((t) => t.type === 'IN').length})
            </button>
          </div>

          {onOpenSheets && (
            <button
              type="button"
              onClick={onOpenSheets}
              className="text-xs text-emerald-700 font-medium hover:underline flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Google Sheets
            </button>
          )}
        </div>

        {/* Transaction list */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              ไม่พบประวัติในหมวดหมู่นี้
            </div>
          ) : (
            filtered.map((tx, index) => {
              const isFirst = index === 0;
              const isOut = tx.type === 'OUT';

              return (
                <div
                  key={tx.id}
                  id={`tx-row-${tx.id}`}
                  className={`p-3 rounded-xl border transition ${
                    isFirst ? 'ring-2 ring-amber-400/40 border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isOut ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isOut ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isOut
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'เบิกออก' : 'รับเข้า'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {tx.itemCode}
                          </span>
                          {isFirst && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1 rounded">
                              ล่าสุด
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                          {tx.itemName}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold ${
                          isOut ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {isOut ? '-' : '+'}
                        {tx.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Transaction metadata */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(tx.date).toLocaleString('th-TH')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{tx.operator}</span>
                      </div>
                    </div>

                    {tx.location && (
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">สถานที่: {tx.location}</span>
                      </div>
                    )}

                    {tx.note && (
                      <div className="text-slate-600 bg-slate-50 p-1.5 rounded text-[11px]">
                        💬 {tx.note}
                      </div>
                    )}

                    {tx.imageUrl && (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(tx.imageUrl || null)}
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          ดูรูปถ่ายสินค้า
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Undo button (Allowed on the latest transaction) */}
                  {isFirst && (
                    <div className="mt-2.5 pt-2 border-t border-amber-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onUndoTransaction(tx.id)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        ย้อนรายการนี้ (ปรับคืนสต๊อก)
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Image Preview Overlay Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden p-3 shadow-2xl">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={previewImage}
                alt="รูปถ่ายสินค้า"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
              <p className="text-center text-xs text-slate-500 mt-2">รูปถ่ายสินค้าตอนบันทึกเข้า</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
