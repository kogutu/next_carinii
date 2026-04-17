import React from 'react';

const SobianekLanding: React.FC = () => {
    return (
        <div className="font-sans bg-gray-50 text-gray-800">
            {/* Header / top bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-2xl font-bold text-green-700">SOBIANEK</div>
                    <div className="flex gap-4 text-sm">
                        <span className="hidden sm:inline text-gray-500">Masz pytania?</span>
                        <span className="font-semibold text-green-800">📞 833 544 491</span>
                    </div>
                </div>
                {/* Main navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 flex flex-wrap gap-3 text-sm font-medium text-gray-700">
                    <a href="#" className="hover:text-green-700">Ekogroszek</a>
                    <a href="#" className="hover:text-green-700">Pellet</a>
                    <a href="#" className="hover:text-green-700">Kotły i pompy ciepła</a>
                    <a href="#" className="hover:text-green-700">Materiał siewny</a>
                    <a href="#" className="hover:text-green-700">Nawozy</a>
                    <a href="#" className="hover:text-green-700">Środki ochrony</a>
                    <a href="#" className="hover:text-green-700">Inhibitory</a>
                    <a href="#" className="hover:text-green-700">O nas</a>
                    <a href="#" className="hover:text-green-700">Blog</a>
                    <a href="#" className="hover:text-green-700">Promocje</a>
                    <a href="#" className="hover:text-green-700">Kontakt</a>
                </div>
            </div>

            <main>
                {/* Hero / welcome section */}
                <section className="bg-gradient-to-r from-green-50 to-white py-10 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">Witamy w naszym sklepie internetowym</h1>
                                <p className="mt-4 text-gray-600">kupią Państwo najlepszy ekogroszek, pellet drzewny czy węgiel orzech workowany!<br />
                                    Nasza firma zajmuje się dystrybucją wysokiej jakości materiałów opałowych. Udowadniamy, że dobry produkt nie musi mieć wysokiej ceny.</p>
                                <div className="mt-6 flex gap-4">
                                    <button className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:bg-green-800">Więcej o nas →</button>
                                    <button className="border border-green-700 text-green-700 px-6 py-2 rounded-full text-sm font-semibold">Oferta</button>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-md border">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-bold">Ekogroszek Lew Plus</span>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">⭐⭐⭐ 4.7</span>
                                </div>
                                <p className="text-2xl font-bold text-green-800">1 809,00 zł <span className="text-sm line-through text-gray-400">+889,00 zł</span></p>
                                <p className="text-xs text-gray-500">Najniższa cena z 30 dni: 1 899 zł</p>
                                <button className="mt-3 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-full text-sm font-medium">Zobacz produkt</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Skup zbóż & szybkie linki */}
                <section className="py-8 border-b bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-6 flex-wrap">
                            <span className="bg-amber-50 px-4 py-2 rounded-full text-amber-800 font-semibold">🌾 Skup rzepak</span>
                            <span className="bg-amber-50 px-4 py-2 rounded-full text-amber-800 font-semibold">🌽 Skup kukurydza</span>
                            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">🔒 Bezpieczna płatność</span>
                            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">🚚 Szybka dostawa</span>
                        </div>
                        <div className="text-sm text-gray-500">© sekretariat@sobianek.pl</div>
                    </div>
                </section>

                {/* Produkty - najczęściej wybierane */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold">Nasze produkty</h2>
                            <p className="text-gray-500 mt-2">Postaw na produkty najczęściej wybierane przez naszych klientów! Sprawdzone produkty w najlepszych cenach.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((prod, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition">
                                    <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center mb-3 text-4xl">🪨</div>
                                    <h3 className="font-bold text-lg">{prod.name}</h3>
                                    <p className="text-sm text-gray-500">{prod.desc}</p>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-xl font-bold text-green-800">{prod.price}</span>
                                        {prod.oldPrice && <span className="text-sm line-through text-gray-400">{prod.oldPrice}</span>}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">⭐⭐⭐ {prod.rating}</div>
                                    <button className="mt-4 w-full bg-green-50 hover:bg-green-100 text-green-800 py-2 rounded-full text-sm font-medium">+ Do koszyka</button>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <button className="border border-green-600 text-green-700 px-8 py-2 rounded-full hover:bg-green-50">Pokaż wszystkie produkty →</button>
                        </div>
                    </div>
                </section>

                {/* Kotły i pompy ciepła + dodatkowa kategoria */}
                <section className="py-10 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold mb-6">Kotły i pompy ciepła</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {heatProducts.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-4 border">
                                    <div className="text-3xl mb-2">🔥</div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.spec}</p>
                                    <p className="text-green-800 font-bold mt-2">{item.price}</p>
                                    <button className="mt-3 text-sm bg-white border rounded-full px-4 py-1.5 w-full">Sprawdź</button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <h2 className="text-2xl font-bold mb-4">Inna promowana kategoria</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {otherCat.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border">
                                        <div className="text-2xl mb-2">🌿</div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-green-800 font-bold mt-2">{item.price}</p>
                                        <button className="mt-2 text-sm bg-gray-200 rounded-full px-3 py-1">Dodaj</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Lider sprzedaży + opinie */}
                <section className="py-12 bg-green-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <h2 className="text-3xl font-bold">Lider sprzedaży węgla i kompleksowego zaopatrzenia rolnictwa</h2>
                                <div className="flex gap-8 mt-6 flex-wrap">
                                    <div><span className="text-4xl font-bold text-green-800">+30</span><br />lat doświadczenia</div>
                                    <div><span className="text-4xl font-bold text-green-800">1 210+</span><br />pozytywnych opinii</div>
                                    <div><span className="text-4xl font-bold text-green-800">+4000</span><br />zadowolonych klientów</div>
                                </div>
                                <div className="mt-6 bg-white p-5 rounded-xl shadow">
                                    <p className="italic text-gray-600">„Tresc opinii lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim.”</p>
                                    <p className="font-bold mt-2">— Adam Kowalski, Dział Rolnictwa</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h3 className="text-xl font-bold mb-3">FORMULARZ KONTAKTOWY</h3>
                                <input type="text" placeholder="Podaj imię" className="w-full border rounded-lg p-2 mb-3" />
                                <input type="text" placeholder="Podaj nazwisko" className="w-full border rounded-lg p-2 mb-3" />
                                <input type="email" placeholder="adam.kowalski@gmail.com" className="w-full border rounded-lg p-2 mb-3" />
                                <textarea rows={3} placeholder="Treść wiadomości..." className="w-full border rounded-lg p-2 mb-3"></textarea>
                                <button className="bg-green-700 text-white py-2 rounded-lg w-full">Wyślij wiadomość</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Błękitny węgiel - artykuł */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <h2 className="text-2xl font-bold text-green-800">💙 Błękitny węgiel - innowacyjny ekogroszek w ofercie Sobianek</h2>
                                <p className="mt-3 text-gray-700">Ekogroszek Błękitny Węgiel jest odpowiedzią na obecne wymagania środowiskowe dotyczące niskiej emisji. Dzięki niemu istnieje szansa na spełnienie współczesnych norm bez kosztownych inwestycji. Unikalna metoda obróbki węgla kamiennego pozwala usunąć substancje toksyczne, uzyskując wysoką wartość opałową i niską zawartość popiołu.</p>
                                <button className="mt-4 text-green-700 font-semibold">Czytaj więcej →</button>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-800">🌲 Pelet i Ekogroszek</h2>
                                <p className="mt-3 text-gray-700">W asortymencie oferujemy popularny workowany pellet drzewny opałowy. Wraz z przystępną ceną zachowana zostaje wysoka jakość oraz wartość opałowa. Pellet to sprasowany materiał przyjazny środowisku, a popiół można wykorzystać jako nawóz.</p>
                                <div className="mt-4 flex gap-3">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Czy pellet z oferty Sobianek jest ekologiczny?</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Czy ekogroszek to paliwo ekologiczne?</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statystyki */}
                <section className="bg-gray-800 text-white py-10">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        <div><span className="text-3xl font-bold">500 000 t</span><br />Sprzedanego węgla rocznie</div>
                        <div><span className="text-3xl font-bold">150 000 t</span><br />Sprzedanych nawozów rocznie</div>
                        <div><span className="text-3xl font-bold">⭐ 4.9</span><br />Ocena na Google</div>
                    </div>
                </section>

                {/* Kolejne opinie */}
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow">
                            <p className="italic">„Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus.”</p>
                            <p className="font-bold mt-3">— Beata Nowicka, Dział Rolnictwa</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow">
                            <p className="italic">„Maecenas eget condimentum velit, sit amet feugiat lectus. Polecam produkty Sobianek!”</p>
                            <p className="font-bold mt-3">— Łukasz Nowicki</p>
                        </div>
                    </div>
                </section>

                {/* FAQ / najnowsze wpisy */}
                <section className="py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold mb-6">Pytania i odpowiedzi oraz blog</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-4 border-b pb-3"><span className="font-semibold">❓ Ile prądu pobiera kocioł na ekogroszek?</span><p className="text-sm text-gray-500 mt-1">03.08.2024 • 14 min czytania</p></div>
                                <div className="mb-4 border-b pb-3"><span className="font-semibold">❓ Ile kosztuje montaż kotła na ekogroszek?</span><p className="text-sm text-gray-500 mt-1">03.08.2024 • 14 min</p></div>
                                <div><span className="font-semibold">❓ Jaki płomień w kotle na ekogroszek?</span><p className="text-sm text-gray-500 mt-1">03.08.2024 • 14 min</p></div>
                            </div>
                            <div className="bg-green-50 p-5 rounded-xl">
                                <h3 className="font-bold text-lg">Bądź na bieżąco z naszymi nowościami</h3>
                                <div className="flex mt-3 gap-2">
                                    <input type="email" placeholder="Twój adres e-mail" className="flex-1 p-2 rounded-lg border" />
                                    <button className="bg-green-700 text-white px-4 rounded-lg">Zapisz się</button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Zapisując się do newslettera, akceptujesz regulamin serwisu</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kontakt i stopka */}
                <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white font-bold text-lg">SOBIANEK</h3>
                            <p className="text-sm mt-2">Lider na rynku sprzedaży węgla i produktów agro</p>
                            <p className="mt-3 text-sm">ul. Polna 70, 21-200 Parczew<br />📞 833 544 491<br />✉ sekretariat@sobianek.pl</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Oferta</h4>
                            <ul className="text-sm space-y-1 mt-2">
                                <li>Ekogroszek</li><li>Pellet</li><li>Kotły i pompy ciepła</li><li>Materiał siewny</li><li>Nawozy</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Informacje</h4>
                            <ul className="text-sm space-y-1 mt-2">
                                <li>O nas</li><li>Blog</li><li>Kontakt</li><li>Porady dla rolnictwa</li><li>Dostawy</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Godziny otwarcia</h4>
                            <p className="text-sm mt-2">Poniedziałek - Sobota: 08:00 - 16:00</p>
                            <div className="flex gap-2 mt-4">
                                <span className="bg-green-800 text-white text-xs px-2 py-1 rounded">Ocena 4.9 na Google</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 border-t border-gray-800 mt-10 pt-6">
                        © 2024 SOBIANEK Sp. z o.o. | Projekt i realizacja Webmetric.com
                    </div>
                </footer>
            </main>
        </div>
    );
};

// sample data
const products = [
    { name: "Ekogroszek Lew Plus", desc: "29-27 MJ/kg 1000 kg", price: "1 809,00 zł", oldPrice: "2 698 zł", rating: "4.7" },
    { name: "NovaTec One", desc: "Wieloskładnikowy nawóz", price: "1 099,00 zł", oldPrice: "", rating: "4.5" },
    { name: "Groszek Plus", desc: "Ekogroszek LEW 29-27 MJ", price: "1 099,00 zł", oldPrice: "1 299 zł", rating: "4.6" },
    { name: "Ekogroszek workowany", desc: "Wysoka jakość", price: "1 809,00 zł", oldPrice: "+889 zł", rating: "4.8" },
];

const heatProducts = [
    { name: "Kocioł Selvan SELVAN", spec: "11-21 kW", price: "7 199,00 zł" },
    { name: "Kocioł SlimKo na pellet", spec: "12-30 kW", price: "17 840,00 zł" },
    { name: "Kocioł gazowy INIDENS", spec: "20/24 kW", price: "4 999,00 zł" },
    { name: "Pompa ciepła Ovatec", spec: "Air 9kW", price: "22 990,00 zł" },
];

const otherCat = [
    { name: "NovaTec One", price: "1 099,00 zł" },
    { name: "Ekogroszek LEW Plus", price: "1 809,00 zł" },
    { name: "Groszek Plus work.", price: "1 099,00 zł" },
    { name: "Pellet drzewny", price: "1 299,00 zł" },
];

export default SobianekLanding;