import React, { useEffect } from "react";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputMask } from '@react-input/mask';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMediaQuery } from '@/hooks/use-media-query';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Apple, Chrome, Eye, EyeOff, FacebookIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react"
import Facebook from "next-auth/providers/facebook";


export function AccountModal() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const { data: session, status } = useSession()


  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <button className="flex items-center justify-center hover:bg-hertwhite p-2 rounded-full transition">
    <Image src="/icons/account.svg" alt="Moje konto" width={24} height={24} />
  </button>;

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setRegisterSuccess(false);
      setRegisterMessage('');
      setLoginError('');
      setView('login');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('https://sklep.carinii.com.pl/directseo/nextjs/user/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Błąd logowania');
      }

      if (result.success) {
        // Handle successful login
        console.log('Login success:', result);

        // Możesz tutaj zapisać token w localStorage lub context
        if (result.success && result.data?.customer) {
          localStorage.setItem("customer", JSON.stringify(result.data.customer))
          await signIn("credentials", {
            email: result.data.customer.email,
            name: result.data.customer.firstname || result.data.customer.email,
            id: result.data.customer.id,
            redirect: false,
          })
        }


        // Zamknij modal i przekieruj na stronę konta
        setOpen(false);
        window.location.href = '/klient/panel/profil';
      } else {
        setLoginError(result.message || 'Nieprawidłowy email lub hasło');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Wystąpił błąd podczas logowania');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    handleOpenChange(false)
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterMessage('');
    setRegisterSuccess(false);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const registerData = {
      firstname: formData.get('firstName'),
      lastname: formData.get('lastName'),
      email: formData.get('email'),
      telephone: formData.get('telephone')?.toString().replace(/-/g, ''), // Usuń myślniki z telefonu
      password: formData.get('password'),
      newsletter: formData.get('newsletter') === 'on',
    };

    try {
      const response = await fetch('https://sklep.carinii.com.pl/directseo/nextjs/user/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Błąd rejestracji');
      }

      if (data.success) {
        // Próba automatycznego logowania po rejestracji
        try {
          const loginResponse = await fetch('https://sklep.carinii.com.pl/directseo/nextjs/user/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: registerData.email,
              password: registerData.password,
            }),
          });

          const loginResult = await loginResponse.json();

          if (loginResult.success && loginResult.data?.customer) {
            localStorage.setItem("customer", JSON.stringify(loginResult.data.customer));
            await signIn("credentials", {
              email: loginResult.data.customer.email,
              name: loginResult.data.customer.firstname || loginResult.data.customer.email,
              id: loginResult.data.customer.id,
              redirect: false,
            });

            setRegisterSuccess(true);
            setRegisterMessage('✓ Konto utworzone! Trwa przekierowanie...');
            setOpen(false);
            window.location.href = '/klient/panel/profil';
            return;
          }
        } catch (autoLoginError) {
          console.warn('Auto-login after registration failed:', autoLoginError);
        }

        // Jeśli auto-login się nie udał (np. wymagana aktywacja mailowa)
        setRegisterSuccess(true);
        setRegisterMessage('✓ Konto zostało pomyślnie utworzone! Sprawdź skrzynkę mailową i potwierdź rejestrację, a następnie zaloguj się.');
      } else {
        setRegisterMessage('❌ ' + (data.message || 'Wystąpił błąd podczas rejestracji'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterMessage('❌ ' + (error instanceof Error ? error.message : 'Wystąpił błąd podczas rejestracji'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "apple" | "facebook") => {
    setOauthLoading(provider)
    try {
      await signIn(provider, {
        callbackUrl: "/",
        redirect: true,
      })
    } catch (error) {
      console.error(`[v0] OAuth ${provider} error:`, error)
      setErrorMessage(`Wystąpił błąd podczas logowania przez ${provider}`)
      setOauthLoading(null)
    }
  }

  const BtnSocialLogin = () => (

    <div className="spacey-y-2 grid gap-4">
      <div className="flex items-center justify-center space-x-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 text-sm">lub</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <button
        type="button"
        onClick={() => handleOAuthLogin("google")}
        disabled={oauthLoading !== null}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all font-medium text-[#4285F4] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" width="64px" height="64px" viewBox="-0.5 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Google-color</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Color-" transform="translate(-401.000000, -860.000000)"> <g id="Google" transform="translate(401.000000, 860.000000)"> <path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05"> </path> <path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335"> </path> <path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853"> </path> <path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4"> </path> </g> </g> </g> </g></svg>

        {oauthLoading === "google" ? "Logowanie..." : "Zaloguj przez Google"}
      </button>
      <button
        type="button"
        onClick={() => handleOAuthLogin("apple")}
        disabled={oauthLoading !== null}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-black rounded-lg bg-black hover:bg-black/90 transition-all font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >

        <svg fill="#ffffff" version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" width="64px" height="64px" viewBox="0 0 512 512" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="7935ec95c421cee6d86eb22ecd114eed"> <path d="M248.644,123.476c-5.45-29.71,8.598-60.285,25.516-80.89 c18.645-22.735,50.642-40.17,77.986-42.086c4.619,31.149-8.093,61.498-24.826,82.965 C309.37,106.527,278.508,124.411,248.644,123.476z M409.034,231.131c8.461-23.606,25.223-44.845,51.227-59.175 c-26.278-32.792-63.173-51.83-97.99-51.83c-46.065,0-65.542,21.947-97.538,21.947c-32.96,0-57.965-21.947-97.866-21.947 c-39.127,0-80.776,23.848-107.19,64.577c-9.712,15.055-16.291,33.758-19.879,54.59c-9.956,58.439,4.916,134.557,49.279,202.144 c21.57,32.796,50.321,69.737,87.881,70.059c33.459,0.327,42.951-21.392,88.246-21.616c45.362-0.258,53.959,21.841,87.372,21.522 c37.571-0.317,67.906-41.199,89.476-73.991c15.359-23.532,21.167-35.418,33.11-62.023 C414.435,352.487,389.459,285.571,409.034,231.131z"> </path> </g> </g></svg>
        {oauthLoading === "apple" ? "Logowanie..." : "Zaloguj przez Apple"}
      </button>
      <button
        type="button"
        onClick={() => handleOAuthLogin("facebook")}
        disabled={oauthLoading !== null}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#1877F2] rounded-lg bg-[#1877F2] hover:bg-[#1877F2]/90 transition-all font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="64px" height="64px" viewBox="-5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>facebook [#176]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-385.000000, -7399.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z" id="facebook-[#176]"> </path> </g> </g> </g> </g></svg>
        {oauthLoading === "facebook" ? "Logowanie..." : "Zaloguj przez Facebook"}
      </button>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{errorMessage}</div>
      )}
    </div>

  )

  const loginContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Logowanie</h3>
        <p className="text-sm text-gray-500">Witaj ponownie! Zaloguj się do swojego konta</p>
      </div>

      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

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
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Hasło</Label>

          <div className="relative">
            <Input
              className="h-11"
              name="password"
              disabled={isLoading} required
              type={showPassword ? "text" : "password"}
              placeholder="Wprowadź hasło"
            />
            <Button
              className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="text-right">
          <a href="#" className="text-sm text-hert hover:underline">
            Zapomniałeś hasła?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-hert hover:bg-hert/90 h-11 font-semibold py-6"
          disabled={isLoading}
        >
          {isLoading ? 'Logowanie...' : 'Zaloguj się'}
        </Button>

        <div>
          <BtnSocialLogin />
        </div>
      </form>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-500 mb-2">Nie masz jeszcze konta?</p>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 font-semibold border-hert text-hert hover:bg-hert/5"
          onClick={() => {
            setView('register');
            setLoginError('');
          }}
        >
          Zarejestruj się
        </Button>
      </div>
    </div>
  );

  const registerContent = (
    <div className="space-y-4">
      <div className="space-y-4 mb-6">
        <h3 className="text-2xl font-semibold">Rejestracja</h3>
        <div className="bg-hertwhite p-4 rounded-lg border border-hert/10">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-hert">Posiadanie konta ma wiele zalet.</span> Szybszy proces składania zamówienia, możliwość zapisywania swoich adresów i śledzenie stanu zamówień to tylko niektóre z nich.
          </p>
        </div>
      </div>

      {/* Registration success message */}
      {registerMessage && (
        <Alert
          className={registerSuccess
            ? "bg-green-50 border-green-500 text-green-700"
            : "bg-red-50 border-red-500 text-red-700"
          }
        >
          <AlertDescription>
            {registerMessage}
            {registerSuccess && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-3 h-11 font-semibold border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => {
                  setView('login');
                  setRegisterMessage('');
                  setRegisterSuccess(false);
                }}
              >
                Przejdź do logowania
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

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
            disabled={isLoading || registerSuccess}
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
            disabled={isLoading || registerSuccess}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
            placeholder="twoj@email.com"
            required
            className="h-11"
            disabled={isLoading || registerSuccess}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone">Telefon</Label>
          <InputMask
            id="telephone"
            name="telephone"
            type="tel"
            placeholder="Wprowadź nr tel np. 123-456-789"
            mask="___-___-___"
            replacement={{ _: /\d/ }}
            title="Telefon musi składać się z 9 cyfr"
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11"
            disabled={isLoading || registerSuccess}
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
            disabled={isLoading || registerSuccess}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="newsletter" name="newsletter" disabled={isLoading || registerSuccess} />
          <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
            Zapisz się, aby otrzymywać newsletter
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-hert hover:bg-hert/90 h-11 font-semibold"
          disabled={isLoading || registerSuccess}
        >
          {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
        </Button>
      </form>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-500 mb-2">Masz już konto?</p>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 font-semibold border-hert text-hert hover:bg-hert/5"
          onClick={() => {
            setView('login');
            setRegisterMessage('');
            setRegisterSuccess(false);
          }}
        >
          Zaloguj się
        </Button>
      </div>
    </div>
  );

  const content = view === 'login' ? loginContent : registerContent;

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <button key="account" className="flex items-center justify-center hover:bg-hertwhite p-2 rounded-full transition">
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
    <div className="flex items-center">
      <div className="hidden sm:flex flex-col items-end leading-tight mr-2">
        {status === "authenticated" ? (
          <span>          <div onClick={() => handleLogout()} className="cursor-pointer text-[10px] text-gray-400 uppercase font-bold">Wyloguj się</div>
            <a href="/klient/panel/profil" className="text-xs font-bold text-hert">MOJE KONTO</a></span>

        ) : (
          <span onClick={() => handleOpenChange(true)} className="cursor-pointer text-xs font-bold text-hert">ZALOGUJ SIĘ</span>
        )}
      </div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="flex items-center justify-center hover:bg-purple-50 p-2 rounded-full transition">
            <Image src="/icons/account.svg" alt="Moje konto" width={24} height={24} />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Konto</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </div>
  );
}