import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    setError(''); setMessage('');
    if (!email || (!password && mode !== 'reset')) { setError('Rellena todos los campos'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Revisa tu email para confirmar la cuenta, luego vuelve a entrar.');
        setLoading(false); return;
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Email de recuperación enviado.');
        setLoading(false); return;
      }
    } catch (e) {
      setError(e.message || 'Error desconocido');
    }
    setLoading(false);
  }

  const titles = { login: 'Entrar', register: 'Crear cuenta', reset: 'Recuperar contraseña' };

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f4ef', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 24,
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#1a2e1a' }}>🌱 Grow Calendar</div>
        <div style={{ fontSize: 13, color: '#7a7060', marginTop: 6 }}>Tu registro de cultivo, siempre disponible</div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 14, padding: '32px 36px',
        boxShadow: '0 4px 24px rgba(26,46,26,0.10)', width: '100%', maxWidth: 360,
      }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1a2e1a', marginBottom: 24 }}>
          {titles[mode]}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#7a7060', display: 'block', marginBottom: 5 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="tu@email.com"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 7,
                border: '1px solid #d8d2c8', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label style={{ fontSize: 12, color: '#7a7060', display: 'block', marginBottom: 5 }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="········"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 7,
                  border: '1px solid #d8d2c8', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 7, padding: '10px 12px', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: '#e8f4ea', border: '1px solid #7eb88a', borderRadius: 7, padding: '10px 12px', fontSize: 13, color: '#2d6a40' }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '11px', borderRadius: 7, border: 'none',
              background: loading ? '#a3c4a8' : '#4a7c59', color: '#fff',
              fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Un momento…' : titles[mode]}
          </button>
        </div>

        {/* Mode switcher */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#4a7c59', fontSize: 13, cursor: 'pointer' }}>
                ¿Sin cuenta? Regístrate
              </button>
              <button onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#7a7060', fontSize: 12, cursor: 'pointer' }}>
                Olvidé mi contraseña
              </button>
            </>
          )}
          {mode !== 'login' && (
            <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#4a7c59', fontSize: 13, cursor: 'pointer' }}>
              ← Volver a entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
