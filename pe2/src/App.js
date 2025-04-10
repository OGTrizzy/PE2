import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/homePage.js";
import VenuePage from "./components/venuePage.js";
import RegisterPage from "./components/registerPage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/venue/:id" element={<VenuePage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
