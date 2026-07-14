import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

// Terminal-styled catch-all for unknown routes.
export default function NotFound() {
  const { pathname } = useLocation();
  useTheme();

  useEffect(() => {
    document.title = "404 — Andrew Dong";
    return () => {
      document.title = "Andrew Dong";
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-term-bg px-6 font-mono text-term-fg">
      <div>
        <p className="text-term-red">
          zsh: command not found: {pathname}
        </p>
        <p className="mt-2 text-sm text-term-faint">
          exit code 404 — nothing is planted here
        </p>
        <p className="mt-6 text-sm">
          <Link to="/" className="text-term-accent hover:underline">
            cd ~
          </Link>
          <span className="mx-3 text-term-faint">·</span>
          <Link to="/blog" className="text-term-accent hover:underline">
            cd ~/blog
          </Link>
        </p>
      </div>
    </div>
  );
}
