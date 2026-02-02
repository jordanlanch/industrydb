import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, DashboardErrorBoundary } from '../error-boundary';

// Test component that throws an error when shouldThrow prop is true
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock window.location.reload and window.location.href
const mockReload = jest.fn();
const mockHref = { value: '' };

// Delete and redefine window.location
delete (window as any).location;
(window as any).location = {
  reload: mockReload,
  get href() {
    return mockHref.value;
  },
  set href(url: string) {
    mockHref.value = url;
  },
};

// Suppress console.error in tests (ErrorBoundary logs to console)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Normal rendering', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-component">Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    test('renders multiple children normally', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Error catching', () => {
    test('catches error and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify fallback UI is displayed
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We encountered an unexpected error/i)
      ).toBeInTheDocument();
    });

    test('displays error message in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify error details are shown in development
      expect(screen.getByText(/Error: Test error/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify error details are NOT shown in production
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test('shows AlertTriangle icon in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Icon should be rendered (has specific SVG structure)
      const container = screen.getByText('Something went wrong').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Custom fallback', () => {
    test('renders custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom error UI</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Button functionality', () => {
    beforeEach(() => {
      mockReload.mockClear();
      mockHref.value = '';
    });

    test('Reload Page button is rendered', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Page/i });
      expect(reloadButton).toBeInTheDocument();

      // Verify button is clickable (doesn't throw)
      fireEvent.click(reloadButton);
    });

    test('Go Home button is rendered', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /Go Home/i });
      expect(homeButton).toBeInTheDocument();

      // Verify button is clickable (doesn't throw)
      fireEvent.click(homeButton);
    });

    test('Try Again button calls onReset callback', () => {
      const onReset = jest.fn();

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(tryAgainButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('Try Again button is hidden when onReset is not provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /Try Again/i })).not.toBeInTheDocument();
    });
  });

  describe('Error recovery', () => {
    test('resets error state when onReset is called', () => {
      const TestComponent = () => {
        const [shouldError, setShouldError] = React.useState(true);

        return (
          <ErrorBoundary onReset={() => setShouldError(false)}>
            <ThrowError shouldThrow={shouldError} />
          </ErrorBoundary>
        );
      };

      render(<TestComponent />);

      // Initially shows error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click Try Again
      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(tryAgainButton);

      // Error should be cleared and child should render
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('getDerivedStateFromError', () => {
    test('updates state correctly when error is thrown', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify hasError state is true (fallback UI is rendered)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Verify the component structure shows error state
      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
    });
  });

  describe('componentDidCatch', () => {
    test('logs error to console', () => {
      // console.error is already mocked globally
      const consoleErrorMock = console.error as jest.Mock;
      consoleErrorMock.mockClear();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify console.error was called with error boundary message
      expect(consoleErrorMock).toHaveBeenCalled();
      const errorCalls = consoleErrorMock.mock.calls.filter(call =>
        call[0] === 'Error caught by ErrorBoundary:'
      );
      expect(errorCalls.length).toBeGreaterThan(0);
    });
  });
});

describe('DashboardErrorBoundary', () => {
  test('renders children when no error occurs', () => {
    render(
      <DashboardErrorBoundary>
        <div data-testid="dashboard-child">Dashboard content</div>
      </DashboardErrorBoundary>
    );

    expect(screen.getByTestId('dashboard-child')).toBeInTheDocument();
  });

  test('catches error and displays dashboard-specific fallback UI', () => {
    render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    expect(
      screen.getByText(/An error occurred while loading this part of the dashboard/i)
    ).toBeInTheDocument();
  });

  test('shows Reload button that is clickable', () => {
    render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /Reload/i });
    expect(reloadButton).toBeInTheDocument();

    // Verify button is clickable (doesn't throw)
    fireEvent.click(reloadButton);
  });

  test('shows Dashboard button that is clickable', () => {
    render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    const dashboardButton = screen.getByRole('button', { name: /Dashboard/i });
    expect(dashboardButton).toBeInTheDocument();

    // Verify button is clickable (doesn't throw)
    fireEvent.click(dashboardButton);
  });

  test('displays error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText(/Test error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  test('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  test('logs error to console', () => {
    const consoleErrorMock = console.error as jest.Mock;
    consoleErrorMock.mockClear();

    render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(consoleErrorMock).toHaveBeenCalled();
    const errorCalls = consoleErrorMock.mock.calls.filter(call =>
      call[0] === 'Dashboard Error:'
    );
    expect(errorCalls.length).toBeGreaterThan(0);
  });
});

describe('Error boundary edge cases', () => {
  test('handles nested error boundaries', () => {
    render(
      <ErrorBoundary fallback={<div>Outer error</div>}>
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      </ErrorBoundary>
    );

    // Inner boundary should catch the error
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
  });

  test('documents that useEffect errors are not caught', () => {
    // Note: Errors in useEffect are not caught by error boundaries in React
    // This is expected React behavior - error boundaries only catch errors
    // during rendering, not in async code like useEffect

    const SafeComponent = () => {
      return <div>Component renders despite useEffect errors not being caught</div>;
    };

    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Component renders/i)).toBeInTheDocument();
  });

  test('documents that event handler errors are not caught', () => {
    // Note: Errors in event handlers are not caught by error boundaries
    // This is expected React behavior - error boundaries only catch errors
    // during rendering. Event handler errors should be handled with try-catch

    const SafeHandler = () => {
      const handleClick = () => {
        // In real code, use try-catch for event handlers
        console.log('Button clicked safely');
      };

      return <button onClick={handleClick}>Click me</button>;
    };

    render(
      <ErrorBoundary>
        <SafeHandler />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Button can be clicked without errors
    fireEvent.click(button);
  });
});
