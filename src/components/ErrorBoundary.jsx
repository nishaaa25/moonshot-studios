import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div 
          style={{
            padding: '20px',
            textAlign: 'center',
            background: '#000',
            color: '#fff',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h2>🚨 Something went wrong</h2>
          <p>The application encountered an error and couldn't recover.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details 
              style={{ 
                marginTop: '20px', 
                padding: '10px', 
                background: '#222', 
                borderRadius: '5px',
                maxWidth: '80vw',
                overflow: 'auto'
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Show Error Details (Development Mode)
              </summary>
              <pre style={{ fontSize: '12px', textAlign: 'left' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
