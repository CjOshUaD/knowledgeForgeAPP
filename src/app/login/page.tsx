'use client';

import { useState } from 'react';
import LoginForm from '@/app/components/ui/login-form';

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#1A4870]">
      <LoginForm setLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
    </main>
  );
}
