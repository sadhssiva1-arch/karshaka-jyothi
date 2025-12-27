
import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Filter, 
  Download, 
  TrendingUp, 
  CircleDollarSign, 
  BarChart4, 
  ReceiptText, 
  Hash, 
  PackageSearch,
  ShoppingCart,
  Wallet,
  ArrowRight,
  ClipboardList,
  Scale,
  Loader2
} from 'lucide-react';
import { AppData, TokenItem, Party } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  data: AppData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [reportType, setReportType] = useState<'daily' | 'party-summary' | 'party-detail'>('daily');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterPartyId, setFilterPartyId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const allItems = data.tokens.flatMap(t => t.items).filter(i => i.status === 'Sold');

  const getFilteredData = () => {
    if (reportType === 'daily') {
      return allItems.filter(i => i.soldAt?.startsWith(filterDate));
    }
    return [];
  };

  const getPartyName = (id?: string) => {
    return data.parties.find(p => p.id === id)?.name || 'Unknown';
  };

  const getSellerIdByToken = (tokenId: string) => {
    const token = data.tokens.find(t => t.id === tokenId);
    return token?.sellerId;
  };

  const calculatePartyTotals = (partyId: string) => {
    // 1. Total Owed BY Partner (They are the Buyer - Binu Concept)
    const totalAsBuyer = allItems
      .filter(i => i.sellingPartyId === partyId)
      .reduce((acc, i) => acc + (i.salesAmount || 0), 0);
    
    // 2. Total Owed TO Partner (They are the Seller - Annu Concept)
    const totalAsSeller = allItems
      .filter(i => getSellerIdByToken(i.tokenId) === partyId)
      .reduce((acc, i) => acc + (i.purchaseAmount || 0), 0);
    
    // Positive balance = Partner owes us (Receivable)
    // Negative balance = We owe partner (Payable)
    return { totalAsBuyer, totalAsSeller, balance: totalAsBuyer - totalAsSeller };
  };

  const getPartnerHistoryData = (partyId: string) => {
    const asSeller = allItems.filter(i => getSellerIdByToken(i.tokenId) === partyId);
    const asBuyer = allItems.filter(i => i.sellingPartyId === partyId);
    return { asSeller, asBuyer };
  };

  const filteredDailyItems = getFilteredData();
  const totalDailySales = filteredDailyItems.reduce((acc, i) => acc + (i.salesAmount || 0), 0);
  const totalDailyPurchase = filteredDailyItems.reduce((acc, i) => acc + (i.purchaseAmount || 0), 0);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const primaryColor = [16, 185, 129]; 
      
      doc.setFontSize(22);
      doc.setTextColor(6, 78, 59);
      doc.text('VIPANI MANAGE', 40, 50);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 65);
      doc.setDrawColor(236, 253, 245);
      doc.line(40, 75, 555, 75);

      if (reportType === 'daily') {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Daily Operational Ledger: ${filterDate}`, 40, 95);

        // Sales List (Receivables)
        doc.setFontSize(11);
        doc.text('SALES LIST (Receivables from Buyers)', 40, 120);
        autoTable(doc, {
          startY: 130,
          head: [['Buyer (Sales Party)', 'Seller (Purchase Party)', 'Token #', 'Qty', 'Rate', 'Sales Amount']],
          body: filteredDailyItems.map(item => [
            getPartyName(item.sellingPartyId), 
            getPartyName(getSellerIdByToken(item.tokenId)), 
            item.tokenId,
            item.soldQuantity,
            item.unitSalesRate?.toLocaleString(),
            item.salesAmount?.toLocaleString()
          ]),
          foot: [['', '', '', '', 'TOTAL RECEIVABLE', totalDailySales.toLocaleString()]],
          styles: { fontSize: 8 },
          headStyles: { fillColor: primaryColor }
        });

        // Purchase List (Payables)
        const finalY = (doc as any).lastAutoTable.finalY + 30;
        doc.text('PURCHASE LIST (Payables to Sellers)', 40, finalY);
        autoTable(doc, {
          startY: finalY + 10,
          head: [['Seller (Purchase Party)', 'Buyer (Sales Party)', 'Token #', 'Qty', 'Rate', 'Purchase Amount']],
          body: filteredDailyItems.map(item => [
            getPartyName(getSellerIdByToken(item.tokenId)), 
            getPartyName(item.sellingPartyId), 
            item.tokenId,
            item.soldQuantity,
            ((item.purchaseAmount || 0) / (item.soldQuantity || 1)).toLocaleString(undefined, {maximumFractionDigits: 2}),
            item.purchaseAmount?.toLocaleString()
          ]),
          foot: [['', '', '', '', 'TOTAL PAYABLE', totalDailyPurchase.toLocaleString()]],
          styles: { fontSize: 8 },
          headStyles: { fillColor: [6, 78, 59] }
        });

        doc.save(`VIPANI_Daily_${filterDate}.pdf`);
      } else if (reportType === 'party-detail' && filterPartyId) {
        const partyName = getPartyName(filterPartyId);
        const { asSeller, asBuyer } = getPartnerHistoryData(filterPartyId);
        const { totalAsBuyer, totalAsSeller, balance } = calculatePartyTotals(filterPartyId);

        doc.setFontSize(14);
        doc.text(`Financial Audit: ${partyName}`, 40, 95);

        // Intimation Block
        const isReceivable = balance > 0;
        const intimationY = 110;
        doc.setFillColor(isReceivable ? 236 : 254, isReceivable ? 253 : 242, isReceivable ? 245 : 242);
        doc.rect(40, intimationY, 515, 50, 'F');
        doc.setDrawColor(isReceivable ? 16 : 225, isReceivable ? 185 : 29, isReceivable ? 129 : 72);
        doc.rect(40, intimationY, 515, 50, 'S');
        
        doc.setFontSize(9);
        doc.setTextColor(isReceivable ? 6 : 153, isReceivable ? 78 : 27, isReceivable ? 59 : 27);
        doc.text('OFFICIAL STANDING INTIMATION', 55, intimationY + 18);
        doc.setFontSize(13);
        const statusText = balance === 0 ? "ACCOUNT SETTLED" : `BALANCE: Rs. ${Math.abs(balance).toLocaleString()} [${isReceivable ? 'RECEIVABLE - COLLECT FROM PARTNER' : 'PAYABLE - SETTLE TO PARTNER'}]`;
        doc.text(statusText, 55, intimationY + 38);

        // Tables
        doc.setTextColor(0,0,0);
        doc.setFontSize(11);
        doc.text('TRANSACTIONS AS BUYER (Money Collected)', 40, 190);
        autoTable(doc, {
          startY: 200,
          head: [['Buyer Name', 'Source Seller', 'Token #', 'Qty', 'Rate', 'Amount Collected']],
          body: asBuyer.map(i => [partyName, getPartyName(getSellerIdByToken(i.tokenId)), i.tokenId, i.soldQuantity, i.unitSalesRate?.toLocaleString(), i.salesAmount?.toLocaleString()]),
          foot: [['', '', '', '', 'TOTAL AS BUYER', totalAsBuyer.toLocaleString()]],
          styles: { fontSize: 8 },
          headStyles: { fillColor: primaryColor }
        });

        const nextY = (doc as any).lastAutoTable.finalY + 30;
        doc.text('TRANSACTIONS AS SELLER (Money Owed)', 40, nextY);
        autoTable(doc, {
          startY: nextY + 10,
          head: [['Seller Name', 'Destination Buyer', 'Token #', 'Qty', 'Rate', 'Amount Owed']],
          body: asSeller.map(i => [partyName, getPartyName(i.sellingPartyId), i.tokenId, i.soldQuantity, ((i.purchaseAmount || 0)/(i.soldQuantity || 1)).toLocaleString(), i.purchaseAmount?.toLocaleString()]),
          foot: [['', '', '', '', 'TOTAL AS SELLER', totalAsSeller.toLocaleString()]],
          styles: { fontSize: 8 },
          headStyles: { fillColor: [6, 78, 59] }
        });

        doc.save(`VIPANI_Audit_${partyName}.pdf`);
      } else if (reportType === 'party-summary') {
        doc.setFontSize(14);
        doc.text('Consolidated Partner Balance Sheet', 40, 95);
        autoTable(doc, {
          startY: 110,
          head: [['Partner Name', 'Total as Buyer (Rec)', 'Total as Seller (Pay)', 'Net Balance', 'Standing Status']],
          body: data.parties.map(p => {
            const { totalAsBuyer, totalAsSeller, balance } = calculatePartyTotals(p.id);
            return [
              p.name,
              totalAsBuyer.toLocaleString(),
              totalAsSeller.toLocaleString(),
              Math.abs(balance).toLocaleString(),
              balance === 0 ? 'Settled' : (balance > 0 ? 'RECEIVABLE' : 'PAYABLE')
            ];
          }),
          headStyles: { fillColor: primaryColor }
        });
        doc.save('VIPANI_All_Partners.pdf');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <BarChart4 className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Fiscal Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tighter">Financial Reports</h1>
          <p className="text-slate-500 mt-1 md:mt-2 font-medium text-sm">Corrected Standing: Buyer (Receivable) vs Seller (Payable)</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full md:w-auto bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isExporting ? 'Generating...' : 'Export PDF Report'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm sticky top-6">
             <h3 className="text-base font-black text-emerald-950 mb-6 flex items-center gap-3 uppercase tracking-tighter">
              <Filter className="w-5 h-5 text-emerald-600" /> Filters
            </h3>
            <div className="space-y-8">
              <div className="flex flex-col gap-2 p-1.5 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                <button onClick={() => setReportType('daily')} className={`py-3 px-5 rounded-xl text-xs font-bold transition-all ${reportType === 'daily' ? 'bg-emerald-900 text-white' : 'text-emerald-400 hover:bg-white'}`}>Daily Velocity</button>
                <button onClick={() => setReportType('party-summary')} className={`py-3 px-5 rounded-xl text-xs font-bold transition-all ${reportType === 'party-summary' ? 'bg-emerald-900 text-white' : 'text-emerald-400 hover:bg-white'}`}>Summary Sheet</button>
                <button onClick={() => setReportType('party-detail')} className={`py-3 px-5 rounded-xl text-xs font-bold transition-all ${reportType === 'party-detail' ? 'bg-emerald-900 text-white' : 'text-emerald-400 hover:bg-white'}`}>Partner History</button>
              </div>
              {reportType !== 'party-summary' && (
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Select Context</label>
                   {reportType === 'daily' ? (
                     <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full rounded-xl border-emerald-100 p-3 font-bold bg-emerald-50/20" />
                   ) : (
                     <select value={filterPartyId} onChange={(e) => setFilterPartyId(e.target.value)} className="w-full rounded-xl border-emerald-100 p-3 font-bold bg-emerald-50/20">
                       <option value="">Choose Partner...</option>
                       {data.parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          {reportType === 'party-summary' && (
            <div className="bg-white border border-emerald-50 rounded-[3rem] shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-emerald-900 text-white text-[9px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Partner Name</th>
                      <th className="px-8 py-5 text-right">Collected (as Buyer)</th>
                      <th className="px-8 py-5 text-right">Owed (as Seller)</th>
                      <th className="px-8 py-5 text-right">Net Balance</th>
                      <th className="px-8 py-5 text-center">Standing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {data.parties.map(p => {
                      const { totalAsBuyer, totalAsSeller, balance } = calculatePartyTotals(p.id);
                      return (
                        <tr key={p.id} className="hover:bg-emerald-50/50">
                          <td className="px-8 py-5 font-black text-emerald-950">{p.name}</td>
                          <td className="px-8 py-5 text-right font-bold text-emerald-600">₹{totalAsBuyer.toLocaleString()}</td>
                          <td className="px-8 py-5 text-right font-bold text-rose-600">₹{totalAsSeller.toLocaleString()}</td>
                          <td className="px-8 py-5 text-right font-black">₹{Math.abs(balance).toLocaleString()}</td>
                          <td className="px-8 py-5 text-center">
                            {balance === 0 ? <span className="text-[8px] font-black uppercase text-slate-300">Settled</span> :
                             balance > 0 ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Receivable</span> :
                             <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Payable</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
               </table>
            </div>
          )}

          {reportType === 'daily' && filteredDailyItems.length > 0 && (
            <div className="space-y-12">
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-2">Daily Receivables (In)</p>
                    <h4 className="text-3xl font-black text-emerald-600">₹{totalDailySales.toLocaleString()}</h4>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-rose-50 shadow-sm">
                    <p className="text-[9px] font-black text-rose-400 uppercase mb-2">Daily Payables (Out)</p>
                    <h4 className="text-3xl font-black text-rose-600">₹{totalDailyPurchase.toLocaleString()}</h4>
                  </div>
               </div>
               
               <div className="space-y-6">
                 <h3 className="text-lg font-black text-emerald-950 uppercase italic tracking-tighter">Sales Registry (Money to Collect)</h3>
                 <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                       <thead className="bg-emerald-900 text-white text-[8px] font-black uppercase">
                         <tr>
                           <th className="px-8 py-4">Buyer Party</th>
                           <th className="px-8 py-4">Source Seller</th>
                           <th className="px-8 py-4">Token</th>
                           <th className="px-8 py-4 text-right">Amount</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-emerald-50 text-xs">
                          {filteredDailyItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-8 py-4 font-bold">{getPartyName(item.sellingPartyId)}</td>
                              <td className="px-8 py-4 text-slate-400">{getPartyName(getSellerIdByToken(item.tokenId))}</td>
                              <td className="px-8 py-4 text-emerald-300">#{item.tokenId}</td>
                              <td className="px-8 py-4 text-right font-black">₹{item.salesAmount?.toLocaleString()}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               </div>
            </div>
          )}

          {reportType === 'party-detail' && filterPartyId && (
            <div className="space-y-10">
               {(() => {
                 const { totalAsBuyer, totalAsSeller, balance } = calculatePartyTotals(filterPartyId);
                 const isReceivable = balance > 0;
                 return (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50">
                        <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Total Collected (In)</p>
                        <h4 className="text-2xl font-black text-emerald-600">₹{totalAsBuyer.toLocaleString()}</h4>
                      </div>
                      <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50">
                        <p className="text-[9px] font-black text-rose-400 uppercase mb-1">Total Owed (Out)</p>
                        <h4 className="text-2xl font-black text-rose-600">₹{totalAsSeller.toLocaleString()}</h4>
                      </div>
                      <div className={`p-8 rounded-[2.5rem] border text-white shadow-xl ${balance === 0 ? 'bg-slate-400' : isReceivable ? 'bg-emerald-800' : 'bg-rose-800'}`}>
                        <p className="text-[9px] font-black opacity-60 uppercase mb-1">Final Standing</p>
                        <h4 className="text-2xl font-black">₹{Math.abs(balance).toLocaleString()}</h4>
                        <p className="text-[8px] font-black uppercase mt-1 opacity-80">{balance === 0 ? 'Account Balanced' : isReceivable ? 'Receivable - Collect Money' : 'Payable - Pay Partner'}</p>
                      </div>
                   </div>
                 )
               })()}
               
               {/* Tables for History */}
               <div className="space-y-12">
                  <div className="space-y-4">
                     <h3 className="text-sm font-black text-emerald-900 uppercase">Transactions as Buyer (Platform Receivables)</h3>
                     <div className="bg-white border rounded-[2rem] overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-emerald-50">
                            <tr><th className="px-6 py-3 text-left">Token #</th><th className="px-6 py-3 text-left">Product</th><th className="px-6 py-3 text-right">Amount Paid</th></tr>
                          </thead>
                          <tbody>
                            {getPartnerHistoryData(filterPartyId).asBuyer.map((i,idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-6 py-3 font-bold">#{i.tokenId}</td>
                                <td className="px-6 py-3">{i.name}</td>
                                <td className="px-6 py-3 text-right font-black text-emerald-600">₹{i.salesAmount?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <h3 className="text-sm font-black text-rose-900 uppercase">Transactions as Seller (Platform Payables)</h3>
                     <div className="bg-white border rounded-[2rem] overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-rose-50">
                            <tr><th className="px-6 py-3 text-left">Token #</th><th className="px-6 py-3 text-left">Product</th><th className="px-6 py-3 text-right">Amount Owed</th></tr>
                          </thead>
                          <tbody>
                            {getPartnerHistoryData(filterPartyId).asSeller.map((i,idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-6 py-3 font-bold">#{i.tokenId}</td>
                                <td className="px-6 py-3">{i.name}</td>
                                <td className="px-6 py-3 text-right font-black text-rose-600">₹{i.purchaseAmount?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {(!filterPartyId && reportType === 'party-detail') && (
            <div className="py-20 text-center bg-white rounded-[3rem] border-dashed border-2">
              <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Select a partner above to see audit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
