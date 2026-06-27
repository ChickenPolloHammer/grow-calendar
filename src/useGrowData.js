import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { DEFAULT_SCHEDULE_BASE } from './fertSchedule';

const LOCAL_KEY = 'grow_all_data_v2';

const DEFAULT_STATE = {
  germDate: '',
  harvestDate: '',
  strainName: '',
  calendarData: {},
  scheduleBase: DEFAULT_SCHEDULE_BASE,
};

function readLocal(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY}_${userId}`);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STATE;
}

function writeLocal(userId, data) {
  try { localStorage.setItem(`${LOCAL_KEY}_${userId}`, JSON.stringify({ ...data, __savedAt: Date.now() })); } catch {}
}

export function useGrowData(user) {
  const userId = user?.id;
  const [data, setData] = useState(DEFAULT_STATE);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const saveTimer = useRef(null);

  // Load from Supabase when user changes
  useEffect(() => {
    if (!userId || !supabase) {
      setData(DEFAULT_STATE);
      return;
    }
    // First load local cache instantly (no flash)
    setData(readLocal(userId));

    // Then fetch from Supabase and use if newer
    (async () => {
      setSyncing(true);
      try {
        const { data: rows, error } = await supabase
          .from('grow_data')
          .select('payload, updated_at')
          .eq('user_id', userId)
          .limit(1);

        if (!error && rows && rows.length > 0) {
          const remote = rows[0].payload;
          const remoteTime = new Date(rows[0].updated_at).getTime();
          const localRaw = localStorage.getItem(`${LOCAL_KEY}_${userId}`);
          const localTime = localRaw ? (JSON.parse(localRaw).__savedAt || 0) : 0;
          if (remoteTime > localTime) {
            setData({ ...DEFAULT_STATE, ...remote });
            writeLocal(userId, remote);
          }
          setLastSynced(new Date(rows[0].updated_at));
        }
      } catch (e) {
        console.warn('Supabase fetch error:', e);
      } finally {
        setSyncing(false);
      }
    })();
  }, [userId]);

  const update = useCallback((updater) => {
    if (!userId) return;
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      writeLocal(userId, next);

      if (supabase) {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          setSyncing(true);
          try {
            await supabase.from('grow_data').upsert({
              user_id: userId,
              payload: next,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
            setLastSynced(new Date());
          } catch (e) {
            console.warn('Supabase save error:', e);
          }
          setSyncing(false);
        }, 1200);
      }
      return next;
    });
  }, [userId]);

  const setGermDate     = useCallback(v => update(p => ({ ...p, germDate: v })), [update]);
  const setHarvestDate  = useCallback(v => update(p => ({ ...p, harvestDate: v })), [update]);
  const setStrainName   = useCallback(v => update(p => ({ ...p, strainName: v })), [update]);
  const setCalendarData = useCallback(v => update(p => ({ ...p, calendarData: typeof v === 'function' ? v(p.calendarData) : v })), [update]);
  const setScheduleBase = useCallback(v => update(p => ({ ...p, scheduleBase: v })), [update]);

  function resetAll() {
    update(() => DEFAULT_STATE);
  }

  return {
    ...data,
    setGermDate, setHarvestDate, setStrainName, setCalendarData, setScheduleBase,
    resetAll, syncing, lastSynced,
  };
}
