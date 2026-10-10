import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  ScrollText,
  Smartphone,
  Truck,
} from 'lucide-react'
import { ENTER, ENTER_DELAY, EYEBROW, SurfaceCard } from '@/components/ui/surface'
import { cn } from '@/lib/utils'

// Strona w pełni statyczna: dane kontaktowe są w kodzie, nic nie jest pobierane przy wejściu.
export const dynamic = 'force-static'

const COMPANY = {
  name: 'Z.P.O. CARINII',
  street: 'ul. Warszawska 78',
  postcode: '08-450',
  city: 'Łaskarzew',
  nip: 'PL8261860220',
  regon: '711791712',
}

const CONTACT = {
  phone: { label: '+48 25 748 42 00', href: 'tel:+48257484200', e164: '+48257484200' },
  mobile: { label: '+48 504 270 628', href: 'tel:+48504270628' },
  email: 'sklep@carinii.com.pl',
  hours: { days: 'Poniedziałek – piątek', time: '8:00 – 16:00' },
}

const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${COMPANY.name}, ${COMPANY.street}, ${COMPANY.postcode} ${COMPANY.city}`,
)}`

const HELP_LINKS = [
  { href: '/dostawa', title: 'Dostawa', description: 'Sposoby i koszty wysyłki', icon: Truck },
  { href: '/sposoby-platnosci', title: 'Płatności', description: 'Dostępne metody płatności', icon: CreditCard },
  { href: '/zwrot-reklamacja', title: 'Zgłoś zwrot lub reklamację', description: 'Formularz online, ze zdjęciami', icon: RotateCcw },
  { href: '/zwroty-reklamacje', title: 'Zasady zwrotów i reklamacji', description: 'Jak odesłać lub zareklamować produkt', icon: ScrollText },
  { href: '/regulamin', title: 'Regulamin', description: 'Zasady zakupów w sklepie', icon: ScrollText },
]

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/Carinii-266421236855019/', label: 'Facebook' },
  { href: 'https://www.instagram.com/cariniifabrykaobuwia', label: 'Instagram' },
]

export const metadata: Metadata = {
  title: 'Kontakt | Carinii',
  description:
    'Skontaktuj się z Carinii: telefon, e-mail, godziny pracy biura obsługi klienta oraz dane firmy Z.P.O. CARINII, ul. Warszawska 78, Łaskarzew.',
  alternates: { canonical: '/kontakt' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Kontakt',
  mainEntity: {
    '@type': 'Organization',
    name: COMPANY.name,
    brand: 'Carinii',
    email: CONTACT.email,
    telephone: CONTACT.phone.e164,
    vatID: COMPANY.nip,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postcode,
      addressLocality: COMPANY.city,
      addressCountry: 'PL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: CONTACT.phone.e164,
      email: CONTACT.email,
      availableLanguage: 'pl',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '16:00',
      },
    },
  },
}

const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-lg text-foreground underline-offset-4 transition-colors hover:text-hcar hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none'

type ContactCardProps = {
  icon: ReactNode
  title: string
  className?: string
  children: ReactNode
}

const ContactCard = ({ icon, title, className, children }: ContactCardProps) => (
  <SurfaceCard className={cn('flex flex-col gap-4 sm:p-6', className)}>
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground [&>svg]:size-5">
        {icon}
      </span>
      <h2 className={EYEBROW}>{title}</h2>
    </div>
    <div className="space-y-1">{children}</div>
  </SurfaceCard>
)

type PhoneLineProps = {
  label: string
  number: string
  href: string
  icon: ReactNode
}

const PhoneLine = ({ label, number, href, icon }: PhoneLineProps) => (
  <div>
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span aria-hidden="true" className="[&>svg]:size-3.5">{icon}</span>
      {label}
    </p>
    <a href={href} className={cn(LINK_CLASS, 'text-xl font-semibold tabular-nums tracking-tight')}>
      {number}
    </a>
  </div>
)

export default function ContactPage() {
  return (
    <main className="bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <header className={cn(ENTER, 'max-w-3xl')}>
          <p className={EYEBROW}>Kontakt</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Porozmawiajmy
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Pytania o zamówienie, rozmiar albo zwrot? Odpowiadamy od poniedziałku do piątku w godzinach 8:00 – 16:00.
          </p>
        </header>

        <section aria-label="Dane kontaktowe" className={cn(ENTER, ENTER_DELAY[1], 'mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
          <ContactCard icon={<Phone />} title="Telefon">
            <PhoneLine label="Biuro, telefon stacjonarny" number={CONTACT.phone.label} href={CONTACT.phone.href} icon={<Phone />} />
            <PhoneLine label="Telefon komórkowy" number={CONTACT.mobile.label} href={CONTACT.mobile.href} icon={<Smartphone />} />
          </ContactCard>

          <ContactCard icon={<Mail />} title="E-mail">
            <a href={`mailto:${CONTACT.email}`} className={cn(LINK_CLASS, 'break-all text-xl font-semibold tracking-tight')}>
              {CONTACT.email}
            </a>
            <p className="text-pretty text-sm text-muted-foreground">
              Piszesz w sprawie zamówienia? Podaj jego numer, np. CAR-261009-7K3QXM.
            </p>
          </ContactCard>

          <ContactCard icon={<Clock />} title="Godziny pracy" className="sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-muted-foreground">{CONTACT.hours.days}</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{CONTACT.hours.time}</p>
          </ContactCard>
        </section>

        <div className={cn(ENTER, ENTER_DELAY[2], 'mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]')}>
          <SurfaceCard role="region" aria-labelledby="company-title" className="sm:p-6">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-muted [&>svg]:size-5">
                <MapPin />
              </span>
              <h2 id="company-title" className={EYEBROW}>Dane firmy</h2>
            </div>

            <address className="mt-5 not-italic">
              <p className="text-xl font-semibold tracking-tight text-foreground">{COMPANY.name}</p>
              <p className="mt-1 text-muted-foreground">{COMPANY.street}</p>
              <p className="text-muted-foreground">{COMPANY.postcode} {COMPANY.city}</p>
            </address>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">NIP</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-foreground">{COMPANY.nip}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">REGON</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-foreground">{COMPANY.regon}</dd>
              </div>
            </dl>

            <p className="mt-5 text-pretty text-sm text-muted-foreground">
              Odbierasz zamówienie osobiście? Zadzwoń wcześniej, żeby odbiór przebiegł sprawnie.
            </p>

            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-menuhover active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Wyznacz trasę
              <span className="sr-only"> (otwiera Mapy Google w nowej karcie)</span>
            </a>
          </SurfaceCard>

          <SurfaceCard role="region" aria-labelledby="help-title" className="sm:p-6">
            <h2 id="help-title" className={EYEBROW}>Szybkie odpowiedzi</h2>
            <ul className="mt-4 divide-y divide-border">
              {HELP_LINKS.map(({ href, title, description, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group -mx-2 flex min-h-14 items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground group-hover:bg-background">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{description}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 border-t border-border pt-4 text-sm text-muted-foreground">
              <span>Znajdziesz nas też na:</span>
              {SOCIAL_LINKS.map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                  {label}
                </a>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  )
}
