import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tick } from "../../types";

interface Props {
  prices: Tick[];
}

const PricesCard = ({ prices }: Props) => {
  // Our master 12-column grid layout
  const gridTemplate = "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]";

  return (
    <Card className="overflow-hidden border-t-2 border-slate-800 border-t-blue-500/30 bg-[#111827] shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-[#1A2333] px-4 py-3">
        <CardTitle className="text-sm font-medium text-slate-300">
          Instrument Controls (Global)
        </CardTitle>
        <span className="font-mono text-xs text-slate-500">
          Weights + Spread Configuration (Non-Virtualized)
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {/* Scrollable Container */}
        <div className="custom-scrollbar max-h-150 overflow-auto">
          <div className="min-w-300 text-left font-mono text-[11px]">
            
            {/* HEADER ROW (Sticky to the top of the scroll container) */}
            <div className={`sticky top-0 z-10 grid ${gridTemplate} border-b border-slate-800 bg-[#1A2333] text-slate-400 shadow-md`}>
              <div className="p-3 font-semibold">ISIN</div>
              <div className="p-3 font-semibold">Name</div>
              <div className="p-3 text-right font-semibold">Quoted Mid</div>
              <div className="p-3 text-right font-semibold">Xetra Spr</div>
              <div className="p-3 text-right font-semibold">LSX Spr</div>
              <div className="p-3 text-right font-semibold">gettex Spr</div>
              <div className="border-r border-slate-800 p-3 text-right font-semibold">Tradegate Spr</div>
              <div className="bg-blue-950/20 p-3 text-center font-semibold">Xetra %</div>
              <div className="bg-blue-950/20 p-3 text-center font-semibold">LSX %</div>
              <div className="bg-blue-950/20 p-3 text-center font-semibold">gettex %</div>
              <div className="bg-blue-950/20 p-3 text-center font-semibold">Trdgate %</div>
              <div className="p-3 text-right font-semibold">Weight Total</div>
            </div>

            {/* STANDARD REACT MAP (Renders all 1000 rows into the DOM instantly) */}
            <div className="w-full">
              {prices.length === 0 ? (
                <div className="flex w-full justify-center py-8 text-slate-600">
                  Waiting for data...
                </div>
              ) : (
                prices.map((p) => (
                  <div
                    key={p.isin}
                    className={`grid w-full items-center border-b border-slate-800/40 transition-colors hover:bg-[#1E293B] ${gridTemplate}`}
                  >
                    <div className="px-3 py-2 text-slate-300">{p.isin}</div>
                    <div className="truncate px-3 py-2 text-slate-500">{p.name}</div>
                    <div className="px-3 py-2 text-right font-bold text-teal-400">{p.xetra_mid.toFixed(2)}</div>
                    <div className="px-3 py-2 text-right text-slate-400">{p.xetra_spr.toFixed(2)}</div>
                    <div className="px-3 py-2 text-right text-slate-400">{p.lsx_spr.toFixed(2)}</div>
                    <div className="px-3 py-2 text-right text-slate-400">{p.gettex_spr.toFixed(2)}</div>
                    <div className="border-r border-slate-800 px-3 py-2 text-right text-slate-400">
                      {p.trade_gate_spr?.toFixed(2) || "0.00"}
                    </div>

                    {/* INTERACTIVE INPUTS */}
                    <div className="flex justify-center bg-blue-950/10 px-2 py-1">
                      <input type="number" defaultValue={45} className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex justify-center bg-blue-950/10 px-2 py-1">
                      <input type="number" defaultValue={20} className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex justify-center bg-blue-950/10 px-2 py-1">
                      <input type="number" defaultValue={20} className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex justify-center bg-blue-950/10 px-2 py-1">
                      <input type="number" defaultValue={15} className="w-12 rounded border border-slate-700 bg-slate-900 py-0.5 text-center text-slate-300 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="px-3 py-2 text-right text-slate-500">100%</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricesCard;