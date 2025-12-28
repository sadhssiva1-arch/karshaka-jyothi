
import React, { useState, useEffect } from 'react';
import { AppData, Token, TokenItem, UserAccount } from './types';
import Dashboard from './components/Dashboard';
import Intake from './components/Intake';
import TokenExplorer from './components/TokenExplorer';
import Reports from './components/Reports';
import Settings from './components/Settings';
import PartiesManager from './components/PartiesManager';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import BackupVault from './components/BackupVault';
import { Lock, LogOut, UserCircle, AlertTriangle } from 'lucide-react';

const INITIAL_EXPIRY = new Date();
INITIAL_EXPIRY.setDate(INITIAL_EXPIRY.getDate() + 30);

const DEFAULT_DATA: AppData = {
  parties: [
    { id: '1', name: 'Walk-in Customer', contact: '000', type: 'Seller' },
    { id: '2', name: 'Retail Store A', contact: '111', type: 'Buyer' }
  ],
  itemTemplates: [
    { id: '1', name: 'Laptop Pro' },
    { id: '2', name: 'Smart Phone X' }
  ],
  tokens: [],
  settings: {
    purchaseMarginPercent: 20
  },
  users: [
    { id: 'admin-1', username: 'sadh', password: '821017', role: 'Admin', createdAt: new Date().toISOString() },
    { id: 'user-1', username: 'user', password: 'user123', role: 'User', createdAt: new Date().toISOString() }
  ],
  license: {
    expiryDate: INITIAL_EXPIRY.toISOString(),
    status: 'Active',
    lastRenewedAt: new Date().toISOString()
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUser = sessionStorage.getItem('vipani_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('smart_trade_data_v2');
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem('smart_trade_data_v2', JSON.stringify(data));
  }, [data]);

  const updateData = (newData: AppData) => {
    setData(newData);
  };

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveTab('dashboard'); 
    sessionStorage.setItem('vipani_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    sessionStorage.removeItem('vipani_current_user');
  };

  const expiryDate = new Date(data.license.expiryDate);
  const now = new Date();
  const isLicenseValid = expiryDate > now;
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const showExpiringSoonWarning = daysRemaining > 0 && daysRemaining <= 2;

  const addToken = (token: Token) => {
    setData(prev => ({
      ...prev,
      tokens: [token, ...prev.tokens]
    }));
  };

  const sellItem = (tokenItemId: string, unitRate: number, buyerId: string, soldQty: number) => {
    setData(prev => {
      const totalSalesAmount = unitRate * soldQty;
      const margin = prev.settings.purchaseMarginPercent;
      const purchaseAmount = totalSalesAmount * (1 - margin / 100);
      
      const newTokens = prev.tokens.map(token => {
        const itemToSell = token.items.find(i => i.id === tokenItemId);
        if (!itemToSell) return token;

        const updatedItems: TokenItem[] = [];
        token.items.forEach(item => {
          if (item.id === tokenItemId) {
            updatedItems.push({
              ...item,
              id: crypto.randomUUID(), 
              status: 'Sold',
              soldQuantity: soldQty,
              unitSalesRate: unitRate,
              finalQuantity: soldQty, 
              salesAmount: totalSalesAmount,
              purchaseAmount,
              sellingPartyId: buyerId,
              soldAt: new Date().toISOString()
            });

            const remainder = item.finalQuantity - soldQty;
            if (remainder > 0) {
              updatedItems.push({
                ...item,
                id: crypto.randomUUID(),
                finalQuantity: remainder,
                quantity: (item.quantity / item.finalQuantity) * remainder, 
                status: 'Available'
              });
            }
          } else {
            updatedItems.push(item);
          }
        });
        return { ...token, items: updatedItems };
      });
      return { ...prev, tokens: newTokens };
    });
  };

  if (!currentUser) {
    return <Login data={data} onLogin={handleLogin} />;
  }

  // Strict Lockout for Users
  if (!isLicenseValid && currentUser.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border border-rose-100 animate-in zoom-in-95 duration-500">
          <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-600">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">System Suspended</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Your license period ended on <span className="text-rose-600 font-bold">{expiryDate.toLocaleDateString()}</span>. 
            All functions are disabled until an administrator applies an extension.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors"
          >
            Exit Terminal
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {(() => {
          switch (activeTab) {
            case 'dashboard': return <Dashboard data={data} />;
            case 'intake': return <Intake data={data} onAddToken={addToken} onUpdateData={updateData} />;
            case 'tokens': return <TokenExplorer data={data} onSellItem={sellItem} onUpdateData={updateData} />;
            case 'parties': return <PartiesManager data={data} onUpdateData={updateData} />;
            case 'reports': return <Reports data={data} />;
            case 'backup': return <BackupVault data={data} onUpdateData={updateData} />;
            case 'settings': 
              return currentUser.role === 'Admin' 
                ? <Settings data={data} onUpdateData={updateData} /> 
                : <Dashboard data={data} />;
            case 'admin': 
              return currentUser.role === 'Admin' 
                ? <AdminPortal data={data} onUpdateData={updateData} currentUser={currentUser} /> 
                : <Dashboard data={data} />;
            default: return <Dashboard data={data} />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Universal Expiration Warning Bar */}
      {showExpiringSoonWarning && (
        <div className="bg-amber-500 text-white px-6 py-2.5 flex items-center justify-center gap-3 shadow-md relative z-[110] animate-in slide-in-from-top duration-700">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Warning: License expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Contact administrator for renewal to avoid suspension.
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={currentUser.role} 
          username={currentUser.username}
          onLogout={handleLogout}
          licenseValid={isLicenseValid}
        />
        <main className="flex-1 px-4 py-8 md:px-10 lg:px-16 overflow-x-hidden pb-32 md:pb-8 selection:bg-emerald-100 selection:text-emerald-700">
          <div className="flex justify-end items-center mb-6 md:mb-10 gap-3">
             <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-emerald-50 shadow-sm">
                <UserCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-950 uppercase tracking-tight">{currentUser.username}</span>
             </div>
             <button 
               onClick={handleLogout}
               className="flex items-center gap-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 px-5 py-2.5 rounded-2xl border border-emerald-50 shadow-sm transition-all text-[10px] font-black uppercase tracking-[0.15em]"
             >
               <LogOut className="w-4 h-4" /> Log off
             </button>
          </div>

          {!isLicenseValid && currentUser.role === 'Admin' && (
            <div className="mb-8 bg-rose-600 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-xl animate-pulse">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">System Warning: License Expired. Renew now to restore user access.</span>
              </div>
              <button 
                onClick={() => setActiveTab('admin')}
                className="bg-white text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
              >
                Renew Period
              </button>
            </div>
          )}
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
