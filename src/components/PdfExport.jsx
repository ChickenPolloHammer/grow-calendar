import React, { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, differenceInCalendarWeeks,
  eachMonthOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getPhaseForWeek } from '../fertSchedule';

const EVENT_ICONS = { water: '💧', fert: '🌿', rain: '🌧' };

function getPrintStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #1a2e1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 210mm; min-height: 297mm; padding: 14mm 12mm; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 22pt; color: #1a2e1a; }
    h2 { font-family: 'DM Serif Display', serif; font-size: 16pt; color: #1a2e1a; text-transform: capitalize; }
    h3 { font-family: 'DM Serif Display', serif; font-size: 12pt; color: #1a2e1a; }
    .month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-top: 6px; }
    .day-header { text-align: center; font-size: 7pt; color: #7a7060; font-weight: 500; padding: 3px 0; }
    .week-row { margin-bottom: 2px; }
    .fert-bar { display: flex; align-items: center; gap: 6px; padding: 2px 6px; border-radius: 3px; margin-bottom: 2px; font-size: 6.5pt; border-left-width: 3px; border-left-style: solid; }
    .day-cell { border: 0.5px solid #d8d2c8; border-radius: 3px; padding: 3px 4px; min-height: 28mm; font-size: 7pt; vertical-align: top; }
    .day-cell.other-month { opacity: 0.3; }
    .day-cell.germ { border: 1.5px solid #4a7c59; background: #f0faf2; }
    .day-cell.est-harvest { border: 1.5px dashed #d4820a; background: #fffef8; }
    .day-cell.real-harvest { border: 1.5px solid #d4820a; background: #fffbf0; }
    .day-cell.today { border: 1.5px solid #4a7c59; }
    .day-num { font-weight: 500; font-size: 8pt; }
    .badge { display: inline-block; border-radius: 3px; padding: 1px 4px; font-size: 6pt; margin: 1px 1px 0 0; }
    .note { font-size: 6pt; color: #7a7060; font-style: italic; margin-top: 2px; }
    .cover-meta { font-size: 10pt; color: #4a7c59; margin-top: 4px; }
    .cover-dates { font-size: 9pt; color: #7a7060; margin-top: 2px; }
    .phase-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .phase-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
    .fert-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8pt; }
    .fert-table th { background: #1a2e1a; color: #e8f4ea; padding: 4px 6px; text-align: left; font-weight: 500; }
    .fert-table td { padding: 3px 6px; border-bottom: 0.5px solid #ede9e2; }
    .fert-table tr:nth-child(even) td { background: #f7f4ef; }
    .phase-cell { font-weight: 600; font-size: 7pt; }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  `;
}

function buildCalendarMonths(germDate, harvestDate, calendarData, scaledSchedule, scaledPhases, germDateStr, harvestDateStr, realHarvestDateStr) {
  const germ = new Date(germDate);
  const harvest = new Date(harvestDate);
  const months = eachMonthOfInterval({ start: germ, end: harvest });

  function getWeekNum(date) {
    if (date < germ) return null;
    if (date > harvest) return null;
    const germMonday = startOfWeek(germ, { weekStartsOn: 1 });
    const week = differenceInCalendarWeeks(date, germMonday, { weekStartsOn: 1 }) + 1;
    return week >= 1 ? week : null;
  }

  function getFertForWeek(weekNum) {
    if (!weekNum || !scaledSchedule) return null;
    const entry = scaledSchedule.find(s => s.week === weekNum);
    return entry?.products?.length ? entry.products : null;
  }

  return months.map(monthDate => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    return { monthDate, weeks, getWeekNum, getFertForWeek };
  });
}

export default function PdfExport({ grow, scaledSchedule, scaledPhases, onClose }) {
  const [generating, setGenerating] = useState(false);

  const { name, germ_date, harvest_date, real_harvest_date, calendar_data } = grow;

  function generateAndPrint() {
    if (!germ_date || !harvest_date) {
      alert('Necesitas configurar las fechas de germinación y cosecha primero.');
      return;
    }
    setGenerating(true);

    const months = buildCalendarMonths(
      germ_date, harvest_date, calendar_data,
      scaledSchedule, scaledPhases,
      germ_date, harvest_date, real_harvest_date
    );

    const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    function renderDay(day, inMonth, getWeekNum) {
      const key = format(day, 'yyyy-MM-dd');
      const dayStr = key;
      const data = calendar_data[key];
      const events = data?.events || [];
      const note = data?.note || '';
      const isGerm = dayStr === germ_date;
      const isEst = dayStr === harvest_date;
      const isReal = dayStr === real_harvest_date;
      const weekNum = getWeekNum(day);
      const inCycle = weekNum !== null;

      let cls = 'day-cell';
      if (!inMonth) cls += ' other-month';
      if (isGerm) cls += ' germ';
      else if (isReal) cls += ' real-harvest';
      else if (isEst) cls += ' est-harvest';

      const bg = !inCycle && inMonth ? '#f9f9f9' : '';

      return `
        <div class="${cls}" style="${bg ? 'background:' + bg + ';' : ''}">
          <div class="day-num" style="color:${isGerm ? '#4a7c59' : (isEst || isReal) ? '#d4820a' : '#1a2e1a'}">
            ${day.getDate() === 1 ? format(day, 'd MMM', { locale: es }) : day.getDate()}
          </div>
          ${isGerm ? '<div style="font-size:6pt;color:#4a7c59;font-weight:600;">🌱 Germinación</div>' : ''}
          ${isEst && !isReal ? '<div style="font-size:6pt;color:#d4820a;font-weight:600;">🌾 Cosecha est.</div>' : ''}
          ${isReal ? '<div style="font-size:6pt;color:#d4820a;font-weight:600;">🌾 Cosecha ✓</div>' : ''}
          ${events.map(ev => {
            const bg = ev.type === 'water' ? '#e3f0f8' : ev.type === 'fert' ? '#e8f4ea' : '#eaf0f5';
            const color = ev.type === 'water' ? '#3a7ca8' : ev.type === 'fert' ? '#4a7c59' : '#6b8fa8';
            return `<span class="badge" style="background:${bg};color:${color}">${EVENT_ICONS[ev.type] || ''} ${ev.liters ? ev.liters + 'L' : ev.type}</span>`;
          }).join('')}
          ${note ? `<div class="note">${note}</div>` : ''}
        </div>`;
    }

    // Build month pages HTML
    const monthPages = months.map(({ monthDate, weeks, getWeekNum, getFertForWeek }) => {
      const label = format(monthDate, "MMMM yyyy", { locale: es });
      const weeksHtml = weeks.map(week => {
        const repDay = week.find(d => isSameMonth(d, monthDate)) || week[0];
        const weekNum = getWeekNum(repDay);
        const fert = getFertForWeek(weekNum);
        const phase = weekNum ? getPhaseForWeek(weekNum, scaledPhases) : null;
        const hasVisible = week.some(d => isSameMonth(d, monthDate)) && weekNum;

        const fertBar = hasVisible ? `
          <div class="fert-bar" style="background:${phase ? phase.color + '18' : '#f7f4ef'};border-left-color:${phase ? phase.color : '#d8d2c8'}">
            <span style="font-weight:600;color:${phase ? phase.color : '#7a7060'}">S${weekNum}${phase ? ' · ' + phase.label : ''}</span>
            ${fert ? fert.map(p => `<span style="color:#4a7c59">🌿 ${p.name} <strong>${p.dose}${p.unit}</strong></span>`).join('') : ''}
          </div>` : '';

        return `
          <div class="week-row">
            ${fertBar}
            <div class="month-grid">
              ${week.map(day => renderDay(day, isSameMonth(day, monthDate), getWeekNum)).join('')}
            </div>
          </div>`;
      }).join('');

      return `
        <div class="page">
          <h2>${label}</h2>
          <div class="month-grid" style="margin-bottom:4px">
            ${DAYS.map(d => `<div class="day-header">${d}</div>`).join('')}
          </div>
          ${weeksHtml}
        </div>`;
    }).join('');

    // Fert schedule table
    const fertRows = scaledSchedule.filter(s => s.products.length > 0).map(s => {
      const phase = getPhaseForWeek(s.week, scaledPhases);
      return `
        <tr>
          <td style="text-align:center;font-weight:600">${s.week}</td>
          <td class="phase-cell" style="color:${phase?.color ?? '#1a2e1a'}">${phase?.label ?? '—'}</td>
          <td>${s.products.map(p => `${p.name} <strong>${p.dose}${p.unit}</strong>`).join(' &nbsp;·&nbsp; ')}</td>
        </tr>`;
    }).join('');

    const cycleDays = Math.round((new Date(harvest_date) - new Date(germ_date)) / 86400000);

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Grow Calendar – ${name}</title>
  <style>${getPrintStyles()}</style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page">
    <div style="border-left:5px solid #4a7c59;padding-left:16px;margin-bottom:24px">
      <h1>🌱 ${name}</h1>
      <div class="cover-meta">Ciclo de ${cycleDays} días · ${months.length} meses</div>
      <div class="cover-dates">
        Germinación: ${format(new Date(germ_date), "d 'de' MMMM yyyy", { locale: es })}
        &nbsp;→&nbsp;
        ${real_harvest_date
          ? 'Cosecha: ' + format(new Date(real_harvest_date), "d 'de' MMMM yyyy", { locale: es }) + ' ✓'
          : 'Cosecha estimada: ' + format(new Date(harvest_date), "d 'de' MMMM yyyy", { locale: es })}
      </div>
    </div>

    <!-- Phase legend -->
    <h3>Fases del ciclo</h3>
    <div class="phase-legend">
      ${Object.values(scaledPhases).map(ph => `
        <div style="display:flex;align-items:center;gap:4px;font-size:9pt">
          <span class="phase-dot" style="background:${ph.color}"></span>
          <span>${ph.label}</span>
          <span style="color:#7a7060;font-size:8pt">S${ph.weeks[0]}–${ph.weeks[ph.weeks.length - 1]}</span>
        </div>`).join('')}
    </div>

    <!-- Fert schedule table -->
    <h3 style="margin-top:20px">Programa de fertilización</h3>
    <table class="fert-table">
      <thead>
        <tr><th>Semana</th><th>Fase</th><th>Productos y dosis</th></tr>
      </thead>
      <tbody>${fertRows}</tbody>
    </table>

    <div style="margin-top:auto;padding-top:20px;font-size:8pt;color:#aaa">
      Exportado el ${format(new Date(), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })} · Grow Calendar
    </div>
  </div>

  <!-- MONTH PAGES -->
  ${monthPages}

</body>
</html>`;

    // Open in new window and print
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      setTimeout(() => {
        win.print();
        setGenerating(false);
      }, 800);
    };
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,46,26,0.5)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(26,46,26,0.18)' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1a2e1a', marginBottom: 8 }}>
          Exportar a PDF
        </h2>

        <div style={{ fontSize: 13, color: '#7a7060', marginBottom: 20, lineHeight: 1.6 }}>
          Se generará un documento con:
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            <li>Portada con resumen del ciclo y programa completo de fertilización</li>
            <li>Un mes por página, con todos los registros de riego y notas</li>
            <li>Franja semanal con fase y fertilizantes de cada semana</li>
          </ul>
        </div>

        {(!grow.germ_date || !grow.harvest_date) && (
          <div style={{ background: '#fef3e2', border: '1px solid #d4820a', borderRadius: 7, padding: '10px 12px', fontSize: 12, color: '#b06a08', marginBottom: 16 }}>
            ⚠ Configura las fechas de germinación y cosecha antes de exportar.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 7, border: '0.5px solid #d8d2c8', background: '#fff', color: '#7a7060', fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={generateAndPrint}
            disabled={generating || !grow.germ_date || !grow.harvest_date}
            style={{
              flex: 2, padding: '10px', borderRadius: 7, border: 'none',
              background: generating || !grow.germ_date || !grow.harvest_date ? '#a3c4a8' : '#4a7c59',
              color: '#fff', fontSize: 14, fontWeight: 500,
              cursor: generating || !grow.germ_date || !grow.harvest_date ? 'default' : 'pointer',
            }}
          >
            {generating ? 'Generando…' : '📄 Generar y abrir PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
