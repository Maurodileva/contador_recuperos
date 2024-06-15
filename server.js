const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'dataMoney.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Función para calcular la diferencia en meses entre dos fechas
function monthsDifference(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() + 
           (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
}

// Función para ajustar el monto según la empresa y antigüedad
function adjustAmount(transaction) {
    if (transaction.company === 'Medife') {
        const transactionDate = new Date(transaction.date);
        const currentDate = new Date();
        const differenceInMonths = monthsDifference(transactionDate, currentDate);

        if (differenceInMonths < 6) {
            return transaction.amount * 0.65;
        }
    }
    return transaction.amount;
}

app.get('/api/moneyData', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).json({ error: 'Error al leer los datos' });
            return;
        }

        const moneyData = JSON.parse(data);
        res.json(moneyData);
    });
});

app.post('/api/moneyData', (req, res) => {
    const newTransaction = req.body.transaction;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.status(500).json({ error: 'Error al leer los datos' });
            return;
        }

        let moneyData = JSON.parse(data);

        // Ajustar el monto de la nueva transacción
        newTransaction.amount = adjustAmount(newTransaction);

        // Acumular el monto ajustado
        moneyData.totalAmount += newTransaction.amount;

        // Registrar la transacción
        moneyData.transactions.push(newTransaction);

        // Guardar el JSON actualizado en el servidor
        fs.writeFile(DATA_FILE, JSON.stringify(moneyData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
                res.status(500).json({ error: 'Error al guardar los datos' });
                return;
            }

            res.json({ message: 'Datos guardados correctamente', totalAmount: moneyData.totalAmount });
        });
    });
});

app.post('/api/resetMoney', (req, res) => {
    const initialData = {
        totalAmount: 0,
        transactions: []
    };

    fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error al escribir el archivo:', err);
            res.status(500).json({ error: 'Error al reiniciar los datos' });
            return;
        }

        res.json({ message: 'Monto reiniciado correctamente', totalAmount: initialData.totalAmount });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
