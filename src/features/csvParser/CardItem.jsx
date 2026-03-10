import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { buildCardContentText, getRenderedValue } from './utils';

export function CardItem({ row, idx, keys }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedFieldKey, setCopiedFieldKey] = useState(null);
  const copiedFieldTimerRef = useRef(null);
  const cardRef = useRef(null);
  const previewKey = keys[0];
  const previewValue = previewKey ? getRenderedValue(row[previewKey]) : '';

  const cardCopyText = useMemo(() => buildCardContentText(row, keys), [keys, row]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardCopyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard failures caused by browser permission restrictions.
    }
  };

  const handleCopyFieldValue = async (key, val) => {
    try {
      await navigator.clipboard.writeText(getRenderedValue(val));
      setCopiedFieldKey(key);
      if (copiedFieldTimerRef.current) {
        window.clearTimeout(copiedFieldTimerRef.current);
      }
      copiedFieldTimerRef.current = window.setTimeout(() => {
        setCopiedFieldKey(null);
      }, 5000);
    } catch {
      // Ignore clipboard failures caused by browser permission restrictions.
    }
  };

  const handleBackToTop = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(
    () => () => {
      if (copiedFieldTimerRef.current) {
        window.clearTimeout(copiedFieldTimerRef.current);
      }
    },
    []
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.25) }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-400">
            {String(idx + 1).padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Record</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
            aria-label={`Copy record ${idx + 1}`}
            title="Copy card content"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} record ${idx + 1}`}
          >
            <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-90')} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {!isExpanded ? (
        <div className="space-y-3">
          <div className="group/field">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 block">
              {previewKey || 'Record'}
            </label>
            <div className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap text-slate-200 max-h-24 overflow-hidden">
              {previewValue}
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">{keys.length} fields in this record</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {keys.map((key) => {
              const val = row[key];
              const isEmpty = val === '' || val === undefined || val === null;
              return (
                <div
                  key={key}
                  className={cn(
                    'group/field rounded-xl p-2 -mx-2 transition-colors',
                    copiedFieldKey === key && 'bg-cyan-500/10 ring-1 ring-cyan-400/40'
                  )}
                >
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 block">
                    {key}
                  </label>
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'text-sm font-medium leading-relaxed break-words whitespace-pre-wrap flex-1',
                        isEmpty ? 'text-rose-400/60 italic' : 'text-slate-200'
                      )}
                    >
                      {getRenderedValue(val)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyFieldValue(key, val)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-white/5 text-white/50 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
                      aria-label={`Copy value for ${key}`}
                    >
                      {copiedFieldKey === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[9px] font-bold uppercase tracking-wider">{copiedFieldKey === key ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleBackToTop}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
                aria-label={`Go to top of record ${idx + 1}`}
              >
                <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Back to Top</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
