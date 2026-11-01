import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import AuthShell from '../components/AuthShell';
import GoogleIcon from '../components/GoogleIcon';

const Login = () => {
  const { handleLogin, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return setError('Please enter your email address');
    if (!form.password) return setError('Please enter your password');
    try {
      const user = await handleLogin({ email: form.email.trim(), password: form.password });
      navigate(user.role === 'seller' ? '/seller/dashboard' : from || '/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials');
    }
  };

  const message = error || authError;

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in" intro="Use your email and password to continue shopping or manage your store.">
      {message && <div className="alert alert--error" role="alert">{message}</div>}

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <div className="ffield">
          <input id="email" name="email" type="email" placeholder=" " value={form.email} onChange={onChange} autoComplete="email" required />
          <label htmlFor="email">Email address</label>
        </div>

        <div className="ffield ffield--icon-right">
          <input id="password" name="password" type={show ? 'text' : 'password'} placeholder=" " value={form.password} onChange={onChange} autoComplete="current-password" required />
          <label htmlFor="password">Password</label>
          <button type="button" className="ffield__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <button type="submit" className="btn--solid auth__submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <><span>Sign in</span> <ArrowRight size={15} /></>}
        </button>
      </form>

      <div className="auth__or"><span>or</span></div>

      <button type="button" className="btn--outline auth__google" onClick={() => { window.location.href = '/api/auth/google'; }}>
        <GoogleIcon /> <span>Continue with Google</span>
      </button>

      <p className="auth__switch">
        New to Vendra? <Link to="/register" state={location.state}>Create an account</Link>
      </p>
    </AuthShell>
  );
};

export default Login;
