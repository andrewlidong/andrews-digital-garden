import * as resume from "../../content/resume.json";
import { forwardRef, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const Contact = forwardRef<HTMLElement>((_, ref) => {
  const revealRef = useRef<HTMLParagraphElement>(null);
  const rv = useIntersectionObserver(revealRef, { threshold: 0.1, once: true }) ? "is-visible" : "";
  return (
    <section
      id="contact"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center relative"
    >
      <p ref={revealRef} className={`font-mono text-sm text-term-accent mb-2 z-10 animate-on-scroll fade-up ${rv}`}>
        ~/contact
      </p>
      <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-term-fg mb-4 z-10 animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '100ms' }}>
        Get in touch
      </h2>
      <p className={`text-base text-term-dim text-center mb-10 z-10 animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '200ms' }}>
        Find me around the web.
      </p>

      <div className="flex gap-4 z-10">
        {[
          {
            href: resume.contact.linkedin,
            src: "/linkedin.svg",
            alt: "LinkedIn",
            delay: 100
          },
          {
            href: resume.contact.github,
            src: "/github.svg",
            alt: "Github",
            delay: 200
          },
          {
            href: resume.contact.twitter,
            src: "/x.svg",
            alt: "X",
            delay: 300
          },
          // {
          //   href: "/resume.pdf",
          //   src: "/resume.svg",
          //   alt: "Resume",
          //   delay: 400
          // }
        ].map((item, index) => (
          <a
            key={index}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={item.alt}
            className={`grid place-items-center rounded-2xl border border-term-border/70 bg-term-elevated/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-term-accent/50 hover:bg-term-elevated/70 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--term-accent)_60%,transparent)] active:scale-95 animate-on-scroll fade-up ${rv}`}
            style={{ transitionDelay: `${item.delay}ms` }}
          >
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" className="w-10 h-10 opacity-70 transition-opacity duration-300 hover:opacity-100" />
          </a>
        ))}
      </div>
    </section>
  );
});

export default Contact;
