import expensesData from "@/services/mockData/expenses.json";
import incomeData from "@/services/mockData/income.json";
import fieldService from "./fieldService";
import cropService from "./cropService";

class FinancialService {
  constructor() {
    this.expenses = [...expensesData];
    this.income = [...incomeData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Expense methods
  async getAllExpenses() {
    await this.delay();
    const enrichedExpenses = await Promise.all(
      this.expenses.map(async (expense) => {
        try {
          const field = await fieldService.getById(expense.fieldId);
          const crop = expense.cropId ? await cropService.getById(expense.cropId) : null;
          return {
            ...expense,
            fieldName: field?.name || 'Unknown Field',
            cropName: crop?.name || 'N/A'
          };
        } catch (error) {
          return {
            ...expense,
            fieldName: 'Unknown Field',
            cropName: 'N/A'
          };
        }
      })
    );
    return enrichedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getExpenseById(id) {
    await this.delay();
    const expense = this.expenses.find(e => e.Id === parseInt(id));
    if (!expense) {
      throw new Error("Expense not found");
    }
    return { ...expense };
  }

  async createExpense(expenseData) {
    await this.delay();
    const maxId = Math.max(...this.expenses.map(e => e.Id), 0);
    const newExpense = {
      Id: maxId + 1,
      ...expenseData,
      fieldId: parseInt(expenseData.fieldId),
      cropId: expenseData.cropId ? parseInt(expenseData.cropId) : null,
      amount: parseFloat(expenseData.amount),
      quantity: expenseData.quantity ? parseFloat(expenseData.quantity) : null,
      pricePerUnit: expenseData.pricePerUnit ? parseFloat(expenseData.pricePerUnit) : null,
      date: expenseData.date || new Date().toISOString()
    };
    
    this.expenses.push(newExpense);
    return { ...newExpense };
  }

  async updateExpense(id, expenseData) {
    await this.delay();
    const index = this.expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Expense not found");
    }

    const updatedExpense = {
      ...this.expenses[index],
      ...expenseData,
      fieldId: expenseData.fieldId ? parseInt(expenseData.fieldId) : this.expenses[index].fieldId,
      cropId: expenseData.cropId ? parseInt(expenseData.cropId) : this.expenses[index].cropId,
      amount: expenseData.amount ? parseFloat(expenseData.amount) : this.expenses[index].amount
    };

    this.expenses[index] = updatedExpense;
    return { ...updatedExpense };
  }

  async deleteExpense(id) {
    await this.delay();
    const index = this.expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Expense not found");
    }
    const deletedExpense = this.expenses.splice(index, 1)[0];
    return { ...deletedExpense };
  }

  // Income methods
  async getAllIncome() {
    await this.delay();
    const enrichedIncome = await Promise.all(
      this.income.map(async (income) => {
        try {
          const field = await fieldService.getById(income.fieldId);
          const crop = income.cropId ? await cropService.getById(income.cropId) : null;
          return {
            ...income,
            fieldName: field?.name || 'Unknown Field',
            cropName: crop?.name || income.cropName || 'N/A'
          };
        } catch (error) {
          return {
            ...income,
            fieldName: 'Unknown Field',
            cropName: income.cropName || 'N/A'
          };
        }
      })
    );
    return enrichedIncome.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getIncomeById(id) {
    await this.delay();
    const income = this.income.find(i => i.Id === parseInt(id));
    if (!income) {
      throw new Error("Income record not found");
    }
    return { ...income };
  }

  async createIncome(incomeData) {
    await this.delay();
    const maxId = Math.max(...this.income.map(i => i.Id), 0);
    const newIncome = {
      Id: maxId + 1,
      ...incomeData,
      fieldId: parseInt(incomeData.fieldId),
      cropId: incomeData.cropId ? parseInt(incomeData.cropId) : null,
      amount: parseFloat(incomeData.amount),
      quantity: parseFloat(incomeData.quantity),
      pricePerUnit: parseFloat(incomeData.pricePerUnit),
      date: incomeData.date || new Date().toISOString()
    };
    
    this.income.push(newIncome);
    return { ...newIncome };
  }

  async updateIncome(id, incomeData) {
    await this.delay();
    const index = this.income.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Income record not found");
    }

    const updatedIncome = {
      ...this.income[index],
      ...incomeData,
      fieldId: incomeData.fieldId ? parseInt(incomeData.fieldId) : this.income[index].fieldId,
      cropId: incomeData.cropId ? parseInt(incomeData.cropId) : this.income[index].cropId,
      amount: incomeData.amount ? parseFloat(incomeData.amount) : this.income[index].amount
    };

    this.income[index] = updatedIncome;
    return { ...updatedIncome };
  }

  async deleteIncome(id) {
    await this.delay();
    const index = this.income.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Income record not found");
    }
    const deletedIncome = this.income.splice(index, 1)[0];
    return { ...deletedIncome };
  }

  // Statistics and analytics
  async getStats() {
    await this.delay();
    const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = this.income.reduce((sum, income) => sum + income.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyExpenses = this.expenses
      .filter(expense => new Date(expense.date) >= currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const monthlyIncome = this.income
      .filter(income => new Date(income.date) >= currentMonth)
      .reduce((sum, income) => sum + income.amount, 0);

    const expensesByCategory = {};
    this.expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    return {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      expensesByCategory,
      profitMargin: totalIncome > 0 ? Math.round((netProfit / totalIncome) * 10000) / 100 : 0
    };
  }

  async getStatsByField(fieldId) {
    await this.delay();
    const fieldExpenses = this.expenses.filter(expense => expense.fieldId === parseInt(fieldId));
    const fieldIncome = this.income.filter(income => income.fieldId === parseInt(fieldId));

    const totalExpenses = fieldExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = fieldIncome.reduce((sum, income) => sum + income.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      fieldId: parseInt(fieldId),
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      expenseCount: fieldExpenses.length,
      incomeCount: fieldIncome.length
    };
  }

  async getStatsByCrop(cropId) {
    await this.delay();
    const cropExpenses = this.expenses.filter(expense => expense.cropId === parseInt(cropId));
    const cropIncome = this.income.filter(income => income.cropId === parseInt(cropId));

    const totalExpenses = cropExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = cropIncome.reduce((sum, income) => sum + income.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      cropId: parseInt(cropId),
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      expenseCount: cropExpenses.length,
      incomeCount: cropIncome.length
    };
  }

  getExpenseCategories() {
    return [
      "Seeds",
      "Fertilizer",
      "Equipment",
      "Labor",
      "Fuel",
      "Maintenance",
      "Pesticides",
      "Utilities",
      "Insurance",
      "Other"
    ];
  }

  getUnits() {
    return [
      { value: "kg", label: "Kilograms (kg)" },
      { value: "lbs", label: "Pounds (lbs)" },
      { value: "tons", label: "Tons" },
      { value: "liters", label: "Liters" },
      { value: "gallons", label: "Gallons" },
      { value: "hours", label: "Hours" },
      { value: "units", label: "Units" }
    ];
  }
}

export default new FinancialService();