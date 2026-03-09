import { useMemo, useState } from 'react';
import { AlertCircle, Download, LayoutGrid, Search, Table as TableIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { FileUpload } from './FileUpload';
import { CardItem } from './CardItem';
import { TableView } from './TableView';
import { buildCardContentText, PAGE_NAME_KEYS } from './utils';

export function CsvParserTool() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const tableKeys = useMemo(() => (data?.length ? Object.keys(data[0]) : []), [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(query)));
  }, [data, searchQuery]);

  const pageNameKey = useMemo(
    () => tableKeys.find((key) => PAGE_NAME_KEYS.has(String(key).trim().toLowerCase())) || null,
    [tableKeys]
  );

  const handleExportCards = () => {
    if (!filteredData.length || !tableKeys.length) return;

    const grouped = filteredData.reduce((acc, row) => {
      const rawPageName = pageNameKey ? row[pageNameKey] : '';
      const pageName = String(rawPageName ?? '').trim() || 'Uncategorized';
      if (!acc.has(pageName)) acc.set(pageName, []);
      acc.get(pageName).push(row);
      return acc;
    }, new Map());

    const lines = [];
    for (const [pageName, rows] of grouped.entries()) {
      lines.push(`Page Name: ${pageName}`, '');
      rows.forEach((row) => {
        lines.push(buildCardContentText(row, tableKeys), '');
      });
      lines.push('');
    }

    const text = lines.join('\n').trim();
    const fileName = `cards-export-${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {!data ? (
        <div className="max-w-xl mx-auto pt-8">
          <FileUpload
            onDataLoaded={(rows) => {
              setData(rows);
              setError(null);
            }}
            onError={setError}
          />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Live Preview
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">CSV Parser Workspace</h2>
              <p className="text-slate-400 mt-1 font-medium">Showing {filteredData.length} records.</p>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative group flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/20"
                />
              </div>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                <button
                  onClick={() => setViewMode('card')}
                  className={cn(
                    'p-2.5 rounded-xl transition-all',
                    viewMode === 'card' ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white'
                  )}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'p-2.5 rounded-xl transition-all',
                    viewMode === 'table' ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white'
                  )}
                >
                  <TableIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => {
                  setData(null);
                  setSearchQuery('');
                  setError(null);
                }}
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all"
                title="Clear loaded data"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {filteredData.length > 0 ? (
            viewMode === 'card' ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleExportCards}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Export Cards</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {filteredData.map((row, idx) => (
                    <CardItem key={idx} row={row} idx={idx} keys={tableKeys} />
                  ))}
                </div>
              </div>
            ) : (
              <TableView data={filteredData} />
            )
          ) : (
            <div className="py-24 text-center flex flex-col items-center glass-card rounded-3xl">
              <div className="bg-white/5 p-8 rounded-full mb-6 border border-white/10">
                <Search className="w-16 h-16 text-white/10" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">Zero Matches Found</h3>
              <p className="text-slate-400 mt-2 max-w-xs mx-auto">Your filter criteria did not match any records.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-8 text-cyan-400 font-bold uppercase tracking-widest text-xs hover:text-cyan-300 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-400"
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
