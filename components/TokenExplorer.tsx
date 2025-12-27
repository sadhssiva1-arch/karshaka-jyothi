
import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Calendar, 
  CircleDollarSign, 
  Printer, 
  UserPlus, 
  PackageSearch,
  FileText,
  X,
  Hash,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Filter,
  ShoppingCart,
  Calculator,
  ChevronRight
} from 'lucide-react';
import { AppData, TokenItem, Party } from '../types';

interface TokenExplorerProps {
  data: AppData;
  onSellItem: (itemId: string, unitRate: number, buyerId: string, soldQty: number) => void;
  onUpdateData: (data: AppData) => void;
}

const TokenExplorer: React.FC<TokenExplorerProps> = ({ data, onSellItem, onUpdateData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Sold'>('All');
  const [sellingItemId, setSellingItemId] = useState<string | null>(null);
  const [viewingBillItem, setViewingBillItem] = useState<TokenItem | null>(null);
  
  const [unitRate, setUnitRate] = useState<number>(0);
  const [soldQty, setSoldQty] = useState<number>(1);
  const [buyerId, setBuyerId] = useState<string>('');
  const [showNewPartyModal, setShowNewPartyModal] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyContact, setNewPartyContact] = useState('');

  const allEntries = data.tokens.flatMap(token => 
    token.items.map(item => ({
      ...item,
      sellerName: data.parties.find(p => p.id === token.sellerId)?.name || 'Unknown',
      createdAt: token.createdAt
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredEntries = allEntries.filter(entry => {
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedItemForSale = allEntries.find(i => i.id === sellingItemId);

  const handleProcessSale = () => {
    if (!sellingItemId || !buyerId || unitRate <= 0 || soldQty <= 0) {
      alert("Please complete all fields (Buyer, Quantity, and Rate).");
      return;
    }
    if (selectedItemForSale && soldQty > selectedItemForSale.finalQuantity) {
      alert("Sold quantity cannot exceed available stock!");
      return;
    }
    onSellItem(sellingItemId, unitRate, buyerId, soldQty);
    setSellingItemId(null);
    setUnitRate(0);
    setSoldQty(1);
    setBuyerId('');
  };

  const handleCreateParty = () => {
    if (!newPartyName) return;
    const newParty: Party = { id: crypto.randomUUID(), name: newPartyName, contact: newPartyContact, type: 'Buyer' };
    onUpdateData({ ...data, parties: [...data.parties, newParty] });
    setBuyerId(newParty.id);
    setNewPartyName('');
    setNewPartyContact('');
    setShowNewPartyModal(false);
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <ArrowRightLeft className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Transaction Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tighter">Active Registry</h1>
          <p className="text-slate-500 mt-1 md:mt-2 font-medium text-sm">Monitor item status and process partial or full sales.</p>
        </div>
      </header>

      <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-emerald-100 shadow-sm space-y-6 md:space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 w-5 h-5 transition-colors group-focus-within:text-emerald-500" />
            <input 
              type="text"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-emerald-100 bg-emerald-50/20 text-sm md:text-base font-bold focus:ring-4 focus:ring-emerald-50 border shadow-inner transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-emerald-50/30 p-1.5 rounded-xl border border-emerald-50 overflow-x-auto no-scrollbar">
            {(['All', 'Available', 'Sold'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === f 
                    ? 'bg-emerald-900 text-white shadow-md' 
                    : 'text-emerald-400 hover:text-emerald-700 hover:bg-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-hidden border border-emerald-50 rounded-[2rem]">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-emerald-300 bg-emerald-50/30">
              <PackageSearch className="w-20 h-20 opacity-10 mb-6 text-emerald-900" />
              <p className="text-sm font-black uppercase tracking-[0.2em]">Zero entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-emerald-900 text-white">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Token & Product</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Partner</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Units</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-emerald-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-100">
                            {entry.tokenId}
                          </div>
                          <div>
                            <p className="font-black text-emerald-950 text-lg tracking-tight">{entry.name}</p>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Recorded {new Date(entry.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-sm font-bold text-emerald-800">{entry.sellerName}</td>
                      <td className="px-10 py-8">
                        <span className="text-lg font-black text-emerald-950">{entry.status === 'Sold' ? entry.soldQuantity : entry.finalQuantity}</span>
                        <span className="ml-1 text-[10px] font-bold text-emerald-400 uppercase">Qty</span>
                      </td>
                      <td className="px-10 py-8">
                        {entry.status === 'Sold' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.15em] border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" /> Sold
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-[0.15em] border border-amber-100">
                            <Clock className="w-3 h-3" /> Available
                          </span>
                        )}
                      </td>
                      <td className="px-10 py-8 text-right">
                        {entry.status === 'Sold' ? (
                          <button onClick={() => setViewingBillItem(entry as any)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-900 hover:text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Docs</button>
                        ) : (
                          <button onClick={() => { setSellingItemId(entry.id); setSoldQty(entry.finalQuantity); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-100 active:scale-95">Sell</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sale Processing Modal */}
      {sellingItemId && selectedItemForSale && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl max-w-lg w-full p-8 md:p-14 animate-in zoom-in-95 duration-200 border border-emerald-50">
            <h3 className="text-2xl md:text-3xl font-black text-emerald-950 mb-2 tracking-tighter">Finalize Sale</h3>
            <p className="text-emerald-400 font-bold text-[10px] md:text-xs mb-8 uppercase tracking-widest">
              Stock: <span className="text-emerald-600">{selectedItemForSale.name} ({selectedItemForSale.finalQuantity} available)</span>
            </p>
            
            <div className="space-y-6">
              {/* Buyer Party Selection - ALL PARTIES SHOWN */}
              <div>
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Purchasing Party</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select 
                      value={buyerId}
                      onChange={(e) => setBuyerId(e.target.value)}
                      className="w-full rounded-xl border-emerald-100 p-4 text-base font-bold bg-emerald-50/20 border appearance-none pr-10 focus:ring-4 focus:ring-emerald-50 outline-none"
                    >
                      <option value="">Select Customer...</option>
                      {data.parties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4 rotate-90" />
                  </div>
                  <button 
                    onClick={() => setShowNewPartyModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-950 text-white p-4 rounded-xl transition-all shadow-lg shadow-emerald-50 active:scale-95"
                    title="Add New Customer"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Quantity</label>
                  <div className="relative">
                    <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 w-4 h-4" />
                    <input 
                      type="number"
                      value={soldQty}
                      onChange={(e) => setSoldQty(Math.min(selectedItemForSale.finalQuantity, Math.max(1, Number(e.target.value))))}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-emerald-100 text-lg font-black border focus:ring-4 focus:ring-emerald-50 bg-emerald-50/20"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Rate (Per Unit)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-300 italic">₹</span>
                    <input 
                      type="number"
                      value={unitRate || ''}
                      onChange={(e) => setUnitRate(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-4 rounded-xl border-emerald-100 text-lg font-black border focus:ring-4 focus:ring-emerald-50 bg-emerald-50/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 p-6 rounded-2xl text-white">
                <div className="flex justify-between items-center opacity-60">
                   <span className="text-[10px] font-black uppercase tracking-widest">Calculated Invoice Value</span>
                   <Calculator className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black mt-1">₹{(unitRate * soldQty).toLocaleString()}</div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setSellingItemId(null)} className="flex-1 px-4 py-4 text-emerald-300 font-black text-[10px] uppercase tracking-widest">Cancel</button>
                <button 
                  onClick={handleProcessSale}
                  className="flex-[2] px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-emerald-900"
                >
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Party Modal */}
      {showNewPartyModal && (
        <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-sm w-full p-10 animate-in zoom-in-95 duration-200 border border-emerald-50">
            <h3 className="text-2xl font-black text-emerald-950 mb-2 tracking-tighter">Quick Partner Add</h3>
            <p className="text-emerald-400 font-bold text-[9px] mb-8 uppercase tracking-widest">Register new commercial partner</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Legal Name</label>
                <input 
                  type="text"
                  autoFocus
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full rounded-xl border-emerald-100 p-4 border text-lg font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                  placeholder="Partner name..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowNewPartyModal(false)} className="flex-1 px-4 py-3 text-emerald-300 font-black text-[9px] uppercase tracking-widest">Cancel</button>
                <button onClick={handleCreateParty} className="flex-1 px-4 py-3 bg-emerald-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95">Register</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Viewer Modal remains same */}
    </div>
  );
};

export default TokenExplorer;
