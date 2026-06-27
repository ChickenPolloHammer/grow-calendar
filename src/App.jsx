import React, { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from './useAuth';
import { useGrowData } from './useGrowData';
import AuthScreen from './components/AuthScreen';
import MonthCalendar from './components/MonthCalendar';
import StatsBar from './components/StatsBar';
import PhaseLegend from './components/PhaseLegend';
import ScheduleEditor from './components/ScheduleEditor';
import { buildScheduleForCycle, buildScaledPhases, BASE_TOTAL_WEEKS } from './fertSchedule';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEditor, setShowEditor] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const {
    germDate, setGermDate,
    harvestDate, setHarvestDate,
    strainName, setStrainName,
    calendarData, setCalendarData,
    scheduleBase, setScheduleBase,
    resetAll,
    syncing, lastSynced,
  } = useGrowData(user);

  const totalCycleWeeks = useMemo(() => {
    if (germDate && harvestDate) {
      const days = Math.round((new Date(harvestDate) - new Date(germDate)) / 86400000);
      return Math.max(4, Math.round(days / 7));
    }
    return BASE_TOTAL_WEEKS;
  }, [germDate, harvestDate]);

  const scaledSchedule = useMemo(
    () => buildScheduleForCycle(totalCycleWeeks, scheduleBase),
    [totalCycleWeeks, scheduleBase]
  );

  const scaledPhases = useMemo(
    () => buildScaledPhases(totalCycleWeeks),
    [totalCycleWeeks]
  );

  function updateDay(key, data) {
    setCalendarData(prev => ({ ...prev, [key]: data }));
  }

  // Loading spinner while Supabase checks session
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f4ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#4a7c59' }}>🌱 Cargando…</div>
      </div>
    );
  }

  // Not logged in → show auth screen
  if (!user) return <AuthScreen />;

  const monthLabel = format(currentDate, "MMMM yyyy", { locale: es });
  const cycleDays = germDate && harvestDate
    ? Math.round((new Date(harvestDate) - new Date(germDate)) / 86400000)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ef', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{
        background: '#1a2e1a', color: '#e8f4ea', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22 }}>🌱 Grow Calendar</span>
          {strainName && <span style={{ fontSize: 13, opacity: 0.7 }}>{strainName}</span>}
          {cycleDays && (
            <span style={{ fontSize: 12, opacity: 0.5 }}>ciclo {cycleDays} días · {totalCycleWeeks} semanas</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Sync indicator */}
          <div title={lastSynced ? `Guardado: ${format(lastSynced, 'HH:mm')}` : 'Sincronizando…'}
            style={{ fontSize: 11, color: '#7eb88a', opacity: 0.75, display: 'flex', alignItems: 'center', gap: 3 }}>
            {syncing ? '↻' : '☁'} {syncing ? 'Guardando…' : lastSynced ? format(lastSynced, 'HH:mm') : ''}
          </div>
          <button onClick={() => setShowEditor(true)}
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #4a7c59', background: 'transparent', color: '#7eb88a', fontSize: 13, cursor: 'pointer' }}>
            Programa
          </button>
          <button onClick={() => setShowConfig(v => !v)}
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #4a7c59', background: showConfig ? '#2d4f2d' : 'transparent', color: '#7eb88a', fontSize: 13, cursor: 'pointer' }}>
            ⚙ Config
          </button>
          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid #2d4f2d' }}>
            <span style={{ fontSize: 11, color: '#7eb88a', opacity: 0.7, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <button onClick={signOut}
              style={{ padding: '5px 10px', borderRadius: 5, border: '1px solid #4a7c59', background: 'transparent', color: '#7eb88a', fontSize: 12, cursor: 'pointer' }}>
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Config panel */}
      {showConfig && (
        <div style={{ background: '#2d4f2d', padding: '16px 24px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7eb88a', marginBottom: 4 }}>Variedad</label>
            <input value={strainName} onChange={e => setStrainName(e.target.value)} placeholder="Nombre del cultivo"
              style={{ padding: '7px 10px', borderRadius: 6, border: '0.5px solid #4a7c59', background: '#1a2e1a', color: '#e8f4ea', fontSize: 14, width: 180 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7eb88a', marginBottom: 4 }}>Fecha de germinación</label>
            <input type="date" value={germDate} onChange={e => setGermDate(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '0.5px solid #4a7c59', background: '#1a2e1a', color: '#e8f4ea', fontSize: 14 }} />
            <div style={{ fontSize: 11, color: '#7eb88a', opacity: 0.65, marginTop: 4 }}>Amnesia Auto ≈ 3 meses desde germinación</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7eb88a', marginBottom: 4 }}>Fecha estimada de cosecha</label>
            <input type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '0.5px solid #4a7c59', background: '#1a2e1a', color: '#e8f4ea', fontSize: 14 }} />
            <div style={{ fontSize: 11, color: '#7eb88a', opacity: 0.65, marginTop: 4 }}>Suma ~90 días a la germinación</div>
          </div>
          {germDate && harvestDate && (
            <div style={{ color: '#7eb88a', fontSize: 13, paddingTop: 22 }}>
              🗓 Cosecha en <strong style={{ color: '#e8f4ea' }}>{Math.round((new Date(harvestDate) - new Date()) / 86400000)} días</strong>
              <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>Programa escalado a {totalCycleWeeks} semanas</div>
            </div>
          )}
          <button
            onClick={() => { if (window.confirm('¿Iniciar un nuevo ciclo? Se borrarán los datos de este cultivo.')) resetAll(); }}
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #c76b2a', background: 'transparent', color: '#c76b2a', fontSize: 12, cursor: 'pointer', marginLeft: 'auto', marginTop: 20 }}>
            Nuevo ciclo
          </button>
        </div>
      )}

      {/* Main */}
      <main style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
            style={{ background: 'none', border: '0.5px solid #d8d2c8', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: '#3d2b1a', fontSize: 16 }}>←</button>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#1a2e1a', textTransform: 'capitalize', margin: 0 }}>
            {monthLabel}
          </h1>
          <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
            style={{ background: 'none', border: '0.5px solid #d8d2c8', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: '#3d2b1a', fontSize: 16 }}>→</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <StatsBar currentDate={currentDate} calendarData={calendarData} />
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '16px', border: '0.5px solid #ede9e2', boxShadow: '0 2px 8px rgba(26,46,26,0.06)', marginBottom: 14 }}>
          <MonthCalendar
            currentDate={currentDate}
            germDate={germDate}
            calendarData={calendarData}
            onUpdateDay={updateDay}
            schedule={scaledSchedule}
            phases={scaledPhases}
          />
        </div>

        {germDate && <div style={{ padding: '10px 0' }}><PhaseLegend phases={scaledPhases} /></div>}

        {harvestDate && new Date(harvestDate) > new Date() && (
          <div style={{ marginTop: 12, background: '#fef3e2', border: '0.5px solid #d4820a', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🌾</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#d4820a' }}>
                Cosecha estimada: {format(new Date(harvestDate), "d 'de' MMMM yyyy", { locale: es })}
              </div>
              <div style={{ fontSize: 11, color: '#b06a08' }}>
                Faltan {Math.round((new Date(harvestDate) - new Date()) / 86400000)} días
              </div>
            </div>
          </div>
        )}
      </main>

      {showEditor && (
        <ScheduleEditor
          scheduleBase={scheduleBase}
          scaledSchedule={scaledSchedule}
          totalCycleWeeks={totalCycleWeeks}
          phases={scaledPhases}
          onSave={setScheduleBase}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
