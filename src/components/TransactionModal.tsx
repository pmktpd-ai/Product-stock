import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  PlusCircle,
  MinusCircle,
  Camera,
  MapPin,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { StockItem, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  item: StockItem | null;
  mode: TransactionType; // 'IN' or 'OUT'
  onClose: () => void;
  onSubmit: (data: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    date: string;
    location?: string;
    imageUrl?: string;
    note?: string;
    operator: string;
  }) => void;
}

const COMMON_LOCATIONS = [
  'อาคาร A ชั้น 1',
  'อาคาร A ชั้น 2',
  'อาคาร B (โรงอาหาร)',
  'ห้องเครื่องปรับอากาศ',
  'ห้องปั๊มน้ำ / บ่อบำบัด',
  'หน้างานซ่อมด่วน',
  'งานซ่อมบำรุงประจำวัน',
  'สต๊อกช่างกลาง',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  item,
  mode,
  onClose,
  onSubmit,
}) => {
  // Defaults
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:mm for datetime-local
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState<string>('');
  const [operator, setOperator] = useState<string>('ช่างเทคนิค');
  const [note, setNote] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuantity(1);
    setValidationError(null);
    if (item && mode === 'IN') {
      setImagePreview(item.imageUrl || null);
    }
  }, [item, mode]);

  if (!isOpen || !item) return null;

  // Handle image upload / camera capture and resize to efficient web size
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (quantity <= 0) {
      setValidationError('จำนวนต้องมากกว่า 0');
      return;
    }

    if (mode === 'OUT' && quantity > item.quantity) {
      setValidationError(
        `ไม่สามารถเบิกเกินจำนวนคงเหลือได้ (สต๊อกปัจจุบันเหลือ ${item.quantity} ${item.unit})`
      );
      return;
    }

    if (mode === 'OUT' && !location.trim()) {
      setValidationError('กรุณาระบุสถานที่เบิกใช้สำหรับงานซ่อม');
      return;
    }

    onSubmit({
      itemId: item.id,
      type: mode,
      quantity,
      date,
      location: mode === 'OUT' ? location.trim() : undefined,
      imageUrl: mode === 'IN' && imagePreview ? imagePreview : undefined,
      note: note.trim() || undefined,
      operator: operator.trim() || 'ช่างซ่อม',
    });

    onClose();
  };

  const isStockOut = mode === 'OUT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="modal-transaction"
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-auto"
      >
        {/* Header */}
        <div
          className={`p-4 text-white flex items-center justify-between ${
            isStockOut ? 'bg-amber-600' : 'bg-emerald-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              {isStockOut ? (
                <MinusCircle className="w-5 h-5 text-white" />
              ) : (
                <PlusCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">
                {isStockOut ? 'บันทึกเบิกออก (ของออก)' : 'บันทึกรับเข้า (ของเข้าสต๊อก)'}
              </h2>
              <p className="text-xs text-white/80">
                {item.code} • {item.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-tx-modal"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Snapshot banner */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">สต๊อกคงเหลือปัจจุบัน:</span>
          <span
            className={`font-semibold text-sm ${
              item.quantity <= item.minThreshold ? 'text-rose-600 font-bold' : 'text-slate-800'
            }`}
          >
            {item.quantity} {item.unit}
            {item.quantity <= item.minThreshold && (
              <span className="ml-1 text-[11px] font-normal text-rose-500">
                (ใกล้หมด! เกณฑ์เตือน: {item.minThreshold})
              </span>
            )}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              จำนวน {isStockOut ? 'ที่ต้องการเบิก' : 'ที่รับเข้า'} ({item.unit}) *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-tx-qty-minus"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition active:scale-95"
              >
                -
              </button>
              <input
                type="number"
                id="input-tx-quantity"
                min="1"
                max={isStockOut ? item.quantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center font-bold text-lg py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
              <button
                type="button"
                id="btn-tx-qty-plus"
                onClick={() =>
                  setQuantity((q) => (isStockOut ? Math.min(item.quantity, q + 1) : q + 1))
                }
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition active:scale-95"
              >
                +
              </button>
            </div>

            {/* Quick quantity chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">เลือกเร็ว:</span>
              {[1, 2, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  id={`btn-quick-qty-${num}`}
                  onClick={() => setQuantity(num)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    quantity === num
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{num}
                </button>
              ))}
              {isStockOut && (
                <button
                  type="button"
                  id="btn-quick-qty-all"
                  onClick={() => setQuantity(item.quantity)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                >
                  เบิกหมดสต๊อก ({item.quantity})
                </button>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              วันที่และเวลาที่ทำรายการ *
            </label>
            <input
              type="datetime-local"
              id="input-tx-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              required
            />
          </div>

          {/* Stock Out Specific: Location (สถานที่เบิกใช้) */}
          {isStockOut && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                สถานที่เบิกใช้ / หน้างานซ่อม *
              </label>
              <input
                type="text"
                id="input-tx-location"
                placeholder="เช่น อาคาร A ชั้น 3 ห้องช่าง, ไซต์งานซ่อมปั๊ม"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                required
              />

              {/* Location Quick suggestion chips */}
              <div className="space-y-1 pt-1">
                <p className="text-[11px] text-slate-400">จุดที่ใช้บ่อย (แตะเพื่อเลือก):</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      id={`btn-loc-${loc}`}
                      onClick={() => setLocation(loc)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                        location === loc
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stock In Specific: Image Upload / Camera */}
          {!isStockOut && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                รูปถ่ายสินค้า / สภาพสินค้า (ถ่ายจากมือถือหรือเลือกรูป)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
                id="input-tx-image"
              />

              {imagePreview ? (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video max-h-48 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="รูปสินค้าที่รับเข้า"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      id="btn-retake-photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-900/80 text-white rounded-lg text-xs hover:bg-slate-900 backdrop-blur-sm flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      เปลี่ยนรูป
                    </button>
                    <button
                      type="button"
                      id="btn-remove-photo"
                      onClick={() => setImagePreview(null)}
                      className="p-1.5 bg-rose-600/80 text-white rounded-lg hover:bg-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      แตะเพื่อถ่ายรูปด้วยกล้องมือถือ หรือเลือกไฟล์รูป
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ระบบจะปรับขนาดภาพให้อัตโนมัติเพื่อความเร็ว
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Operator Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">ผู้ทำรายการ</label>
              <input
                type="text"
                id="input-tx-operator"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="ชื่อช่าง / ผู้เบิก"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">หมายเหตุเพิ่มเติม</label>
              <input
                type="text"
                id="input-tx-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ใบสั่งงาน #104, ล็อตใหม่"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-tx"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-submit-tx"
              className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-semibold shadow-md transition active:scale-[0.99] flex items-center justify-center gap-1.5 ${
                isStockOut
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isStockOut ? `ยืนยันเบิกออก ${quantity} ${item.unit}` : `บันทึกรับเข้า ${quantity} ${item.unit}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
