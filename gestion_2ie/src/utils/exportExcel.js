// src/utils/exportExcel.js
import * as XLSX from 'xlsx';

/**
 * Exporte des données en fichier Excel (.xlsx)
 *
 * @param {object[]} data       Tableau de données à exporter
 * @param {object[]} columns    Colonnes [{key, label}] — même format que TablePage
 * @param {string}   filename   Nom du fichier sans extension
 * @param {string}   sheetName  Nom de l'onglet (optionnel)
 */
export function exportToExcel(data, columns, filename = 'export', sheetName = 'Données') {
  // 1. Construire les lignes avec seulement les colonnes visibles
  //    On ignore les colonnes render complexes (badges, boutons...)
  const rows = data.map((row, i) => {
    const obj = { '#': i + 1 };
    columns.forEach((col) => {
      // Si la colonne a un render, on essaie d'extraire la valeur brute
      // sinon on prend directement row[col.key]
      const val = row[col.key];
      if (val === null || val === undefined) {
        obj[col.label] = '';
      } else if (typeof val === 'boolean') {
        obj[col.label] = val ? 'Oui' : 'Non';
      } else {
        obj[col.label] = val;
      }
    });
    return obj;
  });

  // 2. Créer la feuille
  const ws = XLSX.utils.json_to_sheet(rows);

  // 3. Largeurs de colonnes automatiques
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? '').length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws['!cols'] = colWidths;

  // 4. Style en-têtes (fond bleu foncé, texte blanc)
  const headers = Object.keys(rows[0] ?? {});
  headers.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      fill:  { fgColor: { rgb: '1a1264' } },
      font:  { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center' },
    };
  });

  // 5. Créer le workbook et télécharger
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
}

/**
 * Export spécial pour les pages sans TablePage (ResultatsFinAnnee etc.)
 * Accepte des colonnes avec labels personnalisés
 *
 * @param {object[]} data
 * @param {object}   mapping  { 'Colonne Excel': 'key_du_row' | fn(row) }
 * @param {string}   filename
 * @param {string}   sheetName
 */
export function exportCustomToExcel(data, mapping, filename = 'export', sheetName = 'Données') {
  const rows = data.map((row, i) => {
    const obj = { '#': i + 1 };
    Object.entries(mapping).forEach(([label, keyOrFn]) => {
      if (typeof keyOrFn === 'function') {
        obj[label] = keyOrFn(row) ?? '';
      } else {
        const val = row[keyOrFn];
        obj[label] = val === null || val === undefined ? '' : val;
      }
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.min(Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2, 40),
  }));
  ws['!cols'] = colWidths;

  // En-têtes stylées
  Object.keys(rows[0] ?? {}).forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      fill:  { fgColor: { rgb: '1a1264' } },
      font:  { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center' },
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
}