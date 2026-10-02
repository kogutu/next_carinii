import { Phone, Mail } from "lucide-react"
import Link from "next/link"

export function ContactBar() {
  return (
    <div className="bg-gray-50 border-b border-gray-200 py-2 md:py-2.5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 text-gray-700">
            <span className="hidden md:inline font-medium">Masz pytania? Skontaktuj się z nami:</span>
            <a href="tel:833544491" className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">83 354 44 91</span>
            </a>
            <a
              href="mailto:sekretariat@sobianek.pl"
              className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">sekretariat@sobianek.pl</span>
              <span className="xs:hidden">Email</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 text-gray-600">
            <Link href="/o-nas" className="hover:text-primary transition-colors">
              O nas
            </Link>
            <Link href="/dla-rolnictwa" className="hover:text-primary transition-colors">
              Dla rolnictwa
            </Link>
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/kontakt" className="hover:text-primary transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
