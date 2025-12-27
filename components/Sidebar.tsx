
import React from 'react';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ListChecks, 
  TrendingUp, 
  Settings as SettingsIcon,
  Users,
  Layers,
  Sparkles,
  ShieldCheck,
  LogOut,
  UserCircle,
  Database
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  username: string;
  onLogout: () => void;
  licenseValid: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, username, onLogout, licenseValid }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'User' },
    { id: 'intake', label: 'Inventory Intake', icon: PackagePlus, role: 'User' },
    { id: 'tokens', label: 'Entry Registry', icon: ListChecks, role: 'User' },
    { id: 'parties', label: 'Manage Parties', icon: Users, role: 'User' },
    { id: 'reports', label: 'Reports & P&L', icon: TrendingUp, role: 'User' },
    { id: 'backup', label: 'Backup Vault', icon: Database, role: 'User' },
    { id: 'settings', label: 'Config Panel', icon: SettingsIcon, role: 'Admin' }, // Elevating Settings to Admin only
    { id: 'admin', label: 'Admin Terminal', icon: ShieldCheck, role: 'Admin' },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.role === 'User' || (item.role === 'Admin' && userRole === 'Admin')
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex-col h-screen sticky top-0 z-50">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-100 ring-4 ring-emerald-50 transition-transform hover:scale-105 duration-300">
            <Layers className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-2xl text-emerald-950 tracking-tighter block leading-none">SmartTrade</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> PREMIER
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {filteredMenu.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-emerald-950 text-white shadow-xl shadow-slate-200' 
                    : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`} />
                <span className={`font-semibold text-sm tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 m-4 bg-slate-50/50 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <UserCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-[11px] text-emerald-950 uppercase tracking-tight truncate">{username}</p>
              <p className="text-[9px] font-semibold text-emerald-500 uppercase tracking-[0.1em]">{userRole}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition-all border border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" /> Log off
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200 z-[100] px-6 py-4 rounded-[2rem] flex justify-around items-center shadow-2xl">
        {filteredMenu.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1.5 text-rose-400"
        >
          <LogOut className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Exit</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
