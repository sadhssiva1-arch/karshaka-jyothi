
import React, { useRef } from 'react';
import { AppData } from '../types';
import { 
  Database, 
  Download, 
  Upload, 
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface BackupVaultProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
}

const BackupVault: React.FC<BackupVaultProps> = ({ data, onUpdateData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupJSON = () => {
    const backupData = JSON.stringify(data, null, 2);
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SMART_TRADE_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // 1. Inventory & Sales Data
    const inventoryData = data.tokens.flatMap(t => 
      t.items.map(i => ({
        'Token ID': t.id,
        'Created Date': new Date(t.createdAt).toLocaleDateString(),
        'Item Name': i.name,
        'Gross Quantity': i.quantity,
        'Deduction': i.deductionQuantity,
        'Net Quantity': i.finalQuantity,
        'Status': i.status,
        'Sold Qty': i.soldQuantity || 0,
        'Unit Sales Rate': i.unitSalesRate || 0,
        'Total Sales Amount': i.salesAmount || 0,
        'Purchase Amount': i.purchaseAmount || 0,
        'Sold Date': i.soldAt ? new Date(i.soldAt).toLocaleDateString() : 'N/A',
        'Seller Party': data.parties.find(p => p.id === t.sellerId)?.name || 'Unknown',
        'Buyer Party': data.parties.find(p => p.id === i.sellingPartyId)?.name || 'N/A'
      }))
    );

    // 2. Parties Data
    const partiesData = data.parties.map(p => ({
      'Party ID': p.id,
      'Name': p.name,
      'Contact Info': p.contact,
      'Default Role': p.type
    }));

    // 3. User Accounts Data (Safe info only)
    const usersData = data.users.map(u => ({
      'Username': u.username,
      'Role': u.role,
      'Created At': new Date(u.createdAt).toLocaleDateString()
    }));

    // Create Workbook
    const wb = XLSX.utils.book_new();
    
    // Create Sheets
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    const wsParties = XLSX.utils.json_to_sheet(partiesData);
    const wsUsers = XLSX.utils.json_to_sheet(usersData);

    // Append Sheets
    XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory & Sales");
    XLSX.utils.book_append_sheet(wb, wsParties, "Parties Register");
    XLSX.utils.book_append_sheet(wb, wsUsers, "System Users");

    // Save File
    XLSX.writeFile(wb, `SMART_TRADE_BACKUP_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const restoredData = JSON.parse(event.target?.result as string);
        if (restoredData.parties && restoredData.tokens && restoredData.users) {
          if (confirm("DANGER: Restoring this file will overwrite all current system data. Proceed?")) {
            onUpdateData(restoredData);
            alert("System state successfully restored.");
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
              <Database className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">Data Continuity</span>
          </div>
          <h1 className="text-4xl font-black text-amber-950 tracking-tighter">Backup Vault</h1>
          <p className="text-slate-500 mt-2 font-medium">Download local backups or restore system archives to ensure business continuity.</p>
        </div>
      </header>

      <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 md:p-12 rounded-[3.5rem] border border-amber-200 shadow-xl shadow-amber-900/5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-amber-500 p-4 rounded-3xl shadow-lg shadow-amber-200 text-white">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-950 tracking-tight">System Export & Restore</h3>
              <p className="text-amber-700/60 text-xs font-bold uppercase tracking-widest mt-1">Manage your commercial data records locally</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={handleExportExcel}
            className="bg-white p-8 rounded-[2.5rem] border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col justify-between"
          >
            <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-amber-950 text-lg tracking-tight">Export Excel</p>
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Download data as .xlsx file</p>
            </div>
          </button>

          <button 
            onClick={handleBackupJSON}
            className="bg-white p-8 rounded-[2.5rem] border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col justify-between"
          >
            <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-amber-950 text-lg tracking-tight">Download JSON</p>
              <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mt-1">Generate system state backup</p>
            </div>
          </button>

          <div className="bg-amber-900/5 p-8 rounded-[2.5rem] border border-dashed border-amber-300 relative group overflow-hidden">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleRestoreJSON}
              accept=".json"
              className="hidden" 
            />
            <div className="flex flex-col h-full justify-between">
              <div className="bg-amber-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-amber-950 text-lg tracking-tight">Restore Archive</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-[10px] font-black uppercase text-amber-600 hover:text-amber-800 tracking-[0.2em] flex items-center gap-2 text-left"
                >
                  Click to Upload <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="absolute top-4 right-4 text-amber-200">
               <AlertTriangle className="w-8 h-8 opacity-20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default BackupVault;
