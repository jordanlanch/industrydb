import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from '../form-field';
import { useForm } from 'react-hook-form';

// Test wrapper component that uses react-hook-form
function TestFormFieldWrapper(props: any) {
  const { register } = useForm();
  return <FormField register={register(props.name)} {...props} />;
}

describe('FormField', () => {
  describe('Basic rendering', () => {
    test('renders label and input correctly', () => {
      render(<FormField label="Email Address" name="email" />);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('renders with correct input type', () => {
      render(<FormField label="Password" name="password" type="password" />);

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    test('defaults to text type when not specified', () => {
      render(<FormField label="Name" name="name" />);

      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('type', 'text');
    });

    test('renders placeholder text', () => {
      render(
        <FormField
          label="Email"
          name="email"
          placeholder="Enter your email"
        />
      );

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    test('generates unique IDs for fields', () => {
      const { container } = render(
        <>
          <FormField label="Email" name="email" />
          <FormField label="Password" name="password" />
        </>
      );

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('id', 'field-email');
      expect(passwordInput).toHaveAttribute('id', 'field-password');
    });
  });

  describe('Required indicator', () => {
    test('shows asterisk when field is required', () => {
      render(<FormField label="Email" name="email" required />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('does not show asterisk when field is not required', () => {
      render(<FormField label="Email" name="email" />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    test('asterisk has aria-label', () => {
      render(<FormField label="Email" name="email" required />);

      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveAttribute('aria-label', 'required');
    });
  });

  describe('Error handling', () => {
    test('displays error message when error prop is provided', () => {
      render(
        <FormField
          label="Email"
          name="email"
          error="Invalid email address"
        />
      );

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    test('error message has role="alert"', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email" />
      );

      const error = screen.getByText('Invalid email');
      expect(error).toHaveAttribute('role', 'alert');
    });

    test('error message has aria-live="polite"', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email" />
      );

      const error = screen.getByText('Invalid email');
      expect(error).toHaveAttribute('aria-live', 'polite');
    });

    test('input has aria-invalid when error exists', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email" />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('input has aria-describedby pointing to error', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email" />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'field-email-error');
    });

    test('applies error styling to input', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email" />
      );

      const input = screen.getByLabelText('Email');
      expect(input.className).toContain('border-destructive');
      expect(input.className).toContain('focus-visible:ring-destructive');
    });

    test('hides help text when error is shown', () => {
      render(
        <FormField
          label="Email"
          name="email"
          error="Invalid email"
          helpText="Enter a valid email address"
        />
      );

      expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  describe('Help text', () => {
    test('displays help text when provided', () => {
      render(
        <FormField
          label="Email"
          name="email"
          helpText="We'll never share your email"
        />
      );

      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    test('input has aria-describedby pointing to help text', () => {
      render(
        <FormField
          label="Email"
          name="email"
          helpText="Enter a valid email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'field-email-help');
    });

    test('does not show help text when error exists', () => {
      render(
        <FormField
          label="Email"
          name="email"
          error="Invalid email"
          helpText="Enter a valid email"
        />
      );

      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    test('input is disabled when disabled prop is true', () => {
      render(<FormField label="Email" name="email" disabled />);

      const input = screen.getByLabelText('Email');
      expect(input).toBeDisabled();
    });

    test('input is not disabled by default', () => {
      render(<FormField label="Email" name="email" />);

      const input = screen.getByLabelText('Email');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Accessibility attributes', () => {
    test('sets aria-required when required', () => {
      render(<FormField label="Email" name="email" required />);

      const input = screen.getByLabelText(/Email/);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('does not set aria-required when not required', () => {
      render(<FormField label="Email" name="email" />);

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-required', 'false');
    });

    test('sets aria-invalid to false when no error', () => {
      render(<FormField label="Email" name="email" />);

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    test('label has htmlFor matching input id', () => {
      const { container } = render(
        <FormField label="Email" name="email" />
      );

      const label = container.querySelector('label');
      const input = screen.getByLabelText('Email');

      expect(label).toHaveAttribute('for', input.id);
    });
  });

  describe('React Hook Form integration', () => {
    test('renders with react-hook-form register', () => {
      render(<TestFormFieldWrapper label="Email" name="email" />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    test('accepts register props', () => {
      const mockRegister = {
        name: 'email',
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      };

      render(
        <FormField label="Email" name="email" register={mockRegister} />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('name', 'email');
    });
  });

  describe('Additional props', () => {
    test('accepts and applies className', () => {
      render(
        <FormField
          label="Email"
          name="email"
          className="custom-class"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input.className).toContain('custom-class');
    });

    test('accepts other HTML input attributes', () => {
      render(
        <FormField
          label="Age"
          name="age"
          type="number"
          min={0}
          max={120}
          step={1}
        />
      );

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '120');
      expect(input).toHaveAttribute('step', '1');
    });

    test('accepts autoComplete attribute', () => {
      render(
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Edge cases', () => {
    test('handles long error messages', () => {
      const longError = 'This is a very long error message that should still display correctly without breaking the layout or accessibility features of the form field component.';

      render(
        <FormField label="Email" name="email" error={longError} />
      );

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    test('handles long help text', () => {
      const longHelp = 'This is a very long help text that provides detailed instructions about what the user should enter in this field.';

      render(
        <FormField label="Email" name="email" helpText={longHelp} />
      );

      expect(screen.getByText(longHelp)).toBeInTheDocument();
    });

    test('handles special characters in label', () => {
      render(<FormField label="Email (work)" name="email" />);

      expect(screen.getByLabelText('Email (work)')).toBeInTheDocument();
    });

    test('handles empty string error gracefully', () => {
      render(<FormField label="Email" name="email" error="" />);

      // Empty error should not render error message
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Multiple instances', () => {
    test('renders multiple form fields without conflicts', () => {
      render(
        <>
          <FormField label="First Name" name="firstName" />
          <FormField label="Last Name" name="lastName" />
          <FormField label="Email" name="email" type="email" />
        </>
      );

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    test('each field has unique IDs', () => {
      render(
        <>
          <FormField label="Email" name="email" />
          <FormField label="Password" name="password" type="password" />
        </>
      );

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput.id).not.toBe(passwordInput.id);
    });
  });
});
