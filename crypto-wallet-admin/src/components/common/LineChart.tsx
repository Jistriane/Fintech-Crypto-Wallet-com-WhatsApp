'use client';

import { LineChart as TremorLineChart } from '@tremor/react';
import React from 'react';

interface LineChartProps {
  data: {
    date: string;
    value: number;
    type: string;
  }[];
  dataKey: string;
  title: string;
}

export function LineChart({ data, dataKey, title }: LineChartProps) {
  const types = Array.from(new Set(data.map((item) => item.type)));

  return (
    <TremorLineChart
      className="h-80"
      data={data}
      index="date"
      valueFormatter={(number: number) => `${Intl.NumberFormat('us').format(number).toString()}`}
      onValueChange={() => {}}
    >
      {types.map((type) => (
        <TremorLineChart.Line
          key={type}
          name={type}
          valueKey={dataKey}
          color="blue"
        />
      ))}
    </TremorLineChart>
  );
}