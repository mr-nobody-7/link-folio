import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col justify-center items-center mt-10 p-8 rounded bg-destructive/10 border border-destructive text-destructive max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
            <pre className="text-sm">{this.state.error?.message}</pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
