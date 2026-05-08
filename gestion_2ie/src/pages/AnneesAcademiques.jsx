// src/pages/AnneesAcademiques.jsx
import TablePage from '../components/TablePage';
import { FieldInput, FieldToggle } from '../components/FormField';
import { anneesService } from '../api/services';

const columns = [
  { key: 'libelle',    label: 'Année' },
  { key: 'date_debut', label: 'Début' },
  { key: 'date_fin',   label: 'Fin'   },
  {
    key: 'est_active',
    label: 'Statut',
    render: (row) => row.est_active
      ? (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}
        >
          Active
        </span>
      ) : (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
        >
          Inactive
        </span>
      ),
  },
];

const emptyValues = { libelle: '', date_debut: '', date_fin: '', est_active: false };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : 2024-2025"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <FieldInput
          label="Date début"
          type="date"
          value={values.date_debut}
          onChange={(v) => onChange('date_debut', v)}
          error={errors.date_debut}
          required
        />
        <FieldInput
          label="Date fin"
          type="date"
          value={values.date_fin}
          onChange={(v) => onChange('date_fin', v)}
          error={errors.date_fin}
          required
        />
      </div>
      <FieldToggle
        label="Année active"
        sublabel="(désactive les autres automatiquement)"
        value={values.est_active}
        onChange={(v) => onChange('est_active', v)}
      />
    </>
  );
}

export default function AnneesAcademiques() {
  return (
    <TablePage
      title="Années académiques"
      columns={columns}
      service={anneesService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle']}
      exportFilename="annees_academiques"
      exportSheetName="Années académiques"
    />
  );
}