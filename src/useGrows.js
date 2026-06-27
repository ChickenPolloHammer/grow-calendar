import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { DEFAULT_SCHEDULE_BASE } from './fertSchedule';

const LOCAL_KEY = 'grow_v3';

export const EMPTY_GROW = {
  id: null,
  name: '',
  germ_date: '',
  harvest_date: '',
  real_harvest_date: '',
  calendar_data: {},
  schedule_base: DEFAULT_SCHEDULE_BASE,
};

function localKey(userId) { return `${LOCAL_KEY}_${userId}`; }

function readLocal(userId) {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? JSON.parse(raw) : { grows: [], activeId: null };
  } catch { return { grows: [], activeId: null }; }
}

function writeLocal(userId, state) {
  try { localStorage.setItem(localKey(userId), JSON.stringify(state)); } catch {}
}

export function useGrows(user) {
  const userId = user?.id;
  const [grows, setGrows] = useState([]);
  const [activeId, setActiveIdState] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const saveTimer = useRef({});

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setGrows([]); setActiveIdState(null); return; }

    // Instant local load
    const local = readLocal(userId);
    if (local.grows.length > 0) {
      setGrows(local.grows);
      setActiveIdState(local.activeId || local.grows[0]?.id || null);
    }

    if (!supabase) return;

    // Fetch from Supabase
    (async () => {
      setSyncing(true);
      try {
        const { data: rows, error } = await supabase
          .from('grows')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (!error && rows) {
          setGrows(rows);
          const savedActiveId = local.activeId;
          const validActive = rows.find(r => r.id === savedActiveId) ? savedActiveId : rows[0]?.id ?? null;
          setActiveIdState(validActive);
          writeLocal(userId, { grows: rows, activeId: validActive });
          setLastSynced(new Date());
        }
      } catch (e) { console.warn('Supabase load error:', e); }
      finally { setSyncing(false); }
    })();
  }, [userId]);

  // ── Save a single grow to Supabase (debounced) ────────────────────────────
  const saveGrow = useCallback((grow) => {
    if (!userId || !supabase) return;
    clearTimeout(saveTimer.current[grow.id]);
    saveTimer.current[grow.id] = setTimeout(async () => {
      setSyncing(true);
      try {
        await supabase.from('grows').upsert({
          ...grow,
          user_id: userId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        setLastSynced(new Date());
      } catch (e) { console.warn('Supabase save error:', e); }
      finally { setSyncing(false); }
    }, 1200);
  }, [userId]);

  // ── Update active grow fields ─────────────────────────────────────────────
  const updateActive = useCallback((updater) => {
    setGrows(prev => {
      const next = prev.map(g => {
        if (g.id !== activeId) return g;
        const updated = typeof updater === 'function' ? updater(g) : { ...g, ...updater };
        saveGrow(updated);
        return updated;
      });
      writeLocal(userId, { grows: next, activeId });
      return next;
    });
  }, [activeId, userId, saveGrow]);

  // ── Create new grow ───────────────────────────────────────────────────────
  const createGrow = useCallback(async (name) => {
    if (!userId) return;
    const tempId = 'temp_' + Date.now();
    const newGrow = { ...EMPTY_GROW, id: tempId, name: name || 'Nuevo cultivo' };

    setGrows(prev => {
      const next = [...prev, newGrow];
      writeLocal(userId, { grows: next, activeId: tempId });
      return next;
    });
    setActiveIdState(tempId);

    if (supabase) {
      try {
        const { data, error } = await supabase.from('grows').insert({
          user_id: userId,
          name: newGrow.name,
          germ_date: '',
          harvest_date: '',
  real_harvest_date: '',
          calendar_data: {},
          schedule_base: DEFAULT_SCHEDULE_BASE,
        }).select().single();

        if (!error && data) {
          setGrows(prev => {
            const next = prev.map(g => g.id === tempId ? data : g);
            writeLocal(userId, { grows: next, activeId: data.id });
            return next;
          });
          setActiveIdState(data.id);
        }
      } catch (e) { console.warn('Create grow error:', e); }
    }
  }, [userId]);

  // ── Delete a grow ─────────────────────────────────────────────────────────
  const deleteGrow = useCallback(async (id) => {
    setGrows(prev => {
      const next = prev.filter(g => g.id !== id);
      const newActive = next[0]?.id ?? null;
      setActiveIdState(newActive);
      writeLocal(userId, { grows: next, activeId: newActive });
      return next;
    });
    if (supabase) {
      try { await supabase.from('grows').delete().eq('id', id); }
      catch (e) { console.warn('Delete grow error:', e); }
    }
  }, [userId]);

  // ── Switch active grow ────────────────────────────────────────────────────
  const switchGrow = useCallback((id) => {
    setActiveIdState(id);
    writeLocal(userId, { grows, activeId: id });
  }, [userId, grows]);

  const activeGrow = grows.find(g => g.id === activeId) ?? null;

  // Convenience setters for active grow fields
  const setName         = useCallback(v => updateActive(g => ({ ...g, name: v })), [updateActive]);
  const setGermDate     = useCallback(v => updateActive(g => ({ ...g, germ_date: v })), [updateActive]);
  const setHarvestDate      = useCallback(v => updateActive(g => ({ ...g, harvest_date: v })), [updateActive]);
  const setRealHarvestDate  = useCallback(v => updateActive(g => ({ ...g, real_harvest_date: v })), [updateActive]);
  const setCalendarData = useCallback(v => updateActive(g => ({ ...g, calendar_data: typeof v === 'function' ? v(g.calendar_data) : v })), [updateActive]);
  const setScheduleBase = useCallback(v => updateActive(g => ({ ...g, schedule_base: v })), [updateActive]);

  return {
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
  };
}
