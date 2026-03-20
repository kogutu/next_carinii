'use client';

import React from "react";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMediaQuery } from '@/hooks/use-media-query';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

function AccountModal() {  // <-- Changed from export function to just function
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('choice');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setView('choice'); // Reset to choice view when closing
    }
  };

  // ... rest of your component code remains exactly the same ...

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log('Login:', {
      email: formData.get('email'),
      password: formData.get('password'),
    });
    // Add your login logic here
  };

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log('Register:', {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      nip: formData.get('nip'),
      password: formData.get('password'),
      newsletter: formData.get('newsletter'),
    });
    // Add your registration logic here
  };

  const ChoiceView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => setView('login')}
          className="w-full bg-hert hover:bg-hert/90 h-12 text-base font-semibold"
        >
          Zaloguj się
        </Button>
        <Button
          onClick={() => setView('register')}
          variant="outline"
          className="w-full h-12 text-base font-semibold border-hert text-hert hover:bg-hertwhite"
        >
          Utwórz konto
        </Button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">lub</span>
        </div>
      </div>

      <Button
        onClick={() => {
          window.location.href = '/klient/panel/profil';
          setOpen(false);
        }}
        variant="outline"
        className="w-full h-12 text-base font-semibold"
      >
        Twoje Konto
      </Button>
    </div>
  );

  const LoginView = () => (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Logowanie</h3>
        <p className="text-sm text-gray-500">Witaj ponownie! Zaloguj się do swojego konta</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">E-mail</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="twoj@email.com"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Hasło</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="h-11"
          />
        </div>

        <div className="text-right">
          <a href="#" className="text-sm text-hert hover:underline">
            Zapomniałeś hasła?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-hert hover:bg-hert/90 h-11 font-semibold"
        >
          Zaloguj się
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">lub</span>
        </div>
      </div>

      <Button
        onClick={() => setView('register')}
        variant="outline"
        className="w-full h-11 font-semibold border-hert text-hert hover:bg-hertwhite"
      >
        Zarejestruj się
      </Button>
    </div>
  );

  const RegisterView = () => (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('login')}
            className="text-hert hover:text-hert/80 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-2xl font-semibold">Rejestracja</h3>
        </div>
        <div className="bg-hertwhite p-4 rounded-lg border border-hert/10">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-hert">Posiadanie konta ma wiele zalet.</span> Szybszy proces składania zamówienia, możliwość zapisywania swoich adresów i śledzenie stanu zamówień to tylko niektóre z nich.
          </p>
        </div>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Imię</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Jan"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Kowalski"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="twoj@email.com"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nip">NIP</Label>
          <Input
            id="nip"
            name="nip"
            type="text"
            placeholder="1234567890"
            pattern="[0-9]{10}"
            title="NIP musi składać się z 10 cyfr"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Hasło</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            placeholder="••••••••"
            minLength={8}
            required
            className="h-11"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="newsletter" name="newsletter" />
          <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
            Zapisz się, aby otrzymywać newsletter
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-hert hover:bg-hert/90 h-11 font-semibold"
        >
          Zarejestruj się
        </Button>
      </form>
    </div>
  );

  const content = (
    <>
      {view === 'choice' && <ChoiceView />} {/* Add this line if you want the choice view */}
      {view === 'login' && <LoginView />}
      {view === 'register' && <RegisterView />}
    </>
  );

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <button className="flex items-center justify-center hover:bg-hertwhite p-2 rounded-full transition">
            <Image src="/icons/account.svg" alt="Moje konto" width={24} height={24} />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Konto</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 max-h-[80vh] overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center hover:bg-purple-50 p-2 rounded-full transition">
          <Image src="/icons/account.svg" alt="Moje konto" width={24} height={24} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Konto</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default AccountModal; // <-- Add this default export at the very end