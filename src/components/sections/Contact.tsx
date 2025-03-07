import * as resume from "../../content/resume.json";
import { forwardRef } from "react";

const Contact = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section
      id="contact"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center"
    >
      <h2 className="text-6xl font-bold text-center text-white mb-20">
        Get in Touch
      </h2>
      <div className="flex gap-10">
        <a
          href={resume.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
        >
          <img src="/linkedin.svg" alt="LinkedIn" className="w-20 h-20" />
        </a>
        <a
          href={resume.contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
        >
          <img src="/github.svg" alt="Github" className="w-20 h-20" />
        </a>
        <a
          href={resume.contact.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
        >
          <img src="/x.svg" alt="X" className="w-20 h-20" />
        </a>
        <a
          className="text-blue-500 hover:text-blue-700"
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/resume.svg" alt="Resume" className="w-20 h-20" />
        </a>
      </div>
    </section>
  );
});

export default Contact;
