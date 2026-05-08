// src/pages/Parcours.jsx
import { useState, useEffect } from 'react';
import TablePage from '../components/TablePage';
import { FieldInput, FieldSelect } from '../components/FormField';
import { parcoursService, specialitesService, niveauxService, cyclesService } from '../api/services';

const columns = [
  { key: 'libelle',            label: 'Parcours'   },
  { key: 'specialite_libelle', label: 'Spécialité' },
  { key: 'niveau_libelle',     label: 'Niveau'     },
  { key: 'cycle_libelle',      label: 'Cycle'      },
];

const emptyValues = { libelle: '', specialites_id: '', niveaux_id: '', cycles_id: '' };

function FormFields({ values, onChange, errors }) {
  const [specialites, setSpecialites] = useState([]);
  const [niveaux,     setNiveaux]     = useState([]);
  const [cycles,      setCycles]      = useState([]);

  useEffect(() => {
    Promise.all([
      specialitesService.getAll(),
      niveauxService.getAll(),
      cyclesService.getAll(),
    ]).then(([sp, nv, cy]) => {
      setSpecialites(sp.data);
      setNiveaux(nv.data);
      setCycles(cy.data);
    }).catch(() => {});
  }, []);

  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : GL-L1"
        required
      />
      <FieldSelect
        label="Spécialité"
        value={values.specialites_id}
        onChange={(v) => onChange('specialites_id', v)}
        error={errors.specialites_id}
        options={specialites}
        required
      />
      <FieldSelect
        label="Niveau"
        value={values.niveaux_id}
        onChange={(v) => onChange('niveaux_id', v)}
        error={errors.niveaux_id}
        options={niveaux}
        required
      />
      <FieldSelect
        label="Cycle"
        value={values.cycles_id}
        onChange={(v) => onChange('cycles_id', v)}
        error={errors.cycles_id}
        options={cycles}
      />
    </>
  );
}

export default function Parcours() {
  return (
    <TablePage
      title="Parcours"
      columns={columns}
      service={parcoursService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle', 'specialite_libelle', 'niveau_libelle', 'cycle_libelle']}
      exportFilename="parcours"
      exportSheetName="Parcours"
    />
  );
}