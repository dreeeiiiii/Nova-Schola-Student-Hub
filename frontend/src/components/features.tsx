import React from "react";

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (props) => (
      <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: "Announcements",
    description: "Stay updated with the latest news and announcements.",
  },
  {
    icon: (props) => (
      <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      </svg>
    ),
    title: "Events",
    description: "Keep track of upcoming events and gatherings.",
  },
  {
    icon: (props) => (
      <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
      <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    title: "Real-Time Chat",
    description: "Communicate instantly with fellow students.",
  },
];

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`}>{children}</div>
);

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
