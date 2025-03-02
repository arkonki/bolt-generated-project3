import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertCircle, Mail, Lock } from 'lucide-react';
import { formatLoginRequest } from '../lib/auth/validation';
import { Button } from '../components/shared/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Monitoori võrguühenduse muutusi
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isOnline) {
      setError('Puudub internetiühendus');
      return;
    }

    try {
      setLoading(true);
      const formattedRequest = formatLoginRequest(email.trim(), password);

      // Oota, kuni autentimine õnnestub
      const user = await signIn(formattedRequest.email, formattedRequest.password);

      // Suuna kasutaja avalehele pärast edukat sisselogimist
      navigate('/');
    } catch (err) {
      console.error('Login error:', {
        error: err,
        hasEmail: Boolean(email.trim()),
        hasPassword: Boolean(password.trim()),
        isOnline,
      });

      if (err instanceof Error) {
        if (err.message.includes('Database error') || err.message.includes('unexpected_failure')) {
          setError('Teenus ajutiselt kättesaamatu. Palun proovige hiljem uuesti.');
        } else if (err.message.includes('Invalid login credentials')) {
          setError('Vale e-posti aadress või parool');
        } else if (err.message.includes('Too many requests')) {
          setError('Liiga palju sisselogimiskatseid. Palun proovige hiljem uuesti.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Sisselogimine ebaõnnestus. Palun proovige uuesti.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Logi sisse DragonBane'i
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sisesta oma andmed kontole ligipääsemiseks
          </p>
        </div>

        {/* Võrguühenduse hoiatus */}
        {!isOnline && (
          <div className="mb-6 rounded-md bg-yellow-50 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Puudub internetiühendus
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Palun kontrollige oma internetiühendust ja proovige uuesti.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Veateade sisselogimisel */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Sisselogimise viga</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posti aadress
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sisesta e-posti aadress"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parool
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sisesta parool"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading || !isOnline}
          >
            Logi sisse
          </Button>
        </form>
      </div>
    </div>
  );
}
