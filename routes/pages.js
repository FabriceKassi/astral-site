// ===================================================
// routes/pages.js
// Pages principales du site (chaque menu a sa propre page)
// ===================================================
import express from 'express';
import { getDB } from '../db/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  res.render('accueil', { title: 'Hôtel Astral — Business Hôtel à Abidjan Yopougon', activePage: 'accueil' });
});

router.get('/hebergement', async (req, res) => {
  const db = await getDB();
  res.render('hebergement', {
    title: 'Hébergement — Hôtel Astral',
    activePage: 'hebergement',
    rooms: db.data.rooms
  });
});

router.get('/restaurant', async (req, res) => {
  res.render('restaurant', { title: 'Restaurant — Hôtel Astral', activePage: 'restaurant' });
});

router.get('/reunions-evenements', async (req, res) => {
  res.render('reunions', { title: 'Réunions & événements — Hôtel Astral', activePage: 'reunions' });
});

router.get('/salle-de-sport', async (req, res) => {
  res.render('sport', { title: 'Salle de sport — Hôtel Astral', activePage: 'sport' });
});

router.get('/contacts', async (req, res) => {
  res.render('contacts', { title: 'Contacts — Hôtel Astral', activePage: 'contacts' });
});

export default router;
