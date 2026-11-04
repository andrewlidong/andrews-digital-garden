import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useMobileDetect } from "./hooks/useMobileDetect";
import { lazyRetry } from "./lib/lazyRetry";

const PersonalPage = lazyRetry(() => import("./pages/PersonalPage"));
const MobilePage = lazyRetry(() => import("./pages/MobilePage"));
const ReaderPage = lazyRetry(() => import("./pages/ReaderPage"));
const BlogIndex = lazyRetry(() => import("./pages/BlogIndex"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const CommandPalette = lazyRetry(() =>
  import("./components/ui/CommandPalette").then((m) => ({ default: m.CommandPalette }))
);
const WikilinkPreviews = lazyRetry(() =>
  import("./components/ui/WikilinkPreviews").then((m) => ({ default: m.WikilinkPreviews }))
);
const CursorDog = lazyRetry(() =>
  import("./components/ui/CursorDog").then((m) => ({ default: m.CursorDog }))
);

function App() {
  const isMobile = useMobileDetect();

  return (
    <Router>
      <Suspense fallback={null}>
        <CommandPalette />
        <WikilinkPreviews />
        {!isMobile && <CursorDog />}
        <Routes>
          <Route path="/" element={
            isMobile ?
              <Navigate to="/mobile" replace /> :
              <PersonalPage />
          } />
          <Route path="/mobile" element={<MobilePage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/read/*" element={<ReaderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
