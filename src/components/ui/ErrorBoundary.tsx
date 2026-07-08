import { Component, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="w-full max-w-md animate-[scaleIn_0.2s_ease-out] rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-soft-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Algo sali&oacute; mal
          </h1>
          <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
            Ocurri&oacute; un error inesperado. Por favor intenta de nuevo.
          </p>

          {this.state.error && (
            <div className="mb-6">
              <button
                onClick={this.toggleDetails}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {this.state.showDetails ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                {this.state.showDetails ? "Ocultar" : "Ver"} detalles del error
              </button>

              {this.state.showDetails && (
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-neutral-100 p-3 text-left text-xs leading-relaxed text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {this.state.error.name}: {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-lg bg-royal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-royal-900/10 transition-all hover:bg-royal-700 hover:shadow-md active:scale-[0.97]"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}