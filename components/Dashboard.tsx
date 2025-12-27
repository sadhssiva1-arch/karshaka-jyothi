
import React from 'react';
import { 
  CircleDollarSign, 
  Package, 
  TrendingUp, 
  Activity,
  BarChart3,
  MousePointer2,
  Zap,
  Clock,
  Key,
  ShieldAlert
} from 'lucide-react';
import { AppData } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const allItems = data.tokens.flatMap(t => t.items);
  const soldItems = allItems.filter(i => i.status === 'Sold');
  
  const totalSales = soldItems.reduce((acc, i) => acc + (i.salesAmount || 0), 0);
  const totalPurchase = soldItems.reduce((acc, i) => acc + (i.purchaseAmount || 0), 0);
  const totalMargin = totalSales - totalPurchase;

  // License Calculation Logic
  const expiryDate = new Date(data.license.expiryDate);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySales = soldItems
      .filter(item => item.soldAt?.startsWith(dateStr))
      .reduce((acc, item) => acc + (item.salesAmount || 0), 0);
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), sales: daySales };
  });

  const stats = [
    { label: 'Total Revenue', value: `₹${totalSales.toLocaleString()}`, sub: 'Lifetime sales', icon: TrendingUp, color: 'emerald' },
    { label: 'Merchant Payouts', value: `₹${totalPurchase.toLocaleString()}`, sub: 'Purchase costs', icon: MousePointer2, color: 'rose' },
    { label: 'Gross Margin', value: `₹${totalMargin.toLocaleString()}`, sub: 'Net profit flow', icon: CircleDollarSign, color: 'teal' },
    { label: 'In-Stock Units', value: allItems.filter(i => i.status === 'Available').length, sub: 'Available now', icon: Package, color: 'amber' },
    { 
      label: 'License Validity', 
      value: isExpired ? 'Expired' : `${diffDays} Days`, 
      sub: isExpired ? 'Renewal required' : 'Remaining access', 
      icon: isExpired ? ShieldAlert : Key, 
      color: isExpired ? 'rose' : 'indigo' 
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">Management Hub</span>
          </div>
          <h1 className="text-5xl font-extrabold text-emerald-950 tracking-tight">Business Intelligence</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Real-time pulse of your consignment network.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="relative">
            <div className="bg-emerald-500 w-2.5 h-2.5 rounded-full" />
            <div className="bg-emerald-500 w-2.5 h-2.5 rounded-full animate-ping absolute top-0" />
          </div>
          <span className="text-sm font-bold text-emerald-950 tracking-tight">System Online</span>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 group relative overflow-hidden">
             <div className="flex justify-between items-start mb-8">
               <div className={`bg-${stat.color}-50 text-${stat.color}-600 p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 text-slate-100" />
             </div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-extrabold tracking-tight ${stat.color === 'rose' && stat.label === 'License Validity' ? 'text-rose-600' : 'text-slate-900'}`}>{stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-1.5 opacity-80">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Trajectory</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Growth analysis for the past 7 business days</p>
            </div>
            <div className="flex gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button className="bg-white text-emerald-950 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 transition-all">Revenue</button>
              <button className="text-slate-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-emerald-950 transition-all">Volumes</button>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: '700'}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: '700'}} 
                  dx={-15}
                />
                <Tooltip 
                  cursor={{stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4'}}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                    padding: '20px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-950 p-10 rounded-[3.5rem] text-white shadow-3xl shadow-emerald-950/20 relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex-1">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
                <BarChart3 className="w-6 h-6 text-emerald-400" /> Recent Flows
              </h3>
              <div className="bg-emerald-800/50 p-2 rounded-xl border border-emerald-700/50">
                 <MousePointer2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-7">
              {soldItems.slice(-5).reverse().map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group cursor-pointer hover:translate-x-1 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-900 p-3 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-500 shadow-inner">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-300 transition-colors">{item.name}</p>
                      <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">TK-{item.tokenId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-300 tracking-tight">₹{item.salesAmount?.toLocaleString()}</p>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter mt-1">{new Date(item.soldAt!).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</p>
                  </div>
                </div>
              ))}
              {soldItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Clock className="w-12 h-12 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Waiting for entries</p>
                </div>
              )}
            </div>
          </div>
          <button className="relative z-10 w-full mt-12 bg-white/10 hover:bg-white text-white hover:text-emerald-950 transition-all duration-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] border border-white/10 shadow-xl group">
             Full Analytics Suite
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
