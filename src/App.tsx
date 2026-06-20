import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useMobileDetect } from "./hooks/useMobileDetect";

const PersonalPage = lazy(() => import("./pages/PersonalPage"));
const MobilePage = lazy(() => import("./pages/MobilePage"));
const ReaderPage = lazy(() => import("./pages/ReaderPage"));

function App() {
  const isMobile = useMobileDetect();

  return (
    <Router>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={
            isMobile ?
              <Navigate to="/mobile" replace /> :
              <PersonalPage />
          } />
          <Route path="/mobile" element={<MobilePage />} />
          <Route path="/read/*" element={<ReaderPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
