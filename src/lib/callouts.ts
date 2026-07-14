// GitHub-style callouts in markdown:
//
//   > [!NOTE]
//   > Something worth knowing.
//
// A blockquote whose first line is a [!TYPE] marker becomes a styled aside
// (see the .callout rules in index.css). Implemented as a remark plugin so
// every markdown surface — reader, desktop windows, mobile — renders them
// identically, with no per-component work.

type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, string | string[]> };
};

const CALLOUTS: Record<string, { icon: string; label: string }> = {
  note: { icon: '📝', label: 'note' },
  tip: { icon: '💡', label: 'tip' },
  important: { icon: '❗', label: 'important' },
  warning: { icon: '⚠️', label: 'warning' },
  caution: { icon: '🔥', label: 'caution' },
};

const MARKER = /^\s*\[!(\w+)\]\s*\n?/;

function transform(node: MdNode): void {
  if (node.type === 'blockquote' && node.children?.length) {
    const first = node.children[0];
    const text = first?.type === 'paragraph' ? first.children?.[0] : undefined;
    const m = text?.type === 'text' && text.value ? MARKER.exec(text.value) : null;
    const kind = m && CALLOUTS[m[1].toLowerCase()];
    if (m && kind && text) {
      text.value = (text.value as string).slice(m[0].length);
      // Marker on its own paragraph: drop the now-empty paragraph.
      if (!text.value && first.children?.length === 1) node.children.shift();
      node.data = {
        ...node.data,
        hProperties: {
          ...(node.data?.hProperties || {}),
          className: ['callout', `callout-${m[1].toLowerCase()}`],
          'data-callout': `${kind.icon} ${kind.label}`,
        },
      };
    }
  }
  node.children?.forEach(transform);
}

/** Remark plugin: turn [!NOTE]-style blockquotes into styled callouts. */
export function remarkCallouts() {
  return (tree: MdNode) => {
    transform(tree);
  };
}
