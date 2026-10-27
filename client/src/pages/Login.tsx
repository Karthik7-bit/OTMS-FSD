import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type RoleType = 'DOCTOR' | 'ADMIN' | 'RECIPIENT' | 'DONOR';

interface RolePreset {
  role: RoleType;
  label: string;
  badge: string;
  email: string;
  password: string;
  description: string;
  accentColor: string;
}

const PRESETS: RolePreset[] = [
  {
    role: 'DOCTOR',
    label: 'Doctor Login',
    badge: 'Clinical Staff',
    email: 'doctor@otms.com',
    password: 'password123',
    description: 'Access Matching Engine, Organ Inventory & Allocation approval',
    accentColor: 'border-blue-500 bg-blue-50 text-blue-700'
  },
  {
    role: 'ADMIN',
    label: 'Admin Login',
    badge: 'System Admin',
    email: 'admin@otms.com',
    password: 'admin123',
    description: 'Full administrative control, hospital settings & user directory',
    accentColor: 'border-purple-500 bg-purple-50 text-purple-700'
  },
  {
    role: 'RECIPIENT',
    label: 'Recipient',
    badge: 'Patient',
    email: 'patient@otms.com',
    password: 'password123',
    description: 'View transplant requests, priority status & waiting list',
    accentColor: 'border-emerald-500 bg-emerald-50 text-emerald-700'
  },
  {
    role: 'DONOR',
    label: 'Donor',
    badge: 'Organ Donor',
    email: 'donor@otms.com',
    password: 'password123',
    description: 'Pledge organs, view consent & registry status',
    accentColor: 'border-amber-500 bg-amber-50 text-amber-700'
  }
];

export default function Login() {
  const [email, setEmail] = useState('doctor@otms.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<RoleType>('DOCTOR');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (preset: RolePreset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.password);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          OTMS Portal
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Organ Transplant Management System &bull; RBAC Login
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">
          
          {/* Quick Role Selection for RBAC */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Role for Instant RBAC Login:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = selectedRole === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectRole(p)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? `${p.accentColor} ring-2 ring-blue-500/20 shadow-sm font-semibold`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold">{p.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 font-medium border border-slate-200/60">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 truncate w-full font-normal">
                      {p.email}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Active Role Description */}
            {PRESETS.find(p => p.role === selectedRole) && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                <span className="inline-block mt-0.5 text-blue-600">✦</span>
                <span>{PRESETS.find(p => p.role === selectedRole)?.description}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm"
                  placeholder="name@otms.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Sign in as ${PRESETS.find(p => p.role === selectedRole)?.label || 'User'}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              New participant?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
