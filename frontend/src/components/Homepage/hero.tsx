import React from "react";

interface HeroProps {
  onAccessHub: () => void;
  onCreateAccount: () => void;
}

const Hero: React.FC<HeroProps> = ({ onAccessHub, onCreateAccount }) => {
  const backgroundImage =
    "url('https://sitti.org/wp-content/uploads/2024/05/NST-Facade-low-res-copy-1024x683.jpg')";

  return (
    <section
      className="relative py-12 sm:py-16 flex-1 flex items-center bg-cover bg-center bg-no-repeat mt-16 sm:mt-18"
      style={{ backgroundImage }}
    >
      <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"></div>

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg mb-3 sm:mb-4 max-w-xl mx-auto">
          Welcome to the Student Hub
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-md sm:max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
          The official online hub for Nova Schola students — announcements,
          events, organizations, and real-time chat in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 max-w-xs sm:max-w-md mx-auto">
          <button
            onClick={onAccessHub}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-base sm:text-lg font-semibold flex items-center justify-center transition shadow-md"
          >
            Access Hub
            <svg
              className="ml-2 h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={onCreateAccount}
            className="border border-white text-white hover:bg-blue-400 hover:text-white px-5 py-2 rounded-md text-base sm:text-lg font-semibold transition shadow-md"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Subtle background blob */}
      <div className="absolute top-[-80px] left-[-40px] w-64 h-64 bg-indigo-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
    </section>
  );
};

export default Hero;
