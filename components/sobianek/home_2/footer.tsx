import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-foreground">SOBIANEK</span>
            </div>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Profesjonalne rozwiązania dla rolnictwa. Produkty najwyższej jakości, konkurencyjne ceny i fachowe
              doradztwo.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* O firmie */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">O firmie</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/o-nas" className="text-muted-foreground hover:text-primary transition-colors">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="/realizacje" className="text-muted-foreground hover:text-primary transition-colors">
                  Realizacje
                </Link>
              </li>
              <li>
                <Link href="/doradztwo" className="text-muted-foreground hover:text-primary transition-colors">
                  Doradztwo
                </Link>
              </li>
              <li>
                <Link href="/kariera" className="text-muted-foreground hover:text-primary transition-colors">
                  Kariera
                </Link>
              </li>
            </ul>
          </div>

          {/* Informacje */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Informacje</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/regulamin" className="text-muted-foreground hover:text-primary transition-colors">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link
                  href="/polityka-prywatnosci"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link href="/dostawa" className="text-muted-foreground hover:text-primary transition-colors">
                  Dostawa i płatność
                </Link>
              </li>
              <li>
                <Link href="/zwroty" className="text-muted-foreground hover:text-primary transition-colors">
                  Zwroty i reklamacje
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Kontakt</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+48123456789" className="hover:text-primary transition-colors">
                    +48 123 456 789
                  </a>
                  <div className="text-sm">Pon-Pt: 8:00-18:00</div>
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:kontakt@sobianek.pl" className="hover:text-primary transition-colors">
                  kontakt@sobianek.pl
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>
                  ul. Rolnicza 123
                  <br />
                  00-000 Warszawa
                </span>
              </li>
            </ul>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">Newsletter</h4>
              <div className="flex gap-2">
                <Input placeholder="Twój email" className="flex-1" />
                <Button>Zapisz się</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 Sobianek Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
            <p>Realizacja: v0 by Vercel</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
