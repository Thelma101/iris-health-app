'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function FieldAgentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'field-agent' | 'admin'>('field-agent');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = loginType === 'field-agent' 
        ? '/api/fieldAgent/login' 
        : '/api/admin/login';
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token based on login type
      if (loginType === 'field-agent') {
        localStorage.setItem('fieldAgentToken', data.data?.token || data.token);
        localStorage.setItem('fieldAgentData', JSON.stringify(data.data?.fieldAgent || data.fieldAgent));
        router.push('/field-agent/dashboard');
      } else {
        localStorage.setItem('token', data.data?.token || data.token);
        localStorage.setItem('adminData', JSON.stringify(data.data?.admin || data.admin));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center gap-4">
            <Image
              src="/images/favicon.svg"
              alt="MedTrack Icon"
              width={35}
              height={38}
              className="w-[35px] h-[38px]"
            />
            <Image
              src="/images/logo.svg"
              alt="MedTrack"
              width={223}
              height={34}
              className="h-[34px] w-auto"
            />
          </div>
          <p className="font-poppins font-medium text-2xl text-[#212b36] text-center">
            Bringing Healthcare Closer
          </p>
        </div>

        {/* Login Type Tabs */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLoginType('field-agent')}
            className={`h-10 px-4 rounded-[10px] font-poppins text-sm transition-colors ${
              loginType === 'field-agent'
                ? 'bg-[#2c7be5] text-white'
                : 'bg-white text-[#637381] hover:bg-gray-50'
            }`}
          >
            Field Agent
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`h-10 px-4 rounded-[10px] font-poppins text-sm transition-colors ${
              loginType === 'admin'
                ? 'bg-[#2c7be5] text-white'
                : 'bg-white text-[#637381] hover:bg-gray-50'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-poppins font-medium text-sm text-[#637381]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-12 px-5 bg-white border border-[#d9d9d9] rounded font-poppins text-sm text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-poppins font-medium text-sm text-[#637381]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full h-12 px-5 pr-12 bg-white border border-[#d9d9d9] rounded font-poppins text-sm text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637381] hover:text-[#212b36]"
                >
                  {showPassword ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.7429 5.09232C11.1494 5.03223 11.5686 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7767C21.8518 11.9016 21.8517 12.0987 21.8231 12.2236C21.7849 12.3899 21.7164 12.4985 21.5792 12.7156C21.2793 13.1901 20.8222 13.8571 20.2165 14.5805M6.72432 6.71504C4.56225 8.1817 3.09445 10.2194 2.42111 11.2853C2.28428 11.5019 2.21587 11.6102 2.17774 11.7765C2.1491 11.9014 2.14909 12.0984 2.17771 12.2234C2.21583 12.3897 2.28393 12.4975 2.42013 12.7132C3.54554 14.4952 6.89541 19 12.0004 19C14.0588 19 15.8319 18.2676 17.2888 17.2766M3.00042 3L21.0004 21M9.87871 9.87868C9.33696 10.4204 9.00042 11.1716 9.00042 12C9.00042 13.6569 10.3436 15 12.0004 15C12.8288 15 13.58 14.6635 14.1218 14.1213" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm font-poppins">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#2c7be5] text-white rounded-[10px] font-inter font-medium text-base hover:bg-[#1e5aa8] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
