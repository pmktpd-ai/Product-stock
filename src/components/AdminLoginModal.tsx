import React, { useState } from 'react';
import { X, Shield, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password;

    if (cleanUser === 'admin' && cleanPass === 'Password 12345') {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onLoginSuccess();
        onClose();
      }, 500);
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (กรุณาใช้ Admin / Password 12345)');
    }
  };

  const handleQuickFill = () => {
    setUsername('Admin');
    setPassword('Password 12345');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        id="modal-admin-login"
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-400/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">เข้าสู่ระบบผู้ดูแล (Admin)</h2>
              <p className="text-xs text-slate-300">จัดการสต๊อก เพิ่ม/แก้ไขรายการ และตั้งค่าเตือน</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-admin-login"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>เข้าสู่ระบบสำเร็จ กำลังเปิดโหมดผู้ดูแล...</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">ชื่อผู้ใช้ (Username)</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                id="input-admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ระบุ Admin"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">รหัสผ่าน (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                id="input-admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ระบุรหัสผ่าน"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              id="btn-submit-admin-login"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition active:scale-[0.99] shadow-sm flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              เข้าสู่ระบบ Admin
            </button>

            {/* Quick helper button for testing */}
            <button
              type="button"
              id="btn-quick-fill-admin"
              onClick={handleQuickFill}
              className="text-center text-xs text-slate-500 hover:text-slate-800 py-1"
            >
              กดที่นี่เพื่อกรอก <span className="font-mono text-slate-700 underline">Admin / Password 12345</span> อัตโนมัติ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
