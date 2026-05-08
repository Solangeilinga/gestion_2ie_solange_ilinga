// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import {
  Users, ClipboardList, School, BookOpen, TrendingUp,
  GraduationCap, Loader2, AlertCircle, Globe, Calendar,
} from 'lucide-react';
import { statsService } from '../api/services';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  textPrimary: '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  tableHead:   '#F0F2F7',
  rowAlt:      '#F7F8FA',
};

const CHART_COLORS = ['#4F46E5','#7C3AED','#EC4899','#F59E0B','#10B981','#3B82F6','#F97316','#14B8A6'];
const DECISION_COLORS = {
  'Admis':'#10B981','Admis sous condition':'#F59E0B','Redoublant':'#F97316',
  'Refusé':'#EF4444','Inscrit':'#4F46E5','Exclu':'#9CA3AF','Diplômé':'#7C3AED',
};
const BADGE = {
  'Admis':'#ECFDF5:#065F46','Admis sous condition':'#FFFBEB:#92400E','Redoublant':'#FFF7ED:#9A3412',
  'Refusé':'#FEF2F2:#991B1B','Inscrit':'#EEF2FF:#3730A3','Exclu':'#F3F4F6:#374151','Diplômé':'#F5F3FF:#5B21B6',
};
const badgeStyle = (libelle) => {
  const pair = BADGE[libelle]?.split(':') ?? ['#F3F4F6', '#374151'];
  return { backgroundColor: pair[0], color: pair[1] };
};

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div
      className="flex items-center gap-4 p-5 rounded-xl"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}>
          {value ?? '—'}
        </p>
        <p className="text-sm mt-1" style={{ color: C.textMuted }}>{label}</p>
      </div>
    </div>
  );
}

function BarChart({ data = [] }) {
  if (!data.length) return <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>Aucune donnée.</p>;
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = Math.round((item.count / maxVal) * 100);
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return (
          <div key={i} className="flex items-center gap-3">
            <p
              className="text-xs w-28 truncate shrink-0"
              style={{ color: C.textSecondary }}
              title={item.libelle}
            >
              {item.libelle}
            </p>
            <div className="flex-1 rounded-full h-6 overflow-hidden" style={{ backgroundColor: C.bg }}>
              <div
                className="h-full rounded-full flex items-center justify-end pr-2.5 transition-all duration-500"
                style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: color }}
              >
                <span className="text-xs text-white font-semibold">{item.count}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ data = [], size = 168 }) {
  if (!data.length) return <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>Aucune donnée.</p>;
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 60; const cx = size / 2; const cy = size / 2;
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const end = angle + sweep;
    const x1 = cx + r * Math.cos(angle); const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(end);   const y2 = cy + r * Math.sin(end);
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${sweep > Math.PI ? 1 : 0},1 ${x2},${y2} Z`;
    const color = DECISION_COLORS[d.libelle] ?? CHART_COLORS[i % CHART_COLORS.length];
    angle = end;
    return { ...d, path, color, pct: Math.round((d.count / total) * 100) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={2}>
            <title>{s.libelle} : {s.count} ({s.pct}%)</title>
          </path>
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={22} fontWeight="700" fill={C.textPrimary} fontFamily="Sora, sans-serif">{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize={10} fill={C.textMuted}>inscriptions</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <p className="text-sm truncate flex-1" style={{ color: C.textSecondary }}>{s.libelle}</p>
            <span className="text-sm font-semibold shrink-0" style={{ color: C.textPrimary }}>
              {s.count} <span style={{ color: C.textMuted, fontWeight: 400 }}>({s.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColumnChart({ data = [] }) {
  if (!data.length) return <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>Aucune donnée.</p>;
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const pct = Math.round((item.count / maxVal) * 100);
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>{item.count}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color }}
              title={`${item.libelle} : ${item.count}`}
            />
            <p className="text-[10px] text-center truncate w-full" style={{ color: C.textMuted }}>{item.libelle}</p>
          </div>
        );
      })}
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <h2
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-5"
        style={{ color: C.textMuted }}
      >
        <Icon className="w-3.5 h-3.5" /> {title}
      </h2>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    statsService.dashboard()
      .then((res) => setStats(res.data))
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm" style={{ color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
      <Loader2 className="w-5 h-5 animate-spin mr-2" />Chargement du tableau de bord…
    </div>
  );
  if (error) return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
      style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
    >
      <AlertCircle className="w-4 h-4 shrink-0" />{error}
    </div>
  );

  const { kpi, par_decision, par_filiere, par_pays, par_annee, recentes } = stats;

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: C.textMuted }}>
          Année active :{' '}
          <span className="font-semibold" style={{ color: C.accent }}>
            {kpi.annee_active ?? 'Aucune'}
          </span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Étudiants"    value={kpi.total_etudiants}    icon={Users}         color="#4F46E5" />
        <KpiCard label="Inscriptions" value={kpi.total_inscriptions} icon={ClipboardList} color="#7C3AED" />
        <KpiCard label="Écoles"       value={kpi.total_ecoles}       icon={School}        color="#0D9488" />
        <KpiCard label="Filières"     value={kpi.total_filieres}     icon={BookOpen}      color="#D97706" />
        <KpiCard label="Parcours"     value={kpi.total_parcours}     icon={TrendingUp}    color="#DB2777" />
        <KpiCard label="Spécialités"  value={kpi.total_specialites}  icon={GraduationCap} color="#059669" />
      </div>

      {/* Graphiques ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Décisions — année active" icon={ClipboardList}>
          <PieChart data={par_decision} />
        </ChartCard>
        <ChartCard title="Inscriptions par filière — année active" icon={BookOpen}>
          <BarChart data={par_filiere} />
        </ChartCard>
      </div>

      {/* Graphiques ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Étudiants par nationalité — top 8" icon={Globe}>
          <BarChart data={par_pays} />
        </ChartCard>
        <ChartCard title="Évolution des inscriptions par année" icon={Calendar}>
          <ColumnChart data={par_annee} />
        </ChartCard>
      </div>

      {/* Inscriptions récentes */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.tableHead }}
        >
          <ClipboardList className="w-4 h-4" style={{ color: C.textMuted }} />
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
            Inscriptions récentes
          </h2>
          <span className="ml-auto text-xs" style={{ color: C.textMuted }}>{recentes.length} dernières</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: C.tableHead, borderBottom: `2px solid ${C.border}` }}>
                {['#','Étudiant','Parcours','Année','Décision','Date'].map((h, i) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left"
                    style={{
                      color: C.textMuted,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderRight: i < 5 ? `1px solid ${C.border}` : 'none',
                      width: i === 0 ? '40px' : 'auto',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentes.map((ins, i) => (
                <tr
                  key={ins.id}
                  className="transition-colors"
                  style={{
                    backgroundColor: i % 2 === 0 ? C.card : C.rowAlt,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EEF2FF'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? C.card : C.rowAlt}
                >
                  <td className="px-4 py-3" style={{ color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', borderRight: `1px solid ${C.border}`, backgroundColor: C.tableHead }}>{i + 1}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: C.textPrimary, borderRight: `1px solid ${C.border}` }}>{ins.abreviation} {ins.prenoms} {ins.nom}</td>
                  <td className="px-4 py-3 max-w-[150px] truncate" style={{ color: C.textSecondary, borderRight: `1px solid ${C.border}` }}>{ins.parcours_libelle}</td>
                  <td className="px-4 py-3" style={{ color: C.textSecondary, borderRight: `1px solid ${C.border}` }}>{ins.annee_libelle}</td>
                  <td className="px-4 py-3" style={{ borderRight: `1px solid ${C.border}` }}>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={badgeStyle(ins.decision_libelle)}
                    >
                      {ins.decision_libelle}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: C.textSecondary }}>
                    {ins.dateInscription ? new Date(ins.dateInscription).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}