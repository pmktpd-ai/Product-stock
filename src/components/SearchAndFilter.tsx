import React from 'react';
import { Search, X, Filter, AlertTriangle, Plus, Sparkles } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  categories: string[];
  onlyLowStock: boolean;
  onToggleOnlyLowStock: () => void;
  lowStockCount: number;
  isAdmin: boolean;
  onAddNewItem: () => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  onlyLowStock,
  onToggleOnlyLowStock,
  lowStockCount,
  isAdmin,
  onAddNewItem,
}) => {
  return (
    <div className="space-y-2 mb-3">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            id="input-search-items"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="พิมพ์ 1-2 ตัวอักษรเพื่อค้นหา เช่น เทป, 3M, สว่าน, ท่อ..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-800 transition"
          />
          {searchQuery && (
            <button
              type="button"
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Add new item (if Admin) or Admin hint */}
        {isAdmin ? (
          <button
            type="button"
            id="btn-add-new-item"
            onClick={onAddNewItem}
            className="shrink-0 py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">เพิ่มสินค้า</span>
          </button>
        ) : (
          <button
            type="button"
            id="btn-toggle-low-stock-top"
            onClick={onToggleOnlyLowStock}
            className={`shrink-0 py-2.5 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition ${
              onlyLowStock
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="กรองเฉพาะของใกล้หมด"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyLowStock ? 'text-white' : 'text-rose-500'}`} />
            {lowStockCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                onlyLowStock ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
              }`}>
                {lowStockCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Category filter pills - horizontal scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
            selectedCategory === 'ALL' && !onlyLowStock
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          ทั้งหมด
        </button>

        {/* Low stock quick filter pill */}
        <button
          type="button"
          id="pill-filter-low-stock"
          onClick={onToggleOnlyLowStock}
          className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 flex items-center gap-1 transition ${
            onlyLowStock
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>เตือนของใกล้หมด</span>
          {lowStockCount > 0 && (
            <span className="font-bold">({lowStockCount})</span>
          )}
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              if (onlyLowStock) onToggleOnlyLowStock();
              onSelectCategory(cat);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
              selectedCategory === cat && !onlyLowStock
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
