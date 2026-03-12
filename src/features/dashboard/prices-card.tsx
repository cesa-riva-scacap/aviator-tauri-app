import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tick } from "../../types";
import { cn } from "@/lib/utils";

interface Props {
  prices: Tick[];
}

const PricesCard = ({ prices }: Props) => {
  // 1. We need a ref to the scrollable container so TanStack knows where we are scrolling
  const parentRef = useRef<HTMLDivElement>(null);

  // 2. Setup the Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: prices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // The rough pixel height of each row
    overscan: 10, // Pre-render 10 items above and below the visible area to prevent flickering
  });

  const gridTemplate = cn(
    "grid-cols-[1.5fr_1.5fr_repeat(18,_1fr)]",
  );

  return (
    <Card className="border-t-primary/30 border-t-2 bg-[#111827] shadow-2xl">
      <CardHeader>
        <CardTitle className="text-foreground">Instrument Controls</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* 3. Attach the ref to the scrollable area */}
        <div ref={parentRef} className="custom-scrollbar h-[calc(100vh-220px)] overflow-auto">
          <div className="min-w-500 text-left font-mono text-[11px]">
            
            {/* HEADER ROW (Sticky to the top of the scroll container) */}
            <div className={cn(
                "sticky top-0 z-10 grid border-b border-slate-800 bg-[#1A2333] text-slate-400 shadow-md",
                gridTemplate,
              )}>
              <div className="p-3 font-semibold">ISIN</div>
              <div className="p-3 font-semibold">Name</div>
              <div className="p-3 text-right font-semibold">Quoted Mid</div>
              <div className="p-3 text-right font-semibold">Xetra Spr</div>
              <div className="p-3 text-right font-semibold">LSX Spr</div>
              <div className="p-3 text-right font-semibold">Gettex Spr</div>
              <div className="p-3 text-right font-semibold">Trdgate Spr</div>
              <div className="p-3 text-right font-semibold">Bid Size</div>
              <div className="p-3 text-right font-semibold">Ask Size</div>
              <div className="p-3 text-right font-semibold">Vol XET</div>
              <div className="p-3 text-right font-semibold">Vol LSX</div>
              <div className="p-3 text-right font-semibold">Vol GTX</div>
              <div className="p-3 text-right font-semibold">VWAP</div>
              <div className="p-3 text-right font-semibold">Day High</div>
              <div className="p-3 text-right font-semibold">Day Low</div>
              <div className="p-3 text-right font-semibold">YTD %</div>
              <div className="p-3 text-right font-semibold">Mov Avg</div>
              <div className="p-3 text-right font-semibold">RSI</div>
              <div className="p-3 text-right font-semibold">MACD</div>
              <div className="p-3 text-right font-semibold">Bollinger</div>
            </div>

            <div 
              className="relative w-full" 
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {prices.length === 0 ? (
                <div className="flex w-full justify-center py-8 text-slate-600">
                  Waiting for data...
                </div>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const p = prices[virtualRow.index];
                  
                  return (
                    <div
                      key={virtualRow.key}
                      className={cn(
                        "absolute top-0 left-0 grid w-full items-center border-b border-slate-800/40 transition-colors hover:bg-[#1E293B]",
                        gridTemplate,
                      )}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`, 
                      }}
                    >
                      <div className="px-3 text-slate-300">{p.isin}</div>
                      <div className="truncate px-3 text-slate-500">{p.name}</div>
                      <div className="px-3 text-right font-bold text-teal-400">{p.xetra_mid.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-400">{p.xetra_spr.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-400">{p.lsx_spr.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-400">{p.gettex_spr.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-400">{p.trade_gate_spr?.toFixed(2) || "0.00"}</div>
                      <div className="px-3 text-right text-amber-500">{p.bid_size.toFixed(0)}</div>
                      <div className="px-3 text-right text-blue-400">{p.ask_size.toFixed(0)}</div>
                      <div className="px-3 text-right text-slate-400">{p.vol_xetra.toFixed(0)}</div>
                      <div className="px-3 text-right text-slate-400">{p.vol_lsx.toFixed(0)}</div>
                      <div className="px-3 text-right text-slate-400">{p.vol_gettex.toFixed(0)}</div>
                      <div className="px-3 text-right font-medium text-purple-400">{p.vwap.toFixed(2)}</div>
                      <div className="px-3 text-right text-emerald-500">{p.day_high.toFixed(2)}</div>
                      <div className="px-3 text-right text-rose-500">{p.day_low.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-300">{p.ytd_perf.toFixed(2)}%</div>
                      <div className="px-3 text-right text-slate-500">{p.moving_avg.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-500">{p.rsi.toFixed(2)}</div>
                      <div className="px-3 text-right text-slate-500">{p.macd.toFixed(3)}</div>
                      <div className="px-3 text-right text-slate-500">{p.bollinger.toFixed(3)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricesCard;