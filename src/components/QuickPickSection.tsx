import React from 'react';
import { Flame, Zap, Plus, Minus, AlertCircle } from 'lucide-react';
import type { StockItem } from '../types';

interface QuickPickSectionProps {
  items: StockItem[];
  onQuickStockOut: (item: StockItem) => void;
  onOpenDetailedStockOut: (item: StockItem) => void;
  onOpenDetailedStockIn: (item: StockItem) => void;
}

export const QuickPickSection: React.FC<QuickPickSectionProps> = ({
  items,
  onQuickStockOut,
  onOpenDetailedStockOut,
  onOpenDetailedStockIn,
}) => {
  // Sort items by usage frequency and pick top 5
  const frequentItems = [...items]
    .filter((item) => item.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 6);

  if (frequentItems.length === 0) return null;

  return (
    <section className="mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-amber-100 text-amber-800">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            ของที่หยิบบ่อย • แตะครั้งเดียวบันทึกเบิกได้ทันที
          </h2>
        </div>
        <span className="text-[11px] text-slate-500">
          เบิกด่วน 1 {frequentItems[0]?.unit || 'ชิ้น'}
        </span>
      </div>

      {/* Horizontal scrollable cards for phone view */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory">
        {frequentItems.map((item) => {
          const isLow = item.quantity <= item.minThreshold;
          const isOut = item.quantity === 0;

          return (
            <div
              key={item.id}
              id={`quick-pick-${item.id}`}
              className={`min-w-[160px] max-w-[180px] shrink-0 p-3 rounded-xl border bg-white shadow-xs snap-start flex flex-col justify-between transition hover:shadow-md ${
                isOut
                  ? 'border-rose-200 bg-rose-50/40'
                  : isLow
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Item category & Code */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                    {item.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isOut
                        ? 'bg-rose-100 text-rose-700'
                        : isLow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    เหลือ {item.quantity} {item.unit}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 min-h-[2rem]">
                  {item.name}
                </h3>
              </div>

              {/* 1-Tap Quick Out Button */}
              <div className="space-y-1 mt-1">
                <button
                  type="button"
                  id={`btn-quick-out-${item.id}`}
                  disabled={isOut}
                  onClick={() => onQuickStockOut(item)}
                  className={`w-full py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow-xs ${
                    isOut
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                  title={isOut ? 'สินค้าหมดสต๊อก' : 'กดทีเดียวบันทึกเบิก 1 ชิ้นทันที'}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                  <span>{isOut ? 'ของหมด' : 'กดเบิก 1 ชิ้น'}</span>
                </button>

                {/* Micro In/Out trigger for custom amount */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenDetailedStockIn(item)}
                    className="hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" /> รับเข้า
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDetailedStockOut(item)}
                    className="hover:text-amber-700 flex items-center gap-0.5"
                  >
                    <Minus className="w-3 h-3 text-amber-600" /> ระบุจำนวน
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
