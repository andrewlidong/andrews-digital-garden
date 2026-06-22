import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import * as resume from "../../content/resume.json";
import { forwardRef, useRef } from "react";
import { GithubIcon, ExternalLinkIcon } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const Projects = forwardRef<HTMLElement>((_, ref) => {
  const revealRef = useRef<HTMLDivElement>(null);
  const rv = useIntersectionObserver(revealRef, { threshold: 0.1, once: true }) ? "is-visible" : "";
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
    const img = e.currentTarget;
    if (img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
  };

  return (
    <section
      id="projects"
      ref={ref}
      className="min-h-screen flex items-center justify-center pt-32 relative"
    >
      <div ref={revealRef} className="w-full z-10">
        <p className={`font-mono text-sm text-term-accent mb-2 animate-on-scroll fade-up ${rv}`}>
          ~/projects
        </p>
        <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-term-fg mb-8 animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '100ms' }}>
          Selected Projects
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {resume.projects.map((project, index) => {
            const liveUrl = (project as { live_url?: string }).live_url;
            return (
            <div
              key={index}
              className={`animate-on-scroll fade-up ${rv}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <Card className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-term-border/70 bg-term-elevated/40 backdrop-blur-sm transition-all duration-300 hover:border-term-accent/50 hover:bg-term-elevated/70 hover:shadow-[0_8px_40px_-16px_color-mix(in_srgb,var(--term-accent)_60%,transparent)] active:scale-[0.99]">
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Live demo"
                      className="rounded-lg border border-term-border/70 bg-term-bg/60 p-2 text-term-dim backdrop-blur-sm transition-colors hover:text-term-accent hover:border-term-accent/50"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Source on GitHub"
                      className="rounded-lg border border-term-border/70 bg-term-bg/60 p-2 text-term-dim backdrop-blur-sm transition-colors hover:text-term-accent hover:border-term-accent/50"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <CardHeader className="p-4 md:p-5">
                  {project.image_url && (
                    <div className="overflow-hidden rounded-lg border border-term-border/50 mb-3">
                      <img
                        src={project.image_url}
                        alt={project.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => handleImageError(e, project.fallback_image_url)}
                        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg font-semibold tracking-tight text-term-fg">{project.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-term-dim">
                    {project.description[0]}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="secondary"
                        className="rounded-md border border-term-border/60 bg-term-bg/50 px-2 py-0.5 font-mono text-xs font-normal text-term-dim"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

Projects.displayName = "Projects";

export default Projects;
