document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('moneyForm');
    const resetButton = document.getElementById('resetButton');
    const toggleTableButton = document.getElementById('toggleTableButton');
    const paymentTable = document.getElementById('paymentTable');
    const paymentTableBody = document.getElementById('paymentTableBody');
    const totalAmountDisplay = document.getElementById('totalAmount');
    const amountRemainingDisplay = document.getElementById('amountRemaining');
    const progressBar = document.getElementById('progressBar');
    const goalInput = document.getElementById('goal');
    const filterCompany = document.getElementById('filterCompany');

    let goal = 0;
    let transactions = []; // Variable para almacenar todas las transacciones

    // Función para cargar el JSON desde el servidor
    function loadMoneyData() {
        return fetch('/api/moneyData')
            .then(response => response.json())
            .catch(error => console.error('Error al cargar los datos:', error));
    }

    // Función para guardar una transacción en el servidor
    function saveTransaction(transaction) {
        return fetch('/api/moneyData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transaction })
        }).catch(error => console.error('Error al guardar los datos:', error));
    }

    // Función para reiniciar el monto en el servidor
    function resetMoneyData() {
        return fetch('/api/resetMoney', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
          .catch(error => console.error('Error al reiniciar los datos:', error));
    }

    // Función para actualizar la visualización del monto acumulado
    function updateTotalAmountDisplay(transactionsToShow) {
        const totalAmount = transactionsToShow.reduce((sum, transaction) => sum + transaction.amount, 0);
        totalAmountDisplay.textContent = `Monto acumulado: ${totalAmount.toFixed(2)}`;
        updateProgressBar(totalAmount);
        updateAmountRemaining(totalAmount);
    }

    // Función para llenar la tabla con los pagos registrados
    function fillPaymentTable(transactionsToShow) {
        paymentTableBody.innerHTML = '';
        transactionsToShow.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${transaction.company}</td>
                <td>${transaction.date}</td>
                <td>${transaction.dni}</td>
            `;
            paymentTableBody.appendChild(row);
        });
    }

    // Función para actualizar la barra de progreso
    function updateProgressBar(totalAmount) {
        const percentage = goal > 0 ? (totalAmount / goal) * 100 : 0;
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
        progressBar.textContent = `${Math.min(percentage, 100).toFixed(2)}%`;
    }

    // Función para actualizar la cantidad restante para alcanzar el objetivo
    function updateAmountRemaining(totalAmount) {
        const amountRemaining = Math.max(goal - totalAmount, 0);
        amountRemainingDisplay.textContent = `Falta para el objetivo: ${amountRemaining.toFixed(2)}`;
    }

    // Función para filtrar las transacciones por empresa
    function filterTransactions() {
        const company = filterCompany.value;
        const filteredTransactions = transactions.filter(transaction => company === 'all' || transaction.company === company);
        fillPaymentTable(filteredTransactions);
        updateTotalAmountDisplay(filteredTransactions);
    }

    // Manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const amountInput = document.getElementById('amount');
        const companyInput = document.getElementById('company');
        const dateInput = document.getElementById('date');
        const dniInput = document.getElementById('dni');

        const amount = parseFloat(amountInput.value);
        const company = companyInput.value;
        const date = dateInput.value;
        const dni = dniInput.value;

        // Crear la nueva transacción
        const newTransaction = {
            amount: amount,
            company: company,
            date: date,
            dni: dni
        };

        // Guardar la transacción en el servidor y manejar los datos después
        saveTransaction(newTransaction).then(() => {
            loadMoneyData().then(moneyData => {
                if (moneyData) {
                    transactions = moneyData.transactions;
                    filterTransactions();
                }
            });

            // Limpiar los campos de entrada después de guardar
            amountInput.value = '';
            companyInput.value = 'Creditia';
            dateInput.value = '';
            dniInput.value = '';
        });
    });

    // Manejar el reinicio del monto acumulado
    resetButton.addEventListener('click', function () {
        resetMoneyData().then(data => {
            transactions = [];
            updateTotalAmountDisplay(transactions);
            fillPaymentTable(transactions);
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
            amountRemainingDisplay.textContent = 'Falta para el objetivo: 0';
        });
    });

    // Mostrar u ocultar la tabla de pagos
    toggleTableButton.addEventListener('click', function () {
        paymentTable.classList.toggle('hidden');
        if (!paymentTable.classList.contains('hidden')) {
            toggleTableButton.textContent = 'Ocultar Pagos';
        } else {
            toggleTableButton.textContent = 'Mostrar Pagos';
        }
    });

    // Manejar el cambio del objetivo
    goalInput.addEventListener('input', function () {
        goal = parseFloat(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            goal = 0;
        }
        updateProgressBar(transactions.reduce((sum, transaction) => sum + transaction.amount, 0));
        updateAmountRemaining(transactions.reduce((sum, transaction) => sum + transaction.amount, 0));
    });

    // Manejar el cambio del filtro por empresa
    filterCompany.addEventListener('change', filterTransactions);

    // Inicializar los datos al cargar la página
    loadMoneyData().then(moneyData => {
        if (moneyData) {
            transactions = moneyData.transactions;
            updateTotalAmountDisplay(transactions);
            fillPaymentTable(transactions);
        }
    });
});
