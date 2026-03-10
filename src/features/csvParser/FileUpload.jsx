import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ArrowRight, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { removeExcludedColumns } from './utils';

export function FileUpload({ onDataLoaded, onError }) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    const cleanResult = (data) => {
      const cleaned = data
        .map(removeExcludedColumns)
        .filter((row) =>
          Object.values(row).some((val) => val !== '' && val !== null && val !== undefined)
        );

      if (cleaned.length > 0) {
        onDataLoaded(cleaned);
        return;
      }

      onError('The file appears to be empty or contains no valid records.');
    };

    if (extension === 'csv') {
      reader.onload = (e) => {
        Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => cleanResult(results.data),
          error: (err) => onError(`Error parsing CSV: ${err.message}`),
        });
      };
      reader.readAsText(file);
      return;
    }

    if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          cleanResult(jsonData);
        } catch (err) {
          onError(`Error parsing Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    onError('Unsupported file format. Please use .csv or .xlsx.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative rounded-3xl border-2 border-dashed p-12 transition-all duration-500 overflow-hidden group',
        isDragging
          ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]'
          : 'border-white/10 hover:border-white/20 bg-slate-900/60'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      }}
    >
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div className="bg-gradient-to-br from-cyan-400 to-teal-400 p-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          <Upload className="w-10 h-10 text-slate-900" />
        </div>
        <div>
          <h3 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Upload your file
          </h3>
          <p className="text-slate-400 mt-2 max-w-xs mx-auto text-lg leading-relaxed">
            Drag and drop CSV or Excel files, or browse local storage.
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
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) processFile(file);
            }}
          />
        </label>

        <div className="flex items-center gap-4 mt-2 opacity-60">
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">CSV</span>
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">XLSX</span>
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">XLS</span>
        </div>
      </div>
    </motion.div>
  );
}
