import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log exception details to console (or external logging service like Sentry)
    console.error("[ErrorBoundary] Application crashed with error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDev = Boolean(
        (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV) ||
        (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development")
      );

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center font-sans dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shadow-sm">
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Bir şeyler ters gitti
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            İşleminiz gerçekleştirilirken beklenmeyen bir hata oluştu. Sayfayı yenileyerek veya ana sayfaya dönerek tekrar deneyebilirsiniz.
          </p>

          {/* Technical error stack/message is rendered strictly in development environment */}
          {isDev && this.state.error?.message && (
            <div className="mt-4 max-w-xl overflow-x-auto rounded-xl bg-slate-900/90 p-3 text-left font-mono text-xs text-rose-300 dark:bg-slate-950/80">
              <span className="font-bold text-rose-400">[DEV ONLY ERROR]: </span>
              {this.state.error.message}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-700 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={16} />
              Sayfayı Yenile
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/chat";
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
            >
              <Home size={16} />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
