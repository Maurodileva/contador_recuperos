document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('moneyForm');
    const resetButton = document.getElementById('resetButton');
    const toggleTableButton = document.getElementById('toggleTableButton');
    const paymentTable = document.getElementById('paymentTable');
    const paymentTableBody = document.getElementById('paymentTableBody');
    const totalAmountDisplay = document.getElementById('totalAmount');

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
    function updateTotalAmountDisplay(totalAmount) {
        totalAmountDisplay.textContent = `Monto acumulado: ${totalAmount}`;
    }

    // Función para llenar la tabla con los pagos registrados
    function fillPaymentTable(transactions) {
        paymentTableBody.innerHTML = '';
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.amount}</td>
                <td>${transaction.company}</td>
                <td>${transaction.date}</td>
                <td>${transaction.dni}</td>
            `;
            paymentTableBody.appendChild(row);
        });
    }

    // Cargar y mostrar el monto acumulado al cargar la página
    loadMoneyData().then(moneyData => {
        if (moneyData) {
            updateTotalAmountDisplay(moneyData.totalAmount);
            fillPaymentTable(moneyData.transactions);
        }
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenir el envío del formulario

        // Obtener los valores ingresados
        const amountInput = document.getElementById('amount');
        const companyInput = document.getElementById('company');
        const dateInput = document.getElementById('date');
        const dniInput = document.getElementById('dni');

        // Convertir los valores a los tipos adecuados
        let amount = parseFloat(amountInput.value);
        let company = companyInput.value;
        let date = dateInput.value;
        let dni = dniInput.value;

        // Verificar si la conversión fue exitosa
        if (isNaN(amount)) {
            alert('Por favor, ingrese un número válido.');
            return;
        }

        // Crear la nueva transacción
        const newTransaction = {
            amount: amount,
            company: company,
            date: date,
            dni: dni
        };

        // Guardar la transacción en el servidor
        saveTransaction(newTransaction).then(() => {
            // Recargar los datos después de guardar la transacción
            loadMoneyData().then(moneyData => {
                // Actualizar la visualización del monto acumulado
                updateTotalAmountDisplay(moneyData.totalAmount);
                // Actualizar la tabla de pagos
                fillPaymentTable(moneyData.transactions);
            });

            // Limpiar los campos de entrada
            amountInput.value = '';
            companyInput.value = 'Creditia';
            dateInput.value = '';
            dniInput.value = '';
        });
    });

    // Manejar el reinicio del monto acumulado
    resetButton.addEventListener('click', function () {
        resetMoneyData().then(data => {
            // Actualizar la visualización del monto acumulado
            updateTotalAmountDisplay(data.totalAmount);
            // Limpiar la tabla de pagos
            paymentTableBody.innerHTML = '';
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
});
