// src/api/useApi.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook générique pour appels API.
 *
 * Usage :
 *   const { data, loading, error, execute } = useApi(ecolesService.getAll);
 *   useEffect(() => { execute(); }, []);
 *
 * Ou avec arguments :
 *   const { execute } = useApi(ecolesService.create);
 *   await execute({ libelle: 'Nouvelle école' });
 */
export function useApi(fn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { data, loading, error, execute };
}

/**
 * Version simplifiée pour les listes chargées au montage.
 *
 * Usage :
 *   const { data: ecoles, loading, error, reload } = useFetch(ecolesService.getAll);
 */
export function useFetch(fn, deps = []) {
  const { data, loading, error, execute } = useApi(fn);

  // On charge au montage automatiquement
  useEffect(() => {
    execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: execute };
}