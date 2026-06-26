import React, { useState } from 'react';
import { PHASES, DEFAULT_SCHEDULE } from '../fertSchedule';

export default function ScheduleEditor({ schedule, onSave, onClose }) {
  const [localSchedule, setLocalSchedule] = useState(
    schedule || DEFAULT_SCHEDULE.map(s => ({ ...s, products: s.products.map(p => ({ ...p })) }))
  );

  function updateProduct(weekIdx, prodIdx, field, value) {
    const s = localSchedule.map((w, wi) => wi === weekIdx
      ? { ...w, products: w.products.map((p, pi) => pi === prodIdx ? { ...p, [field]: value } : p) }
      : w
    );
    setLocalSchedule(s);
  }

  function addProduct(weekIdx) {
    const s = localSchedule.map((w, wi) => wi === weekIdx
      ? { ...w, products: [...w.products, { name: '', dose: 1, unit: 'ml/L' }] }
      : w
    );
    setLocalSchedule(s);
  }

  function removeProduct(weekIdx, prodIdx) {
    const s = localSchedule.map((w, wi) => wi === weekIdx
      ? { ...w, products: w.products.filter((_, pi) => pi !== prodIdx) }
      : w
    );
    setLocalSchedule(s);
  }

  const phases = Object.entries(PHASES);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,46,26,0.5)',
      zIndex: 2000, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '20px 12px',
    }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680, height: 'fit-content', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid #ede9e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1a2e1a' }}>
            Programa de fertilización
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#7a7060' }}>✕</button>
        </div>

        <div style={{ padding: '12px 24px', maxHeight: '75vh', overflowY: 'auto' }}>
          {phases.map(([phaseKey, phase]) => (
            <div key={phaseKey} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: phase.color }} />
                <span style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{phase.label}</span>
                <span style={{ fontSize: 12, color: '#7a7060' }}>Semanas {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}</span>
              </div>

              {phase.weeks.map(weekNum => {
                const weekIdx = localSchedule.findIndex(s => s.week === weekNum);
                if (weekIdx === -1) return null;
                const weekData = localSchedule[weekIdx];

                return (
                  <div key={weekNum} style={{ marginBottom: 8, paddingLeft: 18, borderLeft: `2px solid ${phase.color}20` }}>
                    <div style={{ fontSize: 12, color: '#7a7060', marginBottom: 4, fontWeight: 500 }}>Semana {weekNum}</div>
                    {weekData.products.map((prod, pi) => (
                      <div key={pi} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                        <input
                          value={prod.name}
                          onChange={e => updateProduct(weekIdx, pi, 'name', e.target.value)}
                          placeholder="Nombre del producto"
                          style={{ flex: 2, padding: '5px 8px', borderRadius: 5, border: '0.5px solid #d8d2c8', fontSize: 13 }}
                        />
                        <input
                          type="number" min="0" step="0.1"
                          value={prod.dose}
                          onChange={e => updateProduct(weekIdx, pi, 'dose', parseFloat(e.target.value))}
                          style={{ width: 70, padding: '5px 8px', borderRadius: 5, border: '0.5px solid #d8d2c8', fontSize: 13 }}
                        />
                        <select
                          value={prod.unit}
                          onChange={e => updateProduct(weekIdx, pi, 'unit', e.target.value)}
                          style={{ padding: '5px 6px', borderRadius: 5, border: '0.5px solid #d8d2c8', fontSize: 12 }}
                        >
                          <option>ml/L</option>
                          <option>g/L</option>
                          <option>ml</option>
                          <option>g</option>
                        </select>
                        <button
                          onClick={() => removeProduct(weekIdx, pi)}
                          style={{ background: 'none', border: 'none', color: '#c76b2a', fontSize: 16, padding: '0 4px' }}
                        >×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => addProduct(weekIdx)}
                      style={{ fontSize: 12, color: '#4a7c59', background: 'none', border: 'none', marginTop: 2 }}
                    >+ Añadir producto</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '0.5px solid #ede9e2', display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 6, border: '0.5px solid #d8d2c8', background: '#fff', color: '#7a7060', fontSize: 14 }}
          >Cancelar</button>
          <button
            onClick={() => { onSave(localSchedule); onClose(); }}
            style={{ flex: 2, padding: '10px', borderRadius: 6, border: 'none', background: '#4a7c59', color: '#fff', fontSize: 14, fontWeight: 500 }}
          >Guardar programa</button>
        </div>
      </div>
    </div>
  );
}
