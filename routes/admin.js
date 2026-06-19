// ===================================================
// routes/admin.js
// Espace administrateur (Partie 11)
// ===================================================
import express from 'express';
import { getDB } from '../db/database.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login');
}

router.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Connexion administrateur', error: req.query.error });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDB();

  if (username === db.data.admin.username && password === db.data.admin.password) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/admin/login?error=1');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/dashboard', requireAuth, async (req, res) => {
  const db = await getDB();
  const { statut, recherche } = req.query;

  let bookings = [...db.data.bookings].reverse();

  if (statut) {
    bookings = bookings.filter(b => b.status === statut);
  }
  if (recherche) {
    const q = recherche.toLowerCase();
    bookings = bookings.filter(b =>
      b.ref.toLowerCase().includes(q) ||
      b.client.nom.toLowerCase().includes(q) ||
      b.client.email.toLowerCase().includes(q) ||
      (b.client.telephone || '').includes(q)
    );
  }

  res.render('admin/dashboard', {
    title: 'Tableau de bord — Administration Astral',
    bookings,
    quoteRequests: [...db.data.quoteRequests].reverse(),
    contactMessages: [...db.data.contactMessages].reverse(),
    statutFilter: statut || '',
    recherche: recherche || '',
    stats: {
      totalBookings: db.data.bookings.length,
      enAttente: db.data.bookings.filter(b => b.status === 'en_attente').length,
      confirmees: db.data.bookings.filter(b => b.status === 'confirmée').length,
      revenue: db.data.bookings.reduce((sum, b) => sum + (b.total || 0), 0)
    }
  });
});

router.post('/booking/:ref/status', requireAuth, async (req, res) => {
  const { ref } = req.params;
  const { status } = req.body;

  const db = await getDB();
  const booking = db.data.bookings.find(b => b.ref === ref);
  if (booking) {
    booking.status = status;
    await db.write();
  }
  res.redirect('/admin/dashboard');
});

export default router;
