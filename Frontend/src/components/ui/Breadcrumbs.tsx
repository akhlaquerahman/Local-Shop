import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable breadcrumb navigation parsing the active location.
 */
export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are at root, hide breadcrumbs
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-4 select-none">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = value.replace(/-/g, ' ');

        // Skip rendering numbers/IDs in breadcrumbs for clean aesthetics
        if (!isNaN(Number(value))) return null;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="text-border" />
            {last ? (
              <span className="font-medium text-foreground capitalize">{label}</span>
            ) : (
              <Link to={to} className="hover:text-foreground transition-colors capitalize">{label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
