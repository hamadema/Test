
import React, { useState, useEffect } from 'react';
import { AUTHORIZED_USERS } from './constants';
import { UserProfile, DesignCharge, PaymentRecord, PriceTemplate, SecurityLog } from './types';
import { db } from './services/mockDatabase';
import Dashboard from './components/Dashboard';
import DesignCharges from './components/DesignCharges';
import Payments from './components/Payments';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [charges, setCharges] = useState<DesignCharge[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [templates, setTemplates] = useState<PriceTemplate[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charges' | 'payments' | 'templates'>('dashboard');

  useEffect(() => {
    const unsubscribe = db.subscribe((data) => {
      setCharges(data.charges || []);
      setPayments(data.payments || []);
      setTemplates(data.templates || []);
      setSecurityLogs(data.securityLogs || []);
    });
    return unsubscribe;
  }, []);

  const handleLogin = (email: string, password?: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const authUser = AUTHORIZED_USERS[normalizedEmail];
    
    if (authUser) {
      if (authUser.password === password) {
        setCurrentUser(authUser);
        localStorage.setItem('logged_user', JSON.stringify(authUser));
      } else {
        // Log wrong password attempt
        db.addSecurityLog({
          id: Date.now().toString(),
          attemptedEmail: email,
          timestamp: Date.now(),
          date: new Date().toLocaleString(),
          status: 'WRONG_PASSWORD'
        });
        alert("Incorrect password for this account.");
      }
    } else {
      // Log unauthorized email attempt
      db.addSecurityLog({
        id: Date.now().toString(),
        attemptedEmail: email,
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        status: 'UNAUTHORIZED_EMAIL'
      });
      alert("Unauthorized Access Attempt Recorded. Notifications sent.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logged_user');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const totals = {
    costs: charges.reduce((acc, c) => acc + c.amount, 0),
    paid: payments.reduce((acc, p) => acc + p.amount, 0),
  };
  const balance = totals.paid - totals.costs;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        userName={currentUser.name}
      />
      
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header user={currentUser} balance={balance} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              charges={charges} 
              payments={payments} 
              totals={totals} 
              balance={balance}
              securityLogs={securityLogs}
            />
          )}
          {activeTab === 'charges' && (
            <DesignCharges 
              charges={charges} 
              templates={templates} 
              user={currentUser} 
            />
          )}
          {activeTab === 'payments' && (
            <Payments 
              payments={payments} 
              user={currentUser} 
            />
          )}
          {activeTab === 'templates' && currentUser.role === 'DESIGNER' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
               <h2 className="text-xl font-bold mb-4">Price List Management</h2>
               <p className="text-slate-500 mb-6">Create and manage your service buttons here.</p>
               <TemplateManager templates={templates} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const TemplateManager: React.FC<{ templates: PriceTemplate[] }> = ({ templates }) => {
  const [newTemplate, setNewTemplate] = useState({ name: '', amount: '' });

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.amount) return;
    const next = [...templates, { id: Date.now().toString(), name: newTemplate.name, amount: Number(newTemplate.amount) }];
    db.saveTemplates(next);
    setNewTemplate({ name: '', amount: '' });
  };

  const removeTemplate = (id: string) => {
    db.saveTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          placeholder="Service Name (e.g. Logo Design)" 
          className="flex-1 border p-2 rounded"
          value={newTemplate.name}
          onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Price" 
          className="w-full sm:w-32 border p-2 rounded"
          value={newTemplate.amount}
          onChange={e => setNewTemplate({...newTemplate, amount: e.target.value})}
        />
        <button onClick={addTemplate} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="flex justify-between items-center p-3 border rounded bg-slate-50">
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-indigo-600 font-bold">Rs. {t.amount}</div>
            </div>
            <button onClick={() => removeTemplate(t.id)} className="text-red-500 hover:text-red-700">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
