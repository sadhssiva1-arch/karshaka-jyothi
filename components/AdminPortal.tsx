
import React, { useState } from 'react';
import { AppData, UserAccount, UserRole } from '../types';
import { 
  ShieldCheck, 
  RefreshCw, 
  UserPlus, 
  Trash2, 
  Key, 
  User
} from 'lucide-react';

interface AdminPortalProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
  currentUser: UserAccount;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ data, onUpdateData, currentUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('User');
  const [renewalDays, setRenewalDays] = useState(30);

  const handleAddUser = () => {
    if (!newUsername || !newPassword) return;
    const newUser: UserAccount = {
      id: crypto.randomUUID(),
      username: newUsername,
      password: newPassword,
      role: newRole,
      createdAt: new Date().toISOString()
    };
    onUpdateData({ ...data, users: [...data.users, newUser] });
    setNewUsername('');
    setNewPassword('');
    alert(`User '${newUsername}' added successfully.`);
  };

  const handleRenewLicense = () => {
    const currentExpiry = new Date(data.license.expiryDate);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    baseDate.setDate(baseDate.getDate() + renewalDays);
    
    onUpdateData({
      ...data,
      license: {
        expiryDate: baseDate.toISOString(),
        status: 'Active',
        lastRenewedAt: new Date().toISOString()
      }
    });
    alert(`License successfully renewed until ${baseDate.toLocaleDateString()}`);
  };

  const deleteUser = (id: string, username: string) => {
    if (id === currentUser.id) {
      alert("Safety Lock: You cannot remove your own active account.");
      return;
    }
    if (confirm(`Are you sure you want to remove user '${username}'?`)) {
      onUpdateData({ ...data, users: data.users.filter(u => u.id !== id) });
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <ShieldCheck className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Administrative Control</span>
          </div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Admin Command Center</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage user credentials and license periods.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LICENSE MANAGEMENT */}
        <div className="bg-emerald-900 text-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-800 p-4 rounded-3xl">
                <Key className="w-8 h-8 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">License Authority</h3>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Status: {data.license.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Valid Until</p>
                <p className="text-xl font-black">{new Date(data.license.expiryDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Last Renewal</p>
                <p className="text-xl font-black">{new Date(data.license.lastRenewedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/10">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Extension Period (Days)</label>
              <div className="flex gap-4">
                <input 
                  type="number"
                  value={renewalDays}
                  onChange={(e) => setRenewalDays(Number(e.target.value))}
                  className="flex-1 bg-emerald-800 border-none rounded-2xl p-5 text-2xl font-black text-white focus:ring-4 focus:ring-emerald-500"
                />
                <button 
                  onClick={handleRenewLicense}
                  className="bg-white text-emerald-950 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" /> Renew License
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-emerald-50 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-emerald-600" /> User Directory
            </h3>
            <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
              {data.users.length} Active Users
            </span>
          </div>

          <div className="space-y-4">
            {data.users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-6 bg-emerald-50/20 rounded-3xl border border-emerald-50 group hover:bg-emerald-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${user.role === 'Admin' ? 'bg-emerald-900 text-white' : 'bg-white text-emerald-600 border border-emerald-100 shadow-sm'}`}>
                    {user.role === 'Admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="font-black text-emerald-950">{user.username}</p>
                        {user.id === currentUser.id && (
                             <span className="text-[7px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full tracking-tighter">You</span>
                        )}
                    </div>
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteUser(user.id, user.username)}
                  disabled={data.users.length <= 1 || user.id === currentUser.id}
                  className={`p-3 rounded-xl transition-all ${
                    user.id === currentUser.id 
                    ? 'text-emerald-100 cursor-not-allowed' 
                    : 'text-emerald-300 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title={user.id === currentUser.id ? "Cannot remove yourself" : "Remove User"}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-emerald-50 space-y-6">
            <p className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">Enlist New Team Member</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Username" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full rounded-2xl border-emerald-100 p-4 text-sm font-bold bg-emerald-50/30 border focus:ring-4 focus:ring-emerald-50"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border-emerald-100 p-4 text-sm font-bold bg-emerald-50/30 border focus:ring-4 focus:ring-emerald-50"
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="flex-1 rounded-2xl border-emerald-100 p-4 text-sm font-black uppercase tracking-widest bg-emerald-50/30 border"
              >
                <option value="User">Standard User</option>
                <option value="Admin">System Admin</option>
              </select>
              <button 
                onClick={handleAddUser}
                className="bg-emerald-600 hover:bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
