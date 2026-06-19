// ===================================================
// routes/booking.js
// Tunnel de réservation complet (Parties 5 à 9)
// Étapes : Recherche → Résultats → Récap → Infos client → Confirmation
// ===================================================
import express from 'express';
import { getDB, generateBookingRef } from '../db/database.js';

const router = express.Router();

const MAX_OCCUPANCY_PER_ROOM = 3;

function calcNights(arrivee, depart) {
  const d1 = new Date(arrivee);
  const d2 = new Date(depart);
  const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
  return diff > 0 ? Math.round(diff) : 0;
}

// ---------- ÉTAPE 1 : recherche → résultats (Partie 6) ----------
router.get('/', async (req, res) => {
  const { arrivee, depart, adultes = 1, enfants = 0, chambres = 1 } = req.query;

  if (!arrivee || !depart) {
    return res.redirect('/?error=dates-manquantes#bandeau-resa');
  }

  const nights = calcNights(arrivee, depart);
  if (nights < 1) {
    return res.render('reservation-erreur', {
      title: 'Erreur de dates',
      message: 'La date de départ doit être après la date d\'arrivée.'
    });
  }

  const totalVoyageurs = parseInt(adultes, 10) + parseInt(enfants, 10);
  const nbChambresRequises = Math.ceil(totalVoyageurs / MAX_OCCUPANCY_PER_ROOM);

  const db = await getDB();
  const availableRooms = db.data.rooms.map(room => ({
    ...room,
    rates: db.data.rateOptions.map(rate => ({
      ...rate,
      totalPrice: Math.round(room.pricePerNight * rate.modifier * nights)
    }))
  }));

  res.render('reservation-resultats', {
    title: 'Chambres disponibles — Hôtel Astral',
    arrivee, depart, nights,
    adultes: parseInt(adultes, 10),
    enfants: parseInt(enfants, 10),
    chambresRequises: Math.max(nbChambresRequises, parseInt(chambres, 10) || 1),
    rooms: availableRooms,
    maxOccupancy: MAX_OCCUPANCY_PER_ROOM
  });
});

// ---------- ÉTAPE 2 : récapitulatif après sélection (Partie 7) ----------
router.get('/recapitulatif', async (req, res) => {
  const { roomId, rateId, arrivee, depart, adultes, enfants, chambres } = req.query;

  const db = await getDB();
  const room = db.data.rooms.find(r => r.id === roomId);
  const rate = db.data.rateOptions.find(r => r.id === rateId);

  if (!room || !rate) {
    return res.redirect('/reservation?' + new URLSearchParams(req.query).toString());
  }

  const nights = calcNights(arrivee, depart);
  const nbChambres = parseInt(chambres, 10) || 1;
  const pricePerNightWithRate = Math.round(room.pricePerNight * rate.modifier);
  const subtotal = pricePerNightWithRate * nights * nbChambres;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  res.render('reservation-recap', {
    title: 'Récapitulatif de votre séjour — Hôtel Astral',
    room, rate, arrivee, depart, nights,
    adultes: parseInt(adultes, 10),
    enfants: parseInt(enfants, 10),
    nbChambres,
    pricePerNightWithRate,
    subtotal, taxes, total
  });
});

// ---------- ÉTAPE 3 : formulaire client (Partie 8) ----------
router.get('/informations', async (req, res) => {
  const { roomId, rateId, arrivee, depart, adultes, enfants, chambres } = req.query;

  const db = await getDB();
  const room = db.data.rooms.find(r => r.id === roomId);
  const rate = db.data.rateOptions.find(r => r.id === rateId);
  if (!room || !rate) return res.redirect('/reservation');

  const nights = calcNights(arrivee, depart);
  const nbChambres = parseInt(chambres, 10) || 1;
  const pricePerNightWithRate = Math.round(room.pricePerNight * rate.modifier);
  const subtotal = pricePerNightWithRate * nights * nbChambres;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  res.render('reservation-informations', {
    title: 'Vos informations — Hôtel Astral',
    room, rate, arrivee, depart, nights,
    adultes, enfants, nbChambres,
    subtotal, taxes, total
  });
});

// ---------- ÉTAPE 4 : traitement + confirmation (Partie 9) ----------
router.post('/confirmer', async (req, res) => {
  const {
    roomId, rateId, arrivee, depart, adultes, enfants, chambres,
    prenom, nom, email, telephone, whatsapp, pays, ville,
    heureArrivee, message, cgvAccepted
  } = req.body;

  if (!cgvAccepted) {
    return res.status(400).render('reservation-erreur', {
      title: 'Conditions non acceptées',
      message: 'Vous devez accepter les conditions générales pour confirmer votre réservation.'
    });
  }

  const db = await getDB();
  const room = db.data.rooms.find(r => r.id === roomId);
  const rate = db.data.rateOptions.find(r => r.id === rateId);
  if (!room || !rate) return res.redirect('/reservation');

  const nights = calcNights(arrivee, depart);
  const nbChambres = parseInt(chambres, 10) || 1;
  const pricePerNightWithRate = Math.round(room.pricePerNight * rate.modifier);
  const subtotal = pricePerNightWithRate * nights * nbChambres;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  const bookingRef = generateBookingRef();

  const booking = {
    ref: bookingRef,
    status: 'en_attente',
    createdAt: new Date().toISOString(),
    roomId, roomName: room.name,
    rateId, rateLabel: rate.label,
    arrivee, depart, nights,
    adultes: parseInt(adultes, 10),
    enfants: parseInt(enfants, 10),
    nbChambres,
    pricePerNightWithRate, subtotal, taxes, total,
    client: { prenom, nom, email, telephone, whatsapp, pays, ville, heureArrivee, message }
  };

  db.data.bookings.push(booking);
  await db.write();

  res.render('reservation-confirmation', {
    title: 'Réservation confirmée — Hôtel Astral',
    booking
  });
});

export default router;
