import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { TOOLS } from '../../config/tools';

export function ToolDashboard({ onOpenTool }) {
  return (
    <div className="space-y-10 p-4 lg:p-6">
        <div className="p-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Sparkles className="w-3 h-3" /> Tool Selection
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4">Parser Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 auto-rows-[1fr] gap-6">
          {TOOLS.map((tool) => (
            <motion.button
              key={tool.id}
              type="button"
              onClick={() => onOpenTool(tool.id)}
              className="text-left glass-card rounded-[1.75rem] p-6 border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.04] transition-all group aspect-square flex flex-col justify-between relative overflow-hidden"
              whileHover={{ y: -8, scale: 1.015, rotateX: 2, rotateY: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <motion.div
                className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-500/10 blur-[60px] pointer-events-none"
                initial={{ scale: 0.9, opacity: 0.7 }}
                whileHover={{ scale: 1.25, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute -top-10 -left-10 w-28 h-28 bg-teal-500/10 blur-[50px] pointer-events-none"
                initial={{ scale: 0.8, opacity: 0.5 }}
                whileHover={{ scale: 1.2, opacity: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <tool.icon className="w-5 h-5 text-slate-950" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 text-cyan-300 bg-cyan-400/10">
                  {tool.status}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-black text-white tracking-tight">{tool.title}</h3>
              <p className="mt-2 text-slate-400 leading-relaxed text-sm">{tool.subtitle}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-wider">
                Open Tool{' '}
                <motion.span whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.span>
              </div>
            </motion.button>
          ))}
        </div>
    </div>
  );
}
