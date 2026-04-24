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
    latest_run: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await PayrollService.getStats();
        setStats({
          departments: data.total_departments,
          employees: data.total_employees,
          payrollRecords: data.total_payroll_records,
          latest_run: data.latest_run,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getMonthName = (monthNumber) => {
    return new Date(0, monthNumber - 1).toLocaleString('default', { month: 'long' });
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Latest Payroll Run</h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Completed</span>
          </div>
          
          {stats.latest_run ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Period</p>
                  <p className="text-white font-bold">{getMonthName(stats.latest_run.month)} {stats.latest_run.year}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl flex-1">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Employees Processed</p>
                  <p className="text-white font-bold text-2xl">{stats.latest_run.count}</p>
                </div>
              </div>
              <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-primary-400" size={20} />
                  <span className="text-slate-300 text-sm">Monthly generation successful</span>
                </div>
                <ChevronRight className="text-slate-600" size={20} />
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-500 italic">No payroll records found</p>
            </div>
          )}
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
            className="w-full bg-gradient-to-r from-white to-white hover:from-slate-500 hover:to-slate-500 text-slate-950 font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all"
          >
            Go to Payroll Engine
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
