import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { StockItem, Transaction, SheetsConfig, TransactionType } from './types';
import {
  getStoredItems,
  saveStoredItems,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredSheetsConfig,
  saveStoredSheetsConfig,
  getStoredAdminAuth,
  saveStoredAdminAuth,
} from './services/storage';
import { Header } from './components/Header';
import { QuickPickSection } from './components/QuickPickSection';
import { SearchAndFilter } from './components/SearchAndFilter';
import { StockList } from './components/StockList';
import { TransactionModal } from './components/TransactionModal';
import { ReplenishModal } from './components/ReplenishModal';
import { HistoryModal } from './components/HistoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ItemFormModal } from './components/ItemFormModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { appendTransactionToSheets, syncAllToSheets } from './services/googleSheets';
import { initAuth } from './services/firebaseAuth';
import { AlertTriangle, Plus, RotateCcw } from 'lucide-react';

export default function App() {
  // Primary States
  const [items, setItems] = useState<StockItem[]>(() => getStoredItems());
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(() => getStoredSheetsConfig());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getStoredAdminAuth());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [transactionItem, setTransactionItem] = useState<StockItem | null>(null);
  const [transactionMode, setTransactionMode] = useState<TransactionType>('OUT');

  const [isReplenishModalOpen, setIsReplenishModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize Firebase Auth listener on load
  useEffect(() => {
    initAuth(
      (user, token) => {
        console.log('Firebase auth connected:', user.email);
      },
      () => {
        console.log('No active google session');
      }
    );
  }, []);

  // Sync to localStorage on changes
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  useEffect(() => {
    saveStoredAdminAuth(isAdmin);
  }, [isAdmin]);

  // Toast Helpers
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Low stock calculation
  const lowStockItems = useMemo(() => {
    return items.filter((item) => item.quantity <= item.minThreshold);
  }, [items]);

  // Filtered Stock List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search filter (Instant search on code, name, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat) return false;
      }

      // 2. Low stock filter
      if (onlyLowStock) {
        if (item.quantity > item.minThreshold) return false;
      }

      // 3. Category filter
      if (selectedCategory !== 'ALL') {
        if (item.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [items, searchQuery, onlyLowStock, selectedCategory]);

  // 1-Tap Quick Stock Out for Frequently Picked Items
  const handleQuickStockOut = (item: StockItem) => {
    if (item.quantity <= 0) {
      addToast({
        type: 'error',
        title: 'ไม่สามารถเบิกได้',
        description: `อุปกรณ์ "${item.name}" หมดสต๊อกแล้ว`,
      });
      return;
    }

    const txId = `TX-${Date.now().toString().slice(-6)}`;
    const newTx: Transaction = {
      id: txId,
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      type: 'OUT',
      quantity: 1,
      date: new Date().toISOString(),
      location: 'เบิกด่วนหน้างาน (1-Tap)',
      operator: 'ช่างซ่อม',
      createdAt: Date.now(),
    };

    // Update items state
    const updatedItems = items.map((it) => {
      if (it.id === item.id) {
        return {
          ...it,
          quantity: Math.max(0, it.quantity - 1),
          usageCount: it.usageCount + 1,
          updatedAt: new Date().toISOString(),
        };
      }
      return it;
    });

    setItems(updatedItems);
    setTransactions((prev) => [newTx, ...prev]);

    // Optional background sync to Google Sheets
    if (sheetsConfig.spreadsheetId) {
      appendTransactionToSheets(sheetsConfig.spreadsheetId, newTx, item.unit);
    }

    // Show toast with immediate Undo button
    addToast({
      type: 'success',
      title: `เบิกด่วนสำเร็จ: ${item.name} 1 ${item.unit}`,
      description: `สต๊อกคงเหลือตอนนี้: ${item.quantity - 1} ${item.unit}`,
      undoLabel: 'ย้อนรายการ (ยกเลิกเบิก)',
      onUndo: () => handleUndoTransaction(txId),
    });
  };

  // Record Stock In or Out from Transaction Modal
  const handleProcessTransaction = (data: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    date: string;
    location?: string;
    imageUrl?: string;
    note?: string;
    operator: string;
  }) => {
    const targetItem = items.find((i) => i.id === data.itemId);
    if (!targetItem) return;

    const txId = `TX-${Date.now().toString().slice(-6)}`;
    const newTx: Transaction = {
      id: txId,
      itemId: targetItem.id,
      itemName: targetItem.name,
      itemCode: targetItem.code,
      type: data.type,
      quantity: data.quantity,
      date: data.date,
      location: data.location,
      imageUrl: data.imageUrl,
      note: data.note,
      operator: data.operator,
      createdAt: Date.now(),
    };

    // Update item stock
    const updatedItems = items.map((it) => {
      if (it.id === targetItem.id) {
        const newQty =
          data.type === 'IN'
            ? it.quantity + data.quantity
            : Math.max(0, it.quantity - data.quantity);
        return {
          ...it,
          quantity: newQty,
          usageCount: data.type === 'OUT' ? it.usageCount + 1 : it.usageCount,
          imageUrl: data.imageUrl || it.imageUrl,
          updatedAt: new Date().toISOString(),
        };
      }
      return it;
    });

    setItems(updatedItems);
    setTransactions((prev) => [newTx, ...prev]);

    // Background sync to Google Sheets if connected
    if (sheetsConfig.spreadsheetId) {
      appendTransactionToSheets(sheetsConfig.spreadsheetId, newTx, targetItem.unit);
    }

    const actionText = data.type === 'IN' ? 'รับเข้าสต๊อก' : 'เบิกออก';
    addToast({
      type: 'success',
      title: `${actionText}สำเร็จ: ${targetItem.name}`,
      description: `จำนวน ${data.quantity} ${targetItem.unit} ${
        data.location ? `(สถานที่: ${data.location})` : ''
      }`,
      undoLabel: 'ย้อนรายการนี้',
      onUndo: () => handleUndoTransaction(txId),
    });
  };

  // "ถ้ากรอกผิด ย้อนรายการล่าสุดได้" (Undo Transaction)
  const handleUndoTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) {
      addToast({
        type: 'error',
        title: 'ไม่พบรายการที่ต้องการย้อน',
      });
      return;
    }

    // Revert the stock adjustment
    const updatedItems = items.map((it) => {
      if (it.id === tx.itemId) {
        let revertedQty = it.quantity;
        if (tx.type === 'IN') {
          // If was stock in, subtract it back
          revertedQty = Math.max(0, it.quantity - tx.quantity);
        } else {
          // If was stock out, add it back
          revertedQty = it.quantity + tx.quantity;
        }

        return {
          ...it,
          quantity: revertedQty,
          usageCount: tx.type === 'OUT' ? Math.max(0, it.usageCount - 1) : it.usageCount,
          updatedAt: new Date().toISOString(),
        };
      }
      return it;
    });

    // Remove from transactions list
    const updatedTransactions = transactions.filter((t) => t.id !== txId);

    setItems(updatedItems);
    setTransactions(updatedTransactions);

    // Sync state update to Google Sheets if configured
    if (sheetsConfig.spreadsheetId) {
      syncAllToSheets(sheetsConfig.spreadsheetId, updatedItems, updatedTransactions).catch(() => {});
    }

    addToast({
      type: 'info',
      title: 'ย้อนรายการเรียบร้อยแล้ว',
      description: `คืนค่าสต๊อกของ "${tx.itemName}" จำนวน ${tx.quantity} รายการแล้ว`,
    });
  };

  // Admin Save Item (Add or Edit)
  const handleSaveItem = (
    itemData: Omit<StockItem, 'id' | 'usageCount' | 'updatedAt'> & { id?: string }
  ) => {
    if (itemData.id) {
      // Edit existing
      const updated = items.map((it) => {
        if (it.id === itemData.id) {
          return {
            ...it,
            ...itemData,
            updatedAt: new Date().toISOString(),
          };
        }
        return it;
      });
      setItems(updated);
      addToast({
        type: 'success',
        title: 'แก้ไขอุปกรณ์สำเร็จ',
        description: `อัปเดตข้อมูล ${itemData.name} เรียบร้อยแล้ว`,
      });
    } else {
      // Add new
      const newItem: StockItem = {
        id: `item-${Date.now()}`,
        code: itemData.code,
        name: itemData.name,
        category: itemData.category,
        quantity: itemData.quantity,
        unit: itemData.unit,
        minThreshold: itemData.minThreshold,
        recommendedStock: itemData.recommendedStock,
        imageUrl: itemData.imageUrl,
        usageCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setItems([newItem, ...items]);
      addToast({
        type: 'success',
        title: 'เพิ่มอุปกรณ์ใหม่แล้ว',
        description: `เพิ่ม ${newItem.name} เข้าสู่ระบบสต๊อก`,
      });
    }

    // Sync to Sheets
    if (sheetsConfig.spreadsheetId) {
      setTimeout(() => {
        syncAllToSheets(sheetsConfig.spreadsheetId!, items, transactions).catch(() => {});
      }, 500);
    }
  };

  // Admin Delete Item
  const handleDeleteItem = (itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    addToast({
      type: 'info',
      title: 'ลบอุปกรณ์แล้ว',
      description: it ? `ลบ ${it.name} ออกจากระบบ` : undefined,
    });
  };

  // Open modals
  const handleOpenStockIn = (item: StockItem) => {
    setTransactionItem(item);
    setTransactionMode('IN');
    setIsTransactionModalOpen(true);
  };

  const handleOpenStockOut = (item: StockItem) => {
    setTransactionItem(item);
    setTransactionMode('OUT');
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditItem = (item: StockItem) => {
    setItemToEdit(item);
    setIsItemFormModalOpen(true);
  };

  const handleAddNewItem = () => {
    setItemToEdit(null);
    setIsItemFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <Header
        isAdmin={isAdmin}
        sheetsConfig={sheetsConfig}
        lowStockCount={lowStockItems.length}
        hasLatestTransaction={transactions.length > 0}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          addToast({ type: 'info', title: 'ออกจากโหมดผู้ดูแลระบบแล้ว' });
        }}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenReplenishModal={() => setIsReplenishModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onUndoLastTransaction={() => {
          if (transactions[0]) {
            handleUndoTransaction(transactions[0].id);
          }
        }}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 pt-3.5 sm:px-4 sm:pt-4">
        {/* Low Stock Alert Notice Banner (If any) */}
        {lowStockItems.length > 0 && !onlyLowStock && (
          <div className="mb-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">
                  มี {lowStockItems.length} รายการที่ต่ำกว่าจุดแจ้งเตือน!
                </p>
                <p className="text-[11px] text-amber-800/80 truncate">
                  {lowStockItems.map((i) => i.name).slice(0, 2).join(', ')}
                  {lowStockItems.length > 2 ? ` และอีก ${lowStockItems.length - 2} รายการ` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-banner-replenish"
              onClick={() => setIsReplenishModalOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 whitespace-nowrap"
            >
              ดูของต้องเติม ⚡
            </button>
          </div>
        )}

        {/* 1. Quick Pick Section: "โชว์ของที่หยิบบ่อยไว้ข้างบน กดทีเดียวบันทึกได้เลย" */}
        <QuickPickSection
          items={items}
          onQuickStockOut={handleQuickStockOut}
          onOpenDetailedStockOut={handleOpenStockOut}
          onOpenDetailedStockIn={handleOpenStockIn}
        />

        {/* 2. Instant Search and Category Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={categories}
          onlyLowStock={onlyLowStock}
          onToggleOnlyLowStock={() => setOnlyLowStock((prev) => !prev)}
          lowStockCount={lowStockItems.length}
          isAdmin={isAdmin}
          onAddNewItem={handleAddNewItem}
        />

        {/* 3. Items Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
          <span>
            แสดง <strong className="text-slate-800 font-semibold">{filteredItems.length}</strong> จากทั้งหมด {items.length} รายการ
          </span>
          {onlyLowStock && (
            <span className="text-rose-600 font-semibold">
              ● กรองเฉพาะของใกล้หมด
            </span>
          )}
        </div>

        {/* 4. Stock List */}
        <StockList
          items={filteredItems}
          isAdmin={isAdmin}
          onStockIn={handleOpenStockIn}
          onStockOut={handleOpenStockOut}
          onEditItem={handleOpenEditItem}
          onQuickReplenishModal={() => setIsReplenishModalOpen(true)}
        />
      </main>

      {/* Floating Bottom Quick Action Bar on Mobile */}
      <div className="fixed bottom-3 left-0 right-0 z-20 px-4 pointer-events-none max-w-lg mx-auto">
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-2 rounded-2xl shadow-xl flex items-center justify-between gap-2 border border-slate-700 pointer-events-auto">
          {/* One-Tap Replenish Button */}
          <button
            type="button"
            id="btn-floating-replenish"
            onClick={() => setIsReplenishModalOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>ดูของต้องเติม</span>
            {lowStockItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {/* Quick Add Item (Admin) or History (General) */}
          {isAdmin ? (
            <button
              type="button"
              id="btn-floating-add-item"
              onClick={handleAddNewItem}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>เพิ่มสินค้าใหม่</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-floating-history"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>ประวัติเข้า-ออก ({transactions.length})</span>
            </button>
          )}

          {/* Quick Undo if transactions exist */}
          {transactions.length > 0 && (
            <button
              type="button"
              id="btn-floating-undo"
              onClick={() => handleUndoTransaction(transactions[0].id)}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              title="ย้อนรายการล่าสุด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">ย้อน</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {isTransactionModalOpen && transactionItem && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          item={transactionItem}
          mode={transactionMode}
          onClose={() => setIsTransactionModalOpen(false)}
          onSubmit={handleProcessTransaction}
        />
      )}

      {isReplenishModalOpen && (
        <ReplenishModal
          isOpen={isReplenishModalOpen}
          items={items}
          onClose={() => setIsReplenishModalOpen(false)}
          onStockInItem={handleOpenStockIn}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal
          isOpen={isHistoryModalOpen}
          transactions={transactions}
          onClose={() => setIsHistoryModalOpen(false)}
          onUndoTransaction={handleUndoTransaction}
          onOpenSheets={() => {
            setIsHistoryModalOpen(false);
            setIsSheetsModalOpen(true);
          }}
        />
      )}

      {isAdminLoginModalOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onLoginSuccess={() => {
            setIsAdmin(true);
            addToast({
              type: 'success',
              title: 'เข้าสู่ระบบ Admin สำเร็จ',
              description: 'คุณสามารถเพิ่ม/แก้ไขรายการ ตั้งค่าจุดเตือน และจัดการข้อมูลได้แล้ว',
            });
          }}
        />
      )}

      {isItemFormModalOpen && (
        <ItemFormModal
          isOpen={isItemFormModalOpen}
          itemToEdit={itemToEdit}
          onClose={() => setIsItemFormModalOpen(false)}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      )}

      {isSheetsModalOpen && (
        <GoogleSheetsModal
          isOpen={isSheetsModalOpen}
          sheetsConfig={sheetsConfig}
          items={items}
          transactions={transactions}
          onClose={() => setIsSheetsModalOpen(false)}
          onUpdateConfig={setSheetsConfig}
          onShowToast={(msg, type) => addToast({ type, title: msg })}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
