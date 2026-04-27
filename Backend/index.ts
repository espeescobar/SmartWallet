import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Configuración básica de seguridad y formato
app.use(cors());
app.use(express.json());

// Base de datos en memoria (Mocking temporal)
const gastos: any[] = [];

// Ruta de prueba para ver si el servidor vive
app.get('/', (req, res) => {
  res.send('¡Servidor de SmartWallet corriendo perfecto!');
});

// Ruta para guardar un gasto
app.post('/gastos', (req, res) => {
  const nuevoGasto = req.body;
  gastos.push(nuevoGasto);
  console.log("Nuevo gasto recibido:", nuevoGasto);
  res.status(201).json({ mensaje: 'Gasto guardado en local', gasto: nuevoGasto });
});

// Ruta para ver todos los gastos
app.get('/gastos', (req, res) => {
  res.json(gastos);
});

// Encender el motor
app.listen(port, () => {
  console.log(` Servidor de SmartWallet corriendo en http://localhost:${port}`);
});