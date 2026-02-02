import React from 'react';
import { render, screen } from '@testing-library/react';
import { SkipLink } from '../skip-link';

describe('SkipLink', () => {
  describe('Rendering', () => {
    test('renders skip link element', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toBeInTheDocument();
    });

    test('renders as an anchor tag', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.tagName).toBe('A');
    });

    test('has correct href pointing to main content', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Accessibility', () => {
    test('is visually hidden by default with sr-only class', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('sr-only');
    });

    test('becomes visible on focus', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');

      // Check for focus visibility classes
      expect(link.className).toContain('focus:not-sr-only');
      expect(link.className).toContain('focus:absolute');
    });

    test('has proper positioning when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');

      expect(link.className).toContain('focus:top-4');
      expect(link.className).toContain('focus:left-4');
    });

    test('has high z-index to appear above other content', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('focus:z-[9999]');
    });

    test('has no outline to use ring instead', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('focus:outline-none');
    });

    test('has focus ring for keyboard navigation visibility', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');

      expect(link.className).toContain('focus:ring-2');
      expect(link.className).toContain('focus:ring-primary');
      expect(link.className).toContain('focus:ring-offset-2');
    });
  });

  describe('Styling', () => {
    test('has padding when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('focus:px-4');
      expect(link.className).toContain('focus:py-2');
    });

    test('has primary background when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('focus:bg-primary');
      expect(link.className).toContain('focus:text-primary-foreground');
    });

    test('has rounded corners when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('focus:rounded-md');
    });

    test('has shadow when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('focus:shadow-lg');
    });
  });

  describe('Content', () => {
    test('displays correct text content', () => {
      render(<SkipLink />);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    test('text content is clear and descriptive', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.textContent).toBe('Skip to main content');
    });
  });

  describe('Multiple instances', () => {
    test('renders multiple skip links independently', () => {
      render(
        <>
          <SkipLink />
          <SkipLink />
        </>
      );

      const links = screen.getAllByText('Skip to main content');
      expect(links).toHaveLength(2);
    });

    test('each instance has same href', () => {
      render(
        <>
          <SkipLink />
          <SkipLink />
        </>
      );

      const links = screen.getAllByText('Skip to main content');
      links.forEach(link => {
        expect(link).toHaveAttribute('href', '#main-content');
      });
    });
  });

  describe('WCAG Compliance', () => {
    test('provides keyboard-accessible navigation', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');

      // Link should be focusable (it's an anchor)
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href');
    });

    test('is first focusable element for screen readers', () => {
      const { container } = render(
        <>
          <SkipLink />
          <button>Other element</button>
        </>
      );

      const firstFocusable = container.querySelector('a');
      expect(firstFocusable?.textContent).toBe('Skip to main content');
    });

    test('allows skipping repetitive navigation', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');

      // Verify it links to main content area
      expect(link.getAttribute('href')).toBe('#main-content');
    });
  });

  describe('Edge cases', () => {
    test('renders correctly in isolation', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toBeInTheDocument();
    });

    test('maintains accessibility when styled', () => {
      const { container } = render(<SkipLink />);

      const link = container.querySelector('a');

      // Should still be an accessible link
      expect(link).toHaveAttribute('href');
      expect(link?.textContent).toBe('Skip to main content');
    });
  });
});
