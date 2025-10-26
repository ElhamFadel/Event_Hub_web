const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const db = { users: [], tokens: new Map(), events: [] };

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token || !db.tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.user = db.tokens.get(token);
  next();
}

app.get('/api', (req,res)=>res.json({ ok: true, service: 'EventHub API', routes: ['POST /api/register','POST /api/login','GET /api/events','POST /api/events','DELETE /api/events/:id'] }));

app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  if (db.users.some(u => u.username === username)) return res.status(400).json({ error: 'User exists' });
  db.users.push({ username, password });
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const u = db.users.find(u => u.username === username && u.password === password);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const token = uuid();
  db.tokens.set(token, username);
  res.json({ token });
});

app.get('/api/events', (req, res) => res.json(db.events));

app.post('/api/events', auth, (req, res) => {
  const { title, date, location, details } = req.body || {};
  if (!title || !date || !location) return res.status(400).json({ error: 'Missing fields' });
  const ev = { id: uuid(), title, date, location, details: details || '', owner: req.user };
  db.events.push(ev);
  res.json(ev);
});

app.delete('/api/events/:id', auth, (req, res) => {
  const idx = db.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.events.splice(idx, 1);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API running on http://localhost:' + PORT));
