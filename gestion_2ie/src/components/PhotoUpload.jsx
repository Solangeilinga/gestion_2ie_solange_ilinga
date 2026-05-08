// src/components/PhotoUpload.jsx
import { useRef, useState } from 'react';
import { Camera, X, User } from 'lucide-react';

const AVATAR_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#E11D48',
  '#EA580C', '#D97706', '#059669', '#0D9488',
];
const getColor = (nom = '') => AVATAR_COLORS[nom.charCodeAt(0) % AVATAR_COLORS.length] ?? '#8896A5';

export default function PhotoUpload({ value, onChange, nom = '', prenoms = '' }) {
  const inputRef = useRef();
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 2 Mo.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const initiales = `${prenoms?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  const avatarColor = getColor(nom);

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="relative">
        {value ? (
          <img
            src={value}
            alt="Photo"
            className="w-20 h-20 rounded-full object-cover"
            style={{ border: '2px solid #E4E7ED', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{
              backgroundColor: avatarColor,
              border: '2px solid #E4E7ED',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {initiales || <User className="w-8 h-8 opacity-60" />}
          </div>
        )}

        {/* Bouton caméra */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-7 h-7 text-white rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: '#4F46E5', boxShadow: '0 2px 6px rgba(79,70,229,0.4)' }}
          title="Choisir une photo"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4338CA'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F46E5'}
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        {/* Bouton supprimer */}
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setError(''); }}
            className="absolute top-0 right-0 w-6 h-6 text-white rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#DC2626' }}
            title="Supprimer la photo"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#B91C1C'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#DC2626'}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="text-center">
        <p className="text-xs font-medium" style={{ color: '#4B5568' }}>
          Photo de profil <span style={{ color: '#8896A5' }}>(optionnel)</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#8896A5' }}>JPG, PNG · max 2 Mo</p>
      </div>

      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}