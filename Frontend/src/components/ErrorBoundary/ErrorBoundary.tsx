import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global class-based React Error Boundary to catch render crashes.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real application, you would send this to Sentry / LogRocket
    console.error('[ErrorBoundary caught crash]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-surface border border-border rounded-lg shadow-enterprise p-8 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-sm font-bold text-text-primary">Something went wrong</h1>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                An unexpected component rendering error occurred. You can reload the page or return to the main panel.
              </p>
            </div>
            
            {this.state.error && (
              <pre className="text-[10px] font-mono bg-background border border-border text-left p-3 rounded-md overflow-x-auto text-text-secondary max-h-32">
                {this.state.error.message}
              </pre>
            )}
            
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              icon={<RefreshCw size={12} />}
              className="w-full justify-center"
            >
              Reload Platform
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
