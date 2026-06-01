const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const DATA_PATH = './database.json';

// Helper untuk baca data
const readDB = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
// Helper untuk tulis data
const writeDB = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

// Logika Profesional: Auto-update status "Jatuh Tempo"
const checkOverdue = () => {
  const db = readDB();
  const today = new Date().toISOString().split('T')[0];
  let changed = false;
  db.invoice.forEach(inv => {
    if (inv.status === 'Belum Dibayar' && inv.due && inv.due < today) {
      inv.status = 'Jatuh Tempo';
      changed = true;
    }
  });
  if (changed) writeDB(db);
};

// Endpoint untuk ambil semua data
app.get('/api/db', (req, res) => {
  res.json(readDB());
});

// Endpoint untuk simpan semua data (Update seluruh DB)
app.post('/api/db', (req, res) => {
  writeDB(req.body);
  res.json({ message: 'Data berhasil disimpan di server!' });
});

// --- API PRODUK (Spesifik) ---

// Get All Produk
app.get('/api/produk', (req, res) => {
  const db = readDB();
  res.json(db.produk || []);
});

// Add Produk
app.post('/api/produk', (req, res) => {
  const db = readDB();
  const newProd = req.body;
  if (db.produk.some(p => p.nama.toLowerCase() === newProd.nama.toLowerCase())) {
    return res.status(400).json({ message: 'Produk sudah ada' });
  }
  db.produk.push(newProd);
  writeDB(db);
  res.status(201).json(newProd);
});

// Update Produk
app.put('/api/produk/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.produk.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.produk[idx] = { ...db.produk[idx], ...req.body };
    writeDB(db);
    res.json(db.produk[idx]);
  } else {
    res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
});

// Delete Produk
app.delete('/api/produk/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.produk = db.produk.filter(p => p.id !== id);
  writeDB(db);
  res.json({ message: 'Produk dihapus' });
});

// --- API KLIEN (Spesifik) ---

app.get('/api/klien', (req, res) => {
  res.json(readDB().klien || []);
});

app.post('/api/klien', (req, res) => {
  const db = readDB();
  const data = req.body;
  if (db.klien.some(k => k.nama.toLowerCase() === data.nama.toLowerCase())) {
    return res.status(400).json({ message: 'Klien sudah ada' });
  }
  db.klien.push(data);
  writeDB(db);
  res.status(201).json(data);
});

app.put('/api/klien/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.klien.findIndex(k => k.id === id);
  if (idx !== -1) {
    db.klien[idx] = { ...db.klien[idx], ...req.body };
    writeDB(db);
    res.json(db.klien[idx]);
  } else {
    res.status(404).json({ message: 'Klien tidak ditemukan' });
  }
});

app.delete('/api/klien/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.klien = db.klien.filter(k => k.id !== id);
  writeDB(db);
  res.json({ message: 'Klien berhasil dihapus' });
});


// --- API PENAWARAN ---
app.get('/api/penawaran', (req, res) => {
  res.json(readDB().penawaran || []);
});

app.post('/api/penawaran', (req, res) => {
  const db = readDB();
  const data = req.body;
  if (db.penawaran.some(p => p.no === data.no)) {
    return res.status(400).json({ message: 'Nomor penawaran sudah ada' });
  }
  db.penawaran.push(data);
  db.seqPnw = (db.seqPnw || data.id) + 1;
  writeDB(db);
  res.status(201).json(data);
});

app.put('/api/penawaran/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.penawaran.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.penawaran[idx] = { ...db.penawaran[idx], ...req.body };
    writeDB(db);
    res.json(db.penawaran[idx]);
  } else {
    res.status(404).json({ message: 'Penawaran tidak ditemukan' });
  }
});

app.delete('/api/penawaran/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.penawaran = db.penawaran.filter(p => p.id !== id);
  writeDB(db);
  res.json({ message: 'Penawaran dihapus' });
});

// --- API INVOICE ---
app.get('/api/invoice', (req, res) => {
  res.json(readDB().invoice || []);
});

app.post('/api/invoice', (req, res) => {
  const db = readDB();
  const data = req.body;
  if (db.invoice.some(i => i.no === data.no)) {
    return res.status(400).json({ message: 'Nomor invoice sudah ada' });
  }
  db.invoice.push(data);
  db.seqInv = (db.seqInv || data.id) + 1;
  writeDB(db);
  res.status(201).json(data);
});

app.put('/api/invoice/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.invoice.findIndex(i => i.id === id);
  if (idx !== -1) {
    db.invoice[idx] = { ...db.invoice[idx], ...req.body };
    writeDB(db);
    res.json(db.invoice[idx]);
  } else {
    res.status(404).json({ message: 'Invoice tidak ditemukan' });
  }
});

app.delete('/api/invoice/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.invoice = db.invoice.filter(i => i.id !== id);
  writeDB(db);
  res.json({ message: 'Invoice dihapus' });
});

app.listen(port, () => {
  checkOverdue(); // Jalankan pengecekan saat server nyala
  console.log(`Server RZP berjalan di http://localhost:${port}`);
});