import * as resume from "../../content/resume.json";
import { forwardRef } from "react";

const Contact = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section
      id="contact"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center relative"
    >
      {/* Simple background elements */}
      <div className="absolute top-40 left-40 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>
      
      <h2 className="text-6xl font-bold text-center text-white mb-20 z-10 animate-on-scroll fade-up is-visible">
        Contact
      </h2>
      
      <div className="flex gap-10 z-10">
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
            className="flex items-center text-gray-600 hover:text-blue-500 transition-all duration-300 hover-lift animate-on-scroll scale-up is-visible"
            style={{ transitionDelay: `${item.delay}ms` }}
          >
            <img src={item.src} alt={item.alt} className="w-20 h-20" />
          </a>
        ))}
      </div>
    </section>
  );
});

export default Contact;
