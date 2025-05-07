import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext.js";
import HomePage from "./components/homePage.js";
import VenuePage from "./components/venuePage.js";
import RegisterPage from "./components/registerPage.js";
import LoginPage from "./components/loginPage.js";
import CreateVenuePage from "./components/createVenuePage.js";
import EditVenuePage from "./components/editVenuePage.js";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/venue/:id" element={<VenuePage />} />
          <Route path="/venue/:id/edit" element={<EditVenuePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-venue" element={<CreateVenuePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
