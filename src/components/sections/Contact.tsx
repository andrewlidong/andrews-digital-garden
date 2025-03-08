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
          className="flex items-center text-white hover:text-blue-300 transition-colors"
        >
          <img src="/linkedin.svg" alt="LinkedIn" className="w-20 h-20 filter invert" />
        </a>
        <a
          href={resume.contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-white hover:text-blue-300 transition-colors"
        >
          <img src="/github.svg" alt="Github" className="w-20 h-20 filter invert" />
        </a>
        <a
          href={resume.contact.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-white hover:text-blue-300 transition-colors"
        >
          <img src="/x.svg" alt="X" className="w-20 h-20 filter invert" />
        </a>
        <a
          className="text-white hover:text-blue-300"
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/resume.svg" alt="Resume" className="w-20 h-20 filter invert" />
        </a>
      </div>
    </section>
  );
});

export default Contact;
