import { forwardRef } from "react";
import * as resume from "../../content/resume.json";
import { Badge } from "../ui/badge";

const Skills = forwardRef<HTMLElement>((_, ref) => {
  // Group skills by category
  const skillsByCategory = resume.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <section
      id="skills"
      ref={ref}
      className="min-h-screen flex items-center justify-center py-32"
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-6xl font-bold text-center text-white mb-16">
          Technical Skills
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-3xl font-bold text-white mb-6">{category}</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    className="bg-gray-700 hover:bg-gray-600 text-white text-lg py-2 px-4"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-3xl font-bold text-white mb-6">Education</h3>
          {resume.education.map((edu) => (
            <div key={edu.school} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-2xl font-bold text-white">{edu.degree}</h4>
                <span className="text-gray-300">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-xl text-gray-300 mb-4">{edu.school}</p>
              <ul className="list-disc pl-5">
                {edu.description.map((desc, index) => (
                  <li key={index} className="text-gray-300 mb-1">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Skills; 