'use client';

import { useState } from 'react';
import { ChevronRight, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMutation } from '@tanstack/react-query';
import { useNavigationStore, useAuthStore } from '@/stores';
import { toast } from 'sonner';

// ========== LOGIN PAGE ==========
export function LoginPage() {
  const navigate = useNavigationStore();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...data }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.success && data.user) {
        login(data.user);
        toast.success(`Selamat datang, ${data.user.name}!`);
        navigate.navigate('home');
        window.scrollTo(0, 0);
      } else {
        toast.error(data.message || 'Login gagal. Periksa email dan password Anda.');
      }
    },
    onError: () => {
      toast.error('Gagal terhubung ke server');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            <span className="text-rose-600">LUXE</span> FASHION
          </h1>
          <p className="mt-2 text-sm text-stone-500">Masuk ke akun Anda</p>
        </div>

        <Card className="border-stone-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 border-stone-300 pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-stone-300 pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-rose-600 text-white hover:bg-rose-700"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-stone-500">
                Belum punya akun?{' '}
                <button
                  onClick={() => { navigate.navigate('register'); window.scrollTo(0, 0); }}
                  className="font-medium text-rose-600 hover:text-rose-700"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-stone-50 p-3 text-center text-xs text-stone-500">
              <p>Demo login:</p>
              <p>Admin: admin@luxefashion.com</p>
              <p>Customer: customer@example.com</p>
              <p className="mt-1 text-stone-400">(password: password123)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== REGISTER PAGE ==========
export function RegisterPage() {
  const navigate = useNavigationStore();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...data }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.success && data.user) {
        login(data.user);
        toast.success('Pendaftaran berhasil! Selamat datang.');
        navigate.navigate('home');
        window.scrollTo(0, 0);
      } else {
        toast.error(data.message || 'Pendaftaran gagal. Coba lagi.');
      }
    },
    onError: () => {
      toast.error('Gagal terhubung ke server');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Semua field wajib diisi');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Password dan konfirmasi tidak cocok');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    registerMutation.mutate(form);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            <span className="text-rose-600">LUXE</span> FASHION
          </h1>
          <p className="mt-2 text-sm text-stone-500">Buat akun baru</p>
        </div>

        <Card className="border-stone-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    placeholder="Nama lengkap"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="h-10 border-stone-300 pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="h-10 border-stone-300 pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">No. Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="h-10 border-stone-300 pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="h-10 border-stone-300 pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    type="password"
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className="h-10 border-stone-300 pl-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-rose-600 text-white hover:bg-rose-700"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-stone-500">
                Sudah punya akun?{' '}
                <button
                  onClick={() => { navigate.navigate('login'); window.scrollTo(0, 0); }}
                  className="font-medium text-rose-600 hover:text-rose-700"
                >
                  Masuk
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
