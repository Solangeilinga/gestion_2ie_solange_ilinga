// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  textPrimary: '#1A1F2E',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  accentHover: '#4338CA',
  accentLight: '#EEF2FF',
};

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr) => ({
    width: '100%',
    border: `1px solid ${hasErr ? '#FECACA' : C.border}`,
    backgroundColor: hasErr ? '#FEF2F2' : C.card,
    color: C.textPrimary,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '15px',
    borderRadius: '10px',
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  const handleFocus = (e) => {
    e.target.style.borderColor = C.accent;
    e.target.style.boxShadow   = `0 0 0 3px ${C.accentLight}`;
  };
  const handleBlur = (e, hasErr) => {
    e.target.style.borderColor = hasErr ? '#FECACA' : C.border;
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: C.accent }}
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span
            className="text-xl font-bold"
            style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
          >
            Gestion École
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}
        >
          <div className="mb-7 text-center">
            <h2
              className="text-2xl font-semibold"
              style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
            >
              Connexion
            </h2>
            <p className="text-sm mt-1.5" style={{ color: C.textMuted }}>
              Entrez vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: C.textPrimary }}
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: C.textMuted }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@2ie-edu.org"
                  style={{ ...inputStyle(false), paddingLeft: '44px' }}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, false)}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: C.textPrimary }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: C.textMuted }}
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle(false), paddingLeft: '44px', paddingRight: '48px' }}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: C.textMuted }}
                  aria-label={showPass ? 'Masquer' : 'Afficher'}
                  onMouseEnter={e => e.currentTarget.style.color = C.textPrimary}
                  onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm disabled:opacity-70"
              style={{ backgroundColor: loading ? C.accentLight : C.accent, color: loading ? C.accent : 'white' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = C.accentHover; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = C.accent; }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" style={{ color: C.accent }} /> <span style={{ color: C.accent }}>Connexion en cours…</span></>
                : 'Se connecter'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: C.textMuted }}>
          © {new Date().getFullYear()} Gestion École — Tous droits réservés
        </p>
      </div>
    </div>
  );
}