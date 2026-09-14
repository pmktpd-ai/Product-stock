import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShoppingCart,
  Copy,
  Check,
  Package,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import type { StockItem } from '../types';

interface ReplenishModalProps {
  isOpen: boolean;
  items: StockItem[];
  onClose: () => void;
  onStockInItem: (item: StockItem) => void;
}

export const ReplenishModal: React.FC<ReplenishModalProps> = ({
  isOpen,
  items,
  onClose,
  onStockInItem,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter items needing replenish (quantity <= minThreshold)
  const replenishList = items
    .filter((item) => item.quantity <= item.minThreshold)
    .map((item) => {
      // Calculate replenish amount
      const target = item.recommendedStock > item.minThreshold ? item.recommendedStock : item.minThreshold * 2;
      const needAmount = Math.max(1, target - item.quantity);
      return {
        ...item,
        needAmount,
        target,
      };
    })
    .sort((a, b) => {
      // 0 stock first
      if (a.quantity === 0 && b.quantity !== 0) return -1;
      if (b.quantity === 0 && a.quantity !== 0) return 1;
      return a.quantity / (a.minThreshold || 1) - b.quantity / (b.minThreshold || 1);
    });

  const handleCopyShoppingList = () => {
    if (replenishList.length === 0) return;

    const dateStr = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let text = `📋 รายการสั่งซื้อ/เติมสต๊อกอุปกรณ์ช่าง (${dateStr})\n`;
    text += `ทั้งหมด ${replenishList.length} รายการ:\n`;
    text += `-----------------------------------------\n`;

    replenishList.forEach((item, index) => {
      const statusText = item.quantity === 0 ? ' [หมดแล้ว!]' : ` [เหลือ ${item.quantity} ${item.unit}]`;
      text += `${index + 1}. ${item.name} (${item.code})\n`;
      text += `   ➡️ สั่งเติม: ${item.needAmount} ${item.unit}${statusText}\n`;
    });

    text += `-----------------------------------------\n`;
    text += `จัดทำจาก: ระบบสต๊อกอุปกรณ์ช่างซ่อม`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="modal-replenish"
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <AlertTriangle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">รายการที่ต้องเติมสต๊อก</h2>
              <p className="text-xs text-rose-100">
                พบ {replenishList.length} รายการที่ต่ำกว่าจุดเตือนขั้นต่ำ
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-replenish"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {replenishList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">สต๊อกอยู่ในระดับปลอดภัยทุกรายการ</h3>
              <p className="text-xs text-slate-500 mt-1">
                ไม่มีอุปกรณ์ใดที่เหลือน้อยกว่าจำนวนจุดเตือนที่คุณกำหนดไว้
              </p>
            </div>
          ) : (
            replenishList.map((item) => {
              const isZero = item.quantity === 0;

              return (
                <div
                  key={item.id}
                  id={`replenish-item-${item.id}`}
                  className={`p-3.5 rounded-xl border flex flex-col gap-2 transition ${
                    isZero
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                          {item.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.category}
                        </span>
                        {isZero ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                            หมดเกลี้ยง!
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                            ใกล้หมด
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStockInItem(item);
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      บันทึกรับเข้า
                    </button>
                  </div>

                  {/* Quantities indicator */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-500 text-[11px]">คงเหลือ: </span>
                        <span className={`font-bold ${isZero ? 'text-rose-600' : 'text-amber-700'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">เกณฑ์เตือน: </span>
                        <span className="font-medium text-slate-700">{item.minThreshold}</span>
                      </div>
                    </div>

                    <div className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium text-slate-900">
                      <span className="text-rose-600 font-bold">ควรสั่งเพิ่ม: +{item.needAmount}</span>{' '}
                      <span className="text-slate-500 text-[11px]">{item.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {replenishList.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-copy-shopping-list"
              onClick={handleCopyShoppingList}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>คัดลอกรายการแล้ว! พร้อมส่ง LINE</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-300" />
                  <span>คัดลอกรายการสั่งซื้อ ({replenishList.length} รายการ)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 transition"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
