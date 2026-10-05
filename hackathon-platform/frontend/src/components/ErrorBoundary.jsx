import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0505] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#140b0a] border border-red-900/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-red-950/50">
            <div className="w-16 h-16 bg-red-950/60 text-orange-400 border border-red-800/50 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-zinc-100">Something went wrong</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unexpected interface issue occurred. You can reload the page or return to the main dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#0a0505]/90 rounded-xl border border-red-900/40 text-[11px] text-red-300 font-mono text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 bg-[#20100f] hover:bg-[#2c1615] border border-red-900/40 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Home size={15} />
                <span>Go to Home</span>
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/60 border border-orange-400/30 transition cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
