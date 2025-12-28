
import React, { useState } from 'react';
import { Plus, Trash2, Save, UserPlus, PackageSearch, Boxes, Hash, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { AppData, Token, TokenItem, Party, ItemTemplate } from '../types';

interface IntakeProps {
  data: AppData;
  onAddToken: (token: Token) => void;
  onUpdateData: (data: AppData) => void;
}

const Intake: React.FC<IntakeProps> = ({ data, onAddToken, onUpdateData }) => {
  const [sellerId, setSellerId] = useState<string>('');
  const [items, setItems] = useState<Partial<TokenItem>[]>([]);
  const [showNewPartyModal, setShowNewPartyModal] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyContact, setNewPartyContact] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const generateTokenId = () => {
    if (data.tokens.length === 0) return "1";
    const numericIds = data.tokens.map(t => parseInt(t.id)).filter(id => !isNaN(id));
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return (maxId + 1).toString();
  };

  const addItemRow = () => {
    setItems([...items, { id: crypto.randomUUID(), name: '', quantity: 1, deductionQuantity: 0, finalQuantity: 1, status: 'Available' }]);
  };

  const removeItemRow = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItemRow = (id: string, field: keyof TokenItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'deductionQuantity') {
          const qty = Number(field === 'quantity' ? value : item.quantity) || 0;
          const ded = Number(field === 'deductionQuantity' ? value : item.deductionQuantity) || 0;
          updated.finalQuantity = Math.max(0, qty - ded);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSaveToken = () => {
    if (!sellerId) {
      alert("Source Customer identity required.");
      return;
    }
    if (items.length === 0) {
      alert("At least one item must be declared in manifest.");
      return;
    }

    const hasInvalidItem = items.some(item => !item.name || item.name.trim() === '');
    if (hasInvalidItem) {
      alert("Verify item catalog selections.");
      return;
    }

    const tokenId = generateTokenId();
    const newToken: Token = {
      id: tokenId,
      sellerId,
      createdAt: new Date().toISOString(),
      items: items.map(item => ({ ...item, tokenId }) as TokenItem)
    };

    onAddToken(newToken);
    setSellerId('');
    setItems([]);
    alert(`Success: Token #${tokenId} logged into system.`);
  };

  const handleCreateParty = () => {
    if (!newPartyName) return;
    const newParty: Party = {
      id: crypto.randomUUID(),
      name: newPartyName,
      contact: newPartyContact,
      type: 'Seller'
    };
    onUpdateData({ ...data, parties: [...data.parties, newParty] });
    setSellerId(newParty.id);
    setNewPartyName('');
    setNewPartyContact('');
    setShowNewPartyModal(false);
  };

  const handleCreateItemTemplate = () => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    // Duplicate Check Logic
    const exists = data.itemTemplates.some(
      item => item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      alert(`Duplicate Entry: The item "${trimmedName}" is already present in the catalog.`);
      return;
    }

    const newItem: ItemTemplate = {
      id: crypto.randomUUID(),
      name: trimmedName
    };
    onUpdateData({ ...data, itemTemplates: [...data.itemTemplates, newItem] });
    setNewItemName('');
    setShowNewItemModal(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Boxes className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">Workflow Terminal</span>
          </div>
          <h1 className="text-5xl font-extrabold text-emerald-950 tracking-tight">Product Intake</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Digitize incoming inventory and issue secure tokens.</p>
        </div>
        <div className="bg-emerald-950 px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border border-emerald-900 group">
          <div className="bg-emerald-600/20 p-2 rounded-lg">
            <Hash className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-black text-emerald-100 uppercase tracking-[0.15em]">Reserved ID: <span className="text-emerald-400 ml-2 group-hover:scale-110 transition-transform inline-block">#{generateTokenId()}</span></span>
        </div>
      </header>

      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <Sparkles className="text-emerald-50 w-32 h-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 relative z-10">
          <div className="md:col-span-7 space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Origin Partner (Merchant)</label>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <select 
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                  className="w-full rounded-2xl border-slate-200 focus:ring-8 focus:ring-emerald-50 focus:border-emerald-500 block shadow-sm bg-slate-50/50 text-base font-bold p-5 border transition-all appearance-none pr-12"
                >
                  <option value="">Identify partner...</option>
                  {data.parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 rotate-90" />
              </div>
              <button 
                onClick={() => setShowNewPartyModal(true)}
                className="bg-emerald-600 hover:bg-emerald-950 text-white p-5 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 group"
                title="Quick Enlist"
              >
                <UserPlus className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="md:col-span-5 flex items-end">
            <button 
              onClick={() => setShowNewItemModal(true)}
              className="flex items-center gap-3 text-emerald-600 hover:text-emerald-950 font-black text-[10px] uppercase tracking-widest transition-all bg-emerald-50/50 hover:bg-emerald-100/50 px-8 py-5 rounded-2xl w-full justify-center border border-emerald-100/50 group"
            >
              <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Configure Item Catalog
            </button>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-center border-b border-slate-100 pb-8">
             <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Entry Manifest</h3>
            <button 
              onClick={addItemRow}
              className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-950 text-white px-6 py-3.5 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Append Unit
            </button>
          </div>

          <div className="space-y-5">
            {items.length === 0 && (
              <div className="py-24 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-200 group hover:border-emerald-200 transition-colors">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                  <PackageSearch className="w-10 h-10 text-slate-200 group-hover:text-emerald-200 transition-colors" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Manifest is currently void</p>
                <button onClick={addItemRow} className="mt-5 text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Begin entry</button>
              </div>
            )}

            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-slate-50/50 p-7 rounded-[2.5rem] border border-slate-200/50 hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all group relative duration-500">
                <div className="md:col-span-4 space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Identification</label>
                  <select 
                    value={item.name}
                    onChange={(e) => updateItemRow(item.id!, 'name', e.target.value)}
                    className="w-full rounded-xl border-slate-200 text-sm font-bold p-4 border bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                  >
                    <option value="">Select SKU...</option>
                    {data.itemTemplates.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Gross Count</label>
                  <input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItemRow(item.id!, 'quantity', e.target.value)}
                    className="w-full rounded-xl border-slate-200 text-sm font-black p-4 border text-center focus:ring-4 focus:ring-emerald-50 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black text-rose-300 uppercase tracking-widest text-center block">Loss Adjust.</label>
                  <input 
                    type="number"
                    value={item.deductionQuantity}
                    onChange={(e) => updateItemRow(item.id!, 'deductionQuantity', e.target.value)}
                    className="w-full rounded-xl border-rose-100 text-sm font-black p-4 border text-center text-rose-600 focus:ring-4 focus:ring-rose-50 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center block">Net Final</label>
                  <div className="w-full rounded-xl bg-emerald-600 text-white text-base font-black p-4 text-center shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">
                    {item.finalQuantity}
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    onClick={() => removeItemRow(item.id!)}
                    className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-4 rounded-xl transition-all active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3.5 bg-slate-50 px-6 py-3 rounded-2xl text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Audit physical stock before commitment
          </div>
          <button 
            onClick={handleSaveToken}
            disabled={items.length === 0 || !sellerId}
            className={`group flex items-center gap-4 px-16 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-2xl active:scale-95 ${
              (items.length === 0 || !sellerId) 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-950 text-white shadow-emerald-100 hover:shadow-emerald-950/20'
            }`}
          >
            <Save className="w-5 h-5 transition-transform group-hover:scale-110" />
            Commit to Registry
          </button>
        </div>
      </div>

      {/* New Party Modal */}
      {showNewPartyModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full p-12 animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
               <UserPlus className="text-emerald-600 w-8 h-8" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">Quick Register</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Add merchant to system directory</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Partner Entity Name</label>
                <input 
                  type="text"
                  autoFocus
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full rounded-2xl border-slate-200 p-5 border text-lg font-bold focus:ring-8 focus:ring-emerald-50 outline-none transition-all"
                  placeholder="Legal commercial name..."
                />
              </div>
              <div className="flex gap-4 pt-8">
                <button onClick={() => setShowNewPartyModal(false)} className="flex-1 px-4 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={handleCreateParty} className="flex-1 px-4 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Create Registry</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Catalog Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full p-12 animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
               <Plus className="text-emerald-600 w-8 h-8" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">Item Catalog</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Expand your product database</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">New SKU Name</label>
                <input 
                  type="text"
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full rounded-2xl border-slate-200 p-5 border text-lg font-bold focus:ring-8 focus:ring-emerald-50 outline-none transition-all"
                  placeholder="e.g. MacBook Pro 16"
                />
              </div>
              <div className="flex gap-4 pt-8">
                <button onClick={() => setShowNewItemModal(false)} className="flex-1 px-4 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={handleCreateItemTemplate} className="flex-1 px-4 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Add to Catalog</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Intake;
