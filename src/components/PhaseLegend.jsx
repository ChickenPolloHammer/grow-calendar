import React from 'react';
import { PHASES } from '../fertSchedule';

export default function PhaseLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {Object.values(PHASES).map(phase => (
        <div key={phase.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color }} />
          <span style={{ fontSize: 11, color: '#7a7060' }}>
            {phase.label} <span style={{ color: '#bbb' }}>S{phase.weeks[0]}–{phase.weeks[phase.weeks.length-1]}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
