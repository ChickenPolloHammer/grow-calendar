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
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Spacer for phase bar */}
        {germDate && <div style={{ width: 10, flexShrink: 0 }} />}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3, paddingLeft: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#7a7060', fontWeight: 500, padding: '4px 0' }}>{d}</div>
          ))}
        </div>
      </div>

      {/* Weeks — each row: phase bar segment + fert row + day cells */}
      {weeks.map((week, wi) => {
        const repDay = week.find(d => isSameMonth(d, currentDate)) || week[0];
        const weekNum = getWeekNum(repDay);
        const phase = weekNum ? getPhaseForWeek(weekNum, activePhasesMap) : null;
        const fertProducts = getFertForWeek(weekNum);
        const hasVisibleFert = fertProducts && week.some(d => isSameMonth(d, currentDate));

        return (
          <div key={wi} style={{ display: 'flex', gap: 0, marginBottom: 3 }}>
            {/* Vertical phase bar segment */}
            {germDate && (
              <div style={{ width: 10, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 4 }}>
                {/* Fert row spacer */}
                {hasVisibleFert && <div style={{ height: 20 }} />}
                <div
                  title={phase ? `${phase.label} (S${weekNum})` : ''}
                  style={{ flex: 1, minHeight: 90, borderRadius: 3, background: phase ? phase.color : '#ede9e2' }}
                />
              </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Fertilizer row — spans the full week */}
              {hasVisibleFert && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#f0f7f1', borderRadius: 5, padding: '3px 8px',
                  borderLeft: `3px solid ${phase ? phase.color : '#4a7c59'}`,
                  minHeight: 20,
                }}>
                  <span style={{ fontSize: 10, color: '#4a7c59', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    S{weekNum}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                    {fertProducts.map((p, i) => (
                      <span key={i} style={{ fontSize: 10, color: '#4a7c59', whiteSpace: 'nowrap' }}>
                        🌿 {p.name} <strong>{p.dose}{p.unit}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Day cells row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {week.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayWeekNum = getWeekNum(day);
                  const isWeekStart = day.getDay() === 1;
                  const showWeekNum = dayWeekNum && isSameMonth(day, currentDate) && (isWeekStart || day.getDate() === 1);

                  return (
                    <DayCell
                      key={key}
                      date={day}
                      isToday={isToday(day)}
                      isCurrentMonth={isSameMonth(day, currentDate)}
                      dayData={calendarData[key]}
                      weekNum={showWeekNum ? dayWeekNum : null}
                      fertInfo={null}
                      onUpdate={(data) => onUpdateDay(key, data)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
