import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// TypeScript interfaces
interface Account {
  id: string;
  name: string;
  interest?: string;
  balance: number;
}

interface NetworthEntry {
  date: string;
  value: number;
}

interface RetirementMilestone {
  id: string;
  date: string;
  achievement: string;
  isCustom?: boolean;
}

interface ContributionChange {
  id: string;
  date: string;
  amount: number;
}

const FinanceTracker: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  
  // Account data
  const [bankAccounts, setBankAccounts] = useState<Account[]>([
    { id: '1', name: 'Bank of America Checking', interest: '0.03% APY', balance: 5000 },
    { id: '2', name: 'Bank of America Saving', interest: '2.2% APY', balance: 16000 }
  ]);
  
  const [creditCards, setCreditCards] = useState<Account[]>([
    { id: '1', name: 'Chase Saphire', balance: 1500 },
    { id: '2', name: 'Wells Fargo Card', balance: 1000 }
  ]);
  
  const [investments, setInvestments] = useState<Account[]>([
    { id: '1', name: 'Fidelity account(401k)', balance: 5000 },
    { id: '2', name: 'House equity', balance: 20000 },
    { id: '3', name: 'Home loan', balance: -30000 }
  ]);
  
  // Networth history
  const [networthHistory, setNetworthHistory] = useState<NetworthEntry[]>([
    { date: '2024-11', value: 5000 },
    { date: '2024-12', value: 7000 },
    { date: '2025-01', value: 6500 },
    { date: '2025-02', value: 8000 },
    { date: '2025-03', value: 12000 }
  ]);
  
  // State for new account form
  const [showNewAccountForm, setShowNewAccountForm] = useState<boolean>(false);
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [newAccountBalance, setNewAccountBalance] = useState<string>('');
  const [newAccountInterest, setNewAccountInterest] = useState<string>('');
  const [newAccountType, setNewAccountType] = useState<string>('bank');

  // State for new networth entry form
  const [showNewNetworthForm, setShowNewNetworthForm] = useState<boolean>(false);
  const [newNetworthDate, setNewNetworthDate] = useState<string>('');
  const [newNetworthValue, setNewNetworthValue] = useState<string>('');
  
  // State for emergency fund settings
  const [showEmergencyFundSettings, setShowEmergencyFundSettings] = useState<boolean>(false);
  
  // Emergency fund settings
  const [emergencyFundGoal, setEmergencyFundGoal] = useState<number>(20000);
  const [emergencyFundAccountId, setEmergencyFundAccountId] = useState<string>('2'); // Default to second account
  
  // Investment settings
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(7);
  const [contributionChanges, setContributionChanges] = useState<ContributionChange[]>([
    { id: '1', date: '2026-01', amount: 700 }
  ]);
  
  // State for new contribution change form
  const [showNewContributionForm, setShowNewContributionForm] = useState<boolean>(false);
  const [newContributionDate, setNewContributionDate] = useState<string>('');
  const [newContributionAmount, setNewContributionAmount] = useState<string>('');
  
  // Retirement milestone settings
  const [retirementMilestones, setRetirementMilestones] = useState<RetirementMilestone[]>([
    { id: '1', date: 'Dec 2026', achievement: 'House paid', isCustom: true },
    { id: '2', date: 'March 2027', achievement: '20k contributed', isCustom: false },
    { id: '3', date: '2028', achievement: 'Expected promotion', isCustom: true },
    { id: '4', date: '2030', achievement: '100k contributed', isCustom: false },
    { id: '5', date: '2045', achievement: 'Retirement', isCustom: true }
  ]);
  
  // State for new milestone form
  const [showNewMilestoneForm, setShowNewMilestoneForm] = useState<boolean>(false);
  const [newMilestoneDate, setNewMilestoneDate] = useState<string>('');
  const [newMilestoneAchievement, setNewMilestoneAchievement] = useState<string>('');
  
  // Emergency fund progress
  const emergencyFundAccount = bankAccounts.find(account => account.id === emergencyFundAccountId);
  const emergencyFundCurrent = emergencyFundAccount ? emergencyFundAccount.balance : 0;
  const emergencyFundPercentage = (emergencyFundCurrent / emergencyFundGoal) * 100;
  
  // Calculate current net worth
  const calculateNetWorth = (): number => {
    const bankTotal = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
    const creditCardTotal = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const investmentTotal = investments.reduce((sum, inv) => sum + inv.balance, 0);
    
    return bankTotal - creditCardTotal + investmentTotal;
  };
  
  const currentNetWorth = calculateNetWorth();
  
  // Project future investment value based on monthly contributions and annual return rate
  const projectInvestmentGrowth = (
    currentTotal: number,
    monthlyContribution: number,
    annualReturnRate: number,
    years: number,
    contributionChanges: ContributionChange[]
  ): { date: string; value: number }[] => {
    const projections: { date: string; value: number }[] = [];
    const monthlyRate = annualReturnRate / 100 / 12;
    let totalValue = currentTotal;
    const currentDate = new Date();
    
    // Sort contribution changes by date
    const sortedChanges = [...contributionChanges].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let currentContribution = monthlyContribution;
    let nextChangeIndex = 0;
    
    for (let month = 1; month <= years * 12; month++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setMonth(currentDate.getMonth() + month);
      
      // Check if there's a contribution change this month
      const yearMonth = `${projectionDate.getFullYear()}-${String(projectionDate.getMonth() + 1).padStart(2, '0')}`;
      
      while (
        nextChangeIndex < sortedChanges.length && 
        sortedChanges[nextChangeIndex].date <= yearMonth
      ) {
        currentContribution = sortedChanges[nextChangeIndex].amount;
        nextChangeIndex++;
      }
      
      // Calculate growth for this month
      totalValue = totalValue * (1 + monthlyRate) + currentContribution;
      
      // Add projection point every 6 months
      if (month % 6 === 0) {
        projections.push({
          date: projectionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          value: Math.round(totalValue)
        });
      }
    }
    
    return projections;
  };
  
  // Generate automatic retirement milestones based on projected growth
  const generateAutoMilestones = (): RetirementMilestone[] => {
    const currentInvestmentTotal = investments
      .filter(inv => inv.balance > 0)
      .reduce((sum, inv) => sum + inv.balance, 0);
    
    const projections = projectInvestmentGrowth(
      currentInvestmentTotal,
      monthlyContribution,
      annualReturnRate,
      25,
      contributionChanges
    );
    
    const autoMilestones: RetirementMilestone[] = [];
    const milestoneValues = [50000, 100000, 250000, 500000, 1000000];
    
    for (const milestoneValue of milestoneValues) {
      // Find first projection that exceeds the milestone value
      const milestone = projections.find(p => p.value >= milestoneValue);
      if (milestone) {
        autoMilestones.push({
          id: `auto-${milestoneValue}`,
          date: milestone.date,
          achievement: `$${(milestoneValue).toLocaleString()} saved`,
          isCustom: false
        });
      }
    }
    
    return autoMilestones;
  };
  
  // Combine auto and custom milestones
  const getAllMilestones = (): RetirementMilestone[] => {
    const customMilestones = retirementMilestones.filter(m => m.isCustom);
    const autoMilestones = generateAutoMilestones();
    
    return [...customMilestones, ...autoMilestones].sort((a, b) => {
      // Parse dates to comparable format
      const dateA = a.date.includes('-') ? new Date(a.date) : new Date(a.date);
      const dateB = b.date.includes('-') ? new Date(b.date) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  // Update networth history with current value
  useEffect(() => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if we already have an entry for the current month
    const existingEntryIndex = networthHistory.findIndex(entry => entry.date === dateKey);
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedHistory = [...networthHistory];
      updatedHistory[existingEntryIndex].value = currentNetWorth;
      setNetworthHistory(updatedHistory);
    } else {
      // Add new entry
      setNetworthHistory([...networthHistory, { date: dateKey, value: currentNetWorth }]);
    }
  }, [bankAccounts, creditCards, investments]);
  
  // Format networth history for chart
  const formatNetworthData = () => {
    return networthHistory
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(entry => {
        const [year, month] = entry.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: entry.value
        };
      });
  };
  
  // Add new account
  const handleAddAccount = () => {
    const balance = parseFloat(newAccountBalance);
    if (!newAccountName || isNaN(balance)) return;
    
    const newAccount: Account = {
      id: Date.now().toString(),
      name: newAccountName,
      balance: balance,
      ...(newAccountInterest && { interest: newAccountInterest })
    };
    
    if (newAccountType === 'bank') {
      setBankAccounts([...bankAccounts, newAccount]);
    } else if (newAccountType === 'credit') {
      setCreditCards([...creditCards, newAccount]);
    } else if (newAccountType === 'investment') {
      setInvestments([...investments, newAccount]);
    }
    
    // Reset form
    setNewAccountName('');
    setNewAccountBalance('');
    setNewAccountInterest('');
    setShowNewAccountForm(false);
  };
  
  // Add new networth entry
  const handleAddNetworthEntry = () => {
    const value = parseFloat(newNetworthValue);
    if (!newNetworthDate || isNaN(value)) return;
    
    const dateFormatted = newNetworthDate.substring(0, 7); // Extract YYYY-MM part
    
    // Check if entry for this date already exists
    const existingEntryIndex = networthHistory.findIndex(entry => entry.date === dateFormatted);
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedHistory = [...networthHistory];
      updatedHistory[existingEntryIndex].value = value;
      setNetworthHistory(updatedHistory);
    } else {
      // Add new entry
      setNetworthHistory([...networthHistory, { date: dateFormatted, value: value }]);
    }
    
    // Reset form
    setNewNetworthDate('');
    setNewNetworthValue('');
    setShowNewNetworthForm(false);
  };
  
  // Add new contribution change
  const handleAddContributionChange = () => {
    if (!newContributionDate || !newContributionAmount) return;
    
    const amount = parseFloat(newContributionAmount);
    if (isNaN(amount)) return;
    
    const dateFormatted = newContributionDate.substring(0, 7); // Extract YYYY-MM part
    
    const newChange: ContributionChange = {
      id: Date.now().toString(),
      date: dateFormatted,
      amount: amount
    };
    
    setContributionChanges([...contributionChanges, newChange]);
    
    // Reset form
    setNewContributionDate('');
    setNewContributionAmount('');
    setShowNewContributionForm(false);
  };
  
  // Delete contribution change
  const handleDeleteContributionChange = (id: string) => {
    setContributionChanges(contributionChanges.filter(change => change.id !== id));
  };
  
  // Add new milestone
  const handleAddMilestone = () => {
    if (!newMilestoneDate || !newMilestoneAchievement) return;
    
    const newMilestone: RetirementMilestone = {
      id: Date.now().toString(),
      date: new Date(newMilestoneDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      achievement: newMilestoneAchievement,
      isCustom: true
    };
    
    setRetirementMilestones([...retirementMilestones, newMilestone]);
    
    // Reset form
    setNewMilestoneDate('');
    setNewMilestoneAchievement('');
    setShowNewMilestoneForm(false);
  };
  
  // Delete milestone
  const handleDeleteMilestone = (id: string) => {
    setRetirementMilestones(retirementMilestones.filter(milestone => milestone.id !== id));
  };
  
  // Update account balance
  const handleUpdateBalance = (
    accountId: string, 
    newBalance: string, 
    accountType: 'bank' | 'credit' | 'investment'
  ) => {
    const balance = parseFloat(newBalance);
    if (isNaN(balance)) return;
    
    if (accountType === 'bank') {
      setBankAccounts(bankAccounts.map(account => 
        account.id === accountId ? { ...account, balance } : account
      ));
    } else if (accountType === 'credit') {
      setCreditCards(creditCards.map(account => 
        account.id === accountId ? { ...account, balance } : account
      ));
    } else if (accountType === 'investment') {
      setInvestments(investments.map(account => 
        account.id === accountId ? { ...account, balance } : account
      ));
    }
  };
  
  // Delete account
  const handleDeleteAccount = (
    accountId: string, 
    accountType: 'bank' | 'credit' | 'investment'
  ) => {
    if (accountType === 'bank') {
      setBankAccounts(bankAccounts.filter(account => account.id !== accountId));
    } else if (accountType === 'credit') {
      setCreditCards(creditCards.filter(account => account.id !== accountId));
    } else if (accountType === 'investment') {
      setInvestments(investments.filter(account => account.id !== accountId));
    }
  };
  
  // New Account Form
  const renderNewAccountForm = () => (
    <div className="new-account-form mt-4 p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-bold mb-2">Add New Account</h3>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Account Type</label>
        <select 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newAccountType}
          onChange={(e) => setNewAccountType(e.target.value)}
        >
          <option value="bank">Bank Account</option>
          <option value="credit">Credit Card</option>
          <option value="investment">Investment</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Account Name</label>
        <input 
          type="text" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder="Account name"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Balance</label>
        <input 
          type="number" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newAccountBalance}
          onChange={(e) => setNewAccountBalance(e.target.value)}
          placeholder="0.00"
        />
      </div>
      {newAccountType === 'bank' && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Interest Rate (optional)</label>
          <input 
            type="text" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            value={newAccountInterest}
            onChange={(e) => setNewAccountInterest(e.target.value)}
            placeholder="e.g. 2.5% APY"
          />
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
          onClick={() => setShowNewAccountForm(false)}
        >
          Cancel
        </button>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleAddAccount}
        >
          Add Account
        </button>
      </div>
    </div>
  );
  
  // New Networth Entry Form
  const renderNewNetworthForm = () => (
    <div className="new-networth-form mt-4 p-4 border border-gray-300 rounded-md bg-white shadow-md">
      <h3 className="text-lg font-bold mb-2">Add Historical Net Worth</h3>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input 
          type="month" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newNetworthDate}
          onChange={(e) => setNewNetworthDate(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Net Worth Value</label>
        <input 
          type="number" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newNetworthValue}
          onChange={(e) => setNewNetworthValue(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
          onClick={() => setShowNewNetworthForm(false)}
        >
          Cancel
        </button>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleAddNetworthEntry}
        >
          Add Entry
        </button>
      </div>
    </div>
  );
  
  // New Contribution Change Form
  const renderNewContributionForm = () => (
    <div className="new-contribution-form mt-4 p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-bold mb-2">Schedule Contribution Change</h3>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Starting Date</label>
        <input 
          type="month" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newContributionDate}
          onChange={(e) => setNewContributionDate(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">New Monthly Contribution</label>
        <input 
          type="number" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newContributionAmount}
          onChange={(e) => setNewContributionAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
          onClick={() => setShowNewContributionForm(false)}
        >
          Cancel
        </button>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleAddContributionChange}
        >
          Add Change
        </button>
      </div>
    </div>
  );
  
  // New Milestone Form
  const renderNewMilestoneForm = () => (
    <div className="new-milestone-form mt-4 p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-bold mb-2">Add Custom Milestone</h3>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input 
          type="month" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newMilestoneDate}
          onChange={(e) => setNewMilestoneDate(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Achievement</label>
        <input 
          type="text" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={newMilestoneAchievement}
          onChange={(e) => setNewMilestoneAchievement(e.target.value)}
          placeholder="e.g. House paid off"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
          onClick={() => setShowNewMilestoneForm(false)}
        >
          Cancel
        </button>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleAddMilestone}
        >
          Add Milestone
        </button>
      </div>
    </div>
  );
  
  // Account state for editing
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');
  
  // Render account item with edit functionality
  const renderAccountItem = (account: Account, type: 'bank' | 'credit' | 'investment') => {
    const isEditing = editingAccountId === account.id;
    
    const startEditing = (account: Account) => {
      setEditingAccountId(account.id);
      setEditBalance(account.balance.toString());
    };
    
    const cancelEditing = () => {
      setEditingAccountId(null);
      setEditBalance('');
    };
    
    const saveEditing = (accountId: string, type: 'bank' | 'credit' | 'investment') => {
      handleUpdateBalance(accountId, editBalance, type);
      setEditingAccountId(null);
    };
    
    return (
      <div key={account.id} className="account-box border border-gray-300 p-3 mb-3">
        {isEditing ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                {type === 'bank' && account.id === emergencyFundAccountId && <span className="text-red-500">★</span>} 
                {account.name} {account.interest && <span className="text-xs text-gray-500">{account.interest}</span>}
              </div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="text-sm bg-gray-200 px-2 py-1 rounded"
                onClick={cancelEditing}
              >
                Cancel
              </button>
              <button 
                className="text-sm bg-green-600 text-white px-2 py-1 rounded"
                onClick={() => saveEditing(account.id, type)}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center">
              <div>
                {type === 'bank' && account.id === emergencyFundAccountId && <span className="text-red-500">★</span>} 
                {account.name} {account.interest && <span className="text-xs text-gray-500">{account.interest}</span>}
              </div>
              <div className="text-right font-bold">{account.balance.toLocaleString()}</div>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <button 
                className="text-xs text-gray-600"
                onClick={() => startEditing(account)}
              >
                Edit
              </button>
              <button 
                className="text-xs text-red-600"
                onClick={() => handleDeleteAccount(account.id, type)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Page content based on current page
  const renderPageContent = () => {
    switch(currentPage) {
      case 'home':
        return (
          <div className="page-content">
            <h2 className="text-xl font-bold mb-4">Current Networth: {currentNetWorth.toLocaleString()}</h2>
            <div className="chart-container h-64 w-full border border-gray-300 mb-6 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatNetworthData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="flex justify-end mt-2">
                <button 
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded-md"
                  onClick={() => setShowNewNetworthForm(!showNewNetworthForm)}
                >
                  {showNewNetworthForm ? 'Cancel' : 'Add Historical Data'}
                </button>
              </div>
              
              {showNewNetworthForm && renderNewNetworthForm()}
            </div>
            
            <h2 className="text-xl font-bold mb-4">Primary goal</h2>
            <div className="primary-goal-container h-32 w-full border border-gray-300"></div>
          </div>
        );
      
      case 'money':
        return (
          <div className="page-content">
            <h2 className="text-xl font-bold mb-4">Checking/Saving</h2>
            {bankAccounts.map(account => renderAccountItem(account, 'bank'))}
            
            <h2 className="text-xl font-bold my-4">Credit Card</h2>
            {creditCards.map(account => renderAccountItem(account, 'credit'))}
            
            <div className="mt-4 flex justify-center">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-md"
                onClick={() => setShowNewAccountForm(!showNewAccountForm)}
              >
                {showNewAccountForm ? 'Cancel' : 'Add New Account'}
              </button>
            </div>
            
            {showNewAccountForm && renderNewAccountForm()}
          </div>
        );
      
      case 'retirement':
        return (
          <div className="page-content">
            <h2 className="text-xl font-bold mb-4">Retirement timeline</h2>
            <div className="timeline-container relative w-full">
              <div className="timeline-line absolute left-1/2 top-0 bottom-0 w-1 bg-black"></div>
              
              {getAllMilestones().map((milestone, index) => (
                <div key={index} className="milestone-row flex items-center justify-between mb-8 relative">
                  <div className="date w-1/3 text-right pr-4">{milestone.date}</div>
                  <div className="milestone-dot absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black rounded-full"></div>
                  <div className="achievement w-1/3 pl-4">
                    <span>{milestone.achievement}</span>
                    {milestone.isCustom && (
                      <button 
                        className="ml-2 text-xs text-red-600"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-md"
                onClick={() => setShowNewMilestoneForm(!showNewMilestoneForm)}
              >
                {showNewMilestoneForm ? 'Cancel' : 'Add Custom Milestone'}
              </button>
            </div>
            
            {showNewMilestoneForm && renderNewMilestoneForm()}
            
            <div className="text-gray-700 italic mt-4">
              Note: System-generated milestones are based on your investment projection settings.
              Custom milestones are marked with ✕ and can be deleted.
            </div>
          </div>
        );
      
      case 'investments':
        return (
          <div className="page-content">
            <h2 className="text-xl font-bold mb-4">Current Investments: {
              investments.filter(inv => inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0).toLocaleString()
            }</h2>
            
            {investments.map(investment => renderAccountItem(investment, 'investment'))}
            
            <div className="mt-4 flex justify-center">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setNewAccountType('investment');
                  setShowNewAccountForm(!showNewAccountForm);
                }}
              >
                {showNewAccountForm ? 'Cancel' : 'Add New Investment'}
              </button>
            </div>
            
            {showNewAccountForm && newAccountType === 'investment' && renderNewAccountForm()}
          </div>
        );
        
      case 'settings':
        return (
          <div className="page-content">
            <h2 className="text-xl font-bold mb-4">Investment Settings</h2>
            
            <div className="settings-section p-4 border border-gray-300 rounded-md mb-4">
              <h3 className="text-lg font-medium mb-3">Monthly Contribution</h3>
              <div className="flex items-center mb-4">
                <input 
                  type="number" 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md mr-2"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                />
                <span>per month</span>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Expected Return Rate</h3>
              <div className="flex items-center mb-4">
                <input 
                  type="number" 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md mr-2"
                  value={annualReturnRate}
                  onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
                  step="0.1"
                />
                <span>% per year</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Scheduled Contribution Changes</h2>
            <div className="settings-section p-4 border border-gray-300 rounded-md mb-4">
              {contributionChanges.length === 0 ? (
                <p className="text-gray-500">No scheduled changes yet</p>
              ) : (
                <div>
                  {contributionChanges
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(change => (
                      <div key={change.id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">
                            {new Date(change.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                          <span className="mx-2">→</span>
                          <span>${change.amount}/month</span>
                        </div>
                        <button 
                          className="text-red-600 text-sm"
                          onClick={() => handleDeleteContributionChange(change.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-md"
                  onClick={() => setShowNewContributionForm(!showNewContributionForm)}
                >
                  {showNewContributionForm ? 'Cancel' : 'Schedule Contribution Change'}
                </button>
              </div>
              
              {showNewContributionForm && renderNewContributionForm()}
            </div>
            
            <h2 className="text-xl font-bold mb-4">Projected Growth</h2>
            <div className="chart-container h-64 w-full border border-gray-300 mb-6 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={projectInvestmentGrowth(
                    investments.filter(inv => inv.balance > 0).reduce((sum, inv) => sum + inv.balance, 0),
                    monthlyContribution,
                    annualReturnRate,
                    20,
                    contributionChanges
                  )} 
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Projected Value']} />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-gray-700 italic mt-2 text-sm">
                Projection based on current settings and scheduled contribution changes
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Page not found</div>;
    }
  };
  
  return (
    <div className="finance-tracker-app max-w-md mx-auto bg-gray-100 min-h-screen">
      <div className="app-container border-2 border-green-600 bg-white">
        {/* Header with page title */}
        <div className="header text-center p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold">{
            currentPage === 'home' ? 'Home page' : 
            currentPage === 'money' ? 'Money page' : 
            currentPage === 'retirement' ? 'Retirement page' :
            currentPage === 'investments' ? 'Investment page' :
            'Settings page'
          }</h1>
        </div>
        
        {/* Emergency fund progress */}
        <div className="emergency-fund-container border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="w-1/3">
              <p className="text-sm">Progress to emergency fund</p>
              <button 
                className="text-xs text-green-600 mt-1"
                onClick={() => setShowEmergencyFundSettings(!showEmergencyFundSettings)}
              >
                {showEmergencyFundSettings ? 'Hide settings' : 'Edit settings'}
              </button>
            </div>
            <div className="w-2/3 relative h-6">
              <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-full">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-600 rounded-full"
                  style={{ width: `${Math.min(emergencyFundPercentage, 100)}%` }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-sm">
                  {Math.min(emergencyFundPercentage, 100).toFixed(0)}%
                </div>
                <div className="absolute top-0 right-0 -mt-4">
                  {emergencyFundCurrent.toLocaleString()} / {emergencyFundGoal.toLocaleString()}
                </div>
                <div className="absolute top-0 right-12 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Emergency fund settings panel */}
          {showEmergencyFundSettings && (
            <div className="emergency-fund-settings mt-4 p-3 bg-gray-100 rounded-md">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Fund Target</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={emergencyFundGoal}
                  onChange={(e) => setEmergencyFundGoal(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Account</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={emergencyFundAccountId}
                  onChange={(e) => setEmergencyFundAccountId(e.target.value)}
                >
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Page specific content */}
        <div className="page-content p-4">
          {renderPageContent()}
        </div>
        
        {/* Navigation bar */}
        <div className="nav-bar flex justify-between border-t border-gray-200">
          <button 
            className="nav-button flex-1 p-4 border-r border-gray-200 flex flex-col items-center"
            onClick={() => setCurrentPage('home')}
          >
            <div className="icon h-6 w-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </button>
          
          <button 
            className="nav-button flex-1 p-4 border-r border-gray-200 flex flex-col items-center"
            onClick={() => setCurrentPage('money')}
          >
            <div className="icon h-6 w-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </button>
          
          <button 
            className="nav-button flex-1 p-4 border-r border-gray-200 flex flex-col items-center"
            onClick={() => setCurrentPage('retirement')}
          >
            <div className="icon h-6 w-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </button>
          
          <button 
            className="nav-button flex-1 p-4 border-r border-gray-200 flex flex-col items-center"
            onClick={() => setCurrentPage('investments')}
          >
            <div className="icon h-6 w-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </button>
          
          <button 
            className="nav-button flex-1 p-4 flex flex-col items-center"
            onClick={() => setCurrentPage('settings')}
          >
            <div className="icon h-6 w-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceTracker;