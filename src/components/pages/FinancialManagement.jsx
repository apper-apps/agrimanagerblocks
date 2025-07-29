import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import AddExpenseModal from "@/components/organisms/AddExpenseModal";
import AddIncomeModal from "@/components/organisms/AddIncomeModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import financialService from "@/services/api/financialService";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const FinancialManagement = () => {
  const [stats, setStats] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [statsData, expensesData, incomeData, fieldsData, cropsData] = await Promise.all([
        financialService.getStats(),
        financialService.getAllExpenses(),
        financialService.getAllIncome(),
        fieldService.getAll(),
        cropService.getAll()
      ]);
      
      setStats(statsData);
      setExpenses(expensesData);
      setIncome(incomeData);
      setFields(fieldsData);
      setCrops(cropsData);
    } catch (err) {
      setError("Failed to load financial data. Please try again.");
      console.error("Error loading financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSuccess = () => {
    setShowExpenseModal(false);
    loadData();
    toast.success("Expense added successfully!");
  };

  const handleIncomeSuccess = () => {
    setShowIncomeModal(false);
    loadData();
    toast.success("Income recorded successfully!");
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await financialService.deleteExpense(id);
      loadData();
      toast.success("Expense deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income record?")) return;

    try {
      await financialService.deleteIncome(id);
      loadData();
      toast.success("Income record deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete income record. Please try again.");
    }
  };

  const filterTransactions = (transactions) => {
    return transactions.filter(transaction => {
      const matchesSearch = !searchTerm || 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.buyer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
      const matchesField = !fieldFilter || transaction.fieldId === parseInt(fieldFilter);

      const transactionDate = new Date(transaction.date);
      const matchesDateRange = (!dateRange.start || transactionDate >= new Date(dateRange.start)) &&
                              (!dateRange.end || transactionDate <= new Date(dateRange.end));

      return matchesSearch && matchesCategory && matchesField && matchesDateRange;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const filteredExpenses = filterTransactions(expenses);
  const filteredIncome = filterTransactions(income);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Track farm expenses and income for profitability analysis</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} />
            Add Expense
          </Button>
          <Button onClick={() => setShowIncomeModal(true)} className="flex items-center gap-2">
            <ApperIcon name="TrendingUp" size={16} />
            Record Income
          </Button>
        </div>
      </div>

      {/* Financial Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses || 0)}
          icon="TrendingDown"
          className="text-red-600"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome || 0)}
          icon="TrendingUp"
          className="text-green-600"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(stats.netProfit || 0)}
          icon={stats.netProfit >= 0 ? "TrendingUp" : "TrendingDown"}
          className={stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          title="Profit Margin"
          value={`${stats.profitMargin || 0}%`}
          icon="Target"
          className={stats.profitMargin >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: "BarChart3" },
            { id: "expenses", label: "Expenses", icon: "TrendingDown" },
            { id: "income", label: "Income", icon: "TrendingUp" },
            { id: "analytics", label: "Analytics", icon: "PieChart" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {(activeTab === "expenses" || activeTab === "income") && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {activeTab === "expenses" && (
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {financialService.getExpenseCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Fields</option>
                {fields.map((field) => (
                  <option key={field.Id} value={field.Id}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expenses</span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(stats.monthlyExpenses || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Income</span>
                <span className="text-green-600 font-medium">
                  {formatCurrency(stats.monthlyIncome || 0)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Net Profit</span>
                  <span className={`font-medium ${
                    (stats.monthlyIncome || 0) - (stats.monthlyExpenses || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency((stats.monthlyIncome || 0) - (stats.monthlyExpenses || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.expensesByCategory || {}).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredExpenses.length === 0 ? (
            <Empty 
              message="No expenses found" 
              description="Add your first expense to start tracking farm costs"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          {expense.supplier && (
                            <div className="text-gray-500">Supplier: {expense.supplier}</div>
                          )}
                          {expense.notes && (
                            <div className="text-gray-500 text-xs mt-1">{expense.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.fieldName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteExpense(expense.Id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "income" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredIncome.length === 0 ? (
            <Empty 
              message="No income records found" 
              description="Record your first sale to start tracking farm income"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIncome.map((income) => (
                    <tr key={income.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(income.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{income.description}</div>
                          {income.buyer && (
                            <div className="text-gray-500">Buyer: {income.buyer}</div>
                          )}
                          {income.notes && (
                            <div className="text-gray-500 text-xs mt-1">{income.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.cropName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.fieldName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.quantity} {income.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(income.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteIncome(income.Id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Profitability */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Profitability</h3>
            <div className="space-y-4">
              {fields.map((field) => {
                const fieldExpenses = expenses.filter(e => e.fieldId === field.Id);
                const fieldIncome = income.filter(i => i.fieldId === field.Id);
                const totalExpenses = fieldExpenses.reduce((sum, e) => sum + e.amount, 0);
                const totalIncome = fieldIncome.reduce((sum, i) => sum + i.amount, 0);
                const netProfit = totalIncome - totalExpenses;

                return (
                  <div key={field.Id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{field.name}</h4>
                      <span className={`font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Income: </span>
                        <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expenses: </span>
                        <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crop Profitability */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Profitability</h3>
            <div className="space-y-4">
              {crops.map((crop) => {
                const cropExpenses = expenses.filter(e => e.cropId === crop.Id);
                const cropIncome = income.filter(i => i.cropId === crop.Id);
                const totalExpenses = cropExpenses.reduce((sum, e) => sum + e.amount, 0);
                const totalIncome = cropIncome.reduce((sum, i) => sum + i.amount, 0);
                const netProfit = totalIncome - totalExpenses;

                return (
                  <div key={crop.Id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{crop.name}</h4>
                      <span className={`font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Income: </span>
                        <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expenses: </span>
                        <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={handleExpenseSuccess}
      />
      <AddIncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSuccess={handleIncomeSuccess}
      />
    </div>
  );
};

export default FinancialManagement;