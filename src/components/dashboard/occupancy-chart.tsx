'use client';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Booking } from '@/lib/types';
import { useMemo } from 'react';

interface OccupancyChartProps {
    bookings: Booking[];
}

const chartConfig = {
  occupancy: {
    label: 'Bookings',
    color: 'hsl(var(--primary))',
  },
};

export default function OccupancyChart({ bookings }: OccupancyChartProps) {
  const data = useMemo(() => {
    const hourlyData: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i] = 0;
    }

    bookings.forEach((booking) => {
      const startHour = new Date(booking.startTime).getHours();
      hourlyData[startHour]++;
    });

    return Object.entries(hourlyData).map(([hour, count]) => {
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        return {
            time: `${displayHour} ${ampm}`,
            occupancy: count
        }
    }).sort((a, b) => parseInt(a.time) - parseInt(b.time)); // Basic sort, might need refinement
  }, [bookings]);

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full h-[350px]"
    >
      <BarChart accessibilityLayer data={data}>
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="occupancy"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
