import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Markdown bodies render plain <a> tags, so internal links (wikilinks,
// /read/... references) trigger full page loads by default. On GitHub Pages
// that also means a 301 through the pre-rendered share pages. This handler,
// attached to a markdown container, routes internal links client-side
// instead. External links, modified clicks, and direct-file links (anything
// with an extension, like /rss.xml) keep native behavior.
export function useInternalLinkNav() {
  const navigate = useNavigate();
  return (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor || anchor.target === '_blank') return;
    const href = anchor.getAttribute('href') || '';
    if (!href.startsWith('/') || href.startsWith('//')) return;
    if (/\.[a-z0-9]+$/i.test(href)) return;
    e.preventDefault();
    navigate(href);
  };
}
