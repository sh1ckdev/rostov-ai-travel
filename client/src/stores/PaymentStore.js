import { makeAutoObservable } from 'mobx';

class PaymentStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.paymentMethods = [];
    this.transactions = [];
    this.isLoading = false;
    this.error = null;
    this.selectedPaymentMethod = null;
    this.paymentStatus = null; // pending, completed, failed, cancelled
    
    makeAutoObservable(this);
  }

  async fetchPaymentMethods() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.paymentMethods = data.paymentMethods;
      } else {
        throw new Error('Ошибка загрузки способов оплаты');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async addPaymentMethod(paymentData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/payments/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const data = await response.json();
        this.paymentMethods.push(data.paymentMethod);
        return data.paymentMethod;
      } else {
        throw new Error('Ошибка добавления способа оплаты');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async processPayment(paymentData) {
    try {
      this.isLoading = true;
      this.error = null;
      this.paymentStatus = 'pending';
      
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const data = await response.json();
        this.paymentStatus = 'completed';
        this.transactions.push(data.transaction);
        return data.transaction;
      } else {
        this.paymentStatus = 'failed';
        throw new Error('Ошибка обработки платежа');
      }
    } catch (error) {
      this.paymentStatus = 'failed';
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async refundPayment(transactionId, amount = null) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        // Обновляем транзакцию в списке
        const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex !== -1) {
          this.transactions[transactionIndex] = data.transaction;
        }
        return data.transaction;
      } else {
        throw new Error('Ошибка возврата средств');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchTransactions() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/payments/transactions', {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.transactions = data.transactions;
      } else {
        throw new Error('Ошибка загрузки транзакций');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async calculateTotalPrice(items) {
    try {
      const response = await fetch('/api/payments/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.total;
      } else {
        throw new Error('Ошибка расчета стоимости');
      }
    } catch (error) {
      console.error('Ошибка расчета стоимости:', error);
      return 0;
    }
  }

  setSelectedPaymentMethod(methodId) {
    this.selectedPaymentMethod = this.paymentMethods.find(method => method.id === methodId);
  }

  async getToken() {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('token');
  }

  clearError() {
    this.error = null;
  }

  resetPaymentStatus() {
    this.paymentStatus = null;
  }
}

export default PaymentStore;
