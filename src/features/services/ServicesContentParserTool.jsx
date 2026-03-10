import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Copy,
  ChevronRight,
  FileText,
  Layers,
  Play,
  RefreshCw,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { parseServicesContent } from './parser';

function splitQuestionAnswer(text) {
  const trimmed = String(text || '').trim();
  const match = trimmed.match(/^(.+?\?)\s*(.+)$/);
  if (!match) return { question: trimmed, answer: '' };
  return { question: match[1].trim(), answer: match[2].trim() };
}

function toPlainCopyText(text) {
  return String(text || '')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*[-*\u2022\u25e6]\s+/, '')
        .replace(/^\s*\d+[\.\)]\s+/, '')
    )
    .join('\n')
    .trim();
}

function CopyableText({
  as = 'p',
  text,
  className,
  onCopy,
  isCopied,
  inline = false,
}) {
  const Component = as;
  return (
    <button
      type="button"
      onClick={() => onCopy(text)}
      className={[
        inline ? 'inline text-left group align-middle rounded-md px-1 py-0.5' : 'w-full text-left group rounded-lg px-1 py-0.5',
        isCopied ? 'ring-1 ring-cyan-400/70 bg-cyan-500/10' : '',
      ].join(' ')}
      title="Click to copy"
    >
      <Component className={className}>
        {text}
      </Component>
      {!inline && (
        <span
          className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
            isCopied ? 'text-cyan-300' : 'text-cyan-300/0 group-hover:text-cyan-300/70'
          }`}
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            'Click to copy'
          )}
        </span>
      )}
    </button>
  );
}

export function ServicesContentParserTool() {
  const [pages, setPages] = useState([]);
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState(null);
  const [expandedPages, setExpandedPages] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const copiedTimerRef = useRef(null);

  const handleParseText = () => {
    if (!rawText.trim()) {
      setError('Please paste service content text first.');
      return;
    }

    try {
      const parsedPages = parseServicesContent(rawText);
      if (parsedPages.length === 0) {
        setError('No recognizable content pattern found in the provided text.');
        return;
      }
      setPages(parsedPages);
      setExpandedPages({});
    } catch (err) {
      setError(`Unable to parse content: ${err.message}`);
      return;
    }

    setError(null);
  };

  const togglePage = (pageId) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  const handleCopyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(toPlainCopyText(text));
      setCopiedId(id);
      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      // Ignore clipboard permission failures.
    }
  };

  const buildPageCopyText = (page) => {
    const chunks = [page.title];

    page.sections.forEach((section) => {
      if (section.type === 'A') {
        if (section.subHeader) chunks.push(section.subHeader);
        const combined = (section.paragraphs || []).filter(Boolean).join('\n\n');
        if (combined) chunks.push(combined);
        return;
      }

      if (section.type === 'B') {
        if (section.header) chunks.push(section.header);
        const combined = (section.paragraphs || []).filter(Boolean).join('\n\n');
        if (combined) chunks.push(combined);
        return;
      }

      if (section.type === 'C') {
        if (section.header) chunks.push(section.header);
        if (section.openingSentence) chunks.push(section.openingSentence);
        section.bullets.forEach((b) => {
          if (!b) return;
          const { question, answer } = splitQuestionAnswer(b);
          chunks.push(question);
          if (answer) chunks.push(answer);
        });
        if (section.closingSentence) chunks.push(section.closingSentence);
      }
    });

    return chunks.join('\n\n');
  };

  useEffect(
    () => () => {
      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current);
      }
    },
    []
  );

  return (
    <div className="space-y-8">
      {pages.length === 0 ? (
        <div className="max-w-4xl mx-auto pt-6">
          <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-3">
                <Layers className="w-3 h-3" />
                Services Content Parser
              </div>
              <h3 className="text-2xl font-black text-white">Paste Services Content</h3>
              <p className="text-slate-400 mt-1">
                Paste the raw content text below. The parser will detect Section Type A/B/C patterns and build structured cards.
              </p>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste All Services Content text here..."
              className="glass-input w-full min-h-[320px] rounded-2xl p-4 text-sm text-white placeholder:text-white/25 resize-y"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseText}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white text-slate-900 hover:bg-cyan-50 transition-colors font-bold"
              >
                <Play className="w-4 h-4" />
                Parse Content
              </button>
            </div>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-2">
                <Layers className="w-3 h-3" />
                Services Content Parser
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">Structured Services Content</h2>
              <p className="text-slate-400 mt-1">
                Parsed <span className="text-cyan-300 font-bold">{pages.length}</span> structured page cards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPages([]);
                setError(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Paste New Content</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {pages.map((page, pageIndex) => (
              <article
                key={page.id}
                className="glass-card rounded-3xl p-6 lg:p-8 space-y-5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Page {pageIndex + 1}
                    </div>
                    <CopyableText
                      as="h3"
                      text={page.title}
                      className="text-2xl font-black text-white mt-1"
                      onCopy={(text) => handleCopyText(text, `${page.id}-title`)}
                      isCopied={copiedId === `${page.id}-title`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyText(buildPageCopyText(page), `${page.id}-card-copy`)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                        copiedId === `${page.id}-card-copy`
                          ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-300'
                          : 'border-white/10 bg-white/5 text-white/70 hover:text-cyan-300 hover:border-cyan-400/40'
                      }`}
                      aria-label={`Copy ${page.title}`}
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {copiedId === `${page.id}-card-copy` ? 'Copied' : 'Copy Card'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePage(page.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
                      aria-expanded={Boolean(expandedPages[page.id])}
                      aria-label={`${expandedPages[page.id] ? 'Collapse' : 'Expand'} ${page.title}`}
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${expandedPages[page.id] ? 'rotate-90' : ''}`}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {expandedPages[page.id] ? 'Collapse' : 'Expand'}
                      </span>
                    </button>
                    <FileText className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>

                {!expandedPages[page.id] ? (
                  <CopyableText
                    text={page.sections[0]?.subHeader || page.sections[0]?.paragraphs?.[0] || 'Expand to view full content.'}
                    className="text-slate-400 leading-relaxed"
                    onCopy={(text) => handleCopyText(text, `${page.id}-preview`)}
                    isCopied={copiedId === `${page.id}-preview`}
                  />
                ) : (
                  <div className="space-y-4">
                    {page.sections.map((section, sectionIndex) => (
                      <div key={`${page.id}-${section.type}-${sectionIndex}`} className="space-y-3">
                        {section.type === 'A' && (
                          <>
                            <CopyableText
                              as="h4"
                              text={section.subHeader}
                              className="text-lg font-bold text-white"
                              onCopy={(text) => handleCopyText(text, `${page.id}-a-header-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-a-header-${sectionIndex}`}
                            />
                            <CopyableText
                              as="div"
                              text={(section.paragraphs || []).filter(Boolean).join('\n\n')}
                              className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                              onCopy={(text) => handleCopyText(text, `${page.id}-a-p-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-a-p-${sectionIndex}`}
                            />
                          </>
                        )}

                        {section.type === 'B' && (
                          <>
                            <CopyableText
                              as="h4"
                              text={section.header}
                              className="text-lg font-bold text-white"
                              onCopy={(text) => handleCopyText(text, `${page.id}-b-header-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-b-header-${sectionIndex}`}
                            />
                            <CopyableText
                              as="div"
                              text={(section.paragraphs || []).filter(Boolean).join('\n\n')}
                              className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                              onCopy={(text) => handleCopyText(text, `${page.id}-b-p-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-b-p-${sectionIndex}`}
                            />
                          </>
                        )}

                        {section.type === 'C' && (
                          <>
                            <CopyableText
                              as="h4"
                              text={section.header}
                              className="text-lg font-bold text-white"
                              onCopy={(text) => handleCopyText(text, `${page.id}-c-header-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-c-header-${sectionIndex}`}
                            />
                            <CopyableText
                              text={section.openingSentence}
                              className="text-slate-300 leading-relaxed"
                              onCopy={(text) => handleCopyText(text, `${page.id}-c-open-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-c-open-${sectionIndex}`}
                            />
                            <ul className="space-y-1">
                              {section.bullets.map((bullet, idx) => (
                                <li key={idx} className="text-slate-200">
                                  {(() => {
                                    const { question, answer } = splitQuestionAnswer(bullet);
                                    return (
                                      <div className="space-y-1">
                                        <div className="flex items-start gap-2">
                                          <span className="text-cyan-300 leading-6">•</span>
                                          <CopyableText
                                            as="span"
                                            text={question}
                                            className="inline leading-relaxed text-slate-200"
                                            onCopy={(text) => handleCopyText(text, `${page.id}-c-bq-${sectionIndex}-${idx}`)}
                                            isCopied={copiedId === `${page.id}-c-bq-${sectionIndex}-${idx}`}
                                            inline
                                          />
                                        </div>
                                        {answer && (
                                          <div className="ml-6 flex items-start gap-2">
                                            <span className="text-cyan-300/80 leading-6">◦</span>
                                            <CopyableText
                                              as="span"
                                              text={answer}
                                              className="inline leading-relaxed text-slate-300"
                                              onCopy={(text) => handleCopyText(text, `${page.id}-c-ba-${sectionIndex}-${idx}`)}
                                              isCopied={copiedId === `${page.id}-c-ba-${sectionIndex}-${idx}`}
                                              inline
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </li>
                              ))}
                            </ul>
                            <CopyableText
                              text={section.closingSentence}
                              className="text-slate-300 leading-relaxed"
                              onCopy={(text) => handleCopyText(text, `${page.id}-c-close-${sectionIndex}`)}
                              isCopied={copiedId === `${page.id}-c-close-${sectionIndex}`}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
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
