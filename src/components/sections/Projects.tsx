import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import * as resume from "../../content/resume.json";
import { forwardRef } from "react";
import { GithubIcon } from "lucide-react";

const Projects = forwardRef<HTMLElement>((_, ref) => {
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
      {/* Simple background elements */}
      <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-40 right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-center text-white mb-8 animate-on-scroll fade-up is-visible">
          Selected Projects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {resume.projects.map((project, index) => (
            <div 
              key={index} 
              className="animate-on-scroll scale-up is-visible"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="flex flex-col relative border-gray-700 bg-gray-800 h-full hover-lift">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </a>
                )}
                <CardHeader className="bg-gray-800 p-3 md:p-6">
                  {project.image_url && (
                    <div className="overflow-hidden rounded-t-lg">
                      <img
                        src={project.image_url}
                        alt={project.name}
                        onError={(e) => handleImageError(e, project.fallback_image_url)}
                        className="w-full h-32 md:h-48 object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg md:text-xl text-white mt-3">{project.name}</CardTitle>
                  <CardDescription className="text-sm md:text-base text-gray-300">
                    {project.description[0]}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="secondary"
                        className="text-xs md:text-sm bg-gray-700 text-gray-200"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Projects.displayName = "Projects";

export default Projects;
