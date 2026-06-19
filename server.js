// ===================================================
// server.js — Hôtel Astral
// Serveur principal Express
// ===================================================
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import pageRoutes from './routes/pages.js';
import bookingRoutes from './routes/booking.js';
import quoteRoutes from './routes/quotes.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Configuration du moteur de vues ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middlewares ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'astral-secret-dev-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4h
}));

// ---------- Routes ----------
app.use('/', pageRoutes);
app.use('/reservation', bookingRoutes);
app.use('/devis', quoteRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

app.listen(PORT, () => {
  console.log(`✦ Hôtel Astral — serveur démarré sur http://localhost:${PORT}`);
});
