document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('moneyForm');
    const resetButton = document.getElementById('resetButton');
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

    // Cargar y mostrar el monto acumulado al cargar la página
    loadMoneyData().then(moneyData => {
        if (moneyData) {
            updateTotalAmountDisplay(moneyData.totalAmount);
        }
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenir el envío del formulario

        // Obtener el monto ingresado
        const amountInput = document.getElementById('amount');
        let amount = parseFloat(amountInput.value);

        // Obtener la empresa seleccionada
        const companyInput = document.getElementById('company');
        let company = companyInput.value;

        // Obtener la fecha del pago
        const dateInput = document.getElementById('date');
        let date = dateInput.value;

        // Verificar si la conversión fue exitosa
        if (isNaN(amount)) {
            alert('Por favor, ingrese un número válido.');
            return;
        }

        // Crear la nueva transacción
        const newTransaction = {
            amount: amount,
            company: company,
            date: date
        };

        // Guardar la transacción en el servidor
        saveTransaction(newTransaction).then(response => response.json()).then(data => {
            // Actualizar la visualización del monto acumulado
            updateTotalAmountDisplay(data.totalAmount);

            // Limpiar el campo de entrada
            amountInput.value = '';
            companyInput.value = 'Creditia';
            dateInput.value = '';
        });
    });

    // Manejar el reinicio del monto acumulado
    resetButton.addEventListener('click', function () {
        resetMoneyData().then(data => {
            // Actualizar la visualización del monto acumulado
            updateTotalAmountDisplay(data.totalAmount);
        });
    });
});
