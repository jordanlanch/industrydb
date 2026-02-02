import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toaster } from '../toaster';

// Mock toast hook
const mockDismiss = jest.fn();
const mockToasts: any[] = [];

jest.mock('../toast-provider', () => ({
  useToast: () => ({
    toasts: mockToasts,
    dismiss: mockDismiss,
  }),
}));

// Mock UI toast components
jest.mock('../ui/toast', () => ({
  Toast: ({ children, variant, onClose, ...props }: any) => (
    <div
      data-testid="toast"
      data-variant={variant}
      {...props}
    >
      {children}
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  ),
  ToastTitle: ({ children }: any) => (
    <div data-testid="toast-title">{children}</div>
  ),
  ToastDescription: ({ children }: any) => (
    <div data-testid="toast-description">{children}</div>
  ),
}));

describe('Toaster', () => {
  beforeEach(() => {
    mockToasts.length = 0;
    jest.clearAllMocks();
  });

  describe('Container Rendering', () => {
    test('renders empty container when no toasts', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer).toBeInTheDocument();
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });

    test('has correct positioning classes', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('fixed');
      expect(toastContainer?.className).toContain('top-0');
      expect(toastContainer?.className).toContain('right-0');
    });

    test('has high z-index to appear above content', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('z-[100]');
    });

    test('has responsive max-width', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('md:max-w-[420px]');
    });

    test('uses flexbox column layout', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('flex');
      expect(toastContainer?.className).toContain('flex-col-reverse');
      expect(toastContainer?.className).toContain('sm:flex-col');
    });
  });

  describe('Single Toast Rendering', () => {
    test('renders single toast with title and description', () => {
      mockToasts.push({
        id: '1',
        title: 'Success',
        description: 'Operation completed successfully',
        variant: 'success',
      });

      render(<Toaster />);

      expect(screen.getByTestId('toast')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    test('renders toast with title only', () => {
      mockToasts.push({
        id: '1',
        title: 'Information',
        variant: 'default',
      });

      render(<Toaster />);

      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument();
    });

    test('renders toast with description only', () => {
      mockToasts.push({
        id: '1',
        description: 'This is a notification',
        variant: 'default',
      });

      render(<Toaster />);

      expect(screen.getByText('This is a notification')).toBeInTheDocument();
      expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument();
    });

    test('passes variant to Toast component', () => {
      mockToasts.push({
        id: '1',
        title: 'Error',
        variant: 'destructive',
      });

      render(<Toaster />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-variant', 'destructive');
    });
  });

  describe('Multiple Toasts Rendering', () => {
    test('renders multiple toasts', () => {
      mockToasts.push(
        {
          id: '1',
          title: 'First Toast',
          variant: 'default',
        },
        {
          id: '2',
          title: 'Second Toast',
          variant: 'success',
        },
        {
          id: '3',
          title: 'Third Toast',
          variant: 'destructive',
        }
      );

      render(<Toaster />);

      const toasts = screen.getAllByTestId('toast');
      expect(toasts).toHaveLength(3);
      expect(screen.getByText('First Toast')).toBeInTheDocument();
      expect(screen.getByText('Second Toast')).toBeInTheDocument();
      expect(screen.getByText('Third Toast')).toBeInTheDocument();
    });

    test('each toast has unique key', () => {
      mockToasts.push(
        { id: '1', title: 'Toast 1', variant: 'default' },
        { id: '2', title: 'Toast 2', variant: 'default' },
        { id: '3', title: 'Toast 3', variant: 'default' }
      );

      const { container } = render(<Toaster />);

      const toasts = container.querySelectorAll('[data-testid="toast"]');
      expect(toasts).toHaveLength(3);
    });

    test('renders toasts with different variants', () => {
      mockToasts.push(
        { id: '1', title: 'Default', variant: 'default' },
        { id: '2', title: 'Success', variant: 'success' },
        { id: '3', title: 'Error', variant: 'destructive' }
      );

      render(<Toaster />);

      const toasts = screen.getAllByTestId('toast');
      expect(toasts[0]).toHaveAttribute('data-variant', 'default');
      expect(toasts[1]).toHaveAttribute('data-variant', 'success');
      expect(toasts[2]).toHaveAttribute('data-variant', 'destructive');
    });
  });

  describe('Dismiss Functionality', () => {
    test('calls dismiss with toast id when close button clicked', () => {
      mockToasts.push({
        id: 'toast-123',
        title: 'Test Toast',
        variant: 'default',
      });

      render(<Toaster />);

      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);

      expect(mockDismiss).toHaveBeenCalledWith('toast-123');
    });

    test('calls dismiss for correct toast when multiple toasts present', () => {
      mockToasts.push(
        { id: 'toast-1', title: 'First', variant: 'default' },
        { id: 'toast-2', title: 'Second', variant: 'default' },
        { id: 'toast-3', title: 'Third', variant: 'default' }
      );

      render(<Toaster />);

      const closeButtons = screen.getAllByTestId('close-button');

      // Click second toast's close button
      fireEvent.click(closeButtons[1]);

      expect(mockDismiss).toHaveBeenCalledWith('toast-2');
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });

    test('dismiss can be called multiple times', () => {
      mockToasts.push({
        id: 'toast-1',
        title: 'Test',
        variant: 'default',
      });

      render(<Toaster />);

      const closeButton = screen.getByTestId('close-button');

      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      expect(mockDismiss).toHaveBeenCalledTimes(3);
    });
  });

  describe('Toast Variants', () => {
    test('renders default variant toast', () => {
      mockToasts.push({
        id: '1',
        title: 'Default Toast',
        variant: 'default',
      });

      render(<Toaster />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-variant', 'default');
    });

    test('renders success variant toast', () => {
      mockToasts.push({
        id: '1',
        title: 'Success Toast',
        variant: 'success',
      });

      render(<Toaster />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-variant', 'success');
    });

    test('renders destructive variant toast', () => {
      mockToasts.push({
        id: '1',
        title: 'Error Toast',
        variant: 'destructive',
      });

      render(<Toaster />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-variant', 'destructive');
    });
  });

  describe('Toast Content', () => {
    test('renders long title text', () => {
      mockToasts.push({
        id: '1',
        title: 'This is a very long title that might wrap to multiple lines in the toast notification',
        variant: 'default',
      });

      render(<Toaster />);

      expect(
        screen.getByText('This is a very long title that might wrap to multiple lines in the toast notification')
      ).toBeInTheDocument();
    });

    test('renders long description text', () => {
      mockToasts.push({
        id: '1',
        title: 'Title',
        description: 'This is a very long description that provides detailed information about what happened and why the user might care about this notification.',
        variant: 'default',
      });

      render(<Toaster />);

      expect(
        screen.getByText(/This is a very long description/)
      ).toBeInTheDocument();
    });

    test('renders HTML entities in title', () => {
      mockToasts.push({
        id: '1',
        title: 'Success & Completed',
        variant: 'default',
      });

      render(<Toaster />);

      expect(screen.getByText('Success & Completed')).toBeInTheDocument();
    });

    test('renders special characters in description', () => {
      mockToasts.push({
        id: '1',
        description: 'Item "Product Name" was added to cart!',
        variant: 'default',
      });

      render(<Toaster />);

      expect(screen.getByText('Item "Product Name" was added to cart!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty toasts array gracefully', () => {
      render(<Toaster />);

      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });

    test('handles toast without id gracefully', () => {
      mockToasts.push({
        title: 'No ID Toast',
        variant: 'default',
      } as any);

      expect(() => render(<Toaster />)).not.toThrow();
    });

    test('handles toast with empty strings', () => {
      mockToasts.push({
        id: '1',
        title: '',
        description: '',
        variant: 'default',
      });

      render(<Toaster />);

      // Empty title and description should not render ToastTitle/ToastDescription
      expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument();
    });

    test('handles null/undefined title and description', () => {
      mockToasts.push({
        id: '1',
        title: null,
        description: undefined,
        variant: 'default',
      });

      render(<Toaster />);

      expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument();
    });

    test('handles large number of toasts', () => {
      for (let i = 0; i < 20; i++) {
        mockToasts.push({
          id: `toast-${i}`,
          title: `Toast ${i}`,
          variant: 'default',
        });
      }

      render(<Toaster />);

      const toasts = screen.getAllByTestId('toast');
      expect(toasts).toHaveLength(20);
    });
  });

  describe('Layout Behavior', () => {
    test('renders toasts with gap spacing', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('gap-2');
    });

    test('has padding for mobile spacing', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('p-4');
    });

    test('has max-height constraint', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('max-h-screen');
    });

    test('is full width on mobile', () => {
      const { container } = render(<Toaster />);

      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer?.className).toContain('w-full');
    });
  });
});
