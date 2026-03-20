"use client"

import type React from "react"
import { ProductReviews } from "./product-reviews"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"


//TAB zustand

import { create } from 'zustand';

interface TabStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openOpinieTab: () => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "opis",
  setActiveTab: (tab) => set({ activeTab: tab }),
  openOpinieTab: () => {
    set({ activeTab: "opinie" });
    // Opóźnienie dla scrolla
    setTimeout(() => {
      const element: any = document.getElementById('tab_opinie');
      console.clear();

      console.log(element.offsetTop);

      window.scrollTo({
        top: element.offsetTop - 100, // offset dla nagłówka
        behavior: 'smooth'
      });
    }, 150);
  },
}));




interface ProductTabsProps {
  description: string
  specyfikacja_product: Record<string, any>
  shipping: Record<string, any>
  packs_ship: Record<string, any>
  reviews: {
    count: number
    avg_stars: number
    revs: Array<{
      name: string
      city: string
      stars: string
      review: string
      created_at: string
      confirmed: boolean
    }>
  }
  google_reviews: any
}

export function ProductTabs({
  description,
  packs_ship,
  specyfikacja_product,
  shipping,
  reviews,
  google_reviews,
}: ProductTabsProps) {
  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  console.log(specyfikacja_product)

  const checkNumber = (value: any) => {
    // Sprawdź czy wartość to number lub string, który można przekonwertować na number
    const num =
      typeof value === "number" ? value : typeof value === "string" && !isNaN(Number(value)) ? Number(value) : null

    if (num === null) {
      return value // Zwróć oryginalną wartość jeśli nie jest liczbą
    }

    return num - 0.000001
  }

  const TabButton = ({
    value,
    children,
    className
  }: {
    value: string
    children: React.ReactNode
    className: string
  }) => {
    const isActive = activeTab === value
    className = className ? className : '';
    return (
      <button
        onClick={() => setActiveTab(value)}
        id={value}
        className={cn(
          "relative flex justify-center items-center px-1 py-3 rounded-full pr-4 text-sm font-medium transition-all",
          "hover:bg-accent/50",
          isActive ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted/50 text-muted-foreground",
        ) + " " + className}
      >
        <span>{children}</span>
        {isActive ? (
          <ChevronLeft className="h-7 w-7 text-green-600 absolute right-1" />
        ) : (
          <ChevronDown className="h-7 w-7 text-gray absolute right-1" />
        )}
      </button>
    )
  }

  return (
    <div className="w-full px-4">
      <div className="sticky top-0 z-10 bg-background pb-4  md:mx-0 md:px-0">
        {/* Mobile: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5 md:hidden">
          <TabButton value="opis">Opis</TabButton>
          <TabButton value="paczka">Paczka/Wysyłka</TabButton>
          <TabButton value="specyfikacja">Specyfikacja</TabButton>
          <TabButton value="opinie">Opinie</TabButton>
          <TabButton className="col-span-2" value="pytanie">Zadaj Pytanie</TabButton>
        </div>

        {/* Desktop: Horizontal tabs */}
        <div className="hidden md:grid grid-cols-5">
          <TabButton value="opis" className="w-full flex justify-center text-center">
            Opis
          </TabButton>
          <TabButton value="specyfikacja" className="w-full flex justify-center text-center">
            Specyfikacja
          </TabButton>
          <TabButton value="paczka" className="w-full justify-center text-center">
            Paczka Wysyłka
          </TabButton>
          <TabButton value="opinie" className="w-full justify-center text-center">
            Opinie
          </TabButton>
          <TabButton value="pytanie" className="w-full justify-center text-center">
            Zadaj pytanie
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "opis" && (
        <div className="mt-6">
          <Card>
            <CardContent className=" px-4 md:px-6">
              <div
                className="description_product prose prose-sm md:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "specyfikacja" && (
        <div className="mt-6" >
          <Card>
            <CardContent className="pt-6 px-4 md:px-6">
              <div className="space-y-3">
                {specyfikacja_product.map((specification, index) => (
                  <div key={index} className="space-y-6">
                    {Object.entries(specification).map(([categoryKey, categoryValue]) => (
                      <div className="mb-[30px]" key={categoryKey}>
                        {/* Nagłówek kategorii głównej */}
                        <h2 className="text-lg  flex items-center font-semibold border-b  pl-2 p-3 mb-6 capitalize">
                          <ChevronRight className="text-mpred"></ChevronRight> {categoryKey.replace(/_/g, " ")}
                        </h2>

                        <div className="px-6 space-y-3">
                          {/* Iteracja po podkategoriach */}
                          {typeof categoryValue === "object" && !Array.isArray(categoryValue) ? (
                            Object.entries(categoryValue).map(([subKey, subValue]) => {
                              // Obsługa tablicy z obiektami {value: [...]}
                              if (Array.isArray(subValue) && subValue.length > 0 && subValue[0].value) {
                                const values = subValue[0].value.map(checkNumber)
                                return (
                                  <div
                                    key={subKey}
                                    className="flex justify-between items-start border-b pb-3 last:border-0"
                                  >
                                    <div className="font-medium text-sm md:text-base text-foreground capitalize">
                                      {subKey.replace(/_/g, " ")}:
                                    </div>
                                    <div className="text-sm md:text-base text-muted-foreground text-right ml-4">
                                      {values.join(", ")}
                                    </div>
                                  </div>
                                )
                              }
                              // Obsługa obiektów z unit i value (wymiary)
                              else if (typeof subValue === "object" && subValue !== null && "value" in subValue) {
                                const values = Array.isArray(subValue.value)
                                  ? subValue.value.map(checkNumber)
                                  : [checkNumber(subValue.value)]
                                const unit = subValue.unit || ""
                                return (
                                  <div
                                    key={subKey}
                                    className="flex justify-between items-start border-b pb-3 last:border-0"
                                  >
                                    <div className="font-medium text-sm md:text-base text-foreground capitalize">
                                      {subKey.replace(/_/g, " ")}:
                                    </div>
                                    <div className="text-sm md:text-base text-muted-foreground text-right ml-4">
                                      {values.join(", ")} {unit}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })
                          ) : Array.isArray(categoryValue) && categoryValue.length > 0 && categoryValue[0].value ? (
                            // Obsługa kategorii będących tablicami (np. przeznaczenie, styl_wnętrzarski)
                            <div className="flex justify-between items-start border-b pb-3 last:border-0">
                              <div className="font-medium text-sm md:text-base text-foreground capitalize">
                                Wartości:
                              </div>
                              <div className="text-sm md:text-base text-muted-foreground text-right ml-4">
                                {categoryValue[0].value.map(checkNumber).join(", ")}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "paczka" && (
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6 px-4 md:px-6">
              <div className="space-y-6">
                {/* Informacje o wysyłce */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Informacje o wysyłce</h3>

                  <div className="flex justify-between items-start border-b pb-3">
                    <div className="font-medium text-sm md:text-base text-foreground">
                      Koszt wysyłki:
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">
                      {packs_ship.shipping_amount} zł
                    </div>
                  </div>

                  <div className="flex justify-between items-start border-b pb-3">
                    <div className="font-medium text-sm md:text-base text-foreground">
                      Koszt wniesienia:
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">
                      {packs_ship.shipping_carring} zł
                    </div>
                  </div>

                  <div className="flex justify-between items-start border-b pb-3">
                    <div className="font-medium text-sm md:text-base text-foreground">
                      Liczba paczek:
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">
                      {packs_ship.shipping_packages}
                    </div>
                  </div>

                  <div className="flex justify-between items-start border-b pb-3">
                    <div className="font-medium text-sm md:text-base text-foreground">
                      Czas realizacji:
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">
                      {packs_ship.shipping_realizacja} dni
                    </div>
                  </div>

                  <div className="flex justify-between items-start border-b pb-3">
                    <div className="font-medium text-sm md:text-base text-foreground">
                      Termin dostawy:
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">
                      {packs_ship.shipping_termin.join(" ")}
                    </div>
                  </div>


                </div>

                {/* Wymiary paczek */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Wymiary paczek ({packs_ship.wysylka.packs} szt.)</h3>

                  {packs_ship.wysylka.length.map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-medium mb-3">Paczka {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Długość:</span>
                          <span className="font-medium">{packs_ship.wysylka.length[index]} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Szerokość:</span>
                          <span className="font-medium">{packs_ship.wysylka.width[index]} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wysokość:</span>
                          <span className="font-medium">{packs_ship.wysylka.height[index]} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Waga:</span>
                          <span className="font-medium">{packs_ship.wysylka.weight[index]} kg</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Podsumowanie */}
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Łączna waga:</span>
                      <span>{packs_ship.wysylka.weight.reduce((a, b) => a + b, 0)} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "opinie" && (
        <div className="mt-6" id="tab_opinie">
          <Card>
            <CardContent className="pt-6 px-4 md:px-6">
              <ProductReviews reviews={reviews} google_reviews={google_reviews} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "pytanie" && (
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6 px-4 md:px-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Twoje pytanie</label>
                  <textarea
                    className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    placeholder="Wpisz swoje pytanie..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Imię</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full text-sm md:text-base py-2.5">
                  Wyślij pytanie
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
