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
      className="min-h-screen flex flex-col items-center justify-center relative py-20"
    >
      {/* Simple background elements */}
      <div className="absolute top-40 left-40 w-96 h-96 rounded-full bg-green-500/10 blur-3xl"></div>
      <div className="absolute bottom-40 right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
      
      <h2 className="text-4xl md:text-6xl font-bold text-center text-white mb-12 z-10 animate-on-scroll fade-up is-visible">
        Experience
      </h2>
      
      {resume.experience.map((item, index) => (
        <div 
          key={item.company} 
          className="w-full max-w-4xl z-10 animate-on-scroll slide-left is-visible px-4 mb-6"
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <Card className="overflow-hidden border-gray-700 bg-gray-800 hover-lift">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-gray-700 p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {item.company}
                </h3>
                <div className="text-base md:text-lg font-semibold text-gray-200 mt-2">
                  {item.title}
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  {item.startDate} - {item.endDate}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {item.location}
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-3">
                  {item.technologies.map((tech, techIndex) => (
                    <Badge 
                      key={techIndex} 
                      variant="secondary" 
                      className="text-xs md:text-sm bg-gray-600 text-white"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <CardContent className="w-full md:w-2/3 p-4 md:pt-6 bg-gray-800">
                <ol className="list-disc pl-4 md:pl-5 space-y-2 text-sm md:text-base">
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
