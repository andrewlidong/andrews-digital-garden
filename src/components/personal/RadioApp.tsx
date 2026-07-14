import { useEffect, useRef, useState } from 'react';

// A tiny internet radio tuned to SomaFM's listener-supported, DJ-curated
// streams (somafm.com — streams used with their public stream URLs and
// attribution). One <audio> element, a station list, and a volume knob.
const STATIONS = [
  { id: 'groovesalad', name: 'Groove Salad', desc: 'ambient beats & downtempo', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'dronezone', name: 'Drone Zone', desc: 'deep ambient space music', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
  { id: 'secretagent', name: 'Secret Agent', desc: 'spy jazz & lounge', url: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'lush', name: 'Lush', desc: 'sensuous vocal chillout', url: 'https://ice1.somafm.com/lush-128-mp3' },
  { id: 'u80s', name: 'Underground 80s', desc: 'synthpop & new wave', url: 'https://ice1.somafm.com/u80s-128-mp3' },
];

export function RadioApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = (id: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (activeId === id) {
      audio.pause();
      setActiveId(null);
      return;
    }
    const station = STATIONS.find((s) => s.id === id);
    if (!station) return;
    setLoading(true);
    audio.src = station.url;
    audio
      .play()
      .then(() => setActiveId(id))
      .catch(() => setActiveId(null))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex h-full flex-col bg-term-bg p-3 font-mono text-sm">
      <div className="mb-2 flex items-center gap-2 text-term-green">
        <span aria-hidden>📻</span>
        <span>garden radio</span>
        {activeId && (
          <span className="ml-auto flex items-center gap-1 text-xs text-term-accent">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-term-accent" />
            on air
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {STATIONS.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors ${
                active
                  ? 'border-term-accent/60 bg-term-elevated text-term-accent'
                  : 'border-term-border/50 text-term-dim hover:border-term-accent/40 hover:text-term-fg'
              }`}
            >
              <span className="w-4 text-center" aria-hidden>
                {active ? '■' : '▶'}
              </span>
              <span className="flex-1">
                <span className="block text-term-fg">{s.name}</span>
                <span className="block text-xs text-term-faint">{s.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-term-border pt-3 text-xs text-term-faint">
        <span aria-hidden>🔉</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="flex-1 accent-[var(--term-accent)]"
        />
        <span aria-hidden>🔊</span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-term-faint">
        {loading ? 'tuning…' : (
          <>
            streams by{' '}
            <a href="https://somafm.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-term-accent">
              SomaFM
            </a>
            {' '}— listener-supported, commercial-free radio
          </>
        )}
      </p>
    </div>
  );
}
