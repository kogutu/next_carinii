import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    // Pobranie parametru 'name' z URL
    const searchParams = req.nextUrl.searchParams
    const name = searchParams.get('name')

    if (!name) {
        return NextResponse.json(
            { message: 'Brak parametru name' },
            { status: 400 }
        )
    }



    try {
        const desc: any = {
            "Rototherm": "Rototherm to producent specjalistycznych urządzeń grzewczych i piekarniczych dla branży gastronomicznej oraz przemysłowej. W ofercie znajdują się rozwiązania zapewniające precyzyjną kontrolę temperatury i wysoką wydajność pracy.",
            "Ahlborn": "Ahlborn specjalizuje się w systemach pomiarowych oraz urządzeniach kontrolno-diagnostycznych wykorzystywanych w przemyśle spożywczym i laboratoryjnym. Produkty marki gwarantują dokładność, niezawodność i długą żywotność.",
            "Alla France": "Alla France to renomowany producent termometrów i urządzeń kontrolnych dla gastronomii, cukiernictwa oraz przemysłu spożywczego. Sprzęt marki ceniony jest za precyzję i trwałość wykonania.",
            "Ametalurgica": "Ametalurgica dostarcza profesjonalne maszyny i komponenty dla piekarni oraz cukierni. Urządzenia tej marki wyróżniają się solidną konstrukcją i przystosowaniem do intensywnej pracy.",
            "Anneliese": "Anneliese oferuje specjalistyczne wyposażenie dla branży spożywczej, zapewniające efektywność oraz bezpieczeństwo procesów produkcyjnych.",
            "Auxpama": "Auxpama to producent rozwiązań wspierających procesy produkcyjne w gastronomii i przemyśle spożywczym. Marka stawia na funkcjonalność oraz wysoką jakość wykonania.",
            "Bake Off": "Bake Off dostarcza nowoczesne urządzenia dla piekarni i punktów typu bake-off. Produkty marki wspierają szybkie i efektywne przygotowanie świeżych wypieków.",
            "Bakon": "Bakon to specjalista w zakresie urządzeń do dozowania i dekorowania w cukiernictwie. Rozwiązania marki pozwalają na precyzyjną i powtarzalną produkcję.",
            "Bartscher": "Bartscher to uznany producent profesjonalnego wyposażenia gastronomicznego. W ofercie znajdują się urządzenia kuchenne, chłodnicze oraz grzewcze przeznaczone do intensywnej eksploatacji.",
            "Berief": "Berief dostarcza innowacyjne rozwiązania dla przemysłu spożywczego, koncentrując się na wydajności i optymalizacji procesów produkcyjnych.",
            "Bico": "Bico oferuje specjalistyczne urządzenia wspierające procesy produkcji spożywczej. Produkty marki wyróżniają się trwałością i prostotą obsługi.",
            "Bakery Tech": "Bakery Tech to producent maszyn i technologii dla piekarni przemysłowych oraz rzemieślniczych. Rozwiązania marki usprawniają produkcję i zwiększają jej efektywność.",
            "Bolarus": "Bolarus to producent profesjonalnych urządzeń chłodniczych dla gastronomii i handlu. Sprzęt marki zapewnia stabilne warunki przechowywania produktów spożywczych.",
            "Brunner Anlinker": "Brunner Anliker specjalizuje się w profesjonalnych krajalnicach i urządzeniach do obróbki warzyw. Produkty marki gwarantują precyzję cięcia i wysoką wydajność.",
            "Caotech": "Caotech to producent urządzeń do przetwarzania kakao i produkcji czekolady. Maszyny marki cenione są w przemyśle cukierniczym za jakość i niezawodność.",
            "Dc Di Candia": "Dc Di Candia oferuje maszyny i linie technologiczne dla cukiernictwa i przemysłu spożywczego, zapewniające efektywną i powtarzalną produkcję.",
            "Cebea": "Cebea dostarcza profesjonalne rozwiązania dla gastronomii oraz przemysłu spożywczego, koncentrując się na funkcjonalności i trwałości urządzeń.",
            "Diosna": "Diosna to producent miesiarek oraz systemów fermentacyjnych dla piekarni. Urządzenia marki wspierają automatyzację i kontrolę procesów produkcyjnych.",
            "Dubor": "Dubor specjalizuje się w środkach oddzielających oraz rozwiązaniach wspierających proces wypieku. Produkty marki poprawiają jakość i efektywność produkcji.",
            "Doinghaus": "Doinghaus oferuje urządzenia dla przemysłu spożywczego, zapewniające stabilność procesów i wysoką wydajność pracy.",
            "Drutec": "Drutec to producent specjalistycznych komponentów i akcesoriów dla branży spożywczej i technicznej.",
            "E2M": "E2M dostarcza rozwiązania technologiczne dla przemysłu spożywczego, wspierając optymalizację procesów produkcyjnych.",
            "Ebro": "Ebro oferuje profesjonalne urządzenia pomiarowe do kontroli temperatury i wilgotności w gastronomii i przemyśle spożywczym.",
            "Edhard": "Edhard to producent dozowników do nadzień i kremów wykorzystywanych w cukiernictwie. Urządzenia marki gwarantują precyzyjne porcjowanie.",
            "Emmedi": "Emmedi dostarcza maszyny dla przemysłu spożywczego, zapewniające wydajność i niezawodność w codziennej pracy.",
            "Evax": "Evax specjalizuje się w rozwiązaniach wspierających produkcję i pakowanie w branży spożywczej.",
            "Fenco": "Fenco to producent linii technologicznych do przetwórstwa owoców i warzyw. Marka znana jest z kompleksowych rozwiązań dla przemysłu.",
            "Fines": "Fines oferuje urządzenia i komponenty dla sektora spożywczego, łącząc solidność wykonania z funkcjonalnością.",
            "Firex": "Firex produkuje profesjonalne urządzenia do gotowania i obróbki termicznej w gastronomii oraz przemyśle spożywczym.",
            "Follet": "Follet to producent maszyn do lodów i deserów mrożonych, cenionych za jakość wykonania i niezawodność.",
            "Fortuna": "Fortuna specjalizuje się w maszynach dla piekarni, w tym dzielarkach i zaokrąglarkach do ciasta.",
            "Gel Matic": "Gel Matic to renomowany producent automatów do lodów włoskich i maszyn do mrożonych deserów.",
            "GHD Hartmann": "GHD Hartmann dostarcza profesjonalne rozwiązania pakujące dla przemysłu spożywczego.",
            "Glass": "Glass produkuje urządzenia dla piekarni i cukierni, zapewniające precyzję i wysoką jakość wykonania.",
            "Haton": "Haton specjalizuje się w liniach technologicznych do obróbki ciasta i produkcji piekarniczej.",
            "Hagesana": "Hagesana oferuje urządzenia do produkcji i porcjowania w branży cukierniczej i spożywczej.",
            "Heinen": "Heinen to producent pieców i urządzeń grzewczych dla przemysłu spożywczego.",
            "Hematronic": "Hematronic dostarcza zaawansowane systemy sterowania i automatyki dla zakładów produkcyjnych.",
            "Hert": "Hert to producent maszyn dla piekarni i przemysłu spożywczego, oferujący wydajne i trwałe rozwiązania technologiczne.",
            "Hert System": "Hert System specjalizuje się w kompleksowych systemach produkcyjnych dla piekarni i cukierni.",
            "Houno": "Houno to producent pieców konwekcyjno-parowych dla gastronomii i sektora HoReCa.",
            "Hoja Food Tec": "Hoja Food Tec dostarcza rozwiązania technologiczne dla przetwórstwa spożywczego.",
            "Innova": "Innova oferuje nowoczesne maszyny i systemy wspierające automatyzację procesów produkcyjnych.",
            "Industrial Bakery Technologies": "Industrial Bakery Technologies projektuje i wdraża linie technologiczne dla przemysłowych piekarni.",
            "Irinox": "Irinox to producent profesjonalnych szokówek i urządzeń chłodniczych dla gastronomii.",
            "Jac": "Jac specjalizuje się w krajalnicach do pieczywa wykorzystywanych w piekarniach i sklepach.",
            "Jeros": "Jeros produkuje urządzenia myjące i systemy higieniczne dla przemysłu spożywczego.",
            "Kalte Rudi": "Kalte Rudi dostarcza urządzenia chłodnicze dla gastronomii i handlu.",
            "Kastel": "Kastel to producent kostkarek i maszyn do lodu dla sektora HoReCa.",
            "Kempf": "Kempf specjalizuje się w urządzeniach wspierających produkcję piekarniczą.",
            "Kemper": "Kemper to producent profesjonalnych miesiarek spiralnych i systemów do obróbki ciasta.",
            "Komza": "Komza oferuje maszyny dla branży spożywczej, zapewniające niezawodność i trwałość.",
            "Koti Kobra": "Koti Kobra dostarcza rozwiązania szczotkarskie i czyszczące dla przemysłu.",
            "Krumbein": "Krumbein produkuje maszyny do formowania i dekorowania wyrobów cukierniczych.",
            "Krüger & Salecker": "Krüger & Salecker oferuje specjalistyczne rozwiązania dla przemysłu spożywczego.",
            "Kwik Lok": "Kwik Lok to producent systemów zamykania opakowań pieczywa i produktów spożywczych.",
            "Langheinz": "Langheinz dostarcza maszyny dla przemysłu spożywczego, wspierające wydajną produkcję.",
            "Lantech": "Lantech specjalizuje się w systemach owijania i pakowania palet.",
            "Lauterjung": "Lauterjung to producent profesjonalnych noży i narzędzi dla przemysłu spożywczego.",
            "Liebherr": "Liebherr to światowy producent urządzeń chłodniczych i mroźniczych dla gastronomii i przemysłu.",
            "Lincat": "Lincat oferuje profesjonalne wyposażenie kuchni gastronomicznych.",
            "Longoni": "Longoni dostarcza maszyny dla przemysłu cukierniczego i piekarniczego.",
            "Lumitech": "Lumitech produkuje systemy oświetleniowe dla przemysłu i handlu.",
            "Masdac": "Masdac to producent maszyn dla cukiernictwa i przetwórstwa spożywczego.",
            "Merand": "Merand specjalizuje się w automatycznych liniach do obróbki i dzielenia ciasta.",
            "MFT": "MFT dostarcza rozwiązania technologiczne dla branży spożywczej.",
            "MHS": "MHS to producent krajalnic przemysłowych do pieczywa i żywności.",
            "Minipan": "Minipan produkuje linie technologiczne dla piekarni i cukierni.",
            "MKN": "MKN to producent profesjonalnych urządzeń kuchennych klasy premium dla gastronomii.",
            "Moduline": "Moduline oferuje piece i urządzenia do regeneracji potraw w gastronomii.",
            "NBS-Schumann": "NBS-Schumann specjalizuje się w systemach dozowania i natłuszczania form piekarniczych.",
            "Nemox": "Nemox produkuje maszyny do lodów i urządzenia chłodnicze.",
            "Nilma": "Nilma dostarcza urządzenia do przygotowania i obróbki żywności w gastronomii.",
            "Niverplast": "Niverplast to producent systemów pakowania dla przemysłu spożywczego.",
            "Ohaus": "Ohaus to renomowany producent wag laboratoryjnych i przemysłowych.",
            "Paktrend": "Paktrend oferuje rozwiązania pakujące dla branży spożywczej.",
            "Panem": "Panem produkuje maszyny dla piekarni, w tym krajalnice i systemy transportowe.",
            "Precisma": "Precisma dostarcza precyzyjne rozwiązania dla przemysłu spożywczego.",
            "Procys": "Procys specjalizuje się w systemach dozowania i automatyzacji produkcji.",
            "Przybyś": "Przybyś to producent maszyn dla piekarni i cukierni, cenionych za solidność wykonania.",
            "Rademaker": "Rademaker projektuje przemysłowe linie produkcyjne dla wyrobów piekarniczych.",
            "Rheon": "Rheon specjalizuje się w automatycznych systemach formowania i nadziewania produktów spożywczych.",
            "Ringo Plast": "Ringo Plast produkuje opakowania i komponenty z tworzyw sztucznych dla przemysłu spożywczego.",
            "Rilling": "Rilling oferuje maszyny i urządzenia dla branży spożywczej.",
            "Roboqbo": "Roboqbo to producent urządzeń do przetwórstwa i gotowania produktów spożywczych.",
            "Sancassiano": "Sancassiano specjalizuje się w liniach produkcyjnych dla wyrobów cukierniczych.",
            "Sanomat": "Sanomat produkuje urządzenia do napojów mlecznych i systemy dozujące.",
            "Saleen": "Saleen dostarcza rozwiązania technologiczne dla przemysłu spożywczego.",
            "Sasa": "Sasa oferuje specjalistyczne maszyny dla branży spożywczej.",
            "Scaritech": "Scaritech dostarcza rozwiązania technologiczne wspierające automatyzację produkcji.",
            "Schomaker": "Schomaker produkuje urządzenia i komponenty dla przemysłu spożywczego.",
            "Schneider": "Schneider oferuje profesjonalne akcesoria i narzędzia dla piekarni oraz cukierni.",
            "Shuffle-Mix": "Shuffle-Mix specjalizuje się w mieszalnikach i systemach dozowania.",
            "Sispo": "Sispo dostarcza rozwiązania dla przemysłu spożywczego, zapewniające niezawodność i efektywność.",
            "SPM": "SPM to producent maszyn do granity, napojów mrożonych i deserów.",
            "Tecfrigo": "Tecfrigo oferuje urządzenia chłodnicze i witryny ekspozycyjne dla gastronomii.",
            "TFT": "TFT dostarcza rozwiązania technologiczne dla przemysłu spożywczego.",
            "Unifiller": "Unifiller specjalizuje się w systemach dozowania i porcjowania produktów spożywczych.",
            "Unimac-Gherri": "Unimac-Gherri produkuje maszyny dla przemysłu cukierniczego i piekarniczego.",
            "Ultrapower": "Ultrapower dostarcza rozwiązania technologiczne dla produkcji spożywczej.",
            "Weisse": "Weisse to producent urządzeń piekarniczych i technologii wypieku.",
            "Wyoblarz": "Wyoblarz specjalizuje się w maszynach dla branży spożywczej i metalowej.",
            "Whirlpool": "Whirlpool to światowy producent urządzeń chłodniczych i gastronomicznych.",
            "WP Riehle": "WP Riehle produkuje maszyny dla piekarni i cukierni, w tym piece i urządzenia do smażenia.",
            "Varimixer": "Varimixer to producent profesjonalnych mikserów planetarnych dla gastronomii.",
            "Zacmi": "Zacmi dostarcza linie pakujące i systemy technologiczne dla przemysłu spożywczego.",
            "Zeppelin": "Zeppelin oferuje systemy transportu i magazynowania surowców dla przemysłu.",
            "ZCH Góra": "ZCH Góra to producent urządzeń i rozwiązań technologicznych dla branży spożywczej."
        };

        const logs = ["https://www.hert.pl/media/logo/webp/edhard.png", "https://www.hert.pl/media/logo/webp/gel_matic.jpg", "https://www.hert.pl/media/logo/webp/ghd_hartmann.svg", "https://www.hert.pl/media/logo/webp/auxpama.webp", "https://www.hert.pl/media/logo/webp/bakeoff.webp", "https://www.hert.pl/media/logo/webp/bakon.webp", "https://www.hert.pl/media/logo/webp/bartscher.webp", "https://www.hert.pl/media/logo/webp/bazz.webp", "https://www.hert.pl/media/logo/webp/bolarus.webp", "https://www.hert.pl/media/logo/webp/brunner.webp", "https://www.hert.pl/media/logo/webp/cebea.webp", "https://www.hert.pl/media/logo/webp/drutec.webp", "https://www.hert.pl/media/logo/webp/dubor.webp", "https://www.hert.pl/media/logo/webp/e2m.webp", "https://www.hert.pl/media/logo/webp/edhad.webp", "https://www.hert.pl/media/logo/webp/emmedi.webp", "https://www.hert.pl/media/logo/webp/fines.webp", "https://www.hert.pl/media/logo/webp/firex.webp", "https://www.hert.pl/media/logo/webp/follettt.webp", "https://www.hert.pl/media/logo/webp/glass.webp", "https://www.hert.pl/media/logo/webp/hagesana.webp", "https://www.hert.pl/media/logo/webp/hartmann.webp", "https://www.hert.pl/media/logo/webp/haton.webp", "https://www.hert.pl/media/logo/webp/heinen.webp", "https://www.hert.pl/media/logo/webp/hematronic.webp", "https://www.hert.pl/media/logo/webp/hoja.webp", "https://www.hert.pl/media/logo/webp/innova.webp", "https://www.hert.pl/media/logo/webp/jeros.webp", "https://www.hert.pl/media/logo/webp/kastel.webp", "https://www.hert.pl/media/logo/webp/komza.webp", "https://www.hert.pl/media/logo/webp/kruger.webp", "https://www.hert.pl/media/logo/webp/krumbein.webp", "https://www.hert.pl/media/logo/webp/langheinz.webp", "https://www.hert.pl/media/logo/webp/lantech.webp", "https://www.hert.pl/media/logo/webp/liebherr.webp", "https://www.hert.pl/media/logo/webp/longoni.webp", "https://www.hert.pl/media/logo/webp/lumitech.webp", "https://www.hert.pl/media/logo/webp/merand.webp", "https://www.hert.pl/media/logo/webp/mft.webp", "https://www.hert.pl/media/logo/webp/mhs.webp", "https://www.hert.pl/media/logo/webp/mkn.webp", "https://www.hert.pl/media/logo/webp/moduline.webp", "https://www.hert.pl/media/logo/webp/nbs.webp", "https://www.hert.pl/media/logo/webp/nemox.webp", "https://www.hert.pl/media/logo/webp/niverplast.webp", "https://www.hert.pl/media/logo/webp/node", "https://www.hert.pl/media/logo/webp/panem.webp", "https://www.hert.pl/media/logo/webp/pliki.json", "https://www.hert.pl/media/logo/webp/rheon.webp", "https://www.hert.pl/media/logo/webp/rilling.webp", "https://www.hert.pl/media/logo/webp/roboqbo.webp", "https://www.hert.pl/media/logo/webp/sanomat.webp", "https://www.hert.pl/media/logo/webp/schomaker.webp", "https://www.hert.pl/media/logo/webp/shufflemix.webp", "https://www.hert.pl/media/logo/webp/text.log", "https://www.hert.pl/media/logo/webp/unifiller.webp", "https://www.hert.pl/media/logo/webp/unimac_gherri.webp", "https://www.hert.pl/media/logo/webp/varimixer.webp", "https://www.hert.pl/media/logo/webp/weisse.webp", "https://www.hert.pl/media/logo/webp/werner.webp", "https://www.hert.pl/media/logo/webp/whirlpooll.webp", "https://www.hert.pl/media/logo/webp/wp_haton.webp", "https://www.hert.pl/media/logo/webp/wp_kemper.webp", "https://www.hert.pl/media/logo/webp/wp_riehle.webp", "https://www.hert.pl/media/logo/webp/zacmi.webp", "https://www.hert.pl/media/logo/webp/zeppelin.webp"]


        let n = name.toLowerCase().replaceAll(" ", "_");
        const logo = logs.filter(e => {
            if (e.includes(n)) {
                return e
            }
        })

        return NextResponse.json(
            {
                success: true,
                desc: desc[name] || "",
                logo: logo[0],

            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[v0] Error processing order:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Błąd serwera' },
            { status: 500 }
        )
    }



}

