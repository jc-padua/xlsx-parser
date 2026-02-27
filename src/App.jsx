import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileText,
  Search,
  LayoutGrid,
  Table as TableIcon,
  AlertCircle,
  X,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to strip HTML tags from a string
 */
function stripHtml(html) {
  if (typeof html !== 'string') return html;
  // Insert line breaks between a closing tag and a subsequent opening tag
  const htmlWithBreaks = html.replace(/(<\/[^>]+>)(<[^/!>][^>]*>)/g, '$1\n\n$2');
  const doc = new DOMParser().parseFromString(htmlWithBreaks, 'text/html');
  return doc.body.textContent || "";
}

const EXCLUDED_COLUMNS = new Set([
  'item',
  'image',
  'cta text',
  'cta',
  'meta title',
  'meta description',
]);

function shouldExcludeColumn(columnName) {
  const normalized = String(columnName).trim().toLowerCase();
  return EXCLUDED_COLUMNS.has(normalized);
}

function removeExcludedColumns(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !shouldExcludeColumn(key))
  );
}

function getRenderedValue(val) {
  const isEmpty = val === "" || val === undefined || val === null;
  return isEmpty ? "— Empty Field" : stripHtml(String(val));
}

function buildCardContentText(row, keys) {
  return keys.map((key) => getRenderedValue(row[key])).join('\n\n');
}

const PAGE_NAME_KEYS = new Set([
  'page name',
  'pagename',
  'page',
  'page title',
  'page_name',
]);

// --- Components ---

const FileUpload = ({ onDataLoaded, onError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    const cleanResult = (data) => {
      const cleaned = data
        .map(removeExcludedColumns)
        .filter(row =>
        Object.values(row).some(val => val !== "" && val !== null && val !== undefined)
      );
      if (cleaned.length > 0) {
        onDataLoaded(cleaned);
      } else {
        onError("The file appears to be empty or contains no valid records.");
      }
    };

    if (extension === 'csv') {
      reader.onload = (e) => {
        Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => cleanResult(results.data),
          error: (err) => onError(`Error parsing CSV: ${err.message}`)
        });
      };
      reader.readAsText(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          cleanResult(jsonData);
        } catch (err) {
          onError(`Error parsing Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      onError("Unsupported file format. Please use .csv or .xlsx.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative rounded-3xl border-2 border-dashed p-16 transition-all duration-500 overflow-hidden group",
        isDragging
          ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]"
          : "border-white/10 hover:border-white/20 bg-slate-900/40 backdrop-blur-md"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); }}
    >
      {/* Decorative Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 blur-[100px] pointer-events-none group-hover:bg-teal-500/20 transition-colors" />

      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div className="bg-gradient-to-br from-cyan-400 to-teal-400 p-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-transform duration-500">
          <Upload className="w-10 h-10 text-slate-900" />
        </div>
        <div>
          <h3 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Upload your file
          </h3>
          <p className="text-slate-400 mt-2 max-w-xs mx-auto text-lg leading-relaxed">
            Drag and drop your CSV or Excel files or browse local storage.
          </p>
        </div>

        <label className="cursor-pointer">
          <span className="relative inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-cyan-50 hover:scale-105 transition-all active:scale-95 shadow-xl">
            Select Files <ArrowRight className="w-4 h-4" />
          </span>
          <input
            type="file"
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => { const file = e.target.files[0]; if (file) processFile(file); }}
          />
        </label>

        <div className="flex items-center gap-4 mt-4 opacity-50">
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">CSV</span>
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">XLSX</span>
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">XLS</span>
        </div>
      </div>
    </motion.div>
  );
};

const CardItem = ({ row, idx, keys }) => {
  const [copied, setCopied] = useState(false);

  const cardCopyText = useMemo(
    () => buildCardContentText(row, keys),
    [keys, row]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardCopyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can fail when permission is blocked by browser settings.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.05, 0.4) }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-2xl p-7 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-400">
            {String(idx + 1).padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Record Entry</span>
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
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
          <Layers className="w-4 h-4 text-white/20" />
        </div>
      </div>

      <div className="space-y-4">
        {keys.map((key) => {
          const val = row[key];
          const isEmpty = val === "" || val === undefined || val === null;
          return (
            <div key={key} className="group/field">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5 block group-hover/field:text-cyan-400/50 transition-colors">
                {key}
              </label>
              <div className={cn(
                "text-sm font-medium leading-relaxed break-words whitespace-pre-wrap",
                isEmpty ? "text-rose-400/60 italic" : "text-slate-200"
              )}>
                {getRenderedValue(val)}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const TableView = ({ data }) => {
  const keys = Object.keys(data[0]);
  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest w-20">UID</th>
              {keys.map(key => (
                <th key={key} className="px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest min-w-[180px]">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5 text-sm font-bold text-white/20 group-hover:text-cyan-400 transition-colors">
                  {String(idx + 1).padStart(3, '0')}
                </td>
                {keys.map(key => {
                  const val = row[key];
                  const isEmpty = val === "" || val === undefined || val === null;
                  return (
                    <td key={key} className="px-8 py-5">
                      <span className={cn(
                        "text-sm font-medium whitespace-pre-wrap",
                        isEmpty ? "text-rose-400/40 italic" : "text-slate-300"
                      )}>
                        {isEmpty ? "n/a" : stripHtml(String(val))}
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
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const tableKeys = useMemo(() => (data?.length ? Object.keys(data[0]) : []), [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );
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
    <div className="min-h-screen selection:bg-cyan-500/30 selection:text-white">
      {/* Dynamic Header */}
      <nav className="sticky top-0 z-[100] border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="w-5 h-5 text-slate-950" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-white">
                TSI XLSX <span className="text-cyan-400">PARSER</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data && (
              <button
                onClick={() => { setData(null); setSearchQuery(''); }}
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 relative">
        {/* Ambient Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-600/5 blur-[120px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 pt-4 lg:pt-10"
            >
              {/* Left Column: Text */}
              <div className="flex-1 text-center lg:text-left relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8"
                >
                  <Sparkles className="w-3 h-3" /> XLSX File Parser
                </motion.div>
                <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
                  Data clarity <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 font-black">for the modern web.</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-12">
                  The simple way to transform spreadsheet data into clean, visual cards. Process everything locally in your browser.
                </p>

                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
                  {[
                    { icon: Database, label: "Local Security" },
                    { icon: Layers, label: "Data Mapping" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] group">
                      <feat.icon className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Upload Area */}
              <div className="flex-1 w-full max-w-xl">
                <FileUpload
                  onDataLoaded={setData}
                  onError={setError}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-400"
                  >
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
                  </motion.div>
                )}

                <div className="mt-8 flex justify-center lg:justify-start gap-8 opacity-30">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Visual Styling</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Seamless Export</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-4">
                <div>
                  <div className="flex items-center gap-3 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Live Preview
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight">Data Dashboard</h2>
                  <p className="text-slate-400 mt-1 font-medium">Showing {filteredData.length} data records.</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative group flex-1 lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Filter database..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/20"
                    />
                  </div>
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    <button
                      onClick={() => setViewMode('card')}
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        viewMode === 'card' ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20" : "text-white/40 hover:text-white"
                      )}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        viewMode === 'table' ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20" : "text-white/40 hover:text-white"
                      )}
                    >
                      <TableIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {filteredData.length > 0 ? (
                viewMode === 'card' ? (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                     {
                       <button
                        type="button"
                        onClick={handleExportCards}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Export Cards</span>
                      </button>
                     }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredData.map((row, idx) => (
                        <CardItem key={idx} row={row} idx={idx} keys={tableKeys} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <TableView data={filteredData} />
                )
              ) : (
                <div className="py-40 text-center flex flex-col items-center glass-card rounded-[40px]">
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
        </AnimatePresence>
      </main>

      <footer className="py-20 px-6 border-t border-white/5 mt-auto bg-slate-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-teal-500/5 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <div className="text-white text-lg font-black tracking-tight mb-2">TSI <span className="text-cyan-400">XLSX PARSER</span>.</div>
            <p className="text-slate-500 text-sm font-medium">The standard in modern browser-based file parsing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
