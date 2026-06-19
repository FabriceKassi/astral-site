// ===================================================
// routes/contact.js
// Formulaire de contact + inscription newsletter
// ===================================================
import express from 'express';
import { getDB } from '../db/database.js';
import { nanoid } from 'nanoid';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nom, email, telephone, message } = req.body;

  const db = await getDB();
  db.data.contactMessages.push({
    id: nanoid(8),
    createdAt: new Date().toISOString(),
    nom, email, telephone, message
  });
  await db.write();

  res.json({ success: true, message: 'Merci pour votre message. Notre équipe vous répond sous 24h.' });
});

router.post('/newsletter', async (req, res) => {
  const { email } = req.body;

  const db = await getDB();
  const alreadySubscribed = db.data.newsletterSubscribers.some(s => s.email === email);
  if (!alreadySubscribed) {
    db.data.newsletterSubscribers.push({ email, subscribedAt: new Date().toISOString() });
    await db.write();
  }

  res.json({ success: true, message: 'Merci pour votre inscription à notre newsletter !' });
});

export default router;
