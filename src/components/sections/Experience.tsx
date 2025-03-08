import * as resume from "../../content/resume.json";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { forwardRef } from "react";

// TODO: add skills to each position, generate latex resume from json
const Experience = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section
      id="experience"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center gap-4 pt-32 relative"
    >
      {/* Simple background elements */}
      <div className="absolute top-40 right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-20 left-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
      
      <h2 className="text-6xl font-bold text-center text-white mb-8 animate-on-scroll fade-up is-visible">
        Work Experience
      </h2>
      
      {resume.experience.map((item, index) => (
        <div 
          key={item.company} 
          className="w-full max-w-4xl z-10 animate-on-scroll slide-left is-visible"
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <Card className="overflow-hidden border-gray-700 bg-gray-800 hover-lift">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gray-700 p-6">
                <h3 className="text-2xl font-bold text-white">
                  {item.company}
                </h3>
                <div className="text-lg font-semibold text-gray-200 mt-2">
                  {item.title}
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  {item.startDate} - {item.endDate}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {item.location}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="bg-gray-600 text-white">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <CardContent className="md:w-2/3 pt-6 bg-gray-800">
                <ol className="list-disc pl-5 space-y-2">
                  {item.recruiter_description.map((desc, descIndex) => (
                    <li key={descIndex} className="text-gray-200">
                      {desc}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </div>
          </Card>
        </div>
      ))}
    </section>
  );
});

export default Experience;
