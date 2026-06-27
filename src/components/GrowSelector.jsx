import React, { useState } from 'react';

export default function GrowSelector({ grows, activeId, onSwitch, onCreate, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);

  const active = grows.find(g => g.id === activeId);

  function handleCreate() {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setShowNew(false);
    setShowMenu(false);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    if (grows.length <= 1) { alert('No puedes borrar el único cultivo.'); return; }
    if (window.confirm('¿Borrar este cultivo y todos sus datos?')) {
      onDelete(id);
      setShowMenu(false);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setShowMenu(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 6,
          border: '1px solid #4a7c59', background: showMenu ? '#2d4f2d' : 'transparent',
          color: '#7eb88a', fontSize: 13, cursor: 'pointer',
        }}
      >
        🌱 {active?.name || 'Sin cultivo'}
        <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
      </button>

      {/* Dropdown */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div onClick={() => { setShowMenu(false); setShowNew(false); }}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }} />

          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4,
            background: '#fff', borderRadius: 10, minWidth: 220,
            boxShadow: '0 6px 24px rgba(26,46,26,0.15)', zIndex: 1000,
            overflow: 'hidden', border: '0.5px solid #ede9e2',
          }}>
            {/* Grow list */}
            {grows.map(g => (
              <div
                key={g.id}
                onClick={() => { onSwitch(g.id); setShowMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', cursor: 'pointer',
                  background: g.id === activeId ? '#e8f4ea' : '#fff',
                  borderBottom: '0.5px solid #f0ece6',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: g.id === activeId ? 600 : 400, color: '#1a2e1a' }}>
                    {g.id === activeId ? '✓ ' : ''}{g.name}
                  </div>
                  {g.germ_date && (
                    <div style={{ fontSize: 11, color: '#7a7060', marginTop: 1 }}>
                      Germinación: {g.germ_date}
                      {g.harvest_date ? ` · Cosecha: ${g.harvest_date}` : ''}
                    </div>
                  )}
                </div>
                {grows.length > 1 && (
                  <button
                    onClick={e => handleDelete(e, g.id)}
                    title="Borrar cultivo"
                    style={{ background: 'none', border: 'none', color: '#c76b2a', fontSize: 16, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                  >×</button>
                )}
              </div>
            ))}

            {/* New grow */}
            <div style={{ padding: '10px 14px', borderTop: '0.5px solid #ede9e2' }}>
              {!showNew ? (
                <button
                  onClick={() => setShowNew(true)}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px dashed #4a7c59', background: 'transparent', color: '#4a7c59', fontSize: 13, cursor: 'pointer' }}
                >+ Nuevo cultivo</button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false); }}
                    placeholder="Nombre del cultivo"
                    style={{ flex: 1, padding: '6px 8px', borderRadius: 5, border: '1px solid #d8d2c8', fontSize: 13 }}
                  />
                  <button onClick={handleCreate}
                    style={{ padding: '6px 10px', borderRadius: 5, border: 'none', background: '#4a7c59', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
