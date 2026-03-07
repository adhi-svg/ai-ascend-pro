import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] UI crash captured:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-[#1E3A5F]">Something went wrong</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Please reload the page to continue.</p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
