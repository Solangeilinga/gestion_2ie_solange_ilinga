// src/api/services.js
import api from './axios';

// ─── Helper générique CRUD ───────────────────────────────────────────────────
const crud = (endpoint) => ({
  getAll:  (params = {}) => api.get(endpoint, { params }),
  getOne:  (id)          => api.get(`${endpoint}/${id}`),
  create:  (data)        => api.post(endpoint, data),
  update:  (id, data)    => api.put(`${endpoint}/${id}`, data),
  remove:  (id)          => api.delete(`${endpoint}/${id}`),
});

// ─── Ressources de référence ─────────────────────────────────────────────────
export const paysService = {
  ...crud('/pays'),
};

export const civilitesService = {
  ...crud('/civilites'),
};

export const cyclesService = {
  ...crud('/cycles'),
};

export const decisionsService = {
  ...crud('/decisions'),
};

// ─── Entités principales ─────────────────────────────────────────────────────
export const ecolesService = {
  ...crud('/ecoles'),
  getFilieres: (id) => api.get(`/ecoles/${id}/filieres`),
};

export const filieresService = {
  ...crud('/filieres'),
};

export const specialitesService = {
  ...crud('/specialites'),
};

export const ecolesFiliereService = {
  getAll:  ()                          => api.get('/ecolesfilieres'),
  create:  (data)                      => api.post('/ecolesfilieres', data),
  update:  (ecoles_id, filieres_id, data) =>
    api.put(`/ecolesfilieres/${ecoles_id}/${filieres_id}`, data),
  remove:  (ecoles_id, filieres_id)   =>
    api.delete(`/ecolesfilieres/${ecoles_id}/${filieres_id}`),
};

// ─── Structure académique ─────────────────────────────────────────────────────
export const niveauxService = {
  ...crud('/niveaux'),
};

export const parcoursService = {
  ...crud('/parcours'),
};

export const anneesService = {
  ...crud('/annees'),
  getActive: () => api.get('/annees/active'),
};

// ─── Étudiants ───────────────────────────────────────────────────────────────
export const etudiantsService = {
  ...crud('/etudiants'),
  // Recherche par nom/prénom/email
  search:          (q)   => api.get('/etudiants', { params: { search: q } }),
  // Filtrer par pays
  filterByPays:    (id)  => api.get('/etudiants', { params: { pays_id: id } }),
  // Inscriptions d'un étudiant
  getInscriptions: (id)  => api.get(`/etudiants/${id}/inscriptions`),
};

// ─── Inscriptions ─────────────────────────────────────────────────────────────
export const inscriptionsService = {
  ...crud('/inscriptions'),
  // Filtres : annee_id, parcours_id, decision_id
  filter: (params = {}) => api.get('/inscriptions', { params }),
  // Stats globales
  getStats: ()          => api.get('/inscriptions/stats'),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  me: () =>
    api.get('/auth/me'),
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export const statsService = {
  dashboard: () => api.get('/stats/dashboard'),
};