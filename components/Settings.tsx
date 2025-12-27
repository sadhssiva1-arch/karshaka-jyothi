
import React from 'react';
import { Save, Sliders, Info, Percent } from 'lucide-react';
import { AppData } from '../types';

interface SettingsProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
}

const Settings: React.FC<SettingsProps> = ({ data, onUpdateData }) => {
  const handleChangeMargin = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateData({
      ...data,
      settings: {
        ...data.settings,
        purchaseMarginPercent: Number(e.target.value)
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-right duration-500">
      <div className="mb-10 text-center">
        <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Sliders className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-slate-500 mt-2">Global business rules and financial parameters</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-10 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Profit Margin Rules</h3>
            </div>
            
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="max-w-md">
                  <label className="block font-bold text-slate-700 mb-1">Default Deduction Margin</label>
                  <p className="text-sm text-slate-500">This percentage is deducted from the sales rate to calculate the amount payable to the seller (Purchase Rate).</p>
                </div>
                <div className="relative w-32">
                  <input 
                    type="number"
                    value={data.settings.purchaseMarginPercent}
                    onChange={handleChangeMargin}
                    className="w-full pr-8 pl-4 py-4 rounded-2xl border-slate-200 text-2xl font-black border text-center focus:ring-indigo-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-2xl text-indigo-700 text-sm">
                <Info className="w-5 h-5 mt-0.5 shrink-0" />
                <p>
                  <strong>Formula Example:</strong> If sales rate is ₹1,000 and margin is {data.settings.purchaseMarginPercent}%, 
                  the purchase bill will be generated for ₹{1000 * (1 - data.settings.purchaseMarginPercent / 100)}.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Business Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Default Currency</label>
                <select className="w-full bg-white border-slate-200 rounded-xl p-3 border font-medium">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Token System</label>
                <input type="text" value="Sequential Numeric" readOnly className="w-full bg-slate-100 border-slate-200 rounded-xl p-3 border font-medium cursor-not-allowed" />
              </div>
            </div>
          </section>
        </div>
        
        <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
           <button 
            className="flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
            onClick={() => alert('Settings autosaved')}
          >
            <Save className="w-5 h-5" />
            Apply All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
