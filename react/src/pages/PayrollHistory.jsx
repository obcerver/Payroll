import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  Filter,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PayrollService from '../services/PayrollService';
import toast from 'react-hot-toast';

const PayrollHistory = () => {
  const [history, setHistory] = useState({ data: [], total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, sortConfig, searchTerm, monthFilter, yearFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await PayrollService.getHistory({ 
        page: currentPage,
        sort_by: sortConfig.key,
        order: sortConfig.direction,
        month: monthFilter, 
        year: yearFilter,
        search: searchTerm
      });
      setHistory(response);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const paginatedData = history.data || [];
  const totalPages = history.last_page || 1;
  const totalItems = history.total || 0;
  const fromItem = history.from || 0;
  const toItem = history.to || 0;

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-400" /> : <ChevronDown size={14} className="text-primary-400" />;
  };

  const handleExportPdf = (id, name) => {
    toast.promise(
      new Promise((resolve) => {
        PayrollService.exportPdf(id);
        setTimeout(resolve, 1000);
      }),
      {
        loading: `Preparing payslip for ${name}...`,
        success: 'PDF Opened!',
        error: 'Failed to open PDF',
      }
    );
  };

  const handleExportCsv = () => {
    toast.promise(
      new Promise((resolve) => {
        PayrollService.exportCsv({ month: monthFilter, year: yearFilter });
        setTimeout(resolve, 1000);
      }),
      {
        loading: 'Preparing CSV export...',
        success: 'CSV Downloaded!',
        error: 'Failed to download CSV',
      }
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Payroll History</h1>
          <p className="text-slate-400 text-sm">Review past payroll runs and download reports</p>
        </div>
        <button 
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by employee name..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>
          <div className="flex w-full lg:w-auto gap-3">
            <div className="relative flex-1 lg:w-44">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              <select 
                value={monthFilter}
                onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-300 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none text-sm"
              >
                <option value="">All Months</option>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <input 
              type="number" 
              placeholder="Year"
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800/50 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl w-24 outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Employee <SortIcon column="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('period')}>
                  <div className="flex items-center gap-2">Period <SortIcon column="period" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('net_pay')}>
                  <div className="flex items-center justify-end gap-2">Net Pay <SortIcon column="net_pay" /></div>
                </th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <Loader2 className="animate-spin text-primary-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                    No records found
                  </td>
                </tr>
              ) : paginatedData.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white text-sm md:text-base">{record.employee?.name}</div>
                    <div className="text-xs text-slate-500">{record.employee?.department?.name}</div>
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-slate-400">
                    {months[record.month-1]} {record.year}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${Number(record.net_pay).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleExportPdf(record.id, record.employee?.name)}
                        className="p-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:p-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Showing <span className="text-white">{fromItem}</span> to <span className="text-white">{toItem}</span> of <span className="text-white">{totalItems}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">Payslip Summary</h3>
                    <p className="text-slate-400 text-sm">{months[selectedRecord.month-1]} {selectedRecord.year}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-primary-400 tracking-widest uppercase mb-1">Receipt No</p>
                    <p className="text-white font-mono text-sm">#PR-{selectedRecord.id.toString().padStart(5, '0')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 pb-8 border-b border-slate-800">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Employee Details</p>
                    <p className="text-lg md:text-xl font-bold text-white mb-1">{selectedRecord.employee?.name}</p>
                    <p className="text-sm text-slate-400">{selectedRecord.employee?.position}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedRecord.employee?.department?.name}</p>
                  </div>
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Net Payment</p>
                    <p className="text-3xl md:text-4xl font-bold text-emerald-400">${Number(selectedRecord.net_pay).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-10 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Basic Salary</span>
                    <span className="font-mono text-white">${Number(selectedRecord.employee?.basic_salary).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Allowances</span>
                    <span className="font-mono text-white">${Number(selectedRecord.employee?.allowance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Overtime Pay</span>
                    <span className="font-mono text-white">${Number(selectedRecord.overtime_pay).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-primary-400 font-bold pt-2 border-t border-slate-800/50">
                    <span>Gross Pay</span>
                    <span className="font-mono">${Number(selectedRecord.gross_pay).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Income Tax (8%)</span>
                    <span className="font-mono">-${Number(selectedRecord.tax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>EPF Contribution (Employee 11%)</span>
                    <span className="font-mono">-${Number(selectedRecord.epf_employee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 italic">
                    <span>EPF Contribution (Employer 13%)</span>
                    <span className="font-mono">${Number(selectedRecord.epf_employer).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button 
                    onClick={() => handleExportPdf(selectedRecord.id, selectedRecord.employee?.name)}
                    className="flex-1 bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Download size={20} />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="md:px-8 bg-slate-800 text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-700 transition-all"
                  >
                    Close
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

export default PayrollHistory;
