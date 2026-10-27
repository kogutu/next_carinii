import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Image src="/logo.png" alt="Sobianek" width={200} height={60} priority className=" max-h-14 w-auto" />

            </div>
            <p className="text-muted-foreground mb-4 leading-relaxed text-sm sm:text-base">
              Profesjonalne rozwiązania dla rolnictwa. Produkty najwyższej jakości, konkurencyjne ceny i fachowe
              doradztwo.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* O firmie */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-foreground">O firmie</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/o-nas" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="/realizacje" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  Realizacje
                </Link>
              </li>
              <li>
                <Link href="/doradztwo" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  Doradztwo
                </Link>
              </li>
              <li>
                <Link href="/kariera" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  Kariera
                </Link>
              </li>
            </ul>
          </div>

          {/* Informacje */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-foreground">Informacje</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/regulamin" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link
                  href="/polityka-prywatnosci"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base"
                >
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link href="/dostawa" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  Dostawa i płatność
                </Link>
              </li>
              <li>
                <Link href="/zwroty" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  Zwroty i reklamacje
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-foreground">Kontakt</h3>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <li className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+48123456789" className="hover:text-primary transition-colors">
                    +48 123 456 789
                  </a>
                  <div className="text-xs sm:text-sm">Pon-Pt: 8:00-18:00</div>
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:kontakt@sobianek.pl" className="hover:text-primary transition-colors break-all">
                  kontakt@sobianek.pl
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                <span>
                  ul. Rolnicza 123
                  <br />
                  00-000 Warszawa
                </span>
              </li>
            </ul>

            <div>
              <h4 className="font-semibold mb-2 sm:mb-3 text-foreground text-sm sm:text-base">Newsletter</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input placeholder="Twój email" className="flex-1 h-9 sm:h-10 text-sm" />
                <Button className="h-9 sm:h-10 text-sm">Zapisz się</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            <p>© 2026 Sobianek Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
            <p>DevBack.it from ❤️</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
