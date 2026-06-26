import React, { useState } from 'react';
import { format } from 'date-fns';

const EVENT_TYPES = [
  { id: 'water', label: 'Agua', icon: '💧', color: '#3a7ca8', bg: '#e3f0f8' },
  { id: 'fert', label: 'Fertilizante', icon: '🌿', color: '#4a7c59', bg: '#e8f4ea' },
  { id: 'rain', label: 'Lluvia', icon: '🌧', color: '#6b8fa8', bg: '#eaf0f5' },
];

export default function DayCell({ date, isToday, isCurrentMonth, dayData, onUpdate, fertInfo, weekNum }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'water', liters: '', note: '' });

  const events = dayData?.events || [];
  const note = dayData?.note || '';

  function addEvent() {
    if (!form.type) return;
    const newEvent = { type: form.type, liters: form.liters ? parseFloat(form.liters) : null, id: Date.now() };
    onUpdate({ events: [...events, newEvent], note: dayData?.note || '' });
    setForm({ type: 'water', liters: '', note: '' });
    setShowModal(false);
  }

  function removeEvent(id) {
    onUpdate({ events: events.filter(e => e.id !== id), note: dayData?.note || '' });
  }

  function updateNote(val) {
    onUpdate({ events, note: val });
  }

  const dayNum = date.getDate();
  const isFirstDay = dayNum === 1;

  return (
    <>
      <div
        style={{
          minHeight: 110,
          background: isCurrentMonth ? '#fff' : '#f7f4ef',
          border: isToday ? '2px solid #4a7c59' : '0.5px solid #d8d2c8',
          borderRadius: 6,
          padding: '6px 7px',
          position: 'relative',
          opacity: isCurrentMonth ? 1 : 0.45,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Day number + week badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontWeight: isToday ? 600 : 400,
            fontSize: 13,
            color: isToday ? '#4a7c59' : '#3d2b1a',
            background: isToday ? '#e8f4ea' : 'transparent',
            borderRadius: 10,
            padding: isToday ? '0 5px' : 0,
            lineHeight: '18px',
          }}>
            {isFirstDay ? format(date, 'd MMM') : dayNum}
          </span>
          {weekNum && (
            <span style={{
              fontSize: 10,
              background: '#e8f4ea',
              color: '#4a7c59',
              borderRadius: 4,
              padding: '1px 5px',
              fontWeight: 500,
            }}>S{weekNum}</span>
          )}
        </div>

        {/* Events */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {events.map(ev => {
            const et = EVENT_TYPES.find(e => e.id === ev.type);
            return (
              <span
                key={ev.id}
                onClick={() => removeEvent(ev.id)}
                title={`${et?.label}${ev.liters ? ` · ${ev.liters}L` : ''} — clic para borrar`}
                style={{
                  background: et?.bg,
                  color: et?.color,
                  borderRadius: 4,
                  padding: '1px 5px',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  userSelect: 'none',
                }}
              >
                {et?.icon} {ev.liters ? `${ev.liters}L` : et?.label}
              </span>
            );
          })}
        </div>

        {/* Fert info */}
        {fertInfo && isCurrentMonth && (
          <div style={{ fontSize: 10, color: '#7a7060', lineHeight: 1.3 }}>
            {fertInfo.map((p, i) => (
              <div key={i}>{p.name}: <strong>{p.dose}{p.unit}</strong></div>
            ))}
          </div>
        )}

        {/* Note */}
        {note && (
          <div style={{ fontSize: 10, color: '#7a7060', fontStyle: 'italic', lineHeight: 1.3, marginTop: 'auto' }}>
            {note}
          </div>
        )}

        {/* Add button */}
        {isCurrentMonth && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '0.5px solid #d8d2c8',
              background: '#fff',
              color: '#7a7060',
              fontSize: 14,
              lineHeight: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >+</button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,46,26,0.4)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, padding: 24, minWidth: 280,
              boxShadow: '0 8px 32px rgba(26,46,26,0.18)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#1a2e1a' }}>
                {format(date, "d 'de' MMMM")}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#7a7060', display: 'block', marginBottom: 4 }}>Tipo de riego</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {EVENT_TYPES.map(et => (
                    <button
                      key={et.id}
                      onClick={() => setForm(f => ({ ...f, type: et.id }))}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 6,
                        border: `2px solid ${form.type === et.id ? et.color : '#d8d2c8'}`,
                        background: form.type === et.id ? et.bg : '#fff',
                        color: form.type === et.id ? et.color : '#7a7060',
                        fontSize: 12, fontWeight: 500,
                      }}
                    >
                      {et.icon}<br />{et.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#7a7060', display: 'block', marginBottom: 4 }}>Litros (opcional)</label>
                <input
                  type="number"
                  min="0" step="0.1"
                  value={form.liters}
                  onChange={e => setForm(f => ({ ...f, liters: e.target.value }))}
                  placeholder="ej. 2.5"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    border: '0.5px solid #d8d2c8', fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#7a7060', display: 'block', marginBottom: 4 }}>Nota del día</label>
                <textarea
                  value={note}
                  onChange={e => updateNote(e.target.value)}
                  placeholder="Observaciones, pH, EC..."
                  rows={2}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    border: '0.5px solid #d8d2c8', fontSize: 13, resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 6,
                    border: '0.5px solid #d8d2c8', background: '#fff', color: '#7a7060', fontSize: 14,
                  }}
                >Cancelar</button>
                <button
                  onClick={addEvent}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 6,
                    border: 'none', background: '#4a7c59', color: '#fff', fontSize: 14, fontWeight: 500,
                  }}
                >Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
