"use client"

import { useState } from "react"
import { Phone, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
  })
  const [emailValid, setEmailValid] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData({ ...formData, email })
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailValid(emailRegex.test(email))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Contact Form */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full mb-6">
              FORMULARZ KONTAKTOWY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 leading-tight">
              Masz pytania?
              <br />
              Skorzystaj z formularza kontaktowego
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Podaj imię"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-14 bg-white border-gray-200 rounded-lg px-4 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="relative">
                  <label className="absolute top-2 left-4 text-xs text-muted-foreground">Podaj nazwisko</label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-14 bg-white border-gray-200 rounded-lg px-4 pt-5 text-foreground"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="adam.kowalski@gmail.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className="h-14 bg-white border-gray-200 rounded-lg px-4 pr-12 text-foreground placeholder:text-muted-foreground"
                  />
                  {emailValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Numer telefonu"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 bg-white border-gray-200 rounded-lg px-4 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Textarea
                placeholder="Treść wiadomości"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="min-h-[180px] bg-white border-gray-200 rounded-lg px-4 py-4 text-foreground placeholder:text-muted-foreground resize-none"
              />

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                  className="mt-0.5 border-gray-300"
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                  Wyrażam zgodę na lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie,
                  dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan,
                </label>
              </div>

              <Button
                type="submit"
                className="bg-[#E5D429] hover:bg-[#d4c424] text-foreground font-semibold px-8 py-6 h-auto rounded-lg text-base"
              >
                Wyślij wiadomość
              </Button>
            </form>
          </div>

          {/* Right - Contact Details */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full mb-6">
              DANE KONTAKTOWE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 leading-tight">
              Bezpośredni kontakt
              <br />
              z centralą Sobianek.
            </h2>

            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold text-sm mb-3">Adres firmy:</p>
                <p className="text-foreground font-semibold text-lg">SOBIANEK Sp z o. o.</p>
                <p className="text-foreground text-lg">ul. Polna 70, 21-200 Parczew</p>
                <p className="text-muted-foreground mt-3">Poniedziałek - Sobota: 08:00 - 16:00</p>
              </div>

              <div>
                <p className="text-primary font-semibold text-sm mb-4">Dane kontaktowe</p>
                <div className="space-y-4">
                  <a
                    href="tel:833544491"
                    className="flex items-center gap-4 text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-medium">83 354 44 91</span>
                  </a>
                  <a
                    href="mailto:sekretariat@sobianek.pl"
                    className="flex items-center gap-4 text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-medium underline">sekretariat@sobianek.pl</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
