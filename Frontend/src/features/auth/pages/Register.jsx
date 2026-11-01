import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import AuthShell from '../components/AuthShell';
import GoogleIcon from '../components/GoogleIcon';

const strengthOf = (pw) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};
const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

const Register = () => {
  const { handleRegister, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ fullname: '', email: '', contact: '', password: '', isSeller: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => strengthOf(form.password), [form.password]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullname.trim()) return setError('Please enter your full name');
    if (!form.email.trim()) return setError('Please enter your email address');
    if (!form.contact.trim()) return setError('Please enter your contact number');
    if (!form.password || form.password.length < 6) return setError('Password must be at least 6 characters long');
    try {
      const user = await handleRegister({
        fullname: form.fullname.trim(),
        email: form.email.trim(),
        contact: form.contact.trim(),
        password: form.password,
        isSeller: form.isSeller,
      });
      navigate(user?.role === 'seller' ? '/seller/dashboard' : from || '/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create account');
    }
  };

  const message = error || authError;

  return (
    <AuthShell eyebrow="Join Vendra" title="Create your account" intro="Shop new arrivals, or open a seller account to list your own products.">
      {message && <div className="alert alert--error" role="alert">{message}</div>}

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <div className="ffield">
          <input id="fullname" name="fullname" type="text" placeholder=" " value={form.fullname} onChange={onChange} autoComplete="name" required />
          <label htmlFor="fullname">Full name</label>
        </div>
        <div className="ffield">
          <input id="email" name="email" type="email" placeholder=" " value={form.email} onChange={onChange} autoComplete="email" required />
          <label htmlFor="email">Email address</label>
        </div>
        <div className="ffield">
          <input id="contact" name="contact" type="tel" placeholder=" " value={form.contact} onChange={onChange} autoComplete="tel" required />
          <label htmlFor="contact">Contact number</label>
        </div>

        <div>
          <div className="ffield ffield--icon-right">
            <input id="password" name="password" type={show ? 'text' : 'password'} placeholder=" " value={form.password} onChange={onChange} autoComplete="new-password" required />
            <label htmlFor="password">Password</label>
            <button type="button" className="ffield__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {form.password && (
            <div className="auth__strength" data-level={strength} aria-live="polite">
              <span><i /><i /><i /><i /></span>
              <small>{STRENGTH_LABEL[strength]}</small>
            </div>
          )}
        </div>

        <label className={`auth__seller ${form.isSeller ? 'is-on' : ''}`}>
          <input type="checkbox" name="isSeller" checked={form.isSeller} onChange={onChange} />
          <span className="auth__box"><Check size={13} strokeWidth={3} /></span>
          <span>
            <strong>I want to sell on Vendra</strong>
            <small>Create a seller account to list products and manage variants.</small>
          </span>
        </label>

        <button type="submit" className="btn--solid auth__submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <><span>Create account</span> <ArrowRight size={15} /></>}
        </button>
      </form>

      <div className="auth__or"><span>or</span></div>

      <button type="button" className="btn--outline auth__google" onClick={() => { window.location.href = '/api/auth/google'; }}>
        <GoogleIcon /> <span>Continue with Google</span>
      </button>

      <p className="auth__switch">
        Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default Register;
