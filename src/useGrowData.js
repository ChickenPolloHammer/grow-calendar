import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { DEFAULT_SCHEDULE_BASE } from './fertSchedule';

const DEVICE_ID_KEY = 'grow_device_id';
const LOCAL_KEY = 'grow_all_data_v2';

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'device_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

const DEFAULT_STATE = {
  germDate: '',
  harvestDate: '',
  strainName: '',
  calendarData: {},
  scheduleBase: DEFAULT_SCHEDULE_BASE,
};

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  // migrate old keys
  try {
    const migrated = {
      germDate: localStorage.getItem('grow_germDate') ? JSON.parse(localStorage.getItem('grow_germDate')) : '',
      harvestDate: localStorage.getItem('grow_harvestDate') ? JSON.parse(localStorage.getItem('grow_harvestDate')) : '',
      strainName: localStorage.getItem('grow_strain') ? JSON.parse(localStorage.getItem('grow_strain')) : '',
      calendarData: localStorage.getItem('grow_calendarData') ? JSON.parse(localStorage.getItem('grow_calendarData')) : {},
      scheduleBase: localStorage.getItem('grow_scheduleBase') ? JSON.parse(localStorage.getItem('grow_scheduleBase')) : DEFAULT_SCHEDULE_BASE,
    };
    return { ...DEFAULT_STATE, ...migrated };
  } catch {}
  return DEFAULT_STATE;
}

function writeLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}

export function useGrowData() {
  const deviceId = getDeviceId();
  const [data, setData] = useState(() => readLocal());
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [cloudAvailable, setCloudAvailable] = useState(!!supabase);
  const saveTimer = useRef(null);

  // Load from Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      setSyncing(true);
      try {
        const { data: rows, error } = await supabase
          .from('grow_data')
          .select('payload, updated_at')
          .eq('device_id', deviceId)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (!error && rows && rows.length > 0) {
          const remote = rows[0].payload;
          const remoteTime = new Date(rows[0].updated_at).getTime();
          const localRaw = localStorage.getItem(LOCAL_KEY);
          const localTime = localRaw ? (JSON.parse(localRaw).__savedAt || 0) : 0;
          // Use whichever is newer
          if (remoteTime > localTime) {
            setData(prev => ({ ...DEFAULT_STATE, ...remote }));
            writeLocal({ ...remote, __savedAt: remoteTime });
          }
          setLastSynced(new Date(rows[0].updated_at));
        }
        setCloudAvailable(true);
      } catch {
        setCloudAvailable(false);
      } finally {
        setSyncing(false);
      }
    })();
  }, [deviceId]);

  // Debounced save to Supabase + localStorage
  const update = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      writeLocal({ ...next, __savedAt: Date.now() });

      if (supabase) {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          setSyncing(true);
          try {
            await supabase.from('grow_data').upsert({
              device_id: deviceId,
              payload: next,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'device_id' });
            setLastSynced(new Date());
          } catch {}
          setSyncing(false);
        }, 1200);
      }
      return next;
    });
  }, [deviceId]);

  // Helpers matching the old useStorage API shape
  const setGermDate     = useCallback(v => update(p => ({ ...p, germDate: v })), [update]);
  const setHarvestDate  = useCallback(v => update(p => ({ ...p, harvestDate: v })), [update]);
  const setStrainName   = useCallback(v => update(p => ({ ...p, strainName: v })), [update]);
  const setCalendarData = useCallback(v => update(p => ({ ...p, calendarData: typeof v === 'function' ? v(p.calendarData) : v })), [update]);
  const setScheduleBase = useCallback(v => update(p => ({ ...p, scheduleBase: v })), [update]);

  function resetAll() {
    const fresh = DEFAULT_STATE;
    update(() => fresh);
    if (supabase) {
      supabase.from('grow_data').upsert({
        device_id: deviceId,
        payload: fresh,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'device_id' }).catch(() => {});
    }
  }

  return {
    ...data,
    setGermDate, setHarvestDate, setStrainName, setCalendarData, setScheduleBase,
    resetAll,
    syncing,
    lastSynced,
    cloudAvailable,
  };
}
