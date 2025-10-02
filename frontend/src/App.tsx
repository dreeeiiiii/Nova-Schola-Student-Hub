import "./App.css";
import "./index.css";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import Footer from "./components/footer";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Login } from "./auth/login";
import { Signup } from "./auth/register";


const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <Hero onAccessHub={() => navigate("/login")}
            onCreateAccount={() => navigate("/register")}
      />
      <Features />
      <Footer />
    </>
  );
};

const App = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/");
  };
  const handleBackFromLogin = () => {
    navigate(-1); 
  };
  const handleSignupFromLogin = () => {
    navigate("/register");
  };
  const handleSignup = () => {
    navigate("/");
  };

  const handleBackFromSignup = () => {
    navigate(-1);
  };

  const handleLoginFromSignup = () => {
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
              onBack={handleBackFromLogin}
              onSignup={handleSignupFromLogin}
            />
          }
        />

        <Route
          path="/register"
          element={
            <Signup
              onSignup={handleSignup}
              onBack={handleBackFromSignup}
              onLogin={handleLoginFromSignup}
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;
