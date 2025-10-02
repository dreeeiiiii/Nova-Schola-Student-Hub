import React from "react";

interface HeroProps {
  onAccessHub: () => void;
  onCreateAccount: () => void;
}

const Hero: React.FC<HeroProps> = ({ onAccessHub, onCreateAccount }) => {
  return (
    <section className="py-16 flex-1 flex items-center">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-primary mb-4">
          Welcome to the Student Hub
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          The official online hub for Nova Schola students — announcements,
          events, organizations, and real-time chat in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onAccessHub}
            className="bg-primary text-white px-6 py-3 rounded-md text-lg font-semibold flex items-center justify-center hover:bg-primary/90 transition"
          >
            Access Hub
            <svg
              className="ml-2 h-5 w-5"
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
            className="border border-primary text-primary px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary hover:text-white transition"
          >
            Create Account
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
