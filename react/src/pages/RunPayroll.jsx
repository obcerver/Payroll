import React, { useState } from 'react';
import { 
  PlayCircle, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PayrollService from '../services/PayrollService';
import toast from 'react-hot-toast';

const RunPayroll = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleRunPayroll = async () => {
    setLoading(true);
    setError('');
    const toastId = toast.loading('Processing payroll...');
    try {
      const data = await PayrollService.runPayroll(month, year);
      setResults(data);
      setShowConfirm(false);
      toast.success('Payroll processed successfully!', { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process payroll';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Run Payroll</h1>
        <p className="text-slate-400 text-sm">Process monthly salaries for all employees</p>
      </div>

      {!results ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 md:p-8 rounded-3xl"
        >
          <div className="flex items-start gap-4 mb-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
            <Info className="text-primary-400 mt-1 flex-shrink-0" size={20} />
            <p className="text-sm text-slate-300">
              Running payroll will calculate basic salary, allowances, overtime, tax (8%), and EPF (11% employee, 13% employer).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Select Month</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400" size={20} />
                <select 
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all appearance-none"
                >
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Select Year</label>
              <input 
                type="number" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-4 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <PlayCircle size={24} />
            Start Processing
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 md:p-8 bg-emerald-500/10 border-b border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Payroll Completed</h2>
                <p className="text-emerald-400 text-sm font-medium">Successfully processed {results.processed_count} records</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/payroll-history'}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all border border-slate-700"
            >
              Go to History
            </button>
          </div>

          <div className="p-6 md:p-8">
            <div className="space-y-4">
              {results.data.map((record, i) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-800 group hover:border-primary-500/30 transition-all">
                  <div className="flex items-center gap-4 truncate">
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-800 items-center justify-center text-slate-400 font-bold group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-all flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{record.employee?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{record.employee?.position}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-emerald-400 font-bold text-sm md:text-base">${Number(record.net_pay).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Net Pay</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setResults(null)}
              className="mt-8 w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              Process another month <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !loading && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-500">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white">Confirm Action</h3>
                <p className="text-slate-400">
                  You are about to run payroll for <span className="text-white font-bold">{months[month-1]} {year}</span>. 
                  This will generate permanent financial records.
                </p>
                
                {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    disabled={loading}
                    onClick={handleRunPayroll}
                    className="w-full bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Yes, Process Now'}
                  </button>
                  <button 
                    disabled={loading}
                    onClick={() => setShowConfirm(false)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunPayroll;
