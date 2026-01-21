
import React from 'react';
import { DesignCharge, PaymentRecord, SecurityLog } from '../types';
import { db } from '../services/mockDatabase';

interface DashboardProps {
  charges: DesignCharge[];
  payments: PaymentRecord[];
  totals: { costs: number; paid: number };
  balance: number;
  securityLogs: SecurityLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ charges, payments, totals, balance, securityLogs }) => {
  const combinedActivity = [
    ...charges.map(c => ({ ...c, typeLabel: 'Charge', color: 'text-rose-500', icon: 'fa-minus-circle' })),
    ...payments.map(p => ({ ...p, typeLabel: 'Payment', color: 'text-emerald-500', icon: 'fa-plus-circle' }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  const downloadReport = () => {
    const reportData = `
DESIGN LEDGER REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY:
Total Design Cost: Rs. ${totals.costs}
Total Paid: Rs. ${totals.paid}
Balance: Rs. ${balance}

LATEST ACTIVITY:
${combinedActivity.map(a => {
  const activityDetail = a.typeLabel === 'Charge' ? (a as any).type : (a as any).method;
  return `- [${a.date}] ${a.typeLabel}: Rs. ${a.amount} (${activityDetail})`;
}).join('\n')}
    `;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ledger_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Security Alerts - Only show if there are failed attempts */}
      {securityLogs.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-amber-800 font-black flex items-center gap-2">
              <i className="fas fa-shield-virus animate-pulse"></i> SECURITY ALERTS (Failed Logins)
            </h3>
            <button 
              onClick={() => db.clearSecurityLogs()}
              className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-800 px-2 py-1 rounded font-bold uppercase"
            >
              Clear Logs
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {securityLogs.slice().reverse().map(log => (
              <div key={log.id} className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-amber-100 text-xs">
                <span className="font-bold text-amber-900 truncate mr-4">
                  <i className="fas fa-user-secret mr-2"></i> {log.attemptedEmail}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-black ${log.status === 'WRONG_PASSWORD' ? 'text-rose-500' : 'text-amber-600'}`}>
                    {log.status === 'WRONG_PASSWORD' ? 'WRONG PASS' : 'UNKNOWN EMAIL'}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Financial Overview</h2>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <i className="fas fa-file-download text-indigo-500"></i> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-file-invoice-dollar text-xl"></i>
            </div>
            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total Costs</span>
          </div>
          <div className="text-3xl font-black text-slate-800">Rs. {totals.costs.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-hand-holding-usd text-xl"></i>
            </div>
            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total Paid</span>
          </div>
          <div className="text-3xl font-black text-slate-800">Rs. {totals.paid.toLocaleString()}</div>
        </div>

        <div className={`p-6 rounded-2xl shadow-xl border-4 ${
          balance < 0 ? 'bg-rose-600 border-rose-500 text-white' : 'bg-emerald-600 border-emerald-500 text-white'
        }`}>
          <div className="flex items-center gap-4 mb-4 text-white/80">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-wallet text-xl text-white"></i>
            </div>
            <span className="font-bold text-xs uppercase tracking-widest">Current Balance</span>
          </div>
          <div className="text-3xl font-black">Rs. {balance.toLocaleString()}</div>
          <p className="text-sm mt-2 text-white/80 font-medium">{balance < 0 ? 'Outstanding Dues' : 'Credit Balance'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-history text-indigo-500"></i> Recent Activity
          </h3>
          <div className="space-y-3">
            {combinedActivity.length === 0 ? (
              <p className="text-slate-400 text-center py-12 italic">No transactions found</p>
            ) : (
              combinedActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border ${activity.color}`}>
                    <i className={`fas ${activity.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 truncate pr-2">
                        {activity.typeLabel === 'Charge' ? activity.type : activity.method}
                      </span>
                      <span className={`font-black whitespace-nowrap ${activity.color}`}>
                        {activity.typeLabel === 'Charge' ? '-' : '+'} Rs. {activity.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                      <span className="truncate max-w-[150px]">{activity.description || activity.note || 'No description'}</span>
                      <span>{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-[0.2em] font-black">Secure System</span>
            </div>
            <h3 className="text-2xl font-black mb-3 italic">Live Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Every login attempt is tracked. If you see unauthorized entries in the alert box above, please contact each other immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
