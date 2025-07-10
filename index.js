const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let solicitudes = [];
let ubicacionesRepartidor = {};

// Cliente crea solicitud
app.post('/solicitud-envio', (req, res) => {
  const { clienteId, lat, lng, articulo, destino } = req.body;
  solicitudes.push({
    clienteId,
    lat,
    lng,
    articulo,
    destino,
    estado: 'pendiente',
    repartidorId: null,
    fechaHora: new Date().toISOString()
  });
  res.json({ mensaje: 'Solicitud registrada' });
});

// Repartidor acepta solicitud
app.post('/aceptar-envio', (req, res) => {
  const { clienteId, repartidorId } = req.body;
  const pedido = solicitudes.find(s => s.clienteId === clienteId && s.estado === 'pendiente');
  if (pedido) {
    pedido.estado = 'en camino';
    pedido.repartidorId = repartidorId;
    res.json({ mensaje: 'Pedido aceptado' });
  } else {
    res.status(404).json({ error: 'Solicitud no encontrada' });
  }
});

// Marcar como entregado
app.post('/entregado', (req, res) => {
  const { clienteId } = req.query;
  const pedido = solicitudes.find(s => s.clienteId === clienteId);
  if (pedido) {
    pedido.estado = 'entregado';
    res.json({ mensaje: 'Pedido actualizado a entregado' });
  } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
});

// Repartidor envía ubicación en vivo
app.post('/ubicacion-repartidor', (req, res) => {
  const { repartidorId, lat, lng } = req.body;
  ubicacionesRepartidor[repartidorId] = { lat, lng };
  res.json({ mensaje: 'Ubicación actualizada' });
});

app.get('/ubicaciones-repartidor', (req, res) => {
  res.json(ubicacionesRepartidor);
});

// Consultar solicitudes
app.get('/solicitudes', (req, res) => res.json(solicitudes));

// Consultar envíos del repartidor
app.get('/mis-envios', (req, res) => {
  const { repartidorId } = req.query;
  const envios = solicitudes.filter(s => s.repartidorId === repartidorId);
  res.json(envios);
});

// Vistas por rol
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public', 'cliente.html')));
app.get('/cliente', (_, res) => res.sendFile(path.join(__dirname, 'public', 'cliente.html')));
app.get('/repartidor', (_, res) => res.sendFile(path.join(__dirname, 'public', 'repartidor.html')));
app.get('/admin', (_, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => console.log(`🚀 Servidor activo en http://localhost:${PORT}`));