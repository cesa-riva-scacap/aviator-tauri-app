import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { ShieldAlert, AlertOctagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PricesCard from "./prices-card";
import { MetricsCard } from "./metrics-card";
import type { Tick, RiskAlert, Metrics } from "../../types";

export const Dashboard = () => {
  const [prices, setPrices] = useState<Tick[]>([]);
  const [risk, setRisk] = useState<RiskAlert | null>(null);
  const [fps, setFps] = useState(0);
  const [workerMetrics, setWorkerMetrics] = useState<Metrics>({
    throughput: 0,
    is_paused: false,
  });

  const isPausedRef = useRef(workerMetrics.is_paused);

  useEffect(() => {
    isPausedRef.current = workerMetrics.is_paused;
  }, [workerMetrics.is_paused]);

  // FPS Counter 
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const countFrames = () => {
      if (!isPausedRef.current) {
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastTime = now;
        }
      }
      animationFrameId = requestAnimationFrame(countFrames);
    };

    animationFrameId = requestAnimationFrame(countFrames);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- THE NATIVE TAURI IPC BRIDGE ---
  useEffect(() => {
    let unlistenBatch: () => void;
    let unlistenMetrics: () => void;
    let unlistenRisk: () => void;

    // Tauri V2 uses Promises for event listeners, so we wrap them in an async setup function
    const setupListeners = async () => {
      unlistenBatch = await listen<Tick[]>("BATCH_UPDATE", (event) => {
        setPrices(event.payload);
      });

      unlistenMetrics = await listen<Metrics>("METRICS_UPDATE", (event) => {
        setWorkerMetrics(event.payload);
      });

      unlistenRisk = await listen<RiskAlert>("RISK_UPDATE", (event) => {
        setRisk(event.payload);
        setTimeout(() => setRisk(null), 2500);
      });
    };

    setupListeners();

    // Clean up the native listeners when React unmounts
    return () => {
      if (unlistenBatch) unlistenBatch();
      if (unlistenMetrics) unlistenMetrics();
      if (unlistenRisk) unlistenRisk();
    };
  }, []);

  const handleToggleWorker = () => {
    // Calling our Rust toggle_pause command natively!
    invoke("toggle_pause");
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#0B0F19] p-8 font-sans text-slate-300">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-teal-500/50 bg-teal-500/20">
            <div className="h-4 w-4 animate-pulse rounded-full bg-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Market Making Workstation
            </h1>
            <span className="font-mono text-xs text-teal-400">Tauri Native App Connected</span>
          </div>
        </div>
      </div>

      <div className="h-20">
        {risk && (
          <Alert
            variant="destructive"
            className="animate-in fade-in zoom-in border-red-900 bg-red-950/40 text-red-200 duration-200"
          >
            <ShieldAlert className="stroke-red-400" />
            <AlertTitle className="font-bold text-red-400">{risk.level} ALERT</AlertTitle>
            <AlertDescription>{risk.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* TOP PANELS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="col-span-2 border-slate-800 bg-[#111827]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Quote Streaming (SI)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <button
              onClick={handleToggleWorker}
              className={`flex items-center gap-2 rounded-md px-6 py-2 font-bold transition-all ${
                workerMetrics.is_paused
                  ? "border border-slate-700 bg-slate-800 text-slate-400"
                  : "border border-red-700 bg-red-900/80 text-red-100 shadow-[0_0_15px_rgba(153,27,27,0.5)] hover:bg-red-800"
              }`}
            >
              <AlertOctagon className="h-4 w-4" />
              {workerMetrics.is_paused ? "Resume Streaming" : "Halt All Quoting"}
            </button>
            <span className={`text-xs ${workerMetrics.is_paused ? "text-amber-500" : "text-teal-400"}`}>
              ● {workerMetrics.is_paused ? "Paused on SI" : "Live on SI"}
            </span>
          </CardContent>
        </Card>

        <MetricsCard fps={fps} workerMetrics={workerMetrics} />
      </div>

      {/* MAIN DATA GRID */}
      <PricesCard prices={prices} />
    </div>
  );
};