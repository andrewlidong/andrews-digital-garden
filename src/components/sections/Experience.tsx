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
      className="min-h-screen flex flex-col items-center justify-center gap-4 pt-32"
    >
      <h2 className="text-6xl font-bold text-center text-white mb-8">
        Work Experience
      </h2>
      {resume.experience.map((item) => {
        return (
          <Card key={item.company} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-blue-100 p-6">
                <h3 className="text-2xl font-bold text-blue-800">
                  {item.company}
                </h3>
                <div className="text-lg font-semibold text-blue-600 mt-2">
                  {item.title}
                </div>
                <div className="text-sm text-blue-500 mt-2">
                  {item.startDate} - {item.endDate}
                </div>
                <div className="text-sm text-blue-500 mt-1">
                  {item.location}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <CardContent className="md:w-2/3 pt-6">
                <ol className="list-disc pl-5 space-y-2">
                  {item.recruiter_description.map((desc, descIndex) => (
                    <li key={descIndex} className="text-gray-700">
                      {desc}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </div>
          </Card>
        );
      })}
    </section>
  );
});

export default Experience;
