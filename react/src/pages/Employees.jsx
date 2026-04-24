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
  Filter,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeService from '../services/EmployeeService';
import DepartmentService from '../services/DepartmentService';
import toast from 'react-hot-toast';

const Employees = () => {
  const [employees, setEmployees] = useState({ data: [], total: 0, last_page: 1 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    position: '',
    basic_salary: '',
    allowance: '0',
    overtime_hours: '0',
    hour_rate: '0',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, sortConfig, searchTerm, deptFilter]);

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getAll();
      setDepartments(data.data || data); // Handle both paginated and non-paginated
    } catch (err) {
      toast.error('Failed to load departments');
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await EmployeeService.getAll({
        page: currentPage,
        sort_by: sortConfig.key,
        order: sortConfig.direction,
        department_id: deptFilter,
        search: searchTerm
      });
      setEmployees(response);
    } catch (err) {
      toast.error('Failed to load employee data');
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

  const paginatedData = employees.data || [];
  const totalPages = employees.last_page || 1;
  const totalItems = employees.total || 0;
  const fromItem = employees.from || 0;
  const toItem = employees.to || 0;

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-400" /> : <ChevronDown size={14} className="text-primary-400" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const toastId = toast.loading(editingEmp ? 'Updating...' : 'Adding...');
    try {
      if (editingEmp) {
        await EmployeeService.update(editingEmp.id, formData);
        toast.success('Employee updated!', { id: toastId });
      } else {
        await EmployeeService.create(formData);
        toast.success('Employee added!', { id: toastId });
      }
      setIsModalOpen(false);
      setEditingEmp(null);
      resetForm();
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading('Deleting...');
    try {
      await EmployeeService.delete(id);
      toast.success('Employee removed!', { id: toastId });
      setIsDeleting(null);
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed';
      toast.error(msg, { id: toastId });
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      department_id: '',
      position: '',
      basic_salary: '',
      allowance: '0',
      overtime_hours: '0',
      hour_rate: '0',
    });
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      department_id: emp.department_id,
      position: emp.position,
      basic_salary: emp.basic_salary,
      allowance: emp.allowance,
      overtime_hours: emp.overtime_hours,
      hour_rate: emp.hour_rate,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Employees</h1>
          <p className="text-slate-400 text-sm">Manage your workforce and salary details</p>
        </div>
        <button 
          onClick={() => { setEditingEmp(null); resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or position..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>
          <div className="flex w-full lg:max-w-xs items-center gap-3">
            <Filter size={18} className="text-slate-500" />
            <select 
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-slate-800/50 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Employee <SortIcon column="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-2">Department <SortIcon column="department" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('basic_salary')}>
                  <div className="flex items-center justify-end gap-2">Base Salary <SortIcon column="basic_salary" /></div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                    No employees found
                  </td>
                </tr>
              ) : paginatedData.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white text-sm md:text-base">{emp.name}</div>
                    <div className="text-[10px] md:text-xs text-slate-500 uppercase font-medium">{emp.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 text-xs md:text-sm">{emp.department?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${Number(emp.basic_salary).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(emp)}
                        className="p-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(emp)}
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
            Showing <span className="text-white">{fromItem}</span> to <span className="text-white">{toItem}</span> of <span className="text-white">{totalItems}</span>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">{editingEmp ? 'Edit Employee' : 'New Employee'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"><AlertCircle size={18} />{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Department</label>
                    <select required value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none">
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Position</label>
                    <input type="text" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Basic Salary</label>
                    <input type="number" required value={formData.basic_salary} onChange={(e) => setFormData({...formData, basic_salary: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Allowance</label>
                    <input type="number" value={formData.allowance} onChange={(e) => setFormData({...formData, allowance: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">OT Rate</label>
                    <input type="number" value={formData.hour_rate} onChange={(e) => setFormData({...formData, hour_rate: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 font-mono" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 font-bold py-4 rounded-2xl shadow-lg transition-all">
                  {editingEmp ? 'Save Changes' : 'Add Employee'}
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
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Remove Employee?</h3>
              <p className="text-slate-400 text-sm mb-8">Are you sure you want to remove <span className="text-white font-bold">{isDeleting.name}</span>? All history remains in records.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => handleDelete(isDeleting.id)} className="w-full bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 font-bold py-3.5 rounded-2xl transition-all">Yes, Remove</button>
                <button onClick={() => setIsDeleting(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
