import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from './LoginForm';
import './LoginPage.css';

export interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => setActiveSlide((prev) => (prev + 1) % 3), 5000);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, []);

  return (
    <div className="login-page">
      <Link
        href="/"
        className="login-back"
        aria-label="Back to landing page"
      >
        <ArrowLeft className="login-back-icon" />
      </Link>

      <div className="login-visual-side">
        <div className="visual-blob blob-1" />
        <div className="visual-blob blob-2" />

        <div className="visual-content">
          <div className="carousel-window">
            <div className={`carousel-slide ${activeSlide === 0 ? 'active' : ''}`}>
              <div className="mock-dashboard">
                <div className="mock-dash-header">
                  <div className="mock-dash-dot" style={{ backgroundColor: '#ef4444' }} />
                  <div className="mock-dash-dot" style={{ backgroundColor: '#f59e0b' }} />
                  <div className="mock-dash-dot" style={{ backgroundColor: '#10b981' }} />
                </div>
                <div className="mock-dash-body">
                  <div className="mock-dash-sidebar" />
                  <div className="mock-dash-main">
                    <div className="mock-line mock-line-title" />
                    <div className="mock-line" style={{ width: '100%' }} />
                    <div className="mock-line" style={{ width: '90%' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <div className="mock-block" />
                      <div className="mock-block" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="visual-text">
                <h2>Secure Access Gateway</h2>
                <p>
                  Enter your credentials to access your personalized task dashboard and secure
                  workspace.
                </p>
              </div>
            </div>

            <div className={`carousel-slide ${activeSlide === 1 ? 'active' : ''}`}>
              <div className="mock-dashboard mock-analytics">
                <div className="mock-dash-header">
                  <div className="mock-dash-dot" style={{ backgroundColor: '#ef4444' }} />
                  <div className="mock-dash-dot" style={{ backgroundColor: '#f59e0b' }} />
                  <div className="mock-dash-dot" style={{ backgroundColor: '#10b981' }} />
                </div>
                <div className="mock-dash-body">
                  <div className="mock-dash-sidebar" />
                  <div className="mock-dash-main">
                    <div className="chart-bars">
                      <div className="chart-bar" style={{ height: '40%' }} />
                      <div className="chart-bar" style={{ height: '70%' }} />
                      <div className="chart-bar" style={{ height: '50%' }} />
                      <div className="chart-bar" style={{ height: '90%' }} />
                      <div className="chart-bar" style={{ height: '60%' }} />
                    </div>
                    <div className="mock-line" style={{ width: '100%', marginTop: 'auto' }} />
                    <div className="mock-line" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
              <div className="visual-text">
                <h2>Real-time Collaboration</h2>
                <p>
                  Stay connected with your team and track project progress with live data and
                  analytics.
                </p>
              </div>
            </div>

            <div className={`carousel-slide ${activeSlide === 2 ? 'active' : ''}`}>
              <div className="mock-dashboard mock-layout">
                <div className="mock-dash-header">
                  <div className="mock-dash-dot" style={{ backgroundColor: '#ef4444' }} />
                  <div className="mock-dash-dot" style={{ backgroundColor: '#f59e0b' }} />
                  <div className="mock-dash-dot" style={{ backgroundColor: '#10b981' }} />
                </div>
                <div className="mock-dash-body">
                  <div className="mock-dash-sidebar" />
                  <div className="mock-dash-main">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        width: '100%',
                      }}
                    >
                      <div className="mock-tile" />
                      <div className="mock-tile" />
                      <div className="mock-tile" />
                      <div className="mock-tile" />
                    </div>
                    <div className="mock-line" style={{ width: '80%', marginTop: 'auto' }} />
                  </div>
                </div>
              </div>
              <div className="visual-text">
                <h2>Efficient Organization</h2>
                <p>
                  Organize your tasks effortlessly with customizable categories and priority
                  leveling.
                </p>
              </div>
            </div>
          </div>

          <div className="carousel-dots">
            <div
              className={`dot ${activeSlide === 0 ? 'active' : ''}`}
              onClick={() => setActiveSlide(0)}
            />
            <div
              className={`dot ${activeSlide === 1 ? 'active' : ''}`}
              onClick={() => setActiveSlide(1)}
            />
            <div
              className={`dot ${activeSlide === 2 ? 'active' : ''}`}
              onClick={() => setActiveSlide(2)}
            />
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="form-wrapper">
          <div className="form-header">
            <h1>Welcome Back</h1>
          </div>

          <LoginForm onLoginSuccess={onLoginSuccess} />
        </div>
      </div>
    </div>
  );
};
