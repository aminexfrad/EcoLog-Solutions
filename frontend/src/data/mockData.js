export const roleConfig = {
  shipper: {
    subtitle: "Expediteur",
    defaultTitle: "Tableau de bord expediteur",
    score: 82,
    navItems: [
      { to: "/shipper/dashboard", icon: "📊", label: "Dashboard" },
      { to: "/shipper/shipments", icon: "📦", label: "Expeditions" },
      { to: "/shipper/tracking", icon: "🗺️", label: "Tracking" },
      { to: "/shipper/carbon", icon: "🌿", label: "Bilan carbone" },
      { to: "/shipper/marketplace", icon: "🛒", label: "Marketplace CO2" },
      { to: "/shipper/esg", icon: "📈", label: "Rapport ESG" },
      { to: "/shipper/notifications", icon: "🔔", label: "Notifications" },
      { to: "/shipper/profile", icon: "👤", label: "Profil" },
    ],
    demoUser: { name: "Marie Leblanc", initials: "ML", label: "Expediteur Pro" },
  },
  carrier: {
    subtitle: "Transporteur",
    defaultTitle: "Dashboard transporteur",
    score: 94,
    navItems: [
      { to: "/carrier/dashboard", icon: "📊", label: "Dashboard" },
      { to: "/carrier/missions", icon: "✅", label: "Missions" },
      { to: "/carrier/fleet", icon: "🚛", label: "Flotte" },
      { to: "/carrier/certifications", icon: "📑", label: "Certifications" },
      { to: "/carrier/notifications", icon: "🔔", label: "Notifications" },
      { to: "/carrier/profile", icon: "👤", label: "Profil" },
    ],
    demoUser: { name: "Jean Dupont", initials: "JD", label: "Transporteur Or" },
  },
  client: {
    subtitle: "Client Final",
    defaultTitle: "Suivi en temps reel",
    score: 76,
    navItems: [
      { to: "/client/dashboard", icon: "📍", label: "Suivi" },
      { to: "/client/orders", icon: "📦", label: "Commandes" },
      { to: "/client/impact", icon: "🌱", label: "Impact CO2" },
      { to: "/client/documents", icon: "📄", label: "Documents" },
      { to: "/client/notifications", icon: "🔔", label: "Notifications" },
      { to: "/client/profile", icon: "👤", label: "Profil" },
    ],
    demoUser: { name: "Claire Bonnet", initials: "CB", label: "Client Final" },
  },
  admin: {
    subtitle: "Admin",
    defaultTitle: "Dashboard global",
    score: 99,
    navItems: [
      { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
      { to: "/admin/users", icon: "👥", label: "Utilisateurs" },
      { to: "/admin/carriers", icon: "🚛", label: "Transporteurs" },
      { to: "/admin/carbon-ref", icon: "🌍", label: "Referentiel CO2" },
      { to: "/admin/logs", icon: "🧾", label: "Audit logs" },
      { to: "/admin/marketplace", icon: "🛒", label: "Marketplace" },
      { to: "/admin/reports", icon: "📈", label: "Rapports ESG" },
      { to: "/admin/profile", icon: "👤", label: "Profil" },
    ],
    demoUser: { name: "Sarah Admin", initials: "SA", label: "Administrateur" },
  },
};

export const dashboardData = {
  shipper: {
    cards: [
      { icon: "📦", value: "247", label: "Expeditions ce mois", trend: "▲ +12%", tone: "sc-green" },
      { icon: "🌡️", value: "4.2 t", label: "CO2 emis", trend: "▼ -18%", tone: "sc-navy" },
      { icon: "💰", value: "128", label: "Credits carbone", trend: "↔ Stable", tone: "sc-amber" },
      { icon: "♻️", value: "76%", label: "Transport vert", trend: "▲ +5 pts", tone: "sc-green" },
    ],
  },
  carrier: {
    cards: [
      { icon: "✅", value: "34", label: "Missions", trend: "▲ +8%", tone: "sc-green" },
      { icon: "⭐", value: "4.8", label: "Note moyenne", trend: "▲ +0.2", tone: "sc-navy" },
      { icon: "🌿", value: "94", label: "Score vert", trend: "▲ +2 pts", tone: "sc-green" },
      { icon: "💶", value: "28 200 TND", label: "Revenus mois", trend: "▲ +12%", tone: "sc-amber" },
    ],
  },
  client: {
    cards: [
      { icon: "📦", value: "12", label: "Commandes actives", trend: "▲ +3", tone: "sc-green" },
      { icon: "🌡️", value: "4.2 t", label: "CO2 total", trend: "▼ -18%", tone: "sc-navy" },
      { icon: "💧", value: "3.8 t", label: "CO2 compense", trend: "= 90%", tone: "sc-green" },
      { icon: "♻️", value: "76%", label: "Livraisons vertes", trend: "▲ +5 pts", tone: "sc-amber" },
    ],
  },
  admin: {
    cards: [
      { icon: "👥", value: "1 247", label: "Utilisateurs actifs", trend: "▲ +87", tone: "sc-green" },
      { icon: "🚛", value: "38", label: "Transporteurs certifies", trend: "▲ +4", tone: "sc-navy" },
      { icon: "📦", value: "12 450", label: "Expeditions", trend: "▲ +18%", tone: "sc-green" },
      { icon: "🌡️", value: "184 t", label: "CO2 evite", trend: "▼ -22%", tone: "sc-amber" },
    ],
  },
};

export const tableData = {
  shipments: {
    title: "Expeditions",
    columns: ["Ref", "Trajet", "Transporteur", "CO2", "Statut"],
    rows: [
      ["#EXP-0247", "Paris -> Lyon", "EcoTrans", "1.2 kg", "En transit"],
      ["#EXP-0246", "Marseille -> Bordeaux", "RailGreen", "0.8 kg", "En attente"],
      ["#EXP-0245", "Lille -> Strasbourg", "TransCO2", "3.4 kg", "Livre"],
    ],
  },
  marketplace: {
    title: "Marketplace credits carbone",
    columns: ["Projet", "Certification", "Prix/t", "Disponibilite"],
    rows: [
      ["Reforestation Amazonie", "Gold Standard", "60 TND", "5000 t"],
      ["Parc Solaire Sahel", "VCS Verra", "47 TND", "8000 t"],
      ["Eoliennes Normandes", "Label Bas-Carbone", "74 TND", "200 t"],
    ],
  },
  missions: {
    title: "Missions transporteur",
    columns: ["Mission", "Client", "Vehicule", "Statut"],
    rows: [
      ["#MIS-980", "Green Market", "Mercedes eActros", "Chargement"],
      ["#MIS-979", "BioStore", "Volvo FH Electric", "En route"],
      ["#MIS-978", "Eco Retail", "Iveco GNV", "Livree"],
    ],
  },
  fleet: {
    title: "Flotte verte",
    columns: ["Vehicule", "Energie", "Capacite", "CO2"],
    rows: [
      ["Mercedes eActros", "Electrique", "18 t", "0 g/t.km"],
      ["Volvo FH Electric", "Electrique", "26 t", "7 g/t.km"],
      ["Iveco Daily GNV", "Biomethane", "3.5 t", "40 g/t.km"],
    ],
  },
  orders: {
    title: "Commandes client",
    columns: ["Commande", "Trajet", "Mode", "ETA", "Statut"],
    rows: [
      ["#CMD-2201", "Paris -> Lille", "Electrique", "14h32", "En transit"],
      ["#CMD-2200", "Lyon -> Nice", "Rail", "Livre", "Terminee"],
    ],
  },
  users: {
    title: "Gestion utilisateurs",
    columns: ["Nom", "Role", "Entreprise", "Statut"],
    rows: [
      ["Marie Leblanc", "Expediteur", "DistriVert", "Actif"],
      ["Jean Dupont", "Transporteur", "EcoTrans", "Actif"],
      ["Claire Bonnet", "Client", "Retail Plus", "Actif"],
    ],
  },
  carriers: {
    title: "Validation transporteurs",
    columns: ["Nom", "Score", "Flotte", "Statut"],
    rows: [
      ["EcoTrans SAS", "94", "12 vehicules", "Valide"],
      ["RailGreen Express", "87", "22 wagons", "Valide"],
      ["Urban Freight", "66", "6 camions", "En revue"],
    ],
  },
  tracking: {
    title: "Tracking livraisons",
    columns: ["Expedition", "Progression", "ETA", "Position", "Derniere maj"],
    rows: [],
  },
  documents: {
    title: "Documents de livraison",
    columns: ["ID", "Expedition", "Type", "Date"],
    rows: [],
  },
  certifications: {
    title: "Certifications transporteur",
    columns: ["Certification", "Emetteur", "Validite", "Statut"],
    rows: [
      ["ISO 14001", "AFNOR", "2028-12-31", "Valide"],
      ["Label Objectif CO2", "ADEME", "2027-10-11", "Valide"],
    ],
  },
  notifications: {
    title: "Notifications",
    columns: ["Message", "Etat"],
    rows: [],
  },
  logs: {
    title: "Logs d'audit",
    columns: ["Heure", "Niveau", "Evenement"],
    rows: [],
  },
  carbonRef: {
    title: "Referentiel CO2",
    columns: ["Mode", "Facteur g/t.km", "Reduction"],
    rows: [
      ["Diesel", "62", "Reference"],
      ["Electrique", "7", "-89%"],
      ["Biomethane", "40", "-35%"],
      ["Ferroviaire", "18", "-71%"],
    ],
  },
};

export const reportData = {
  carbon: {
    title: "Bilan carbone expediteur",
    highlights: ["Emissions mensuelles: 4.2 t CO2", "Reduction vs N-1: -18%", "Transport vert: 76%"],
  },
  impact: {
    title: "Impact client final",
    highlights: ["CO2 livre: 4.2 t", "CO2 compense: 3.8 t", "Equivalent arbres: 182"],
  },
  reports: {
    title: "Rapports ESG administrateur",
    highlights: ["CO2 evite plateforme: 184 t", "Credits vendus: 81 000 TND", "Taux transport vert: 71%"],
  },
  esg: {
    title: "Rapport ESG expediteur",
    highlights: ["Score ESG: 82/100", "Conformite GRI: 93%", "Rapport mensuel exportable PDF/Excel"],
  },
};
