
import { DesignCharge, PaymentRecord, PriceTemplate, SecurityLog } from '../types';

class MockDatabase {
  private static STORAGE_KEY = 'design_ledger_db';

  private getData() {
    const data = localStorage.getItem(MockDatabase.STORAGE_KEY);
    return data ? JSON.parse(data) : { 
      charges: [], 
      payments: [], 
      securityLogs: [],
      templates: [
        { id: '1', name: 'Background Change', amount: 500 },
        { id: '2', name: 'Photo Retouch', amount: 300 },
        { id: '3', name: 'Album Basic', amount: 6000 },
        { id: '4', name: 'Album Premium', amount: 9000 }
      ] 
    };
  }

  private saveData(data: any) {
    localStorage.setItem(MockDatabase.STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  }

  subscribe(callback: (data: any) => void) {
    const handler = () => callback(this.getData());
    window.addEventListener('storage', handler);
    handler();
    return () => window.removeEventListener('storage', handler);
  }

  addCharge(charge: DesignCharge) {
    const data = this.getData();
    data.charges.push(charge);
    this.saveData(data);
  }

  addPayment(payment: PaymentRecord) {
    const data = this.getData();
    data.payments.push(payment);
    this.saveData(data);
  }

  addSecurityLog(log: SecurityLog) {
    const data = this.getData();
    if (!data.securityLogs) data.securityLogs = [];
    data.securityLogs.push(log);
    // Keep only last 20 logs
    if (data.securityLogs.length > 20) data.securityLogs.shift();
    this.saveData(data);
  }

  saveTemplates(templates: PriceTemplate[]) {
    const data = this.getData();
    data.templates = templates;
    this.saveData(data);
  }

  clearSecurityLogs() {
    const data = this.getData();
    data.securityLogs = [];
    this.saveData(data);
  }
}

export const db = new MockDatabase();
