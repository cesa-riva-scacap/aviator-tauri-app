import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { Metrics } from "../../types";

interface Props {
  fps: number;
  workerMetrics: Metrics;
}

export const MetricsCard = ({ fps, workerMetrics }: Props) => {
  return (
    <Card className="h-fit border-slate-800 bg-[#111827] text-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <Activity className="h-4 w-4" /> System Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 font-mono text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Actual Throughput</span>
          <span
            className={`rounded px-2 py-1 font-bold transition-colors ${workerMetrics.throughput > 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}
          >
            {workerMetrics.throughput.toLocaleString()} / sec
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">UI Paint Rate (FPS)</span>
          <span
            className={`rounded px-2 py-1 font-bold ${fps >= 25 ? "bg-blue-400/10 text-blue-400" : "bg-amber-400/10 text-amber-400"}`}
          >
            {fps} FPS
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-slate-400">Backend Status</span>
          {workerMetrics.is_paused ? (
            <span className="flex items-center gap-2 font-bold text-amber-500">
              Paused
            </span>
          ) : (
            <span className="flex items-center gap-2 text-green-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Processing
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};