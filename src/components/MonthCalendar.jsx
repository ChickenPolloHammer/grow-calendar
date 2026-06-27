import React from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, format,
  differenceInCalendarWeeks
} from 'date-fns';
import DayCell from './DayCell';
import { buildScaledPhases, BASE_TOTAL_WEEKS, getPhaseForWeek } from '../fertSchedule';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function MonthCalendar({ currentDate, germDate, calendarData, onUpdateDay, schedule, phases }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const activePhasesMap = phases || buildScaledPhases(BASE_TOTAL_WEEKS);

  function getWeekNum(date) {
    if (!germDate) return null;
    const germ = new Date(germDate);
    if (date < germ) return null;
    const week = differenceInCalendarWeeks(date, germ, { weekStartsOn: 1 }) + 1;
    return week > 0 ? week : null;
  }

  function getFertForWeek(weekNum) {
    if (!weekNum || !schedule) return null;
    const entry = schedule.find(s => s.week === weekNum);
    return entry?.products?.length ? entry.products : null;
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#7a7060', fontWeight: 500, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => {
        const repDay = week.find(d => isSameMonth(d, currentDate)) || week[0];
        const weekNum = getWeekNum(repDay);
        const phase = weekNum ? getPhaseForWeek(weekNum, activePhasesMap) : null;
        const fertProducts = getFertForWeek(weekNum);
        const hasVisibleFert = fertProducts && week.some(d => isSameMonth(d, currentDate));

        return (
          <div key={wi} style={{ marginBottom: 3 }}>
            {/* Week indicator row — always shown when germDate is set */}
            {weekNum && week.some(d => isSameMonth(d, currentDate)) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: phase ? `${phase.color}18` : '#f7f4ef',
                borderRadius: 5, padding: '3px 8px',
                borderLeft: `3px solid ${phase ? phase.color : '#d8d2c8'}`,
                marginBottom: 2,
              }}>
                <span style={{ fontSize: 10, color: phase ? phase.color : '#7a7060', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  S{weekNum} {phase ? `· ${phase.label}` : ''}
                </span>
                {hasVisibleFert && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                    {fertProducts.map((p, i) => (
                      <span key={i} style={{ fontSize: 10, color: '#4a7c59', whiteSpace: 'nowrap' }}>
                        🌿 {p.name} <strong>{p.dose}{p.unit}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {week.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                return (
                  <DayCell
                    key={key}
                    date={day}
                    isToday={isToday(day)}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    dayData={calendarData[key]}
                    onUpdate={(data) => onUpdateDay(key, data)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
