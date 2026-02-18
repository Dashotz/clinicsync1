import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import './LoginForm.css';

export interface LoginFormProps {
  onLoginSuccess: () => void;
}

type LoginCredentials = {
  email: string;
  password: string;
};

type FieldError = { field: keyof LoginCredentials; message: string };

type LoginFormState = {
  credentials: LoginCredentials;
  errors: FieldError[];
  isSubmitting: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/** For email: trim, strip control chars, limit length. Use on change and submit. */
function sanitizeEmail(value: string): string {
  const trimmed = value.trim();
  const noControl = trimmed.replace(/[\x00-\x1f\x7f]/g, '');
  return noControl.slice(0, MAX_EMAIL_LENGTH);
}

/** For password input while typing: only strip control chars and limit length (no trim). */
function sanitizePasswordInput(value: string): string {
  const noControl = value.replace(/[\x00-\x1f\x7f]/g, '');
  return noControl.slice(0, MAX_PASSWORD_LENGTH);
}

/** For password on submit: trim then same as input sanitization for validation. */
function sanitizePasswordForValidation(value: string): string {
  return sanitizePasswordInput(value.trim());
}

function validateCredentials(credentials: LoginCredentials): FieldError[] {
  const errors: FieldError[] = [];
  const email = sanitizeEmail(credentials.email);
  const password = sanitizePasswordForValidation(credentials.password);

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({ field: 'password', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push({ field: 'password', message: `Password must be at most ${MAX_PASSWORD_LENGTH} characters` });
  }

  return errors;
}

function getFieldError(errors: FieldError[], fieldName: keyof LoginCredentials): string | undefined {
  return errors.find((e) => e.field === fieldName)?.message;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [formState, setFormState] = useState<LoginFormState>({
    credentials: { email: '', password: '' },
    errors: [],
    isSubmitting: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const mountedRef = useRef(true);

  const emailError = useMemo(() => getFieldError(formState.errors, 'email'), [formState.errors]);
  const passwordError = useMemo(
    () => getFieldError(formState.errors, 'password'),
    [formState.errors]
  );

  const updateField = useCallback((field: keyof LoginCredentials, value: string) => {
    const sanitized =
      field === 'email' ? sanitizeEmail(value) : sanitizePasswordInput(value);
    setFormState((prev) => ({
      ...prev,
      credentials: { ...prev.credentials, [field]: sanitized },
      errors: prev.errors.filter((e) => e.field !== field),
    }));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const sanitized = {
      email: sanitizeEmail(formState.credentials.email),
      password: sanitizePasswordForValidation(formState.credentials.password),
    };
    const validationErrors = validateCredentials(sanitized);

    if (validationErrors.length > 0) {
      setFormState((prev) => ({ ...prev, credentials: sanitized, errors: validationErrors }));
      return;
    }

    setFormState((prev) => ({ ...prev, credentials: sanitized, isSubmitting: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!mountedRef.current) return;
    setFormState({ credentials: { email: '', password: '' }, errors: [], isSubmitting: false });
    onLoginSuccess();
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="login-form-container">
      <button
        type="button"
        className="btn btn-primary btn-large btn-block social-button-custom google-button"
        onClick={() => {}}
        disabled={formState.isSubmitting}
      >
        <span className="social-logo-g" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z"
              fill="#EA4335"
            />
          </svg>
        </span>
        Sign in with Google
      </button>

      <div className="divider-wrap" role="separator" aria-label="or">
        <div className="divider-line" />
        OR
        <div className="divider-line" />
      </div>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email Address <span className="mandatory">*</span>
          </label>
          <input
            id="email"
            className={`text-input ${emailError ? 'has-error' : ''}`}
            type="email"
            value={formState.credentials.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={formState.isSubmitting}
          />
          {emailError ? <div className="field-error">{emailError}</div> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            Password <span className="mandatory">*</span>
          </label>
          <div className={`input-wrap ${passwordError ? 'has-error' : ''}`}>
            <input
              id="password"
              className="text-input input-has-icon"
              type={showPassword ? 'text' : 'password'}
              value={formState.credentials.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={formState.isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={formState.isSubmitting}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="1"
                    y1="1"
                    x2="23"
                    y2="23"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
          {passwordError ? <div className="field-error">{passwordError}</div> : null}
        </div>

        <div className="login-form-footer">
          <button type="button" className="btn btn-ghost btn-small" onClick={() => {}}>
            Forgot password?
          </button>
          <div className="footer-dot" />
          <button type="button" className="btn btn-ghost btn-small" onClick={() => {}}>
            Create account
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large btn-block"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <span className="btn-loading">
              <span className="spinner" aria-hidden="true" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="login-hint">Demo login. Enter any valid email and 8+ character password.</p>
      </form>
    </div>
  );
};
