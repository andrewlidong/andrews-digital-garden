// Ambient visual polish behind the desktop, inspired by maximeheckel.com:
//   - an aurora of slow-drifting, blurred radial blobs tinted to the active
//     theme's accent / magenta / cyan tokens (so it re-colors when the theme
//     changes), and
//   - a faint film-grain overlay for texture.
//
// Both layers are purely decorative (aria-hidden, pointer-events: none) and the
// aurora's drift is paused under prefers-reduced-motion (handled in CSS).

export function AmbientBackground() {
  return (
    <>
      {/* Aurora — sits behind content within the page's stacking context. */}
      <div aria-hidden className="aurora-layer -z-10 pointer-events-none">
        <div className="aurora-blob aurora-blob-1 aurora-animate-1" />
        <div className="aurora-blob aurora-blob-2 aurora-animate-2" />
        <div className="aurora-blob aurora-blob-3 aurora-animate-3" />
      </div>
      {/* Film grain — thin texture above everything; never intercepts clicks. */}
      <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 z-[9999]" />
    </>
  );
}

export default AmbientBackground;
