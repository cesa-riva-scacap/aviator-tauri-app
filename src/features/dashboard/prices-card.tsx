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
    "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]",
  );

  return (
    <Card className="border-t-primary/30 border-t-2 bg-[#111827] shadow-2xl">
      <CardHeader>
        <CardTitle className="text-foreground">Instrument Controls</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* 3. Attach the ref to the scrollable area */}
        <div ref={parentRef} className="custom-scrollbar max-h-150 overflow-auto">
          <div className="min-w-300 text-left font-mono text-[11px]">
            
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
              <div className="p-3 text-right font-semibold">gettex Spr</div>
              <div className="p-3 text-right font-semibold">Tradegate Spr</div>
              <div className="p-3 text-center font-semibold">Xetra %</div>
              <div className="p-3 text-center font-semibold">LSX %</div>
              <div className="p-3 text-center font-semibold">gettex %</div>
              <div className="p-3 text-center font-semibold">Trdgate %</div>
              <div className="p-3 text-right font-semibold">Weight Total</div>
            </div>

            {/* 4. The Virtualized Wrapper (Forces the scrollbar to simulate the height of 1000 items) */}
            <div 
              className="relative w-full" 
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {prices.length === 0 ? (
                <div className="flex w-full justify-center py-8 text-slate-600">
                  Waiting for data...
                </div>
              ) : (
                /* 5. Map over ONLY the virtual items (the ones currently visible) */
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const p = prices[virtualRow.index];
                  
                  return (
                    <div
                      key={virtualRow.key} // Use the virtualizer's key
                      className={cn(
                        // We must use absolute positioning so the virtualizer can slide the rows up and down
                        "absolute top-0 left-0 grid w-full items-center border-b border-slate-800/40 transition-colors hover:bg-[#1E293B]",
                        gridTemplate,
                      )}
                      style={{
                        height: `${virtualRow.size}px`,
                        // This transform is the magic that places the row exactly where it belongs on the screen
                        transform: `translateY(${virtualRow.start}px)`, 
                      }}
                    >
                      <div className="px-3 text-slate-300">{p.isin}</div>
                      <div className="truncate px-3 text-slate-500">
                        {p.name}
                      </div>
                      <div className="px-3 text-right font-bold text-teal-400">
                        {p.xetra_mid.toFixed(2)}
                      </div>
                      <div className="px-3 text-right text-slate-400">
                        {p.xetra_spr.toFixed(2)}
                      </div>
                      <div className="px-3 text-right text-slate-400">
                        {p.lsx_spr.toFixed(2)}
                      </div>
                      <div className="px-3 text-right text-slate-400">
                        {p.gettex_spr.toFixed(2)}
                      </div>
                      <div className="px-3 text-right text-slate-400">
                        {p.trade_gate_spr?.toFixed(2) || "0.00"}
                      </div>
                      <div className="flex justify-center px-2 py-1">
                        <input
                          type="number"
                          defaultValue={45}
                          className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-center px-2 py-1">
                        <input
                          type="number"
                          defaultValue={20}
                          className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-center px-2 py-1">
                        <input
                          type="number"
                          defaultValue={20}
                          className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-center px-2 py-1">
                        <input
                          type="number"
                          defaultValue={15}
                          className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="px-3 text-right text-slate-500">100%</div>
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