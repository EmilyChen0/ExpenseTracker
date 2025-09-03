class ExpenseTracker {
    constructor() {
        this.form = document.getElementById('expenseForm');
        this.expensesList = document.getElementById('expensesList');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.totalAmount = document.getElementById('totalAmount');
        this.initializeEventListeners();
        this.loadExpenses();
        this.setTodayDate();
        this.loadCategories();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.loadExpenses());
        }
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            amount: parseFloat(document.getElementById('amount').value),
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.form.reset();
                this.setTodayDate();
                this.loadExpenses();
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    }

    async loadExpenses() {
        try {
            let url = '/api/expenses';
            if (this.categoryFilter && this.categoryFilter.value !== 'all') {
                url += `?category=${this.categoryFilter.value}`;
            }
            
            const response = await fetch(url);
            const expenses = await response.json();
            this.renderExpenses(expenses);
            this.updateTotal(expenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    renderExpenses(expenses) {
        this.expensesList.innerHTML = expenses.map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="expense-info">
                    <span class="amount">$${expense.amount}</span>
                    <span>${expense.description}</span>
                    <span class="category">${expense.category}</span>
                    <span>${new Date(expense.date).toLocaleDateString()}</span>
                </div>
                <div class="expense-actions">
                    <button class="edit-btn" onclick="app.editExpense(${expense.id})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteExpense(${expense.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async deleteExpense(id) {
        if (confirm('Delete this expense?')) {
            try {
                const response = await fetch(`/api/expenses/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.loadExpenses();
                }
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    }
}

    async loadCategories() {
        try {
            const response = await fetch('/api/expenses/categories');
            const categories = await response.json();
            
            if (this.categoryFilter) {
                this.categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
                    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    updateTotal(expenses) {
        const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        if (this.totalAmount) {
            this.totalAmount.textContent = `$${total.toFixed(2)}`;
        }
    }

    editExpense(id) {
        const expenseItem = document.querySelector(`.expense-item[data-id="${id}"]`);
        const expenseInfo = expenseItem.querySelector('.expense-info');
        const spans = expenseInfo.querySelectorAll('span');
        
        const currentData = {
            amount: spans[0].textContent.replace('$', ''),
            description: spans[1].textContent,
            category: spans[2].textContent,
            date: new Date(spans[3].textContent).toISOString().split('T')[0]
        };
        
        expenseInfo.innerHTML = `
            <input type="number" step="0.01" value="${currentData.amount}" class="edit-amount">
            <input type="text" value="${currentData.description}" class="edit-description">
            <select class="edit-category">
                <option value="food" ${currentData.category === 'food' ? 'selected' : ''}>Food</option>
                <option value="transport" ${currentData.category === 'transport' ? 'selected' : ''}>Transport</option>
                <option value="entertainment" ${currentData.category === 'entertainment' ? 'selected' : ''}>Entertainment</option>
                <option value="utilities" ${currentData.category === 'utilities' ? 'selected' : ''}>Utilities</option>
                <option value="other" ${currentData.category === 'other' ? 'selected' : ''}>Other</option>
            </select>
            <input type="date" value="${currentData.date}" class="edit-date">
        `;
        
        const actions = expenseItem.querySelector('.expense-actions');
        actions.innerHTML = `
            <button class="save-btn" onclick="app.saveExpense(${id})">Save</button>
            <button class="cancel-btn" onclick="app.cancelEdit(${id})">Cancel</button>
        `;
        
        expenseItem.classList.add('editing');
    }
    
    async saveExpense(id) {
        const expenseItem = document.querySelector(`.expense-item[data-id="${id}"]`);
        const amount = expenseItem.querySelector('.edit-amount').value;
        const description = expenseItem.querySelector('.edit-description').value;
        const category = expenseItem.querySelector('.edit-category').value;
        const date = expenseItem.querySelector('.edit-date').value;
        
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, description, category, date })
            });
            
            if (response.ok) {
                this.loadExpenses();
            }
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    }
    
    cancelEdit(id) {
        this.loadExpenses();
    }
}

const app = new ExpenseTracker();