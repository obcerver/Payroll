import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import DepartmentService from '../services/DepartmentService';
import EmployeeService from '../services/EmployeeService';
import PayrollService from '../services/PayrollService';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl group hover:border-primary-500/30 transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs text-slate-500 gap-1">
      <TrendingUp size={14} className="text-emerald-400" />
      <span className="text-emerald-400 font-medium">+12%</span>
      <span>from last month</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    departments: 0,
    employees: 0,
    payrollRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [depts, emps, payroll] = await Promise.all([
          DepartmentService.getAll(),
          EmployeeService.getAll(),
          PayrollService.getHistory(),
        ]);
        setStats({
          departments: depts.length,
          employees: emps.length,
          payrollRecords: payroll.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Departments" 
          value={stats.departments} 
          icon={Building2} 
          color="bg-blue-500 text-blue-500"
          delay={0.1}
        />
        <StatCard 
          title="Total Employees" 
          value={stats.employees} 
          icon={Users} 
          color="bg-purple-500 text-purple-500"
          delay={0.2}
        />
        <StatCard 
          title="Payroll Records" 
          value={stats.payrollRecords} 
          icon={CreditCard} 
          color="bg-emerald-500 text-emerald-500"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Activity or Chart Placeholders */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">System Status</h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">Active</span>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">Database Synchronization</p>
                  <p className="text-xs text-slate-500">Last checked 2 minutes ago</p>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-primary-400 transition-colors" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary-600/20 to-emerald-600/20 backdrop-blur-xl border border-primary-500/20 p-8 rounded-3xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to run payroll?</h3>
            <p className="text-slate-400 text-sm mb-6">Process all employee salaries for the current month with just one click.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/run-payroll'}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-primary-50 hover:scale-[1.02] transition-all"
          >
            Go to Payroll Engine
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
