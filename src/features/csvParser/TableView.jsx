import { cn } from '../../lib/cn';
import { stripHtml } from './utils';

export function TableView({ data }) {
  const keys = Object.keys(data[0]);
  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[11px] font-bold text-white/40 uppercase tracking-widest w-20">UID</th>
              {keys.map((key) => (
                <th key={key} className="px-6 py-4 text-[11px] font-bold text-white/40 uppercase tracking-widest min-w-[180px]">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-white/20">{String(idx + 1).padStart(3, '0')}</td>
                {keys.map((key) => {
                  const val = row[key];
                  const isEmpty = val === '' || val === undefined || val === null;
                  return (
                    <td key={key} className="px-6 py-4">
                      <span className={cn('text-sm font-medium whitespace-pre-wrap', isEmpty ? 'text-rose-400/40 italic' : 'text-slate-300')}>
                        {isEmpty ? 'n/a' : stripHtml(String(val))}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
