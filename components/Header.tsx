
import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  balance: number;
}

const Header: React.FC<HeaderProps> = ({ user, balance }) => {
  return (
    <header className="bg-white border-b px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Welcome, {user.name}</h1>
        <p className="text-sm text-slate-500">Real-time Financial Tracking</p>
      </div>
      
      <div className={`px-6 py-2 rounded-full border-2 flex items-center gap-3 ${
        balance < 0 ? 'border-red-100 bg-red-50 text-red-600' : 'border-green-100 bg-green-50 text-green-600'
      }`}>
        <span className="text-xs font-bold uppercase tracking-wider">Net Balance</span>
        <span className="text-lg font-black">Rs. {balance.toLocaleString()}</span>
      </div>
    </header>
  );
};

export default Header;
