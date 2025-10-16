'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const data = [
  { time: '12 AM', occupancy: 186 },
  { time: '2 AM', occupancy: 150 },
  { time: '4 AM', occupancy: 120 },
  { time: '6 AM', occupancy: 220 },
  { time: '8 AM', occupancy: 490 },
  { time: '10 AM', occupancy: 520 },
  { time: '12 PM', occupancy: 650 },
  { time: '2 PM', occupancy: 700 },
  { time: '4 PM', occupancy: 750 },
  { time: '6 PM', occupancy: 890 },
  { time: '8 PM', occupancy: 820 },
  { time: '10 PM', occupancy: 450 },
];

const chartConfig = {
  occupancy: {
    label: "Occupancy",
    color: "hsl(var(--primary))",
  },
};

export default function OccupancyChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[350px]">
      <BarChart accessibilityLayer data={data}>
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
         <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
        <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
