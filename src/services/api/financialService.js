class FinancialService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.expenseTableName = 'expense_c';
    this.incomeTableName = 'income_c';
    this.lookupFields = ['field_id_c', 'crop_id_c'];
  }

  // Expense methods
  async getAllExpenses() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "quantity_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "price_per_unit_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "supplier_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.expenseTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const expenses = response.data || [];
      
      // Enrich with field and crop names from lookup objects
      return expenses.map(expense => ({
        ...expense,
        fieldName: expense.field_id_c?.Name || 'Unknown Field',
        cropName: expense.crop_id_c?.Name || 'N/A'
      }));
    } catch (error) {
      console.error("Error fetching expenses:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getExpenseById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "quantity_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "price_per_unit_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "supplier_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.expenseTableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching expense with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async createExpense(expenseData) {
    try {
      const params = {
        records: [{
          Name: expenseData.description,
          category_c: expenseData.category,
          description_c: expenseData.description,
          amount_c: parseFloat(expenseData.amount),
          quantity_c: expenseData.quantity ? parseInt(expenseData.quantity) : null,
          unit_c: expenseData.unit,
          price_per_unit_c: expenseData.pricePerUnit ? parseFloat(expenseData.pricePerUnit) : null,
          date_c: expenseData.date,
          supplier_c: expenseData.supplier,
          notes_c: expenseData.notes,
          field_id_c: parseInt(expenseData.fieldId),
          crop_id_c: expenseData.cropId ? parseInt(expenseData.cropId) : null
        }]
      };

      const response = await this.apperClient.createRecord(this.expenseTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create expense ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating expense:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async updateExpense(id, expenseData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      if (expenseData.category) updateData.category_c = expenseData.category;
      if (expenseData.description) updateData.description_c = expenseData.description;
      if (expenseData.amount) updateData.amount_c = parseFloat(expenseData.amount);
      if (expenseData.quantity) updateData.quantity_c = parseInt(expenseData.quantity);
      if (expenseData.unit) updateData.unit_c = expenseData.unit;
      if (expenseData.pricePerUnit) updateData.price_per_unit_c = parseFloat(expenseData.pricePerUnit);
      if (expenseData.date) updateData.date_c = expenseData.date;
      if (expenseData.supplier) updateData.supplier_c = expenseData.supplier;
      if (expenseData.notes) updateData.notes_c = expenseData.notes;
      if (expenseData.fieldId) updateData.field_id_c = parseInt(expenseData.fieldId);
      if (expenseData.cropId !== undefined) updateData.crop_id_c = expenseData.cropId ? parseInt(expenseData.cropId) : null;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord(this.expenseTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update expense ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating expense:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async deleteExpense(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.expenseTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting expense:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Income methods
  async getAllIncome() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "crop_name_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "quantity_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "price_per_unit_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "buyer_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.incomeTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const incomeRecords = response.data || [];
      
      // Enrich with field and crop names from lookup objects
      return incomeRecords.map(income => ({
        ...income,
        fieldName: income.field_id_c?.Name || 'Unknown Field',
        cropName: income.crop_id_c?.Name || income.crop_name_c || 'N/A'
      }));
    } catch (error) {
      console.error("Error fetching income records:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getIncomeById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "crop_name_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "quantity_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "price_per_unit_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "buyer_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.incomeTableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching income record with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async createIncome(incomeData) {
    try {
      const params = {
        records: [{
          Name: incomeData.description,
          crop_name_c: incomeData.cropName,
          description_c: incomeData.description,
          amount_c: parseFloat(incomeData.amount),
          quantity_c: parseInt(incomeData.quantity),
          unit_c: incomeData.unit,
          price_per_unit_c: parseFloat(incomeData.pricePerUnit),
          date_c: incomeData.date,
          buyer_c: incomeData.buyer,
          notes_c: incomeData.notes,
          field_id_c: parseInt(incomeData.fieldId),
          crop_id_c: incomeData.cropId ? parseInt(incomeData.cropId) : null
        }]
      };

      const response = await this.apperClient.createRecord(this.incomeTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create income ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating income record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async updateIncome(id, incomeData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      if (incomeData.cropName) updateData.crop_name_c = incomeData.cropName;
      if (incomeData.description) updateData.description_c = incomeData.description;
      if (incomeData.amount) updateData.amount_c = parseFloat(incomeData.amount);
      if (incomeData.quantity) updateData.quantity_c = parseInt(incomeData.quantity);
      if (incomeData.unit) updateData.unit_c = incomeData.unit;
      if (incomeData.pricePerUnit) updateData.price_per_unit_c = parseFloat(incomeData.pricePerUnit);
      if (incomeData.date) updateData.date_c = incomeData.date;
      if (incomeData.buyer) updateData.buyer_c = incomeData.buyer;
      if (incomeData.notes) updateData.notes_c = incomeData.notes;
      if (incomeData.fieldId) updateData.field_id_c = parseInt(incomeData.fieldId);
      if (incomeData.cropId !== undefined) updateData.crop_id_c = incomeData.cropId ? parseInt(incomeData.cropId) : null;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord(this.incomeTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update income ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating income record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async deleteIncome(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.incomeTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting income record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Statistics and analytics
  async getStats() {
    try {
      const [expenses, income] = await Promise.all([
        this.getAllExpenses(),
        this.getAllIncome()
      ]);

      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount_c || 0), 0);
      const totalIncome = income.reduce((sum, incomeItem) => sum + (incomeItem.amount_c || 0), 0);
      const netProfit = totalIncome - totalExpenses;

      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyExpenses = expenses
        .filter(expense => new Date(expense.date_c) >= currentMonth)
        .reduce((sum, expense) => sum + (expense.amount_c || 0), 0);

      const monthlyIncome = income
        .filter(incomeItem => new Date(incomeItem.date_c) >= currentMonth)
        .reduce((sum, incomeItem) => sum + (incomeItem.amount_c || 0), 0);

      const expensesByCategory = {};
      expenses.forEach(expense => {
        const category = expense.category_c || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (expense.amount_c || 0);
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
    } catch (error) {
      console.error("Error getting financial stats:", error?.response?.data?.message || error.message);
      return {
        totalExpenses: 0,
        totalIncome: 0,
        netProfit: 0,
        monthlyExpenses: 0,
        monthlyIncome: 0,
        expensesByCategory: {},
        profitMargin: 0
      };
    }
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