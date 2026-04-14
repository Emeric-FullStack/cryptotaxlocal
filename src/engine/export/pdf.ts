import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TaxSummary } from '../../types';
import { formatEUR } from '../tax-rules/france';

export function exportTaxReportPDF(summary: TaxSummary): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport Fiscal Crypto', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Annee fiscale ${summary.year}`, pageWidth / 2, 33, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} par CryptoTaxLocal`, pageWidth / 2, 39, { align: 'center' });
  doc.text('Outil indicatif - ne constitue pas un conseil fiscal - PFU 31,4% (IR 12,8% + PS 18,6%)', pageWidth / 2, 44, { align: 'center' });
  doc.setTextColor(0);

  // Summary table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resume', 14, 56);

  autoTable(doc, {
    startY: 60,
    head: [['Element', 'Montant']],
    body: [
      ['Nombre d\'operations imposables', summary.numberOfTransactions.toString()],
      ['Total des cessions (prix de vente)', formatEUR(summary.totalProceeds)],
      ['Total des acquisitions (cout d\'achat)', formatEUR(summary.totalCostBasis)],
      ['Plus-values realisees', formatEUR(summary.totalGain)],
      ['Moins-values realisees', formatEUR(summary.totalLoss)],
      ['Gain net imposable', formatEUR(summary.netGainLoss)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  // Tax calculation
  const y1 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const modeLabel = summary.taxMode === 'flat_tax'
    ? 'Flat Tax 31,4% - PFU 2026'
    : 'Bareme progressif + PS 18,6%';
  const irLabel = summary.taxMode === 'flat_tax'
    ? 'Impot sur le revenu (IR 12,8%)'
    : 'Impot sur le revenu (bareme progressif)';
  const irRate = summary.taxMode === 'flat_tax'
    ? '12,8%'
    : `${(summary.effectiveRate > 0 && summary.incomeTaxPart > 0 ? ((summary.incomeTaxPart / Math.max(1, summary.netGainLoss)) * 100).toFixed(1) : '0')}%`;
  const totalRate = summary.effectiveRate > 0 ? `${(summary.effectiveRate * 100).toFixed(1)}%` : '0%';

  doc.text(`Calcul de l'impot (${modeLabel})`, 14, y1);

  autoTable(doc, {
    startY: y1 + 4,
    head: [['Composante', 'Taux', 'Montant']],
    body: [
      [irLabel, irRate, formatEUR(summary.incomeTaxPart)],
      ['Prelevements sociaux (CSG/CRDS/PS)', '18,6%', formatEUR(summary.socialChargesPart)],
      ['TOTAL A PAYER', totalRate, formatEUR(summary.taxDue)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    bodyStyles: { },
    didParseCell: (data) => {
      // Bold the total row
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Detail of operations
  const y2 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail des operations imposables', 14, y2);

  const eventRows = summary.events.map((e) => [
    e.date.toLocaleDateString('fr-FR'),
    e.asset,
    e.amountSold.toFixed(4),
    formatEUR(e.unitPriceEUR),
    e.feesEUR > 0 ? formatEUR(e.feesEUR) : '-',
    formatEUR(e.netProceedsEUR),
    formatEUR(e.costBasisEUR),
    `${e.gainLoss >= 0 ? '+' : ''}${formatEUR(e.gainLoss)}`,
  ]);

  autoTable(doc, {
    startY: y2 + 4,
    head: [['Date', 'Actif', 'Qte', 'Cours EUR', 'Frais', 'Cession nette', 'Acquisition', '+/- Value']],
    body: eventRows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
    styles: { fontSize: 8 },
    didParseCell: (data) => {
      // Color gain/loss column
      if (data.section === 'body' && data.column.index === 7) {
        const val = summary.events[data.row.index]?.gainLoss;
        if (val !== undefined) {
          data.cell.styles.textColor = val >= 0 ? [16, 185, 129] : [239, 68, 68];
        }
      }
    },
  });

  // Formulaire 2086 helper
  const y3 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (y3 > 260) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Aide au remplissage - Formulaire 2086', 14, 20);

    autoTable(doc, {
      startY: 24,
      body: [
        ['Case 3AN (plus-values)', summary.netGainLoss > 0 ? formatEUR(summary.netGainLoss) : '0'],
        ['Case 3BN (moins-values)', summary.netGainLoss < 0 ? formatEUR(Math.abs(summary.netGainLoss)) : '0'],
        ['Prix total des cessions', formatEUR(summary.totalProceeds)],
        ['Nombre de cessions', summary.numberOfTransactions.toString()],
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
    });
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Aide au remplissage - Formulaire 2086', 14, y3);

    autoTable(doc, {
      startY: y3 + 4,
      body: [
        ['Case 3AN (plus-values)', summary.netGainLoss > 0 ? formatEUR(summary.netGainLoss) : '0'],
        ['Case 3BN (moins-values)', summary.netGainLoss < 0 ? formatEUR(Math.abs(summary.netGainLoss)) : '0'],
        ['Prix total des cessions', formatEUR(summary.totalProceeds)],
        ['Nombre de cessions', summary.numberOfTransactions.toString()],
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `CryptoTaxLocal - Rapport genere automatiquement - Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`rapport-fiscal-crypto-${summary.year}.pdf`);
}
