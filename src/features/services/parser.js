function normalizeLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        Boolean(line) &&
        !line.startsWith('```') &&
        !/^all services content$/i.test(line) &&
        !/^html$/i.test(line)
    );
}

function getSectionType(line) {
  const match = line.match(/^section\s*type\s*([abc])$/i);
  return match ? match[1].toUpperCase() : null;
}

function cleanBullet(line) {
  return line
    .replace(/^[-*\u2022]\s*/, '')
    .replace(/^\d+[\.\)]\s*/, '')
    .trim();
}

function readChunk(lines, startIndex, count) {
  const out = [];
  let i = startIndex;

  while (i < lines.length && out.length < count) {
    if (getSectionType(lines[i])) break;
    out.push(lines[i]);
    i += 1;
  }

  return { items: out, nextIndex: i };
}

function parseSectionA(lines, startIndex) {
  const chunk = readChunk(lines, startIndex, 5);
  const [mainHeader = '', subHeader = '', ...paragraphs] = chunk.items;
  return {
    section: {
      type: 'A',
      title: 'Section Type A',
      mainHeader,
      subHeader,
      paragraphs,
    },
    nextIndex: chunk.nextIndex,
  };
}

function parseSectionB(lines, startIndex) {
  const chunk = readChunk(lines, startIndex, 4);
  const [header = '', ...paragraphs] = chunk.items;
  return {
    section: {
      type: 'B',
      title: 'Section Type B',
      header,
      paragraphs,
    },
    nextIndex: chunk.nextIndex,
  };
}

function parseSectionC(lines, startIndex) {
  const chunk = readChunk(lines, startIndex, 8);
  const [header = '', openingSentence = '', ...rest] = chunk.items;
  const bullets = rest.slice(0, 5).map(cleanBullet);
  const closingSentence = rest[5] || '';

  return {
    section: {
      type: 'C',
      title: 'Section Type C',
      header,
      openingSentence,
      bullets,
      closingSentence,
    },
    nextIndex: chunk.nextIndex,
  };
}

function buildPageTitle(pageIndex, pendingTitleLines) {
  if (pendingTitleLines.length === 0) return `Page ${pageIndex}`;
  return pendingTitleLines.join(' - ');
}

export function parseServicesContent(rawText) {
  const lines = normalizeLines(rawText);
  const markerBasedPages = parseMarkerBasedSections(lines);
  if (markerBasedPages.length > 0) return markerBasedPages;

  return parseFixedPatternSections(lines);
}

function parseMarkerBasedSections(lines) {
  const pages = [];

  let i = 0;
  let pageIndex = 1;
  let pendingTitleLines = [];
  let currentPage = {
    title: buildPageTitle(pageIndex, pendingTitleLines),
    sections: [],
  };

  while (i < lines.length) {
    const line = lines[i];
    const sectionType = getSectionType(line);

    if (!sectionType) {
      if (currentPage.sections.length === 0) {
        pendingTitleLines.push(line);
        currentPage.title = buildPageTitle(pageIndex, pendingTitleLines);
      }
      i += 1;
      continue;
    }

    if (sectionType === 'A' && currentPage.sections.length > 0) {
      pages.push(currentPage);
      pageIndex += 1;
      pendingTitleLines = [];
      currentPage = {
        title: buildPageTitle(pageIndex, pendingTitleLines),
        sections: [],
      };
    }

    i += 1;

    let parsed;
    if (sectionType === 'A') parsed = parseSectionA(lines, i);
    else if (sectionType === 'B') parsed = parseSectionB(lines, i);
    else parsed = parseSectionC(lines, i);

    currentPage.sections.push(parsed.section);
    i = parsed.nextIndex;
  }

  if (currentPage.sections.length > 0) {
    pages.push(currentPage);
  }

  return pages.map((page, idx) => ({
    id: `page-${idx + 1}`,
    title: page.title || `Page ${idx + 1}`,
    sections: page.sections,
  }));
}

function isLikelyTitle(line) {
  if (!line) return false;
  if (line.includes('?')) return false;
  if (line.length < 10 || line.length > 120) return false;
  return /^[A-Z0-9]/.test(line);
}

function isLikelySubtitle(line) {
  if (!line) return false;
  if (line.includes('?')) return false;
  if (line.length < 10 || line.length > 160) return false;
  return true;
}

function parseFixedPatternSections(lines) {
  const pages = [];
  let i = 0;
  let pageIndex = 1;

  while (i < lines.length) {
    if (i + 16 >= lines.length) break;

    const title = lines[i];
    const subtitle = lines[i + 1];

    if (!isLikelyTitle(title) || !isLikelySubtitle(subtitle)) {
      i += 1;
      continue;
    }

    const aParagraphs = [lines[i + 2], lines[i + 3], lines[i + 4]];
    const bHeader = lines[i + 5];
    const bParagraphs = [lines[i + 6], lines[i + 7], lines[i + 8]];
    const cHeader = lines[i + 9];
    const cSentence = lines[i + 10];
    const cBullets = [lines[i + 11], lines[i + 12], lines[i + 13], lines[i + 14], lines[i + 15]];
    const cClosing = lines[i + 16];

    const questionLikeCount = cBullets.filter((line) => line.includes('?')).length;
    if (questionLikeCount < 3) {
      i += 1;
      continue;
    }

    pages.push({
      id: `page-${pageIndex}`,
      title,
      subtitle,
      sections: [
        {
          type: 'A',
          title: 'Section Type A',
          mainHeader: title,
          subHeader: subtitle,
          paragraphs: aParagraphs,
        },
        {
          type: 'B',
          title: 'Section Type B',
          header: bHeader,
          paragraphs: bParagraphs,
        },
        {
          type: 'C',
          title: 'Section Type C',
          header: cHeader,
          openingSentence: cSentence,
          bullets: cBullets.map(cleanBullet),
          closingSentence: cClosing,
        },
      ],
    });

    pageIndex += 1;
    i += 17;
  }

  return pages;
}
