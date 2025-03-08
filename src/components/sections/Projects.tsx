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
import { ExternalLink } from "lucide-react";

// TODO: add proper images, external links
const Projects = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section
      id="projects"
      ref={ref}
      className="min-h-screen flex items-center justify-center pt-32"
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-6xl font-bold text-center text-white mb-8">
          Selected Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resume.projects.map((project, index) => (
            <Card key={index} className="flex flex-col relative border-gray-700 bg-gray-800">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 z-10 p-2 bg-gray-700 rounded"
                >
                  <ExternalLink className="w-6 h-6 text-white" />
                </a>
              )}
              <CardHeader className="bg-gray-800">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
              </CardHeader>
              <CardContent className="flex-grow bg-gray-800">
                <CardTitle className="text-xl mb-2 text-white">{project.name}</CardTitle>
                <CardDescription className="text-gray-300 mb-4">
                  {project.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="bg-gray-600 text-white">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Projects;
