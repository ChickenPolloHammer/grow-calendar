import React, { useState, useMemo } from 'react';
import { format, addMonths, subMonths, addYears, subYears, setMonth, setYear, getYear, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from './useAuth';
import { useGrows } from './useGrows';
import AuthScreen from './components/AuthScreen';
import GrowSelector from './components/GrowSelector';
import MonthCalendar from './components/MonthCalendar';
import StatsBar from './components/StatsBar';
import PhaseLegend from './components/PhaseLegend';
import ScheduleEditor from './components/ScheduleEditor';
import PdfExport from './components/PdfExport';
import { buildScheduleForCycle, buildScaledPhases, BASE_TOTAL_WEEKS } from './fertSchedule';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEditor, setShowEditor] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const {
    grows,
    activeGrow,
    activeId,
    switchGrow,
    createGrow,
    deleteGrow,
    setName,
    setGermDate,
    setHarvestDate,
    setRealHarvestDate,
    setCalendarData,
    setScheduleBase,
    syncing,
    lastSynced,
  } = useGrows(user);

  const germDate     = activeGrow?.germ_date ?? '';
  const harvestDate      = activeGrow?.harvest_date ?? '';
  const realHarvestDate  = activeGrow?.real_harvest_date ?? '';
  const strainName   = activeGrow?.name ?? '';
  const calendarData = activeGrow?.calendar_data ?? {};
  const scheduleBase = activeGrow?.schedule_base ?? null;

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

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f4ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#4a7c59' }}>🌱 Cargando…</div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const cycleDays = germDate && harvestDate
    ? Math.round((new Date(harvestDate) - new Date(germDate)) / 86400000)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ef', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#1a2e1a', color: '#e8f4ea', padding: '10px 16px' }}>
        {/* Row 1: logo + email + salir */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, whiteSpace: 'nowrap' }}>🌱 Grow Calendar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: '#7eb88a', opacity: 0.6, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <button onClick={signOut}
              style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #4a7c59', background: 'transparent', color: '#7eb88a', fontSize: 12, cursor: 'pointer' }}>
              Salir
            </button>
          </div>
        </div>
        {/* Row 2: grow selector + actions + sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <GrowSelector
            grows={grows}
            activeId={activeId}
            onSwitch={switchGrow}
            onCreate={createGrow}
            onDelete={deleteGrow}
          />
          <button onClick={() => setShowEditor(true)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4a7c59', background: 'transparent', color: '#7eb88a', fontSize: 13, cursor: 'pointer' }}>
            Programa
          </button>
          <button onClick={() => setShowPdf(true)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4a7c59', background: 'transparent', color: '#7eb88a', fontSize: 13, cursor: 'pointer' }}>
            📄 PDF
          </button>
          <button onClick={() => setShowConfig(v => !v)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4a7c59', background: showConfig ? '#2d4f2d' : 'transparent', color: '#7eb88a', fontSize: 13, cursor: 'pointer' }}>
            ⚙ Config
          </button>
          {cycleDays && (
            <span style={{ fontSize: 11, opacity: 0.45 }}>
              {cycleDays}d · {totalCycleWeeks}sem
            </span>
          )}
          <div title={lastSynced ? `Guardado: ${format(lastSynced, 'HH:mm')}` : 'Sincronizando…'}
            style={{ marginLeft: 'auto', fontSize: 11, color: '#7eb88a', opacity: 0.6 }}>
            {syncing ? '↻' : '☁'}{lastSynced && !syncing ? ` ${format(lastSynced, 'HH:mm')}` : ''}
          </div>
        </div>
      </header>

      {/* Config panel */}
      {showConfig && activeGrow && (
        <div style={{ background: '#2d4f2d', padding: '16px 24px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7eb88a', marginBottom: 4 }}>Nombre del cultivo</label>
            <input value={strainName} onChange={e => setName(e.target.value)} placeholder="Ej. Amnesia Auto"
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
        </div>
      )}

      {/* Main */}
      <main style={{ padding: '12px 10px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
              style={{ background: 'none', border: '0.5px solid #d8d2c8', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#3d2b1a', fontSize: 15 }}>‹</button>
            <select
              value={getMonth(currentDate)}
              onChange={e => setCurrentDate(d => setMonth(d, parseInt(e.target.value)))}
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1a2e1a', border: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none', textAlign: 'center', padding: '2px 4px' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM', { locale: es })}</option>
              ))}
            </select>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
              style={{ background: 'none', border: '0.5px solid #d8d2c8', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#3d2b1a', fontSize: 15 }}>›</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => setCurrentDate(d => subYears(d, 1))}
              style={{ background: 'none', border: '0.5px solid #d8d2c8', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#3d2b1a', fontSize: 15 }}>‹</button>
            <select
              value={getYear(currentDate)}
              onChange={e => setCurrentDate(d => setYear(d, parseInt(e.target.value)))}
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1a2e1a', border: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none', textAlign: 'center', padding: '2px 4px', width: 80 }}
            >
              {Array.from({ length: 10 }, (_, i) => {
                const y = new Date().getFullYear() - 3 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <button onClick={() => setCurrentDate(d => addYears(d, 1))}
              style={{ background: 'none', border: '0.5px solid #d8d2c8', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#3d2b1a', fontSize: 15 }}>›</button>
          </div>

          {format(currentDate, 'yyyy-MM') !== format(new Date(), 'yyyy-MM') && (
            <button onClick={() => setCurrentDate(new Date())}
              style={{ fontSize: 11, color: '#4a7c59', background: '#e8f4ea', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>
              Hoy
            </button>
          )}
        </div>

        {!activeGrow ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a7060' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1a2e1a', marginBottom: 8 }}>Sin cultivos todavía</div>
            <div style={{ fontSize: 14 }}>Pulsa el selector de arriba para crear tu primer cultivo</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <StatsBar currentDate={currentDate} calendarData={calendarData} />
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '16px', border: '0.5px solid #ede9e2', boxShadow: '0 2px 8px rgba(26,46,26,0.06)', marginBottom: 14 }}>
              <MonthCalendar
                currentDate={currentDate}
                germDate={germDate}
                harvestDate={harvestDate}
                realHarvestDate={realHarvestDate}
                calendarData={calendarData}
                onUpdateDay={updateDay}
                onSetRealHarvest={setRealHarvestDate}
                schedule={scaledSchedule}
                phases={scaledPhases}
              />
            </div>

            {germDate && <div style={{ padding: '10px 0' }}><PhaseLegend phases={scaledPhases} /></div>}

            {realHarvestDate && (
              <div style={{ marginTop: 12, background: '#fef3e2', border: '2px solid #d4820a', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🌾</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d4820a' }}>
                    Cosecha real: {format(new Date(realHarvestDate), "d 'de' MMMM yyyy", { locale: es })}
                  </div>
                  {germDate && <div style={{ fontSize: 11, color: '#b06a08' }}>
                    Ciclo de {Math.round((new Date(realHarvestDate) - new Date(germDate)) / 86400000)} días
                  </div>}
                </div>
              </div>
            )}
            {!realHarvestDate && harvestDate && new Date(harvestDate) > new Date() && (
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
          </>
        )}
      </main>

      {showPdf && activeGrow && (
        <PdfExport
          grow={activeGrow}
          scaledSchedule={scaledSchedule}
          scaledPhases={scaledPhases}
          onClose={() => setShowPdf(false)}
        />
      )}

      {showEditor && activeGrow && (
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
