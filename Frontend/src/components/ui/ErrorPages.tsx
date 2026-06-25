import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, FileWarning, HelpCircle, Server, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useAuthStore } from '@/store/authStore';

interface ErrorPageProps {
  code?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const ErrorPageTemplate: React.FC<ErrorPageProps> = ({
  code,
  title,
  description,
  icon,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-surface border border-border rounded-lg shadow-enterprise p-8 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mx-auto text-text-secondary">
          {icon}
        </div>
        
        <div className="space-y-1">
          {code && <span className="text-[10px] uppercase font-bold tracking-wider text-accent">{code} Error</span>}
          <h1 className="text-sm font-bold text-text-primary">{title}</h1>
          <p className="text-[11px] text-text-secondary leading-relaxed">{description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="flex-1 justify-center"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            size="sm"
            className="flex-1 justify-center"
          >
            Home Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 403 Forbidden Access
 */
export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-surface border border-border rounded-lg shadow-enterprise p-8 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mx-auto text-text-secondary">
          <ShieldAlert size={22} className="text-danger" />
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-accent">403 Error</span>
          <h1 className="text-sm font-bold text-text-primary">Access Forbidden</h1>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Your profile role permissions do not authorize access to this specific dashboard. Please request assistance from your supervisor.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="flex-1 justify-center"
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              size="sm"
              className="flex-1 justify-center"
            >
              Home Dashboard
            </Button>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-center border-danger/30 text-danger hover:bg-danger/5"
          >
            Logout / Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 404 Route Not Found
 */
export const NotFoundPage: React.FC = () => (
  <ErrorPageTemplate
    code="404"
    title="Resource Not Found"
    description="The URL path requested does not exist on our platform nodes. Verify spelling errors in your address bar."
    icon={<FileWarning size={22} className="text-text-secondary" />}
  />
);

/**
 * 500 Server Crashes
 */
export const InternalErrorPage: React.FC = () => (
  <ErrorPageTemplate
    code="500"
    title="Internal Server Error"
    description="A critical exception occurred on the database container. Our support engineers are looking into this audit trace."
    icon={<Server size={22} className="text-danger" />}
  />
);

/**
 * Maintenance Mode Toggles
 */
export const MaintenancePage: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center select-none">
    <div className="max-w-md w-full bg-surface border border-border rounded-lg shadow-enterprise p-8 space-y-4">
      <Server className="w-12 h-12 mx-auto text-warning animate-pulse" />
      <h1 className="text-sm font-bold text-text-primary">System Upgrades In Progress</h1>
      <p className="text-[11px] text-text-secondary leading-relaxed">
        We are executing scheduled platform updates on our ledger registers. Nodes will restart in approximately 15 minutes.
      </p>
    </div>
  </div>
);

/**
 * Offline Connectivity Guard
 */
export const OfflinePage: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center select-none">
    <div className="max-w-md w-full bg-surface border border-border rounded-lg shadow-enterprise p-8 space-y-4">
      <WifiOff className="w-12 h-12 mx-auto text-text-secondary" />
      <h1 className="text-sm font-bold text-text-primary">No Network Connection</h1>
      <p className="text-[11px] text-text-secondary leading-relaxed">
        Your browser has lost internet connection. Please verify your ethernet cable or Wi-Fi channel switches.
      </p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="w-full">
        Check Connection Status
      </Button>
    </div>
  </div>
);
