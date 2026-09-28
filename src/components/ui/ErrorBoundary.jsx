import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0f0f] flex items-center justify-center px-4">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <span
              className="material-symbols-outlined text-[#fa4d56] mb-4 block"
              style={{ fontSize: 48 }}
            >
              error
            </span>
            <h1 className="text-xl font-bold text-[#e2e2e2] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#8c909f] mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
