import React, { useState } from 'react';
import {
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Package,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { StockItem } from '../types';

interface StockListProps {
  items: StockItem[];
  isAdmin: boolean;
  onStockIn: (item: StockItem) => void;
  onStockOut: (item: StockItem) => void;
  onEditItem: (item: StockItem) => void;
  onQuickReplenishModal: () => void;
}

export const StockList: React.FC<StockListProps> = ({
  items,
  isAdmin,
  onStockIn,
  onStockOut,
  onEditItem,
  onQuickReplenishModal,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Package className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">ไม่พบรายการอุปกรณ์</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          ลองพิมพ์ค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นเพื่อดูรายการทั้งหมด
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const isOut = item.quantity === 0;
        const isLow = item.quantity <= item.minThreshold;
        const replenishNeed = Math.max(0, item.recommendedStock - item.quantity);

        return (
          <div
            key={item.id}
            id={`stock-item-${item.id}`}
            className={`p-3.5 sm:p-4 rounded-2xl border bg-white shadow-xs transition hover:shadow-md ${
              isOut
                ? 'border-rose-300 ring-1 ring-rose-300/40 bg-rose-50/15'
                : isLow
                ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/15'
                : 'border-slate-200'
            }`}
          >
            {/* Top row: Code, Category, Alerts, Admin Edit */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {item.code}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Clear prominent alerts */}
                {isOut ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    หมดเกลี้ยง!
                  </span>
                ) : isLow ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                    <AlertTriangle className="w-3 h-3" />
                    ใกล้หมด (เกณฑ์ {item.minThreshold})
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    สต๊อกปกติ
                  </span>
                )}

                {/* Admin edit button */}
                {isAdmin && (
                  <button
                    type="button"
                    id={`btn-edit-item-${item.id}`}
                    onClick={() => onEditItem(item)}
                    className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition ml-1"
                    title="แก้ไขข้อมูล / ตั้งค่าจุดเตือน"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Middle row: Thumbnail + Name + Quantities */}
            <div className="flex items-start gap-3 my-2">
              {/* Image thumbnail if exists */}
              {item.imageUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhoto({ url: item.imageUrl!, title: item.name })
                  }
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 relative group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-slate-300" />
                </div>
              )}

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                  {item.name}
                </h3>

                {/* Stock details */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1 text-xs">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-500 text-[11px]">คงเหลือ:</span>
                    <span
                      className={`text-base font-extrabold ${
                        isOut
                          ? 'text-rose-600'
                          : isLow
                          ? 'text-amber-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <span className="font-medium text-slate-600 text-xs">
                      {item.unit}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    จุดเตือน: <span className="font-semibold text-slate-700">{item.minThreshold}</span>
                  </div>

                  {item.recommendedStock > 0 && (
                    <div className="text-[11px] text-slate-500">
                      เป้าหมาย: <span className="font-semibold text-slate-700">{item.recommendedStock}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* If low stock, show quick replenish hint */}
            {isLow && replenishNeed > 0 && (
              <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
                <span>
                  💡 แนะนำเติมเพิ่มอีก <strong className="font-bold">{replenishNeed} {item.unit}</strong> เพื่อให้สต๊อกปลอดภัย
                </span>
              </div>
            )}

            {/* Bottom action buttons (Large touch targets for mobile) */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              {/* Stock IN */}
              <button
                type="button"
                id={`btn-stock-in-${item.id}`}
                onClick={() => onStockIn(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>บันทึกรับเข้า</span>
              </button>

              {/* Stock OUT */}
              <button
                type="button"
                id={`btn-stock-out-${item.id}`}
                disabled={isOut}
                onClick={() => onStockOut(item)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] ${
                  isOut
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                <MinusCircle className={`w-4 h-4 ${isOut ? 'text-slate-400' : 'text-amber-600'}`} />
                <span>บันทึกเบิกออก</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
            <p className="text-center font-semibold text-xs text-slate-800 mt-2.5">
              {selectedPhoto.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
