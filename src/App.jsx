import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Database, Home } from 'lucide-react';
import { TOOLS } from './config/tools';
import { ToolDashboard } from './features/dashboard/ToolDashboard';
import { CsvParserTool } from './features/csvParser/CsvParserTool';
import { ServicesContentParserTool } from './features/services/ServicesContentParserTool';

export default function App() {
  const [activeToolId, setActiveToolId] = useState(() => {
    const match = window.location.hash.match(/^#\/tool\/(.+)$/);
    return match ? match[1] : null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const match = window.location.hash.match(/^#\/tool\/(.+)$/);
      setActiveToolId(match ? match[1] : null);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activeTool = useMemo(
    () => TOOLS.find((tool) => tool.id === activeToolId) || null,
    [activeToolId]
  );

  const openTool = (toolId) => {
    window.location.hash = `/tool/${toolId}`;
  };

  const goHome = () => {
    window.location.hash = '/';
  };

  return (
    <div className="relative isolate min-h-screen selection:bg-cyan-500/30 selection:text-white">
      <div className="relative z-10">
        <nav className="sticky top-0 z-[100] border-b border-white/5 bg-slate-950/70">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Database className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">
                  TSI <span className="text-cyan-400">TOOLS</span>
                </h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  {activeTool ? activeTool.title : 'Dashboard'}
                </p>
              </div>
            </div>
            {activeTool && (
              <button
                type="button"
                onClick={goHome}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest">All Tools</span>
              </button>
            )}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10 lg:py-14 relative">
          <AnimatePresence mode="wait">
            {!activeTool ? (
              <motion.div
                key="tool-dashboard"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ToolDashboard onOpenTool={openTool} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTool.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {activeTool.id === 'csv-parser' ? (
                  <CsvParserTool />
                ) : (
                  <ServicesContentParserTool />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="max-w-7xl mx-auto px-6 pb-10">
          {/* <div className="border-t border-white/10 pt-6 flex justify-center">
            <a href="https://www.buymeacoffee.com/jcpadua" target="_blank" rel="noreferrer">
              <img
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=jcpadua&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff"
                alt="Buy me a coffee"
              />
            </a>
          </div> */}
        </footer>
      </div>
    </div>
  );
}
