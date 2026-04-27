// SmartWallet/Backend/src/server.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Expense } from '../../shared/types';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/expenses', (req, res) => {
    const expense: Expense = req.body;
    console.log('Gasto recibido:', expense);
    res.status(201).send(expense);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
