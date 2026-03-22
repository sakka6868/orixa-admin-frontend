import { ReactNode } from "react";

// Props interfaces for Card, CardTitle, and CardDescription
interface CardProps {
  children?: ReactNode; // Optional additional content
}

interface CardTitleProps {
  children: ReactNode;
}

interface CardDescriptionProps {
  children: ReactNode;
}

// Card Component
const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="app-surface rounded-xl border p-5 sm:p-6">
      {children}
    </div>
  );
};

// CardTitle Component
const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <h4 className="app-text-primary mb-1 text-theme-xl font-medium">
      {children}
    </h4>
  );
};

// CardDescription Component
const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
  return (
    <p className="app-text-muted text-sm">
      {children}
    </p>
  );
};

// Named exports for better flexibility
export { Card, CardTitle, CardDescription };
