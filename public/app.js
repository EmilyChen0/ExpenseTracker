class ExpenseTracker {
    constructor() {
        this.form = document.getElementById('expenseForm');
        this.expensesList = document.getElementById('expensesList');
        this.initializeEventListeners();
        this.loadExpenses();
        this.setTodayDate();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
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
            const response = await fetch('/api/expenses');
            const expenses = await response.json();
            this.renderExpenses(expenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    renderExpenses(expenses) {
        this.expensesList.innerHTML = expenses.map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <span class="amount">$${expense.amount}</span>
                    <span>${expense.description}</span>
                    <span class="category">${expense.category}</span>
                    <span>${new Date(expense.date).toLocaleDateString()}</span>
                </div>
                <button class="delete-btn" onclick="app.deleteExpense(${expense.id})">Delete</button>
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

const app = new ExpenseTracker();