import React from "react";

const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.21.37 2.4.72 3.53a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.54-1.54a2 2 0 0 1 2.11-.45c1.13.35 2.32.59 3.53.72a2 2 0 0 1 1.72 2z" />
  </svg>
);

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M4 4h16v16H4z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="border-t bg-background py-10">
      <div className="container mx-auto px-6 text-center space-y-4">
        <h4 className="font-semibold text-primary">Contact Us</h4>
        <p className="text-sm text-muted-foreground">
          A. Mabini Ave, Barangay Sambat, Tanauan City, Batangas 4232, Philippines
        </p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <PhoneIcon className="h-4 w-4 text-primary" />
          (043) 773-8927 | 0920-803-0527
        </p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <MailIcon className="h-4 w-4 text-primary" />
          <a href="mailto:inquiry@nst.edu.ph" className="underline hover:text-primary">
            inquiry@nst.edu.ph
          </a>
        </p>
        <p className="text-xs text-muted-foreground">
          © 2025 Nova Schola Student Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
