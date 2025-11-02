import React, { useState } from 'react';
import type { UserRole } from '../types';
import { Logo } from './icons/Logo';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashedIcon } from './icons/EyeSlashedIcon';
import { CheckIcon } from './icons/CheckIcon';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (userData: { name: string; email: string; password: string; role: UserRole; }) => Promise<void>;
}

const LoginForm: React.FC<{ onLogin: (email: string, password: string) => Promise<void>; onSwitchToRegister: () => void; }> = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        await onLogin(email, password);
      } catch (err: any) {
        setError(err.message || 'Error al iniciar sesión');
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <Logo className="h-10 w-auto text-slate-800" />
                        <h2 className="mt-6 text-3xl font-extrabold text-slate-900">¡Bienvenid@ a tu nueva comunidad!</h2>
                        <p className="mt-2 text-sm text-slate-600">Accede con tu cuenta universitaria</p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                             {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">{error}</div>}

                             <div>
                                <label htmlFor="email-login" className="block text-sm font-medium text-slate-700">Email</label>
                                <div className="mt-1">
                                    <input id="email-login" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="password-login" className="block text-sm font-medium text-slate-700">Contraseña</label>
                                <div className="mt-1 relative">
                                    <input id="password-login" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                        {showPassword ? <EyeSlashedIcon className="h-5 w-5 text-slate-500" /> : <EyeIcon className="h-5 w-5 text-slate-500" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-300 rounded"/>
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot Password</a>
                                </div>
                            </div>

                            <div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                                    {loading ? 'Iniciando sesión...' : 'Login'}
                                </button>
                            </div>
                            <p className="mt-2 text-center text-sm text-slate-600">
                                ¿No tenes una cuenta?{' '}
                                <button type="button" onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500">Regístrate</button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <div className="hidden lg:block relative w-0 flex-1">
                <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2940&auto=format&fit=crop" alt="University students collaborating together"/>
                 <div className="absolute inset-0 h-full w-full bg-gradient-to-l from-white via-white/50 to-transparent"></div>
            </div>
        </div>
    );
};

const RegisterForm: React.FC<{ onRegister: AuthProps['onRegister']; onSwitchToLogin: () => void; }> = ({ onRegister, onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('Estudiante');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (!agreedToTerms) {
            setError('Debes aceptar los términos y políticas de privacidad.');
            return;
        }

        setLoading(true);

        try {
            await onRegister({ name: fullName, email, password, role });
            setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');

            // Clear form
            setFullName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAgreedToTerms(false);

            setTimeout(() => onSwitchToLogin(), 2000);
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            <div className="hidden lg:block relative w-0 flex-1">
                <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2940&auto=format&fit=crop" alt="Students collaborating"/>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-white via-white/50 to-transparent"></div>
            </div>
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <Logo className="h-10 w-auto text-slate-800" />
                        <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Regístrate</h2>
                        <p className="mt-2 text-sm text-slate-600">Sumate a RAU y potenciá tu cursada</p>
                    </div>
                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
                            {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">{success}</p>}

                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input id="full-name" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            </div>
                            <div>
                                <label htmlFor="email-register" className="block text-sm font-medium text-slate-700">Email</label>
                                <input id="email-register" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setRole('Estudiante')} className={`w-full flex justify-center items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${role === 'Estudiante' ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                                    {role === 'Estudiante' && <CheckIcon className="h-5 w-5"/>} Soy Estudiante
                                </button>
                                <button type="button" onClick={() => setRole('Profesor')} className={`w-full flex justify-center items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${role === 'Profesor' ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                                    {role === 'Profesor' && <CheckIcon className="h-5 w-5"/>} Soy Profesor
                                </button>
                            </div>

                            <div>
                                <label htmlFor="password-register" className="block text-sm font-medium text-slate-700">Password</label>
                                <div className="mt-1 relative">
                                    <input id="password-register" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center"><EyeSlashedIcon className={`h-5 w-5 ${showPassword ? 'text-blue-500': 'text-slate-400'}`} /></button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                                <div className="mt-1 relative">
                                    <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center"><EyeSlashedIcon className={`h-5 w-5 ${showConfirmPassword ? 'text-blue-500': 'text-slate-400'}`} /></button>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-1"/>
                                <label htmlFor="terms" className="ml-2 block text-sm text-slate-900">I agree to all the <a href="#" className="font-medium text-blue-600 hover:underline">Terms</a> and <a href="#" className="font-medium text-blue-600 hover:underline">Privacy Policies</a></label>
                            </div>

                            <div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                                    {loading ? 'Creando cuenta...' : 'Creá tu Cuenta'}
                                </button>
                            </div>
                            <p className="text-center text-sm text-slate-600">
                                ¿Ya tenés una cuenta?{' '}
                                <button type="button" onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500">Login</button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Login: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [view, setView] = useState<'login' | 'register'>('login');

  if (view === 'register') {
    return <RegisterForm onRegister={onRegister} onSwitchToLogin={() => setView('login')} />;
  }

  return <LoginForm onLogin={onLogin} onSwitchToRegister={() => setView('register')} />;
};
