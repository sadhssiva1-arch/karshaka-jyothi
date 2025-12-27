
import React, { useState } from 'react';
import { UserPlus, Search, Phone, User, Trash2, Edit2, Filter, Mail, Briefcase, ShoppingBag, Users } from 'lucide-react';
import { AppData, Party } from '../types';

interface PartiesManagerProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
}

const PartiesManager: React.FC<PartiesManagerProps> = ({ data, onUpdateData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const filteredParties = data.parties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParty = () => {
    if (!name) return;
    // Defaulting to 'Seller' internally but it no longer impacts UI filtering
    const newParty: Party = { id: crypto.randomUUID(), name, contact, type: 'Seller' };
    onUpdateData({ ...data, parties: [...data.parties, newParty] });
    setName('');
    setContact('');
    setShowModal(false);
  };

  const handleDeleteParty = (id: string) => {
    if (confirm("Proceed with deletion? Historical records will remain unaffected.")) {
      onUpdateData({ ...data, parties: data.parties.filter(p => p.id !== id) });
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <Users className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Universal Directory</span>
          </div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Parties Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Network registry for all commercial partners and customers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-900 hover:bg-emerald-800 text-white px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> Register New Partner
        </button>
      </header>

      <div className="bg-white p-8 rounded-[3rem] border border-emerald-50 shadow-sm flex flex-wrap gap-8 items-center">
        <div className="relative flex-1 min-w-[300px] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-200 w-5 h-5 group-focus-within:text-emerald-500" />
          <input 
            type="text"
            placeholder="Search by name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-4 rounded-2xl border-emerald-100 text-base font-bold focus:ring-4 focus:ring-emerald-50 border bg-emerald-50/20 shadow-inner transition-all"
          />
        </div>
        <div className="px-6 py-4 bg-emerald-50/30 rounded-2xl border border-emerald-50 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
           {filteredParties.length} Registered Partners
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredParties.map((party) => (
          <div key={party.id} className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/30 transition-all group flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[4rem] opacity-50 transition-all duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="p-5 rounded-3xl bg-emerald-600 shadow-emerald-100 text-white shadow-xl">
                   <User className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Active Partner
                </span>
              </div>
              <h3 className="text-2xl font-black text-emerald-950 tracking-tighter group-hover:text-emerald-600 transition-colors">{party.name}</h3>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-2">{party.contact || 'No Contact Data'}</p>
            </div>
            <div className="flex gap-4 mt-10 pt-8 border-t border-emerald-50 relative z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={() => handleDeleteParty(party.id)}
                className="flex-1 flex justify-center py-4 text-emerald-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 font-black text-[10px] uppercase tracking-widest"
              ><Trash2 className="w-4 h-4 mr-2" /> Delete Registry</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] shadow-2xl max-w-lg w-full p-16 animate-in zoom-in-95 duration-200 border border-emerald-100">
            <h3 className="text-4xl font-black text-emerald-950 mb-4 tracking-tighter">New Registration</h3>
            <p className="text-emerald-400 font-bold text-sm mb-12 uppercase tracking-widest">Enlist a new commercial partner to the network</p>
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest">Commercial Name</label>
                <input 
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[2rem] border-emerald-100 p-6 border text-xl font-black focus:ring-8 focus:ring-emerald-50 bg-emerald-50/20 shadow-inner"
                  placeholder="Full Legal Name"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest">Contact Information</label>
                <input 
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-[2rem] border-emerald-100 p-6 border text-xl font-black focus:ring-8 focus:ring-emerald-50 bg-emerald-50/20 shadow-inner"
                  placeholder="Phone or Email"
                />
              </div>
              <div className="flex gap-6 pt-10">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-5 text-emerald-300 font-black text-xs uppercase tracking-widest">Cancel</button>
                <button 
                  onClick={handleAddParty}
                  className="flex-[2] px-8 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-100 hover:bg-emerald-900 transition-all active:scale-95"
                >
                  Create Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesManager;
