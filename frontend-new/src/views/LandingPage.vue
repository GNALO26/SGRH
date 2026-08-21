<template>
  <div class="landing">
    <!-- HEADER -->
    <header class="header">
      <div class="container">
        <img src="/logo-sgrh.png" alt="SGRH" class="logo" />
        <router-link to="/login" class="btn-login">
          Se connecter
        </router-link>
      </div>
    </header>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <h1>SGRH – Gérez vos équipes en toute simplicité</h1>
        <p>Pointage, congés, absences, statistiques – tout en un endroit.</p>
        <a href="#features" class="btn-primary">Découvrir</a>
      </div>
    </section>

    <!-- FONCTIONNALITÉS -->
    <section id="features" class="features">
      <h2>Fonctionnalités clés</h2>
      <div class="grid">
        <div class="card">
          <i class="fas fa-fingerprint"></i>
          <h3>Pointage géolocalisé</h3>
          <p>Vérification GPS + 4 paliers horaires + anti‑fraude.</p>
        </div>
        <div class="card">
          <i class="fas fa-calendar-check"></i>
          <h3>Congés & Absences</h3>
          <p>Demandes en ligne, validation automatique, blocage du pointage.</p>
        </div>
        <div class="card">
          <i class="fas fa-chart-line"></i>
          <h3>Statistiques en temps réel</h3>
          <p>Taux d'absentéisme, retards, productivité.</p>
        </div>
        <div class="card">
          <i class="fas fa-mobile-alt"></i>
          <h3>Application Android</h3>
          <p>Pointage mobile, notifications push.</p>
        </div>
      </div>
    </section>

    <!-- INTERFACES (2 colonnes) -->
    <section class="mockups">
      <h2>Une interface pensée pour vous</h2>
      <div class="mockup-grid">
        <div class="mockup-item">
          <img src="/assets/images/mockups/admin-dashboard.png" alt="Dashboard administrateur" />
          <p class="mockup-label">Administrateur</p>
        </div>
        <div class="mockup-item">
          <img src="/assets/images/mockups/employee-dashboard.png" alt="Dashboard employé" />
          <p class="mockup-label">Employé</p>
        </div>
      </div>
    </section>

    <!-- FOOTER (logo supprimé) -->
    <footer>
      <div class="footer-content">
        <p>&copy; 2025 SGRH. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Aucune vidéo – page entièrement statique
</script>

<style scoped>
/* ========== STYLES ========== */
.landing {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #f4f6f9;
  color: #0f172a;
}

/* HEADER */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.75rem 0;
  z-index: 100;
  border-bottom: 1px solid #e2e8f0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}
.logo {
  height: 40px;
  object-fit: contain;
}
.btn-login {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-login:hover {
  background: #1d4ed8;
}

/* HERO */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  padding: 6rem 2rem;
}
.hero-content {
  max-width: 800px;
}
.hero h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}
.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: background 0.2s, transform 0.2s;
}
.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

/* FEATURES */
.features {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.features h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
}
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.card i {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 1rem;
}
.card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.card p {
  font-size: 0.95rem;
  color: #475569;
}

/* MOCKUPS (2 colonnes) */
.mockups {
  background: #f8fafc;
  padding: 4rem 2rem;
}
.mockups h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
}
.mockup-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.mockup-item {
  text-align: center;
}
.mockup-item img {
  width: 100%;
  height: 500px;
  object-fit: contain;
  background-color: #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.mockup-item img:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}
.mockup-label {
  margin-top: 0.75rem;
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
}

/* FOOTER (logo supprimé) */
footer {
  background: #0f172a;
  color: white;
  text-align: center;
  padding: 2rem;
}
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}
footer p {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .mockup-grid {
    grid-template-columns: 1fr;
  }
  .mockup-item img {
    height: 300px;
  }
}
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .header .container {
    padding: 0 1rem;
  }
  .btn-login {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
  .hero h1 {
    font-size: 2rem;
  }
  .mockup-item img {
    height: 250px;
  }
}
</style>w