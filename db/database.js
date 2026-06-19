// ===================================================
// db/database.js
// Base de données légère (fichier JSON) via lowdb
// ===================================================
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'astral.json');
const adapter = new JSONFile(file);

const defaultData = {
  rooms: [
    {
      id: 'standard',
      name: 'Chambre Standard',
      description: 'Confort essentiel, literie premium, climatisation et Wifi haut débit. Idéale pour les séjours d\'affaires courts.',
      surface: 22,
      maxOccupancy: 3,
      pricePerNight: 35000,
      amenities: ['Climatisation', 'Wifi haut débit', 'TV écran plat', 'Bureau de travail', 'Salle de bain privative'],
      totalRooms: 12
    },
    {
      id: 'appartement',
      name: 'Appartement',
      description: 'Salon séparé, coin TV, espace de vie généreux. Pensé pour les séjours prolongés et les voyageurs d\'affaires.',
      surface: 38,
      maxOccupancy: 3,
      pricePerNight: 55000,
      amenities: ['Climatisation', 'Wifi haut débit', 'Salon séparé', 'Kitchenette', 'TV écran plat', 'Bureau de travail'],
      totalRooms: 6
    }
  ],
  rateOptions: [
    {
      id: 'flexible',
      label: 'Tarif flexible',
      description: 'Annulation gratuite jusqu\'à 24h avant l\'arrivée',
      modifier: 1,
      refundable: true
    },
    {
      id: 'non-remboursable',
      label: 'Tarif non remboursable',
      description: 'Paiement intégral à la réservation, tarif réduit',
      modifier: 0.88,
      refundable: false
    }
  ],
  bookings: [],
  quoteRequests: [],
  contactMessages: [],
  newsletterSubscribers: [],
  admin: {
    username: 'admin',
    password: 'astral2026'
  }
};

export async function getDB() {
  const db = new Low(adapter, defaultData);
  await db.read();
  db.data ||= defaultData;
  return db;
}

export function generateBookingRef() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AST-${year}-${random}`;
}
