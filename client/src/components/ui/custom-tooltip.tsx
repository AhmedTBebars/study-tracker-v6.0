import React from 'react';

// This is a custom tooltip component for Recharts
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-lg shadow-lg">
        <p className="label text-sm font-bold">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ color: pld.fill || pld.color }}>
            <p className="intro text-xs">{`${pld.name}: ${pld.value}`}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
