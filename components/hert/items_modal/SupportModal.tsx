'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Building2, Send, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function SupportModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'form'>('contact');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    setMounted(true);
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setFormStatus('sending');
    try {
      // Replace with your actual form submission endpoint
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      setFormStatus('sent');
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setFormStatus('idle');
      }, 3000);
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  const isFormValid =
    formData.name.trim() && formData.email.trim() && formData.subject.trim() && formData.message.trim();

  if (!mounted) {
    return (
      <button className="flex items-center justify-center hover:bg-purple-50 p-2 rounded-full transition">
        <Image src="/icons/support.svg" alt="Biuro obsługi" width={24} height={24} />
      </button>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'contact'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Dane kontaktowe
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'form'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Formularz
        </button>
      </div>

      {activeTab === 'contact' ? (
        <div className="space-y-5">
          {/* Working Hours */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Godziny pracy</p>
              <p className="text-xs text-amber-700">Poniedziałek – Piątek: 08:00 – 16:00</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Chętnie odpowiemy na Państwa pytania
              </p>
            </div>
          </div>

          {/* Phone & Email */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Biuro Obsługi Klienta</h3>
            <div className="space-y-2">
              <a
                href="tel:+48257484200"
                className="flex items-center gap-3 w-full h-11 px-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition text-sm text-gray-700"
              >
                <Phone size={16} className="text-hert shrink-0" />
                <span className="flex-1 text-left">+48 25 748 42 00</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">stacjonarny</span>
              </a>
              <a
                href="tel:+48504270628"
                className="flex items-center gap-3 w-full h-11 px-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition text-sm text-gray-700"
              >
                <Phone size={16} className="text-hert shrink-0" />
                <span className="flex-1 text-left">+48 504 270 628</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">komórkowy</span>
              </a>
              <a
                href="mailto:sklep@carinii.com.pl"
                className="flex items-center gap-3 w-full h-11 px-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition text-sm text-gray-700"
              >
                <Mail size={16} className="text-hert shrink-0" />
                <span className="flex-1 text-left">sklep@carinii.com.pl</span>
              </a>
            </div>
          </div>

          {/* Company Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Adres firmy</h3>
            <div className="p-3 border border-gray-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Building2 size={16} className="text-hert mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Z.P.O. CARINII</p>
                  <p className="text-xs text-gray-500">NIP: PL8261860220</p>
                  <p className="text-xs text-gray-500">REGON: 711791712</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-hert mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">ul. Warszawska 78</p>
                  <p className="text-sm text-gray-700">08-450 Łaskarzew</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Contact Form */
        <div className="space-y-3">
          {formStatus === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle size={48} className="text-green-500" />
              <p className="text-sm font-semibold text-gray-900">Wiadomość wysłana!</p>
              <p className="text-xs text-gray-500 text-center">
                Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jan Kowalski"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hert/30 focus:border-hert transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jan@firma.pl"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hert/30 focus:border-hert transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+48 ..."
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hert/30 focus:border-hert transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temat *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hert/30 focus:border-hert transition bg-white"
                >
                  <option value="">Wybierz temat...</option>
                  <option value="zamówienie">Pytanie o zamówienie</option>
                  <option value="produkt">Pytanie o produkt</option>
                  <option value="zwrot">Zwrot / Reklamacja</option>
                  <option value="współpraca">Współpraca</option>
                  <option value="inne">Inne</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Wiadomość *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Treść wiadomości..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hert/30 focus:border-hert transition resize-none"
                />
              </div>
              {formStatus === 'error' && (
                <p className="text-xs text-red-500">
                  Wystąpił błąd. Spróbuj ponownie lub napisz na sklep@carinii.com.pl
                </p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || formStatus === 'sending'}
                className="w-full bg-hert hover:bg-hert/90 h-11 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === 'sending' ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Wyślij wiadomość
                  </>
                )}
              </Button>
              <p className="text-[10px] text-gray-400 text-center">
                Pola oznaczone * są wymagane
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            key="support"
            className="flex items-center justify-center hover:bg-purple-50 p-2 rounded-full transition"
          >
            <Image src="/icons/support.svg" alt="Biuro obsługi" width={24} height={24} />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Kontakt</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center hover:bg-purple-50 p-2 rounded-full transition">
          <Image src="/icons/support.svg" alt="Biuro obsługi" width={24} height={24} />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[420px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kontakt</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}