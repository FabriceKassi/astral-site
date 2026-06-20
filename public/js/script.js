// ===================================================
// HÔTEL ASTRAL — interactions front-end
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Burger menu (mobile) ---------- */
  const mainNav = document.getElementById('mainNav');
  const burgerBtn = document.getElementById('burgerBtn');
  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => mainNav.classList.toggle('mobile-open'));
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mainNav.classList.remove('mobile-open'));
    });
  }

  /* ---------- Smooth scroll helpers ---------- */
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-scroll-to');
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Hero : carrousel de 3 images (cover) ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length) {
    let currentSlide = 0;
    let carouselInterval;

    const goToSlide = (index) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    };
    const startCarousel = () => {
      carouselInterval = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);
    };
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(carouselInterval);
        goToSlide(i);
        startCarousel();
      });
    });
    startCarousel();
  }

  /* ---------- Réservation : dates + LIMITE 3 PERSONNES MAX ---------- */
  const dateArrivee = document.getElementById('dateArrivee');
  const dateDepart = document.getElementById('dateDepart');
  const adultsSelect = document.getElementById('adultsSelect');
  const childrenSelect = document.getElementById('childrenSelect');
  const resaNote = document.getElementById('resaNote');

  if (dateArrivee && dateDepart) {
    const today = new Date().toISOString().split('T')[0];
    dateArrivee.min = today;
    dateDepart.min = today;

    dateArrivee.addEventListener('change', () => {
      const arrivee = new Date(dateArrivee.value);
      const nextDay = new Date(arrivee);
      nextDay.setDate(nextDay.getDate() + 1);
      dateDepart.min = nextDay.toISOString().split('T')[0];
      if (dateDepart.value && new Date(dateDepart.value) <= arrivee) {
        dateDepart.value = nextDay.toISOString().split('T')[0];
      }
    });
  }

  const MAX_PERSONNES_PAR_CHAMBRE = 3;

  if (adultsSelect && childrenSelect && resaNote) {
    const updateOccupancyNote = () => {
      const adults = parseInt(adultsSelect.value, 10);
      const children = parseInt(childrenSelect.value, 10);
      const total = adults + children;
      if (total > MAX_PERSONNES_PAR_CHAMBRE) {
        const nbChambres = Math.ceil(total / MAX_PERSONNES_PAR_CHAMBRE);
        resaNote.textContent = `${total} personnes détectées : ${nbChambres} chambres seront proposées (3 personnes max/chambre).`;
        resaNote.style.color = 'var(--rouge)';
      } else {
        resaNote.textContent = '3 personnes maximum par chambre (adultes + enfants).';
        resaNote.style.color = '';
      }
    };
    adultsSelect.addEventListener('change', updateOccupancyNote);
    childrenSelect.addEventListener('change', updateOccupancyNote);
  }

  /* ---------- Modale Devis (réunion / sport) ---------- */
  const devisOverlay = document.getElementById('devisOverlay');
  const devisClose = document.getElementById('devisClose');
  const devisTitle = document.getElementById('devisTitle');
  const devisForm = document.getElementById('devisForm');
  const devisType = document.getElementById('devisType');
  const devisFeedback = document.getElementById('devisFeedback');

  if (devisOverlay) {
    document.querySelectorAll('[data-open-devis]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-open-devis');
        devisType.value = type;
        devisTitle.textContent = type === 'reunion' ? 'Devis — Salle de réunion' : 'Devis — Salle de sport';
        devisOverlay.classList.add('open');
      });
    });
    devisClose.addEventListener('click', () => devisOverlay.classList.remove('open'));
    devisOverlay.addEventListener('click', (e) => {
      if (e.target === devisOverlay) devisOverlay.classList.remove('open');
    });

    devisForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(devisForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        const res = await fetch('/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        devisFeedback.textContent = data.message;
        if (data.success) {
          devisForm.reset();
          setTimeout(() => { devisOverlay.classList.remove('open'); devisFeedback.textContent = ''; }, 2000);
        }
      } catch (err) {
        devisFeedback.textContent = 'Une erreur est survenue. Merci de réessayer.';
        devisFeedback.style.color = 'var(--rouge)';
      }
    });
  }

  /* ---------- Formulaire contact ---------- */
  const contactForm = document.getElementById('contactForm');
  const contactFeedback = document.getElementById('contactFeedback');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        contactFeedback.textContent = data.message;
        if (data.success) contactForm.reset();
      } catch (err) {
        contactFeedback.textContent = 'Une erreur est survenue. Merci de réessayer.';
      }
    });
  }

  /* ---------- Newsletter (footer) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(newsletterForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        const res = await fetch('/contact/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message);
        newsletterForm.reset();
      } catch (err) {
        alert('Une erreur est survenue. Merci de réessayer.');
      }
    });
  }

});
