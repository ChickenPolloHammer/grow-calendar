import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function StatsBar({ currentDate, calendarData }) {
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

  let waterDays = 0, fertDays = 0, rainDays = 0;
  let totalWaterL = 0, totalFertL = 0, totalRainL = 0;

  days.forEach(day => {
    const key = format(day, 'yyyy-MM-dd');
    const data = calendarData[key];
    if (!data?.events) return;
    data.events.forEach(ev => {
      if (ev.type === 'water') { waterDays++; if (ev.liters) totalWaterL += ev.liters; }
      if (ev.type === 'fert') { fertDays++; if (ev.liters) totalFertL += ev.liters; }
      if (ev.type === 'rain') { rainDays++; if (ev.liters) totalRainL += ev.liters; }
    });
  });

  const stats = [
    { icon: '💧', label: 'Agua', days: waterDays, liters: totalWaterL, bg: '#e3f0f8', color: '#3a7ca8' },
    { icon: '🌿', label: 'Fertilizante', days: fertDays, liters: totalFertL, bg: '#e8f4ea', color: '#4a7c59' },
    { icon: '🌧', label: 'Lluvia', days: rainDays, liters: totalRainL, bg: '#eaf0f5', color: '#6b8fa8' },
  ];

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {stats.map(s => (
        <div
          key={s.label}
          style={{
            flex: 1, background: s.bg, borderRadius: 8, padding: '10px 14px',
          }}
        >
          <div style={{ fontSize: 11, color: s.color, fontWeight: 500, marginBottom: 4 }}>
            {s.icon} {s.label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: s.color, lineHeight: 1 }}>
            {s.days}x
          </div>
          {s.liters > 0 && (
            <div style={{ fontSize: 11, color: s.color, marginTop: 2, opacity: 0.8 }}>
              {s.liters.toFixed(1)} L total
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
