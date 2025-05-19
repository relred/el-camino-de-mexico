const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos SQLite
const db = new sqlite3.Database('./database.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS coordinadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      celular TEXT,
      correo TEXT,
      estado TEXT,
      municipio TEXT,
      subcoordinadores TEXT
    )
  `);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Sirve archivos HTML, CSS, JS e imágenes

// Ruta para guardar datos del formulario
app.post('/api/guardar', (req, res) => {
  const { nombre, celular, correo, estado, municipio, subcoordinadores } = req.body;

  if (!nombre || !celular || !correo || !estado || !municipio || subcoordinadores === undefined) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const stmt = db.prepare(`
    INSERT INTO coordinadores (nombre, celular, correo, estado, municipio, subcoordinadores)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(nombre, celular, correo, estado, municipio, subcoordinadores, function (err) {
    if (err) {
      console.error('❌ Error al guardar:', err.message);
      return res.status(500).json({ error: 'Error al guardar datos' });
    }

    console.log(`✅ Coordinador registrado con ID ${this.lastID}`);
    res.json({ success: true, id: this.lastID });
  });

  stmt.finalize();
});

// Ruta para obtener todos los registros
app.get('/api/coordinadores', (req, res) => {
  db.all("SELECT * FROM coordinadores", (err, rows) => {
    if (err) {
      console.error('❌ Error al leer la base:', err.message);
      return res.status(500).json({ error: 'Error al leer datos' });
    }

    res.json(rows);
  });
});

app.get('/panel/ver', (req, res) => {
  res.sendFile(path.join(__dirname, 'ver.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
