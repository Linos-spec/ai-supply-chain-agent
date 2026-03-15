"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationRisk {
  location: string;
  count: number;
}

interface RiskDistribution {
  name: string;
  value: number;
}

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];
const PIE_HOVER_COLORS = ["#dc2626", "#d97706", "#2563eb"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].color }}>
          {payload[0].value} {payload[0].name}
        </p>
      </div>
    );
  }
  return null;
};

export function StockoutByLocationChart({ data }: { data: LocationRisk[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const ticks = Array.from({ length: maxCount + 1 }, (_, i) => i);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <CardTitle className="text-base">Stockout Risks by Location</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="location"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              ticks={ticks}
              domain={[0, maxCount]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="url(#stockoutGradient)"
              radius={[6, 6, 0, 0]}
              name="Stockout Risks"
              maxBarSize={50}
            />
            <defs>
              <linearGradient id="stockoutGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ExcessByLocationChart({ data }: { data: LocationRisk[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const ticks = Array.from({ length: maxCount + 1 }, (_, i) => i);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <CardTitle className="text-base">Excess Inventory by Location</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="location"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              ticks={ticks}
              domain={[0, maxCount]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="url(#excessGradient)"
              radius={[6, 6, 0, 0]}
              name="Excess Items"
              maxBarSize={50}
            />
            <defs>
              <linearGradient id="excessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RiskDistributionChart({ data }: { data: RiskDistribution[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="relative" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    className="transition-all duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const v = Number(value) || 0;
                  return [`${v} risks (${total > 0 ? ((v/total)*100).toFixed(0) : 0}%)`, name];
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-gray-600">{String(value)}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label — positioned relative to chart container */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ marginBottom: 40 }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
