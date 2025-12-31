import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  waterQualityTrend,
  consumptionData,
  energyCostData,
} from "../data/watermetrics.js";

const COLORS = ["#22d3ee", "#34d399"];

export default function WaterCharts() {
  return (
    <div className="space-y-8">

      {/* WATER QUALITY TRENDS */}
      <div className="aqua-card p-6">
        <h3 className="text-xs font-black tracking-widest text-aqua-cyan uppercase mb-4">
          Water Quality Trends
        </h3>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={waterQualityTrend}>
            <XAxis dataKey="time" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="pH"
              stroke="#22d3ee"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="turbidity"
              stroke="#facc15"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="tds"
              stroke="#34d399"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CONSUMPTION SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="aqua-card p-6">
          <h3 className="text-xs font-black tracking-widest text-aqua-cyan uppercase mb-4">
            Water Consumption Split
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={consumptionData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
              >
                {consumptionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ENERGY & COST */}
        <div className="aqua-card p-6">
          <h3 className="text-xs font-black tracking-widest text-aqua-cyan uppercase mb-4">
            Energy & Cost
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={energyCostData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="energy" fill="#22d3ee" />
              <Bar dataKey="cost" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TOTAL CONSUMPTION AREA */}
      <div className="aqua-card p-6">
        <h3 className="text-xs font-black tracking-widest text-aqua-cyan uppercase mb-4">
          Total Water Usage
        </h3>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={waterQualityTrend}>
            <XAxis dataKey="time" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="tds"
              stroke="#22d3ee"
              fill="#22d3ee33"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
