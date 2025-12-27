
import React, { useRef } from 'react';
import { AppData } from '../types';
import { 
  Database, 
  Download, 
  Upload, 
  Copy, 
  ExternalLink,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface BackupVaultProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
}

const BackupVault: React.FC<BackupVaultProps> = ({ data, onUpdateData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1iFe5dLEGwZ3GVe9lyv0xF_OM8L_yIB2epq_4H-9if7k/edit?gid=0#gid=0";

  const handleBackupJSON = () => {
    const backupData = JSON.stringify(data, null, 2);
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VIPANI_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  const handleCopyToClipboardForSheets = () => {
    const allSoldItems = data.tokens.flatMap(t => 
      t.items.filter(i => i.status === 'Sold').map(i => ({
        tokenId: t.id,
        date: i.soldAt?.split('T')[0],
        item: i.name,
        qty: i.soldQuantity,
        buyer: data.parties.find(p => p.id === i.sellingPartyId)?.name || 'Unknown',
        seller: data.parties.find(p => p.id === t.sellerId)?.name || 'Unknown',
        salesAmount: i.salesAmount,
        purchaseAmount: i.purchaseAmount
      }))
    );

    const header = "Token ID\tDate\tItem\tQuantity\tBuyer\tSeller\tSales Amount\tPurchase Amount\n";
    const rows = allSoldItems.map(i => 
      `${i.tokenId}\t${i.date}\t${i.item}\t${i.qty}\t${i.buyer}\t${i.seller}\t${i.salesAmount}\t${i.purchaseAmount}`
    ).join('\n');

    navigator.clipboard.writeText(header + rows).then(() => {
      alert("Data formatted for Google Sheets copied to clipboard! Open your spreadsheet and paste (Ctrl+V).");
    });
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
          <p className="text-slate-500 mt-2 font-medium">Synchronize your records with Google Sheets or download full system archives.</p>
        </div>
      </header>

      <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 md:p-12 rounded-[3.5rem] border border-amber-200 shadow-xl shadow-amber-900/5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-amber-500 p-4 rounded-3xl shadow-lg shadow-amber-200 text-white">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-950 tracking-tight">Cloud Backup & Sync</h3>
              <p className="text-amber-700/60 text-xs font-bold uppercase tracking-widest mt-1">Safeguard your commercial records</p>
            </div>
          </div>
          <a 
            href={GOOGLE_SHEET_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white hover:bg-amber-100 text-amber-900 px-8 py-4 rounded-2xl border border-amber-200 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm group"
          >
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            Open Connected Google Sheet
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={handleCopyToClipboardForSheets}
            className="bg-white p-8 rounded-[2.5rem] border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col justify-between"
          >
            <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Copy className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-amber-950 text-lg tracking-tight">Copy for Google Sheets</p>
              <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mt-1">Smart-format TSV data for easy pasting</p>
            </div>
          </button>

          <button 
            onClick={handleBackupJSON}
            className="bg-white p-8 rounded-[2.5rem] border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col justify-between"
          >
            <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-amber-950 text-lg tracking-tight">Download Full Archive</p>
              <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mt-1">Generate system backup (JSON format)</p>
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
                  className="mt-2 text-[10px] font-black uppercase text-amber-600 hover:text-amber-800 tracking-[0.2em] flex items-center gap-2"
                >
                  Click to Upload Backup File <ArrowRightIcon className="w-3 h-3" />
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
