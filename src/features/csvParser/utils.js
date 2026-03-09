export const EXCLUDED_COLUMNS = new Set([
  'item',
  'image',
  'cta text',
  'cta',
]);

export const COPY_EXCLUDED_COLUMNS = new Set([
  'meta title',
  'meta description',
]);

export const PAGE_NAME_KEYS = new Set([
  'page name',
  'pagename',
  'page',
  'page title',
  'page_name',
]);

export function stripHtml(html) {
  if (typeof html !== 'string') return html;
  const htmlWithBreaks = html.replace(/(<\/[^>]+>)(<[^/!>][^>]*>)/g, '$1\n\n$2');
  const doc = new DOMParser().parseFromString(htmlWithBreaks, 'text/html');
  return doc.body.textContent || '';
}

export function shouldExcludeColumn(columnName) {
  const normalized = String(columnName).trim().toLowerCase();
  return EXCLUDED_COLUMNS.has(normalized);
}

export function removeExcludedColumns(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !shouldExcludeColumn(key))
  );
}

export function getRenderedValue(val) {
  const isEmpty = val === '' || val === undefined || val === null;
  return isEmpty ? 'Empty Field' : stripHtml(String(val));
}

export function buildCardContentText(row, keys) {
  return keys
    .filter((key) => !COPY_EXCLUDED_COLUMNS.has(String(key).trim().toLowerCase()))
    .map((key) => getRenderedValue(row[key]))
    .join('\n\n');
}
