// src/pages/Specialites.jsx
import { useState, useEffect } from 'react';
import TablePage from '../components/TablePage';
import { FieldInput, FieldTextarea, FieldSelect } from '../components/FormField';
import { specialitesService, filieresService } from '../api/services';

const columns = [
  { key: 'filiere_libelle', label: 'Filière'     },
  { key: 'libelle',         label: 'Spécialité'  },
  { key: 'description',     label: 'Description' },
];

const emptyValues = { libelle: '', filieres_id: '', description: '' };

function FormFields({ values, onChange, errors }) {
  const [filieres, setFilieres] = useState([]);

  useEffect(() => {
    filieresService.getAll().then((res) => setFilieres(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <FieldSelect
        label="Filière"
        value={values.filieres_id}
        onChange={(v) => onChange('filieres_id', v)}
        error={errors.filieres_id}
        options={filieres}
        required
      />
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Génie Logiciel"
        required
      />
      <FieldTextarea
        label="Description"
        value={values.description}
        onChange={(v) => onChange('description', v)}
        placeholder="Décrivez cette spécialité…"
        rows={3}
      />
    </>
  );
}

export default function Specialites() {
  return (
    <TablePage
      title="Spécialités"
      columns={columns}
      service={specialitesService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle', 'filiere_libelle']}
      exportFilename="specialites"
      exportSheetName="Spécialités"
    />
  );
}