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

  // Group days into weeks for the vertical phase bar
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* Vertical phase bar */}
      {germDate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 26 }}>
          {weeks.map((week, wi) => {
            const repDay = week.find(d => isSameMonth(d, currentDate)) || week[0];
            const w = getWeekNum(repDay);
            const phase = w ? getPhaseForWeek(w, activePhasesMap) : null;
            return (
              <div
                key={wi}
                title={phase ? `${phase.label} (S${w})` : ''}
                style={{
                  width: 6,
                  flex: 1,
                  minHeight: 80,
                  borderRadius: 3,
                  background: phase ? phase.color : '#ede9e2',
                }}
              />
            );
          })}
        </div>
      )}

      <div style={{ flex: 1 }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#7a7060', fontWeight: 500, padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const weekNum = getWeekNum(day);
            const fertProducts = getFertForWeek(weekNum);

            const isWeekStart = day.getDay() === 1;
            const showFert = fertProducts && (isWeekStart || day.getDate() === 1) && isSameMonth(day, currentDate);

            return (
              <DayCell
                key={key}
                date={day}
                isToday={isToday(day)}
                isCurrentMonth={isSameMonth(day, currentDate)}
                dayData={calendarData[key]}
                weekNum={weekNum && isSameMonth(day, currentDate) && (isWeekStart || day.getDate() === 1) ? weekNum : null}
                fertInfo={showFert ? fertProducts : null}
                onUpdate={(data) => onUpdateDay(key, data)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

