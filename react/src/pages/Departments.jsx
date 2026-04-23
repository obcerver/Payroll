import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  X,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DepartmentService from '../services/DepartmentService';
import toast from 'react-hot-toast';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await DepartmentService.getAll();
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments');
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
  };

  const sortedAndFilteredDepartments = useMemo(() => {
    let result = [...departments].filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = sortConfig.key === 'employees_count' ? (a.employees_count || 0) : a[sortConfig.key];
        const valB = sortConfig.key === 'employees_count' ? (b.employees_count || 0) : b[sortConfig.key];
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [departments, searchTerm, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredDepartments.length / itemsPerPage);
  const paginatedData = sortedAndFilteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-400" /> : <ChevronDown size={14} className="text-primary-400" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const toastId = toast.loading(editingDept ? 'Updating...' : 'Creating...');
    try {
      if (editingDept) {
        await DepartmentService.update(editingDept.id, formData);
        toast.success('Department updated!', { id: toastId });
      } else {
        await DepartmentService.create(formData);
        toast.success('Department created!', { id: toastId });
      }
      setIsModalOpen(false);
      setEditingDept(null);
      setFormData({ name: '' });
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.data ? Object.values(err.response.data)[0][0] : 'Action failed');
      setError(msg);
      toast.error(msg, { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading('Deleting...');
    try {
      await DepartmentService.delete(id);
      toast.success('Department deleted!', { id: toastId });
      setIsDeleting(null);
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed';
      toast.error(msg, { id: toastId });
      setIsDeleting(null);
    }
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Departments</h1>
          <p className="text-slate-400 text-sm">Manage your organization units</p>
        </div>
        <button 
          onClick={() => { setEditingDept(null); setFormData({ name: '' }); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} />
          Add Department
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-slate-800">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Name <SortIcon column="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('employees_count')}>
                  <div className="flex items-center gap-2">Employees <SortIcon column="employees_count" /></div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center">
                    <Loader2 className="animate-spin text-primary-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-500">
                    No departments found
                  </td>
                </tr>
              ) : paginatedData.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{dept.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-primary-400 text-[10px] font-bold border border-slate-700">
                      {dept.employees_count || 0} Members
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(dept)}
                        className="p-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(dept)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:p-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, sortedAndFilteredDepartments.length)}</span> of <span className="text-white">{sortedAndFilteredDepartments.length}</span>
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

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {editingDept ? 'Edit Department' : 'New Department'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Department Name</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                    placeholder="e.g. Engineering"
                  />
                </div>
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/20 transition-all">
                  {editingDept ? 'Update Changes' : 'Create Department'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleting(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Department?</h3>
              <p className="text-slate-400 text-sm mb-8">Are you sure you want to delete <span className="text-white font-bold">{isDeleting.name}</span>? This action cannot be undone.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => handleDelete(isDeleting.id)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl transition-all">Yes, Delete</button>
                <button onClick={() => setIsDeleting(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Departments;
