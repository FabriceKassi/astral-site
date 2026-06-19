// ===================================================
// routes/quotes.js
// Demandes de devis (Salle de réunion / Salle de sport)
// ===================================================
import express from 'express';
import { getDB } from '../db/database.js';
import { nanoid } from 'nanoid';

const router = express.Router();

router.post('/', async (req, res) => {
  const { type, nom, email, telephone, dateSouhaitee, details } = req.body;

  const db = await getDB();
  const quote = {
    id: nanoid(8),
    type,
    status: 'nouveau',
    createdAt: new Date().toISOString(),
    nom, email, telephone, dateSouhaitee, details
  };
  db.data.quoteRequests.push(quote);
  await db.write();

  res.json({ success: true, message: 'Votre demande de devis a été envoyée. Notre équipe vous recontacte sous 24h.' });
});

export default router;
