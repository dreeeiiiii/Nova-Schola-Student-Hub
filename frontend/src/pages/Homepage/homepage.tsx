import { useNavigate } from "react-router-dom";
import Features from "../../components/Homepage/features";
import Footer from "../../components/Homepage/footer";
import Hero from "../../components/Homepage/hero";

export const Home = () => {
    const navigate = useNavigate();
    return (
      <>
        <Hero
          onAccessHub={() => navigate("/login")}
          onCreateAccount={() => navigate("/register")}
        />
        <Features />
        <Footer />
      </>
    );
  };
  