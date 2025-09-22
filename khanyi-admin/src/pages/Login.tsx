import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.success) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Only allow admins to access
        if (response.data.user.role === 'system_admin' || response.data.user.role === 'estate_admin') {
          navigate('/');
        } else {
          setError('Access denied. Admin privileges required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8\">
        <div>
          <div className=\"mx-auto h-12 w-12 bg-pacific-blue rounded-full flex items-center justify-center\">
            <span className=\"text-white font-bold text-xl\">K</span>
          </div>
          <h2 className=\"mt-6 text-center text-3xl font-extrabold text-gray-900\">
            Khanyi Admin Dashboard
          </h2>
          <p className=\"mt-2 text-center text-sm text-gray-600\">
            Sign in to manage your electricity vending system
          </p>
        </div>
        <form className=\"mt-8 space-y-6\" onSubmit={handleSubmit}>
          {error && (
            <div className=\"rounded-md bg-red-50 p-4\">
              <div className=\"flex\">
                <div className=\"ml-3\">
                  <h3 className=\"text-sm font-medium text-red-800\">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className=\"rounded-md shadow-sm -space-y-px\">
            <div>
              <label htmlFor=\"email-address\" className=\"sr-only\">
                Email address
              </label>
              <input
                id=\"email-address\"
                name=\"email\"
                type=\"email\"
                autoComplete=\"email\"
                required
                className=\"appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pacific-blue focus:border-pacific-blue focus:z-10 sm:text-sm\"
                placeholder=\"Email address\"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor=\"password\" className=\"sr-only\">
                Password
              </label>
              <input
                id=\"password\"
                name=\"password\"
                type=\"password\"
                autoComplete=\"current-password\"
                required
                className=\"appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pacific-blue focus:border-pacific-blue focus:z-10 sm:text-sm\"
                placeholder=\"Password\"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type=\"submit\"
              disabled={loading}
              className=\"group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pacific-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pacific-blue disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className=\"text-center\">
            <p className=\"text-sm text-gray-600\">
              Demo Credentials:<br/>
              <strong>Email:</strong> admin@khanyisolutions.com<br/>
              <strong>Password:</strong> admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}