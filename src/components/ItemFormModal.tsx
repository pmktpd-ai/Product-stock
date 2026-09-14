import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  Camera,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import type { StockItem } from '../types';

interface ItemFormModalProps {
  isOpen: boolean;
  itemToEdit: StockItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<StockItem, 'id' | 'usageCount' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (itemId: string) => void;
}

const CATEGORIES = [
  'งานไฟฟ้า',
  'งานประปา',
  'เครื่องมือช่าง',
  'วัสดุสิ้นเปลือง',
  'สีและเคมีภัณฑ์',
  'อุปกรณ์ความปลอดภัย',
  'งานก่อสร้างและงานปูน',
  'อื่น ๆ',
];

const UNITS = ['ชิ้น', 'อัน', 'ตัว', 'ม้วน', 'กล่อง', 'หลอด', 'เส้น', 'เมตร', 'ชุด', 'คู่', 'ถุง', 'กระป๋อง'];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState(UNITS[0]);
  const [customUnit, setCustomUnit] = useState('');
  const [minThreshold, setMinThreshold] = useState<number>(5);
  const [recommendedStock, setRecommendedStock] = useState<number>(15);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setCode(itemToEdit.code);
      setName(itemToEdit.name);
      if (CATEGORIES.includes(itemToEdit.category)) {
        setCategory(itemToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('อื่น ๆ');
        setCustomCategory(itemToEdit.category);
      }
      setQuantity(itemToEdit.quantity);
      if (UNITS.includes(itemToEdit.unit)) {
        setUnit(itemToEdit.unit);
        setCustomUnit('');
      } else {
        setUnit('อื่น ๆ');
        setCustomUnit(itemToEdit.unit);
      }
      setMinThreshold(itemToEdit.minThreshold);
      setRecommendedStock(itemToEdit.recommendedStock);
      setImageUrl(itemToEdit.imageUrl);
    } else {
      setCode(`ITEM-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setCategory(CATEGORIES[0]);
      setCustomCategory('');
      setQuantity(10);
      setUnit(UNITS[0]);
      setCustomUnit('');
      setMinThreshold(5);
      setRecommendedStock(15);
      setImageUrl(undefined);
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setImageUrl(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อสินค้า/อุปกรณ์');
      return;
    }
    if (!code.trim()) {
      setError('กรุณาระบุรหัสสินค้า');
      return;
    }

    const finalCategory = category === 'อื่น ๆ' && customCategory.trim() ? customCategory.trim() : category;
    const finalUnit = unit === 'อื่น ๆ' && customUnit.trim() ? customUnit.trim() : unit;

    onSave({
      id: itemToEdit?.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: finalCategory,
      quantity: Number(quantity) || 0,
      unit: finalUnit,
      minThreshold: Number(minThreshold) || 0,
      recommendedStock: Number(recommendedStock) || Number(minThreshold) * 2,
      imageUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="modal-item-form"
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">
                {itemToEdit ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าสต๊อก'}
              </h2>
              <p className="text-xs text-slate-300">
                {itemToEdit ? `รหัส ${itemToEdit.code}` : 'สำหรับผู้ดูแลระบบ (Admin)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-item-form"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Photo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">รูปภาพอุปกรณ์ (ถ้ามี)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageFile}
              className="hidden"
            />
            {imageUrl ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 h-36 flex items-center justify-center">
                <img src={imageUrl} alt="preview" className="h-full w-full object-contain" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-slate-900/80 text-white rounded-lg text-xs"
                  >
                    เปลี่ยนรูป
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    className="p-1.5 bg-rose-600/80 text-white rounded-lg text-xs"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:border-slate-400 flex items-center justify-center gap-2 text-slate-500"
              >
                <Camera className="w-4 h-4 text-slate-400" />
                <span className="text-xs">แตะเพื่อถ่ายรูปหรือเลือกรูป</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Code */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">รหัสสินค้า / อุปกรณ์ *</label>
              <input
                type="text"
                id="input-item-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น ELEC-01"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">หมวดหมู่</label>
              <select
                id="select-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">ชื่อสินค้า / อุปกรณ์ช่าง *</label>
            <input
              type="text"
              id="input-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น เทปพันสายไฟ 3M สีดำ, บอลวาล์ว PVC 1/2 นิ้ว"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">จำนวนคงเหลือปัจจุบัน</label>
              <input
                type="number"
                id="input-item-quantity"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">หน่วยนับ</label>
              <select
                id="select-item-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thresholds: minThreshold & recommendedStock */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>การตั้งค่าแจ้งเตือนและจำนวนเติม</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-amber-900">
                  จุดเตือนของใกล้หมด (ขั้นต่ำ) *
                </label>
                <input
                  type="number"
                  id="input-item-min-threshold"
                  min="0"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-sm font-bold text-rose-700"
                  required
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  เตือนเมื่อเหลือน้อยกว่าหรือเท่ากับจำนวนนี้
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-amber-900">
                  จำนวนแนะนำมีในสต๊อก (เป้าหมาย)
                </label>
                <input
                  type="number"
                  id="input-item-recommended"
                  min="0"
                  value={recommendedStock}
                  onChange={(e) => setRecommendedStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-sm font-bold text-slate-800"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  ใช้คำนวณจำนวนที่ควรสั่งเติม
                </p>
              </div>
            </div>
          </div>

          {/* Submit and Delete */}
          <div className="pt-2 flex items-center gap-2">
            {itemToEdit && onDelete && (
              <button
                type="button"
                id="btn-delete-item"
                onClick={() => {
                  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${itemToEdit.name}" ออกจากสต๊อก?`)) {
                    onDelete(itemToEdit.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                title="ลบรายการนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              id="btn-save-item"
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{itemToEdit ? 'บันทึกการแก้ไข' : 'บันทึกอุปกรณ์ใหม่'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
