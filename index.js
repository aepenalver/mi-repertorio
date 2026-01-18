const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();

app.use(express.json());
app.use(cors());

const getTodasLasCanciones = async () => {
  const fsReadFile = await fs.readFile('canciones.json', 'utf-8');
  const canciones = JSON.parse(fsReadFile);
  return canciones;
};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/canciones', async (req, res) => {
  const canciones = await getTodasLasCanciones();
  return res.json(canciones);
});

app.post('/canciones', async (req, res) => {
  const { titulo, artista, tono } = req.body;

  const newCancion = {
    id: nanoid(),
    titulo,
    artista,
    tono,
  };

  let canciones = await getTodasLasCanciones();
  canciones.push(newCancion);
  await fs.writeFile('canciones.json', JSON.stringify(canciones));

  return res
    .status(201)
    .json({ message: '¡Canción agregada con éxito!', newCancion });
});

app.put('/canciones/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, artista, tono } = req.body;
  let canciones = await getTodasLasCanciones();
  let cancion = canciones.findIndex((c) => c.id === id);

  if (cancion === -1) {
    return res.status(404).json({ message: '¡Canción no encontrada!' });
  }

  canciones[cancion] = {
    id,
    titulo,
    artista,
    tono,
  };

  await fs.writeFile('canciones.json', JSON.stringify(canciones));

  return res.status(200).json(canciones[cancion]);
});

app.delete('/canciones/:id', async (req, res) => {
  const { id } = req.params;
  let canciones = await getTodasLasCanciones();
  const cancion = canciones.findIndex((c) => c.id === id);

  if (cancion === -1) {
    return res.status(404).json({ message: '¡Canción no encontrada!' });
  }

  canciones = canciones.filter((c) => c.id !== id);

  await fs.writeFile('canciones.json', JSON.stringify(canciones));
  return res.json({ message: `¡Canción ${id} eliminada con éxito!` });
});

app.listen(3000, () => {
  console.log('Server Ready! 📡 on port 3000');
});
