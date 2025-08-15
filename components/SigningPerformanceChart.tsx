import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SigningPerformanceData } from "../lib/signing-utils";

interface SigningPerformanceChartProps {
  data: SigningPerformanceData[];
  stats: Array<{
    method: string;
    totalTests: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    medianTime: number;
  }>;
}

export default function SigningPerformanceChart({
  data,
  stats,
}: SigningPerformanceChartProps) {
  // Prepare time series data for line chart
  // Group results by iteration to show three separate lines
  const timeSeriesData: Record<string, any>[] = [];

  // Group data by method first
  const dataByMethod = data.reduce((acc, item) => {
    if (!acc[item.method]) {
      acc[item.method] = [];
    }
    acc[item.method]!.push(item);
    return acc;
  }, {} as Record<string, typeof data>);

  // Find the maximum number of tests for any method
  const maxTests = Math.max(
    ...Object.values(dataByMethod).map((arr) => arr.length)
  );

  // Create combined data points for each iteration
  for (let i = 0; i < maxTests; i++) {
    const dataPoint: Record<string, any> = { iteration: i + 1 };

    // Add data for each method at this iteration
    Object.entries(dataByMethod).forEach(([method, methodData]) => {
      if (methodData[i]) {
        dataPoint[`${method}_time`] = methodData[i]!.timeTaken;
      }
    });

    timeSeriesData.push(dataPoint);
  }

  const formatTime = (value: number) => `${value.toFixed(2)}ms`;

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">
          Signing Time Over Iterations
        </h3>

        {/* @ts-expect-error - Recharts TypeScript compatibility issue */}
        <ResponsiveContainer width="100%" height={300}>
          {/* @ts-expect-error - Recharts TypeScript compatibility issue */}
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* @ts-expect-error - Recharts TypeScript compatibility issue */}
            <XAxis
              dataKey="iteration"
              label={{
                value: "Test Iteration",
                position: "insideBottom",
                offset: -5,
              }}
            />
            {/* @ts-expect-error - Recharts TypeScript compatibility issue */}
            <YAxis
              label={{ value: "Time (ms)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (value == null) return [null, name];
                return [formatTime(Number(value)), name];
              }}
            />
            {/* @ts-expect-error - Recharts TypeScript compatibility issue */}
            <Legend />

            {/* Local Wallet Line - Green */}
            <Line
              type="monotone"
              dataKey="local_time"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
              name="Local Wallet"
              strokeDasharray="0"
            />

            {/* Privy Wallet Line - Purple */}
            <Line
              type="monotone"
              dataKey="privy-client_time"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
              name="Privy Wallet"
              strokeDasharray="5 5"
            />

            {/* Web Crypto API Line - Orange */}
            <Line
              type="monotone"
              dataKey="web-crypto_time"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
              name="Web Crypto API"
              strokeDasharray="10 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Table */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Performance Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Method
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Tests
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Avg Time
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Min Time
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Max Time
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Median Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((stat) => (
                <tr key={stat.method} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {stat.method === "local"
                      ? "Local Wallet"
                      : stat.method === "privy-client"
                      ? "Privy Wallet"
                      : "Web Crypto API"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {stat.totalTests}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatTime(stat.avgTime)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatTime(stat.minTime)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatTime(stat.maxTime)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatTime(stat.medianTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No performance data available. Run a test to see results.
        </div>
      )}
    </div>
  );
}
