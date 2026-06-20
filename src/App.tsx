import PersonalPage from "./pages/PersonalPage";
import MobilePage from "./pages/MobilePage";
import ReaderPage from "./pages/ReaderPage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useMobileDetect } from "./hooks/useMobileDetect";

function App() {
  const isMobile = useMobileDetect();

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isMobile ?
            <Navigate to="/mobile" replace /> :
            <PersonalPage />
        } />
        <Route path="/mobile" element={<MobilePage />} />
        <Route path="/read/*" element={<ReaderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
