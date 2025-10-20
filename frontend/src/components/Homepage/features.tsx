import React from "react";

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (props) => (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: "Announcements",
    description: "Stay updated with the latest news and announcements.",
  },
  {
    icon: (props) => (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      </svg>
    ),
    title: "Events",
    description: "Keep track of upcoming events and gatherings.",
  },
  {
    icon: (props) => (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: "Organizations",
    description: "Join clubs and groups to connect with peers.",
  },
  {
    icon: (props) => (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    title: "Real-Time Chat",
    description: "Communicate instantly with fellow students.",
  },
];

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={`bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition ${
      className ?? ""
    }`}
  >
    {children}
  </div>
);

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={`p-5 sm:p-6 text-center ${className ?? ""}`}>{children}</div>;

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-10 sm:py-14">
      {/* Soft floating orbs for vibe */}
      <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-blue-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-50px] right-[-30px] w-64 h-64 bg-purple-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent>
                <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-blue-700 mb-1 sm:mb-2 text-lg sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed px-2">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
