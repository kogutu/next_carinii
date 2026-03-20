import { createSlug } from "@/utils/slugify";

export function getLogos() {
    return ["/logos/edhard.png",
        "/logos/kalte_rudi.png",
        "/logos/gel_matic.jpg", "/logos/ghd_hartmann.svg", "/logos/auxpama.webp", "/logos/bakeoff.webp", "/logos/bakon.webp", "/logos/bartscher.webp", "/logos/bazz.webp", "/logos/bolarus.webp", "/logos/brunner.webp", "/logos/cebea.webp", "/logos/drutec.webp", "/logos/dubor.webp", "/logos/e2m.webp", "/logos/edhad.webp", "/logos/emmedi.webp", "/logos/fines.webp", "/logos/firex.webp", "/logos/follettt.webp", "/logos/glass.webp", "/logos/hagesana.webp", "/logos/hartmann.webp", "/logos/haton.webp", "/logos/heinen.webp", "/logos/hematronic.webp", "/logos/hoja.webp", "/logos/innova.webp", "/logos/jeros.webp", "/logos/kastel.webp", "/logos/komza.webp", "/logos/kruger.webp", "/logos/krumbein.webp", "/logos/langheinz.webp", "/logos/lantech.webp", "/logos/liebherr.webp", "/logos/longoni.webp", "/logos/lumitech.webp", "/logos/merand.webp", "/logos/mft.webp", "/logos/mhs.webp", "/logos/mkn.webp", "/logos/moduline.webp", "/logos/nbs.webp", "/logos/nemox.webp", "/logos/niverplast.webp", "/logos/node", "/logos/panem.webp", "/logos/pliki.json", "/logos/rheon.webp", "/logos/rilling.webp", "/logos/roboqbo.webp", "/logos/sanomat.webp", "/logos/schomaker.webp", "/logos/shufflemix.webp", "/logos/text.log", "/logos/unifiller.webp", "/logos/unimac_gherri.webp", "/logos/varimixer.webp", "/logos/weisse.webp", "/logos/werner.webp", "/logos/whirlpooll.webp", "/logos/wp_haton.webp", "/logos/wp_kemper.webp", "/logos/wp_riehle.webp", "/logos/zacmi.webp", "/logos/zeppelin.webp"];
}
export function getLogo(name: string) {
    const logs = getLogos();
    let n = name.toLowerCase().replaceAll(" ", "_");
    const logo = logs.filter(e => {
        if (e.includes(n)) {
            return e
        }
    })
    if (!logo[0]) {
        return false;
    }


    return logo[0]; ''
}
export function getBrandData(name?: string) {


    if (!name) {
        return "";
    }



    try {
        const desc: any = [
            {
                "manufacturer": "Rototherm",
                "description": "Rototherm to renomowany producent profesjonalnych urządzeń grzewczych i piekarniczych, którego historia sięga XIX wieku. Firma specjalizuje się w wytwarzaniu precyzyjnych termometrów oraz zaawansowanych pieców konwekcyjno-parowych, które znajdują zastosowanie w przemyśle spożywczym na całym świecie. Urządzenia Rototherm cechują się niezwykłą trwałością, równomiernym rozprowadzaniem ciepła oraz intuicyjnymi systemami sterowania, co gwarantuje powtarzalność wypieków i doskonałe efekty w każdej profesjonalnej piekarni czy cukierni."
            },
            {
                "manufacturer": "Ahlborn",
                "description": "Ahlborn to niemiecka firma o ugruntowanej pozycji w dziedzinie techniki pomiarowej i rejestracji danych. Specjalizuje się w produkcji precyzyjnych termometrów, higrometrów oraz zaawansowanych rejestratorów danych, które są niezbędne w procesach produkcyjnych wymagających ścisłej kontroli parametrów. W piekarnictwie i cukiernictwie urządzenia Ahlborn pozwalają na monitorowanie temperatury wypieku, wilgotności w garowniach oraz warunków przechowywania, co przekłada się na najwyższą jakość i bezpieczeństwo produktów."
            },
            {
                "manufacturer": "Alla France",
                "description": "Alla France to francuski producent, który od lat dostarcza najwyższej jakości akcesoria cukiernicze i piekarnicze. Firma słynie z eleganckich form do wypieków, blach, rękawów cukierniczych oraz drobnego sprzętu, który łączy w sobie funkcjonalność z estetyką. Produkty Alla France są cenione przez profesjonalistów za precyzję wykonania, trwałość oraz dbałość o detale, co pozwala na tworzenie wyjątkowych wypieków i deserów o doskonałym wyglądzie."
            },
            {
                "manufacturer": "Ametalurgica",
                "description": "Ametalurgica to brazylijski producent maszyn dla przemysłu spożywczego, specjalizujący się w urządzeniach do obróbki ciasta. Firma oferuje szeroką gamę mieszarek, dzielarek, zaokrąglarek oraz linii produkcyjnych, które charakteryzują się solidną konstrukcją i wydajnością dostosowaną do potrzeb średnich i dużych zakładów piekarniczych. Maszyny Ametalurgica są projektowane z myślą o długotrwałej eksploatacji w trudnych warunkach produkcyjnych, co czyni je niezawodnym wyborem dla wymagających producentów."
            },
            {
                "manufacturer": "Anneliese",
                "description": "Anneliese to niemiecka marka znana z produkcji praktycznych akcesoriów i wyposażenia pomocniczego dla piekarni i cukierni. W ofercie znajdują się między innymi wózki transportowe, stoły robocze, pojemniki do przechowywania oraz drobne narzędzia usprawniające codzienną pracę. Produkty Anneliese cechują się ergonomicznym designem, wysoką jakością wykonania oraz dbałością o detale, co sprawia, że są chętnie wybierane przez profesjonalistów poszukujących funkcjonalnych i trwałych rozwiązań."
            },
            {
                "manufacturer": "Auxpama",
                "description": "Auxpama to specjalista w dziedzinie urządzeń pakujących i systemów termokurczliwych. Firma oferuje zaawansowane maszyny do pakowania produktów spożywczych, w tym pieczywa i wyrobów cukierniczych, które zapewniają szczelność, estetykę oraz wydłużają trwałość produktów. Rozwiązania Auxpama charakteryzują się wysoką wydajnością, niezawodnością oraz łatwością obsługi, co pozwala na optymalizację procesów pakowania w zakładach produkcyjnych różnej wielkości."
            },
            {
                "manufacturer": "Bake Off",
                "description": "Bake Off to marka specjalizująca się w kompleksowych rozwiązaniach dla systemu piekarnia w sklepie. Oferta obejmuje piece konwekcyjne, lady odroczonego wypieku, schładzarki oraz akcesoria niezbędne do prowadzenia punktu sprzedaży świeżego pieczywa. Urządzenia Bake Off są zaprojektowane z myślą o łatwości obsługi, kompaktowych rozmiarach i szybkim osiąganiu optymalnych parametrów pracy, co pozwala na serwowanie klientom wypieków o jakości porównywalnej z tradycyjną piekarnią."
            },
            {
                "manufacturer": "Bakon",
                "description": "Bakon to holenderski producent o ugruntowanej pozycji w dziedzinie krajalnic i urządzeń do porcjowania pieczywa. Firma od lat dostarcza maszyny charakteryzujące się precyzyjnym cięciem, wysoką wydajnością oraz zaawansowanymi systemami bezpieczeństwa. Krajalnice Bakon radzą sobie zarówno z miękkim pieczywem, jak i chlebem o twardej skórce, gwarantując estetyczne i równe plastry bez gniecenia struktury miąższu. To niezawodne rozwiązanie dla piekarni, hoteli i dużych zakładów gastronomicznych."
            },
            {
                "manufacturer": "Bartscher",
                "description": "Bartscher to jeden z wiodących europejskich dostawców wyposażenia dla gastronomii i piekarnictwa. Szeroki asortyment obejmuje wszystko, od drobnego sprzętu, przez urządzenia chłodnicze, aż po zaawansowane piece konwekcyjne i zmywarki. Produkty Bartscher są cenione za solidne wykonanie, funkcjonalność i atrakcyjny stosunek jakości do ceny. Firma nieustannie rozwija swoją ofertę, odpowiadając na zmieniające się potrzeby rynku i oczekiwania profesjonalnych użytkowników."
            },
            {
                "manufacturer": "Berief",
                "description": "Berief to firma specjalizująca się w nowoczesnych systemach wałkujących i rozwałkowujących ciasto. Technologia oferowana przez Berief umożliwia automatyczną i precyzyjną obróbkę różnych rodzajów ciasta, w tym francuskiego, kruchego i drożdżowego. Maszyny Berief zapewniają równomierną grubość ciasta na całej powierzchni, co jest kluczowe dla uzyskania doskonałych efektów w produkcji rogalików, chałek czy pizzy. To idealne rozwiązanie dla średnich i dużych zakładów piekarniczych."
            },
            {
                "manufacturer": "Bico",
                "description": "Bico to włoski producent maszyn do produkcji pizzy i pieczywa, łączący w swoich urządzeniach tradycyjne włoskie rzemiosło z nowoczesnymi technologiami. Oferta firmy obejmuje niezawodne mieszarki, dzielarki do ciasta oraz piece, które zapewniają optymalne warunki wypieku. Maszyny Bico są cenione za prostotę obsługi, trwałość i doskonałe efekty końcowe, co sprawia, że chętnie wybierają je zarówno pizzerie, jak i profesjonalne piekarnie."
            },
            {
                "manufacturer": "Bakery Tech",
                "description": "Bakery Tech to innowacyjna firma projektująca i dostarczająca zaawansowane technologie dla nowoczesnych piekarni. Specjalizuje się w kompleksowych liniach produkcyjnych oraz pojedynczych urządzeniach, które optymalizują proces wypieku i zwiększają efektywność produkcji. Rozwiązania Bakery Tech charakteryzują się wysokim stopniem automatyzacji, precyzją wykonania oraz dbałością o detale, co pozwala klientom osiągać najwyższą jakość wyrobów przy jednoczesnym obniżeniu kosztów operacyjnych."
            },
            {
                "manufacturer": "Bolarus",
                "description": "Bolarus to specjalista w dziedzinie termoobiegów i urządzeń chłodniczych dla przemysłu spożywczego. Szeroka oferta firmy obejmuje szafy chłodnicze, tunele schładzalnicze oraz zaawansowane schładzalniki, które zapewniają szybkie i efektywne obniżanie temperatury produktów. Urządzenia Bolarus gwarantują utrzymanie najwyższej jakości wyrobów piekarniczych i cukierniczych poprzez kontrolowane procesy chłodzenia, co jest kluczowe dla zachowania świeżości i przedłużenia trwałości."
            },
            {
                "manufacturer": "Brunner Anlinker",
                "description": "Brunner Anlinker to niemiecka firma o wieloletniej tradycji w produkcji urządzeń do mycia i dezynfekcji dla przemysłu spożywczego. Specjalizuje się w zaawansowanych technologiach mycia wózków, blach, pojemników i innych elementów wyposażenia piekarni. Maszyny Brunner Anlinker zapewniają najwyższy standard higieny, są energooszczędne i zaprojektowane z myślą o długotrwałej, bezawaryjnej pracy w wymagającym środowisku produkcyjnym."
            },
            {
                "manufacturer": "Caotech",
                "description": "Caotech to holenderski lider w produkcji maszyn do przetwórstwa kakao, czekolady i mas orzechowych. Firma oferuje zaawansowane urządzenia do mielenia, rafinowania i mieszania, które gwarantują uzyskanie doskonałej konsystencji i smaku. Technologia Caotech jest ceniona przez producentów czekolady i wyrobów cukierniczych na całym świecie za precyzję, niezawodność i innowacyjne rozwiązania dostosowane do indywidualnych potrzeb klientów."
            },
            {
                "manufacturer": "Dc Di Candia",
                "description": "Dc Di Candia to włoska firma z bogatą tradycją w produkcji maszyn dla lodziarstwa i cukiernictwa. Specjalizuje się w urządzeniach do temperowania, pasteryzacji i przechowywania mas lodowych, łącząc w sobie klasyczne włoskie wzornictwo z nowoczesnymi rozwiązaniami technologicznymi. Produkty Dc Di Candia są cenione przez profesjonalnych producentów lodów za niezawodność, precyzję i dbałość o detale, co pozwala na tworzenie wyjątkowych deserów o doskonałej konsystencji."
            },
            {
                "manufacturer": "Cebea",
                "description": "Cebea to włoska firma specjalizująca się w projektowaniu i produkcji kompletnych linii technologicznych do wytwarzania herbatników, sucharków i wafelków. Dzięki wieloletniemu doświadczeniu i zaawansowanej inżynierii, Cebea oferuje rozwiązania, które zapewniają wysoką wydajność, precyzję i powtarzalność procesów produkcyjnych. Maszyny Cebea są synonimem najwyższej jakości w branży piekarniczej, łącząc innowacyjność z tradycyjnymi recepturami."
            },
            {
                "manufacturer": "Diosna",
                "description": "Diosna to niemiecki producent o światowej renomie w dziedzinie mieszarek i urządzeń do przygotowania ciasta. Firma oferuje szeroką gamę produktów, od kompaktowych mieszarek dla małych piekarni po zaawansowane systemy do automatycznego dozowania i mieszania składników dla dużych zakładów przemysłowych. Urządzenia Diosna są synonimem niezawodności, precyzji i innowacyjności, gwarantując optymalne przygotowanie ciasta o doskonałej strukturze."
            },
            {
                "manufacturer": "Dubor",
                "description": "Dubor to włoski producent pieców i linii technologicznych do produkcji pizzy, chleba oraz wyrobów ciastkarskich. Firma łączy w swoich urządzeniach klasyczne włoskie wzornictwo z najnowszymi technologiami oszczędzania energii i optymalizacji procesów wypieku. Piece Dubor zapewniają równomierne rozprowadzanie ciepła i doskonałe efekty końcowe, co doceniają profesjonaliści na całym świecie, poszukujący niezawodnych i wydajnych rozwiązań."
            },
            {
                "manufacturer": "Doinghaus",
                "description": "Doinghaus to niemiecki specjalista w produkcji precyzyjnych urządzeń dozujących i porcjujących dla przemysłu spożywczego. Firma dostarcza zaawansowane systemy, które umożliwiają automatyzację linii produkcyjnych i zapewniają dokładne odmierzanie składników. Rozwiązania Doinghaus charakteryzują się wysoką powtarzalnością, niezawodnością i łatwością integracji z istniejącymi liniami technologicznymi, co pozwala na optymalizację procesów i redukcję odpadów."
            },
            {
                "manufacturer": "Drutec",
                "description": "Drutec to firma specjalizująca się w produkcji maszyn do drutowania i cięcia ciast. Urządzenia Drutec umożliwiają szybkie, precyzyjne i estetyczne porcjowanie różnego rodzaju wyrobów cukierniczych, takich jak ciasta, torty czy desery. Dzięki zaawansowanej technologii cięcia drutem, maszyny zapewniają czyste i równe krawędzie, nie deformując delikatnej struktury wyrobów. To niezawodne rozwiązanie dla cukierni i zakładów produkcyjnych."
            },
            {
                "manufacturer": "E2M",
                "description": "E2M to innowacyjna firma specjalizująca się w systemach pakowania próżniowego i pakowania w modyfikowanej atmosferze. Technologie oferowane przez E2M pozwalają na znaczne wydłużenie świeżości pieczywa i wyrobów cukierniczych poprzez ograniczenie dostępu tlenu i kontrolowanie składu atmosfery wewnątrz opakowania. Urządzenia E2M są cenione za niezawodność, efektywność i łatwość obsługi, co czyni je idealnym rozwiązaniem dla producentów dbających o jakość i trwałość swoich produktów."
            },
            {
                "manufacturer": "Ebro",
                "description": "Ebro to renomowany producent precyzyjnej techniki wagowej dla przemysłu spożywczego. Firma oferuje szeroką gamę wag, systemów dozujących i urządzeń kontrolnych, które gwarantują dokładność pomiarów i zgodność z rygorystycznymi normami. Wagi Ebro są niezastąpione w procesach produkcyjnych wymagających precyzyjnego odmierzania składników, kontroli porcji oraz etykietowania produktów. To synonim niezawodności i najwyższej jakości w dziedzinie ważenia."
            },
            {
                "manufacturer": "Edhard",
                "description": "Edhard to amerykański producent maszyn do nadziewania i porcjowania, ceniony za niezawodność i wszechstronność. Urządzenia Edhard są niezbędne przy produkcji nadziewanych pączków, eklerów, babeczek i innych wyrobów cukierniczych. Dzięki precyzyjnym systemom dozowania, maszyny te umożliwiają równomierne i powtarzalne napełnianie wyrobów różnego rodzaju nadzieniami, od dżemów i kremów po masy serowe. To idealne rozwiązanie dla cukierni poszukujących wydajnych i łatwych w obsłudze urządzeń."
            },
            {
                "manufacturer": "Emmedi",
                "description": "Emmedi to włoski producent maszyn do produkcji makaronów i ciast, łączący tradycyjne włoskie rzemiosło z nowoczesnymi technologiami. Oferta firmy obejmuje szeroki wybór urządzeń, od wałkownic i gniotowników po zaawansowane linie do produkcji makaronów. Maszyny Emmedi sprawdzają się zarówno w restauracjach i małych zakładach, jak i w przemysłowej produkcji na dużą skalę, gwarantując doskonałą jakość i wydajność."
            },
            {
                "manufacturer": "Evax",
                "description": "Evax to specjalista w dziedzinie pakowania próżniowego i zgrzewania. Firma oferuje niezawodne maszyny pakujące dla małych i średnich zakładów produkcyjnych, które dbają o jakość i trwałość swoich produktów. Urządzenia Evax są cenione za prostotę obsługi, kompaktowe rozmiary i skuteczność w przedłużaniu świeżości pieczywa i wyrobów cukierniczych. To ekonomiczne i efektywne rozwiązanie dla producentów poszukujących sprawdzonych technologii pakowania."
            },
            {
                "manufacturer": "Fenco",
                "description": "Fenco dostarcza zaawansowane systemy do transportu i przechowywania ciasta, projektowane z myślą o optymalizacji logistyki w nowoczesnych piekarniach. Oferowane rozwiązania obejmują przenośniki, pojemniki i systemy automatyzacji przepływu materiałów, które usprawniają procesy produkcyjne i minimalizują ryzyko uszkodzenia delikatnego ciasta. Fenco to gwarancja wydajności i niezawodności w zarządzaniu produkcją piekarniczą."
            },
            {
                "manufacturer": "Fines",
                "description": "Fines to włoski producent maszyn do mielenia, mieszania i emulgowania, ceniony przez wymagających producentów za doskonałą jakość i precyzję wykonania. Urządzenia Fines umożliwiają uzyskanie perfekcyjnej konsystencji różnego rodzaju mas, kremów i emulsji, co jest kluczowe w produkcji wyrobów cukierniczych i spożywczych. Dzięki zaawansowanej technologii i dbałości o detale, maszyny Fines zapewniają powtarzalność procesów i najwyższą jakość produktów."
            },
            {
                "manufacturer": "Firex",
                "description": "Firex to włoski producent pieców i linii technologicznych do produkcji chleba, pizzy oraz wyrobów cukierniczych. Firma łączy innowacyjne rozwiązania z tradycyjnym włoskim podejściem do wypieku, oferując urządzenia, które zapewniają doskonałe efekty końcowe i wysoką wydajność. Piece Firex charakteryzują się równomiernym rozprowadzaniem ciepła, precyzyjną kontrolą parametrów i solidną konstrukcją, co doceniają profesjonaliści na całym świecie."
            },
            {
                "manufacturer": "Follet",
                "description": "Follet to specjalista w produkcji dozowników i systemów nalewania, zaprojektowanych z myślą o higienie i precyzji w dozowaniu płynnych składników. Oferta Follet obejmuje urządzenia dozujące mleko, soki, oleje i inne płyny, które znajdują zastosowanie w piekarniach, cukierniach i zakładach gastronomicznych. Produkty Follet są cenione za niezawodność, łatwość czyszczenia i dokładność dozowania, co minimalizuje straty i zapewnia powtarzalność receptur."
            },
            {
                "manufacturer": "Fortuna",
                "description": "Fortuna to austriacki producent maszyn do produkcji pączków i wyrobów smażonych, synonim jakości i niezawodności w automatyzacji procesu smażenia. Urządzenia Fortuna gwarantują równomierne smażenie, doskonały wygląd i smak pączków, przy jednoczesnym zachowaniu wysokiej wydajności i niskiego zużycia tłuszczu. Dzięki zaawansowanej technologii i precyzyjnemu sterowaniu, maszyny Fortuna pozwalają na uzyskanie powtarzalnych, doskonałych efektów za każdym razem."
            },
            {
                "manufacturer": "Gel Matic",
                "description": "Gel Matic to włoski producent maszyn i urządzeń dla lodziarstwa i cukiernictwa, oferujący kompleksowe wyposażenie profesjonalnych lodziarni. W ofercie znajdują się lady chłodnicze, pasteryzatory, frysery oraz systemy do przechowywania i podawania lodów. Produkty Gel Matic łączą w sobie nowoczesny design, funkcjonalność i niezawodność, zapewniając optymalne warunki produkcji i ekspozycji lodów, co doceniają zarówno producenci, jak i klienci."
            },
            {
                "manufacturer": "GHD Hartmann",
                "description": "GHD Hartmann to niemiecki producent urządzeń myjących i dezynfekujących dla przemysłu spożywczego, oferujący zaawansowane technologie mycia wózków, pojemników, blach i tac. Maszyny GHD Hartmann zapewniają najwyższy standard higieny, są energooszczędne i zaprojektowane z myślą o intensywnej, wieloletniej eksploatacji w wymagających warunkach zakładów produkcyjnych. To niezawodne rozwiązanie dla firm dbających o czystość i bezpieczeństwo swoich produktów."
            },
            {
                "manufacturer": "Glass",
                "description": "Glass to specjalista w produkcji szyb i osłon ochronnych do lad i ekspozycji, oferujący elementy szklane, które zapewniają estetyczny wygląd i bezpieczeństwo w punktach sprzedaży. Produkty Glass charakteryzują się wysoką jakością wykonania, precyzyjnym cięciem i dbałością o detale. Szyby i osłony Glass nie tylko chronią produkty przed zabrudzeniem i dostępem klientów, ale także podkreślają ich atrakcyjny wygląd, co wpływa na zwiększenie sprzedaży."
            },
            {
                "manufacturer": "Haton",
                "description": "Haton to belgijski producent maszyn do produkcji wafli, gofrów i ciastek, ceniony za tradycyjne receptury i nowoczesne technologie. Urządzenia Haton pozwalają na uzyskanie doskonałych, chrupiących wafli i gofrów o niepowtarzalnym smaku, który doceniają klienci na całym świecie. Firma oferuje zarówno kompaktowe maszyny dla małych punktów gastronomicznych, jak i zaawansowane linie produkcyjne dla przemysłu, zawsze z zachowaniem najwyższej jakości i dbałości o detale."
            },
            {
                "manufacturer": "Hagesana",
                "description": "Hagesana to specjalista w produkcji krajalnic i urządzeń do porcjowania chleba, oferujący precyzyjne i bezpieczne maszyny, które są niezbędne w każdej nowoczesnej piekarni. Krajalnice Hagesana zapewniają równe i estetyczne plastry, nie gniotąc delikatnego miąższu, a zaawansowane systemy bezpieczeństwa chronią operatora przed skaleczeniem. To niezawodne rozwiązanie dla piekarni, hoteli i sklepów, które chcą oferować klientom pieczywo pokrojone w atrakcyjny i wygodny sposób."
            },
            {
                "manufacturer": "Heinen",
                "description": "Heinen to niemiecki producent systemów wentylacyjnych i klimatyzacyjnych dla zakładów produkcyjnych, oferujący rozwiązania zapewniające optymalny klimat w pomieszczeniach. Systemy Heinen skutecznie usuwają zanieczyszczenia, parę wodną i nadmiar ciepła, co przekłada się na komfort pracy personelu i jakość produkowanych wyrobów. Dzięki zaawansowanej technologii i energooszczędnym rozwiązaniom, Heinen pomaga tworzyć zdrowe i wydajne środowisko pracy w piekarniach i cukierniach."
            },
            {
                "manufacturer": "Hematronic",
                "description": "Hematronic to producent urządzeń do znakowania i kodowania opakowań, oferujący niezawodne drukarki i etykieciarki, które zapewniają czytelne i trwałe oznakowanie produktów. Maszyny Hematronic umożliwiają drukowanie dat ważności, partii produkcyjnych, kodów kreskowych i innych informacji na różnego rodzaju opakowaniach, w tym na workach, tackach i etykietach. To niezbędne wyposażenie dla firm dbających o identyfikowalność i zgodność z przepisami."
            },
            {
                "manufacturer": "Hert",
                "description": "Hert to polska firma, która od ponad 25 lat wyznacza standardy w branży maszyn dla piekarnictwa i cukiernictwa, będąc nie tylko dostawcą, ale przede wszystkim partnerem technologicznym dla nowoczesnych zakładów produkcyjnych. Strategia Hert opiera się na łączeniu sprawdzonych, często niemieckich technologii z elastycznością i dogłębnym zrozumieniem potrzeb lokalnego rynku, co zaowocowało wprowadzeniem do oferty kultowych już pieców Matador. Sztandarowym przykładem filozofii Hert są modułowe linie do produkcji chleba, których wyjątkowość polega na umiejętnym połączeniu automatyzacji z niezwykle delikatnym traktowaniem ciasta, co pozwala na zachowanie jego struktury i objętości. Dzięki modułowej rozbudowie, inwestycję można rozpocząć od zakupu dzielarki, a z czasem rozbudowywać linię o wydłużarki, zaokrąglarki czy międzygarownie, idealnie dopasowując ją do zmieniających się potrzeb i skali produkcji. Hert doskonale rozumie, że współczesny rynek wymaga różnorodności, dlatego oferowane linie umożliwiają produkcję zarówno pieczywa rzemieślniczego o lekko nieregularnym kształcie, jak i w pełni powtarzalnego asortymentu dla sieci handlowych, zawsze z zachowaniem najwyższej dbałości o strukturę ciasta. Wybierając Hert, zyskuje się nie tylko niezawodne maszyny, ale również fachowe doradztwo technologiczne i pewność opłacalnej inwestycji, która przekłada się na wymierne korzyści w codziennej produkcji."
            },
            {
                "manufacturer": "Hert System",
                "description": "Hert System to marka specjalizująca się w zaawansowanych systemach dezynfekcji powietrza i powierzchni, oferując skuteczną ochronę przed drobnoustrojami w przemyśle spożywczym. Urządzenia Hert System wykorzystują nowoczesne technologie, takie jak promieniowanie UV-C, do eliminacji bakterii, wirusów i grzybów, zapewniając bezpieczeństwo mikrobiologiczne w halach produkcyjnych, magazynach i punktach sprzedaży. To kompleksowe rozwiązanie dla firm dbających o najwyższe standardy higieny i jakość swoich produktów."
            },
            {
                "manufacturer": "Houno",
                "description": "Houno to norweski producent urządzeń do obróbki ciasta, specjalizujący się w maszynach do wałkowania i formowania, idealnych do produkcji ciasta francuskiego. Urządzenia Houno charakteryzują się solidną konstrukcją, precyzją wykonania i delikatnym traktowaniem ciasta, co pozwala na uzyskanie doskonałych efektów w produkcji rogalików, chałek i innych wyrobów warstwowych. Dzięki zaawansowanej technologii, maszyny Houno zapewniają równomierną grubość ciasta na całej powierzchni i powtarzalność procesów."
            },
            {
                "manufacturer": "Hoja Food Tec",
                "description": "Hoja Food Tec to firma oferująca nowoczesne technologie dla przemysłu spożywczego, specjalizująca się w projektowaniu i wdrażaniu innowacyjnych rozwiązań w zakresie obróbki termicznej i automatyzacji. Dzięki wieloletniemu doświadczeniu i zaawansowanej wiedzy inżynierskiej, Hoja Food Tec dostarcza kompleksowe linie produkcyjne oraz pojedyncze urządzenia, które optymalizują procesy, zwiększają wydajność i podnoszą jakość produktów. To partner technologiczny dla firm poszukujących nowoczesnych i efektywnych rozwiązań."
            },
            {
                "manufacturer": "Innova",
                "description": "Innova to producent inteligentnych systemów pakowania i dozowania, oferujący gwarancję wydajności i precyzji dostosowaną do indywidualnych potrzeb klienta. Urządzenia Innova charakteryzują się zaawansowaną technologią, modułową budową i łatwością integracji z istniejącymi liniami produkcyjnymi. Systemy pakowania Innova zapewniają optymalną ochronę produktów, a precyzyjne dozowniki gwarantują dokładne odmierzanie składników, co przekłada się na redukcję odpadów i oszczędności."
            },
            {
                "manufacturer": "Industrial Bakery Technologies",
                "description": "Industrial Bakery Technologies to firma oferująca kompleksowe linie technologiczne dla wielkoprzemysłowych piekarni, od systemów mieszania i dozowania składników, przez zaawansowane procesy formowania i garowania, aż po nowoczesne piece i linie pakujące. Dzięki bogatemu doświadczeniu i zaawansowanej inżynierii, Industrial Bakery Technologies dostarcza rozwiązania szyte na miarę, które optymalizują produkcję, zwiększają wydajność i zapewniają najwyższą jakość wyrobów na masową skalę."
            },
            {
                "manufacturer": "Irinox",
                "description": "Irinox to włoski lider w produkcji pieców konwekcyjnych i kondensacyjnych, synonim włoskiej jakości i niezawodności, ceniony przez szefów kuchni i piekarzy na całym świecie. Piece Irinox charakteryzują się precyzyjnym sterowaniem parametrami wypieku, równomiernym rozprowadzaniem ciepła i innowacyjnymi funkcjami, takimi jak automatyczne programy i systemy czyszczenia. Dzięki zaawansowanej technologii, Irinox pozwala na uzyskanie doskonałych efektów w pieczeniu chleba, ciast, mięs i innych potraw."
            },
            {
                "manufacturer": "Jac",
                "description": "Jac to holenderski producent maszyn do produkcji ciastek i herbatników, łączący tradycyjne receptury z nowoczesną technologią. Firma oferuje urządzenia dla wymagających producentów, które zapewniają precyzyjne formowanie, równomierne pieczenie i doskonały wygląd gotowych wyrobów. Maszyny Jac są cenione za niezawodność, wydajność i łatwość obsługi, co pozwala na produkcję szerokiej gamy ciastek i herbatników o niepowtarzalnym smaku i konsystencji."
            },
            {
                "manufacturer": "Jeros",
                "description": "Jeros to producent precyzyjnych systemów do nadziewania i dekorowania wyrobów cukierniczych, oferujący urządzenia, które pozwalają na tworzenie wyjątkowych deserów. Maszyny Jeros umożliwiają równomierne i powtarzalne napełnianie pączków, eklerów, babeczek i innych wyrobów różnego rodzaju nadzieniami, a także precyzyjne dekorowanie tortów i ciast. Dzięki zaawansowanej technologii i łatwości obsługi, Jeros to idealne rozwiązanie dla cukierni poszukujących kreatywnych i wydajnych narzędzi."
            },
            {
                "manufacturer": "Kalte Rudi",
                "description": "Kalte Rudi to specjalista w dziedzinie chłodnictwa i mroźnictwa, oferujący profesjonalne szafy i komory chłodnicze, idealne do przechowywania składników i gotowych wyrobów w piekarniach, cukierniach i zakładach gastronomicznych. Produkty Kalte Rudi charakteryzują się solidną konstrukcją, niezawodnością i precyzyjnym utrzymywaniem zadanej temperatury, co gwarantuje świeżość i jakość przechowywanych produktów. To sprawdzone rozwiązanie dla firm dbających o właściwe warunki przechowywania."
            },
            {
                "manufacturer": "Kastel",
                "description": "Kastel to polski producent mebli i wyposażenia dla gastronomii i piekarnictwa, oferujący solidne i funkcjonalne rozwiązania, które sprawdzą się w każdej firmie. W ofercie Kastel znajdują się stoły robocze, regały, szafy, lady i inne elementy wyposażenia, zaprojektowane z myślą o ergonomii pracy i łatwości utrzymania czystości. Produkty Kastel są cenione za wysoką jakość wykonania, trwałość i atrakcyjny stosunek jakości do ceny."
            },
            {
                "manufacturer": "Kempf",
                "description": "Kempf to niemiecki producent zaawansowanych maszyn do mycia i dezynfekcji dla przemysłu spożywczego, oferujący technologie mycia wózków, pojemników, blach i tac, które zapewniają najwyższy standard higieny. Urządzenia Kempf charakteryzują się energooszczędnością, niezawodnością i łatwością obsługi, a ich solidna konstrukcja gwarantuje długoletnią eksploatację nawet w najbardziej wymagających warunkach. To wybór firm, dla których czystość i bezpieczeństwo są priorytetem."
            },
            {
                "manufacturer": "Kemper",
                "description": "Kemper to renomowany niemiecki producent mieszarek i urządzeń do przygotowania ciasta, synonim niezawodności i wydajności w każdej piekarni. Firma oferuje szeroką gamę mieszarek, od małych, uniwersalnych maszyn po duże, przemysłowe systemy, które zapewniają optymalne przygotowanie ciasta o doskonałej strukturze. Maszyny Kemper są cenione za solidną konstrukcję, precyzję wykonania i łatwość obsługi, co sprawia, że są chętnie wybierane przez profesjonalistów na całym świecie."
            },
            {
                "manufacturer": "Komza",
                "description": "Komza to polski producent maszyn dla przemysłu spożywczego z wieloletnią tradycją, oferujący sprawdzone i trwałe urządzenia, idealne dla średnich i dużych zakładów produkcyjnych. W ofercie Komza znajdują się mieszarki, dzieże, przesiewacze i inne maszyny niezbędne w procesie produkcji pieczywa i wyrobów cukierniczych. Produkty Komza są cenione za solidną konstrukcję, niezawodność i prostotę obsługi, co doceniają polscy piekarze od pokoleń."
            },
            {
                "manufacturer": "Koti Kobra",
                "description": "Koti Kobra to specjalista w produkcji okapów i systemów wentylacyjnych, zapewniających skuteczne usuwanie zanieczyszczeń, pary wodnej i zapachów z zaplecza produkcyjnego. Urządzenia Koti Kobra charakteryzują się wysoką wydajnością, energooszczędnością i nowoczesnym designem, a ich solidna konstrukcja gwarantuje długoletnią, bezawaryjną pracę. To niezawodne rozwiązanie dla piekarni, cukierni i zakładów gastronomicznych dbających o komfort pracy i czystość powietrza."
            },
            {
                "manufacturer": "Krumbein",
                "description": "Krumbein to niemiecki producent precyzyjnych urządzeń dozujących i porcjujących dla piekarnictwa, oferujący rozwiązania, które pozwalają na optymalizację procesów produkcyjnych. Urządzenia Krumbein umożliwiają dokładne odmierzanie i porcjowanie ciasta, nadzień i innych składników, zapewniając powtarzalność i wysoką jakość wyrobów. Dzięki zaawansowanej technologii i niezawodności, maszyny Krumbein są cenione przez piekarzy poszukujących precyzyjnych i efektywnych narzędzi."
            },
            {
                "manufacturer": "Krüger & Salecker",
                "description": "Krüger & Salecker to specjalista w produkcji urządzeń do mycia i czyszczenia dla przemysłu spożywczego, oferujący zaawansowane technologie mycia wózków, pojemników i innych elementów wyposażenia. Maszyny Krüger & Salecker zapewniają skuteczne usuwanie zanieczyszczeń i wysoki standard higieny, a ich solidna konstrukcja i energooszczędność gwarantują ekonomiczną i niezawodną eksploatację. To wybór firm, które stawiają na czystość i bezpieczeństwo."
            },
            {
                "manufacturer": "Kwik Lok",
                "description": "Kwik Lok to światowy lider w produkcji zamknięć do opakowań elastycznych, oferujący proste, szybkie i skuteczne systemy zamykania worków z pieczywem i innymi produktami spożywczymi. Zamknięcia Kwik Lok są cenione za łatwość użycia, estetyczny wygląd i możliwość wielokrotnego otwierania i zamykania opakowania, co doceniają zarówno producenci, jak i konsumenci. To niezawodne i ekonomiczne rozwiązanie dla firm pakujących swoje produkty w worki."
            },
            {
                "manufacturer": "Langheinz",
                "description": "Langheinz to niemiecki producent pieców i urządzeń grzewczych, łączący tradycyjne rzemiosło z nowoczesnymi technologiami, oferujący piece dla wymagających piekarzy. Urządzenia Langheinz charakteryzują się solidną konstrukcją, doskonałą izolacją termiczną i precyzyjnym sterowaniem parametrami wypieku, co gwarantuje równomierne pieczenie i doskonałe efekty końcowe. To wybór dla tych, którzy cenią sobie tradycję, jakość i niezawodność."
            },
            {
                "manufacturer": "Lantech",
                "description": "Lantech to amerykański producent owijarek i urządzeń do paletyzacji, oferujący stabilne i bezpieczne systemy owijania palet z gotowymi produktami. Maszyny Lantech zapewniają skuteczną ochronę towarów podczas transportu i magazynowania, minimalizując ryzyko uszkodzeń i zabrudzeń. Dzięki zaawansowanej technologii i niezawodności, urządzenia Lantech są cenione przez firmy logistyczne i produkcyjne na całym świecie."
            },
            {
                "manufacturer": "Lauterjung",
                "description": "Lauterjung to niemiecki producent noży i akcesoriów tnących o wieloletniej tradycji, oferujący najwyższej jakości narzędzia, niezbędne w każdej profesjonalnej kuchni i piekarni. Noże Lauterjung są cenione za doskonałe wyważenie, ostrość i trwałość, a szeroka gama akcesoriów tnących pozwala na precyzyjne i efektywne wykonywanie różnorodnych zadań. To wybór dla tych, którzy cenią sobie precyzję, jakość i niezawodność."
            },
            {
                "manufacturer": "Liebherr",
                "description": "Liebherr to światowy lider w produkcji urządzeń chłodniczych i zamrażalniczych, synonim niezawodności, energooszczędności i najwyższej jakości. Firma oferuje szeroką gamę profesjonalnych urządzeń chłodniczych, od szaf i lad chłodniczych po komory i tunele mroźnicze, które znajdują zastosowanie w piekarniach, cukierniach, restauracjach i zakładach produkcyjnych. Liebherr to gwarancja precyzyjnego utrzymywania temperatury, trwałości i niskich kosztów eksploatacji."
            },
            {
                "manufacturer": "Lincat",
                "description": "Lincat to brytyjski producent wyposażenia dla gastronomii, oferujący szeroką gamę urządzeń grzewczych i chłodniczych, cenionych za prostotę obsługi, funkcjonalność i trwałość. W ofercie Lincat znajdują się piece, patelnie, frytkownice, grille, a także szafy chłodnicze i zamrażalnicze, zaprojektowane z myślą o intensywnej eksploatacji w profesjonalnych kuchniach. To sprawdzone rozwiązanie dla firm poszukujących niezawodnego i praktycznego sprzętu."
            },
            {
                "manufacturer": "Longoni",
                "description": "Longoni to włoski producent maszyn do produkcji lodów i cukiernictwa, łączący tradycję z innowacją w urządzeniach dla profesjonalistów. Firma oferuje szeroką gamę maszyn, od pasteryzatorów i dojrzewalników po frysery i lamele, które pozwalają na produkcję lodów o doskonałej konsystencji i smaku. Produkty Longoni są cenione za solidną konstrukcję, precyzję wykonania i nowoczesny design, co doceniają producenci lodów na całym świecie."
            },
            {
                "manufacturer": "Lumitech",
                "description": "Lumitech to specjalista w produkcji oświetlenia LED dla przemysłu spożywczego, oferujący energooszczędne i higieniczne oprawy oświetleniowe, idealne do hal produkcyjnych, magazynów i punktów sprzedaży. Oświetlenie Lumitech charakteryzuje się wysoką szczelnością, odpornością na wilgoć i zabrudzenia oraz doskonałym oddawaniem barw, co pozwala na prawidłową ocenę wyglądu produktów. To bezpieczne i ekonomiczne rozwiązanie dla firm dbających o komfort pracy i jakość oświetlenia."
            },
            {
                "manufacturer": "Masdac",
                "description": "Masdac to polski producent maszyn dla przemysłu spożywczego, oferujący sprawdzone i niezawodne urządzenia, dostosowane do potrzeb polskich piekarni i cukierni. W ofercie Masdac znajdują się mieszarki, dzieże, przesiewacze, krajalnice i inne maszyny niezbędne w codziennej produkcji. Produkty Masdac są cenione za solidną konstrukcję, prostotę obsługi i atrakcyjną cenę, co czyni je popularnym wyborem wśród polskich przedsiębiorców."
            },
            {
                "manufacturer": "Merand",
                "description": "Merand to specjalista w produkcji urządzeń do pakowania i etykietowania, oferujący gwarancję precyzji i wydajności w procesie pakowania. Maszyny Merand umożliwiają automatyczne pakowanie produktów w różnego rodzaju opakowania, a także etykietowanie z dużą dokładnością i szybkością. Dzięki zaawansowanej technologii i niezawodności, urządzenia Merand są cenione przez firmy z branży spożywczej, które chcą optymalizować swoje linie pakujące."
            },
            {
                "manufacturer": "MFT",
                "description": "MFT oferuje zaawansowane technologie filtracji i separacji dla przemysłu spożywczego, zapewniające czystość i wysoką jakość produktów. Systemy filtracji MFT skutecznie usuwają zanieczyszczenia z cieczy i powietrza, a separatory oddzielają niepożądane frakcje, co pozwala na uzyskanie produktów o doskonałej czystości i konsystencji. To niezawodne rozwiązanie dla firm dbających o najwyższe standardy jakości."
            },
            {
                "manufacturer": "MHS",
                "description": "MHS projektuje i wdraża nowoczesne systemy do transportu i magazynowania dla przemysłu spożywczego, oferując zaawansowane rozwiązania logistyczne, które optymalizują przepływ materiałów i produktów. Systemy MHS charakteryzują się wysoką wydajnością, niezawodnością i elastycznością, co pozwala na dostosowanie ich do indywidualnych potrzeb klienta. To partner technologiczny dla firm poszukujących efektywnych rozwiązań w zakresie logistyki wewnętrznej."
            },
            {
                "manufacturer": "Minipan",
                "description": "Minipan to włoski producent maszyn do produkcji pizzy i pieczywa, oferujący kompaktowe i wydajne urządzenia, idealne dla małych i średnich pizzerii oraz piekarni. W ofercie Minipan znajdują się mieszarki, dzieże, krajalnice i piece, które charakteryzują się solidną konstrukcją, prostotą obsługi i atrakcyjnym designem. Produkty Minipan są cenione za niezawodność i doskonały stosunek jakości do ceny."
            },
            {
                "manufacturer": "MKN",
                "description": "MKN to niemiecki lider w produkcji urządzeń dla gastronomii, synonim jakości i innowacji, oferujący piece, patelnie, kuchnie i inne urządzenia dla profesjonalistów. Produkty MKN charakteryzują się najwyższą jakością wykonania, zaawansowaną technologią i ergonomicznym designem, co doceniają szefowie kuchni na całym świecie. MKN to gwarancja niezawodności, wydajności i doskonałych efektów kulinarnych."
            },
            {
                "manufacturer": "Moduline",
                "description": "Moduline oferuje elastyczne i funkcjonalne systemy modułowe do przechowywania i ekspozycji produktów w punktach sprzedaży. Regały, półki i lady Moduline charakteryzują się nowoczesnym designem, łatwością montażu i możliwością dowolnej konfiguracji, co pozwala na optymalne wykorzystanie przestrzeni i atrakcyjną prezentację towarów. To idealne rozwiązanie dla sklepów, piekarni i cukierni poszukujących praktycznych i estetycznych mebli ekspozycyjnych."
            },
            {
                "manufacturer": "NBS-Schumann",
                "description": "NBS-Schumann to niemiecki producent zaawansowanych urządzeń do mycia i dezynfekcji dla przemysłu spożywczego, oferujący technologie mycia wózków, pojemników, blach i tac na najwyższym poziomie. Maszyny NBS-Schumann zapewniają skuteczne usuwanie zanieczyszczeń, wysoki standard higieny i są zaprojektowane z myślą o długotrwałej, bezawaryjnej eksploatacji. To wybór firm, dla których czystość i bezpieczeństwo są absolutnym priorytetem."
            },
            {
                "manufacturer": "Nemox",
                "description": "Nemox to włoski producent kompaktowych i stylowych maszyn do produkcji lodów i kawy, idealnych dla małych lodziarni, kawiarni i gelaterii. Urządzenia Nemox łączą w sobie nowoczesny design, funkcjonalność i łatwość obsługi, pozwalając na produkcję lodów o doskonałej konsystencji i smaku. To propozycja dla tych, którzy szukają niezawodnego i estetycznego sprzętu w atrakcyjnej cenie."
            },
            {
                "manufacturer": "Nilma",
                "description": "Nilma to włoski producent maszyn do mycia i dezynfekcji naczyń i pojemników, oferujący gwarancję higieny i efektywności w każdej profesjonalnej kuchni i piekarni. Zmywarki Nilma charakteryzują się solidną konstrukcją, wydajnością i niskim zużyciem wody i energii, co przekłada się na oszczędności i komfort pracy. To sprawdzone rozwiązanie dla firm dbających o czystość i porządek."
            },
            {
                "manufacturer": "Niverplast",
                "description": "Niverplast to polski producent pojemników i akcesoriów z tworzyw sztucznych, oferujący praktyczne i trwałe rozwiązania do przechowywania i transportu produktów spożywczych. W ofercie Niverplast znajdują się pojemniki, wiaderka, skrzynie i inne akcesoria, które charakteryzują się wysoką jakością wykonania, bezpieczeństwem dla żywności i funkcjonalnością. To niezawodny wybór dla piekarni, cukierni i zakładów produkcyjnych."
            },
            {
                "manufacturer": "Ohaus",
                "description": "Ohaus to amerykański lider w produkcji wag i systemów ważących, oferujący precyzyjne i niezawodne urządzenia, cenione w laboratoriach i przemyśle spożywczym. Wagi Ohaus charakteryzują się wysoką dokładnością, trwałością i łatwością obsługi, a szeroka gama modeli pozwala na dobór odpowiedniego urządzenia do różnorodnych zastosowań. To wybór dla tych, którzy cenią sobie precyzję i jakość."
            },
            {
                "manufacturer": "Paktrend",
                "description": "Paktrend to polski producent opakowań i akcesoriów pakowych, oferujący szeroki wybór opakowań dla piekarnictwa i cukiernictwa. W ofercie Paktrend znajdują się torebki, woreczki, pudełka, tacki i inne opakowania, które charakteryzują się estetycznym wyglądem, funkcjonalnością i bezpieczeństwem dla żywności. To kompleksowe rozwiązanie dla firm poszukujących atrakcyjnych i praktycznych opakowań dla swoich produktów."
            },
            {
                "manufacturer": "Panem",
                "description": "Panem to polski producent maszyn dla piekarnictwa i cukiernictwa z wieloletnim doświadczeniem, oferujący sprawdzone i niezawodne urządzenia, które doceniają polscy piekarze. W ofercie Panem znajdują się mieszarki, dzieże, piece, krajalnice i inne maszyny niezbędne w nowoczesnej piekarni. Produkty Panem są cenione za solidną konstrukcję, prostotę obsługi i doskonałe efekty wypieku."
            },
            {
                "manufacturer": "Precisma",
                "description": "Precisma oferuje zaawansowane technologie w dziedzinie precyzyjnych urządzeń dozujących i porcjujących dla przemysłu spożywczego. Maszyny Precisma zapewniają dokładne i powtarzalne dozowanie składników, nadzień i półproduktów, co pozwala na optymalizację procesów produkcyjnych i minimalizację odpadów. To niezawodne rozwiązanie dla firm poszukujących precyzyjnych i efektywnych narzędzi."
            },
            {
                "manufacturer": "Procys",
                "description": "Procys to firma specjalizująca się w systemach do automatyzacji procesów produkcyjnych, oferująca zaawansowane rozwiązania IT dla przemysłu spożywczego. Systemy Procys umożliwiają monitorowanie i sterowanie liniami produkcyjnymi, zbieranie i analizę danych oraz optymalizację procesów w czasie rzeczywistym. To partner technologiczny dla firm poszukujących nowoczesnych narzędzi do zarządzania produkcją."
            },
            {
                "manufacturer": "Przybyś",
                "description": "Przybyś to polski producent maszyn i urządzeń dla piekarnictwa, oferujący sprawdzone rozwiązania, dostosowane do potrzeb polskich piekarń. W ofercie Przybyś znajdują się piece, mieszarki, dzieże, krajalnice i inne urządzenia, które charakteryzują się solidną konstrukcją, prostotą obsługi i niezawodnością. Produkty Przybyś są cenione przez polskich piekarzy za trwałość i dobre efekty wypieku."
            },
            {
                "manufacturer": "Rademaker",
                "description": "Rademaker to holenderski lider w produkcji linii do produkcji ciasta francuskiego i wyrobów specjalnych, synonim innowacji i najwyższej jakości w branży piekarniczej. Firma oferuje zaawansowane linie technologiczne do automatycznej produkcji rogalików, chałek, croissantów i innych wyrobów z ciasta warstwowego, zapewniając delikatne traktowanie ciasta, precyzję formowania i wysoką wydajność. To wybór dla najbardziej wymagających producentów."
            },
            {
                "manufacturer": "Rheon",
                "description": "Rheon to japoński producent zaawansowanych maszyn do formowania i nadziewania, których technologia rewolucjonizuje proces produkcji wyrobów cukierniczych. Urządzenia Rheon umożliwiają formowanie różnego rodzaju ciast i nadziewanie ich bez uszkadzania delikatnej struktury, co pozwala na tworzenie wyrobów o doskonałym wyglądzie i smaku. To innowacyjne rozwiązanie dla firm poszukujących najwyższej jakości i precyzji."
            },
            {
                "manufacturer": "Ringo Plast",
                "description": "Ringo Plast to specjalista w produkcji estetycznych i funkcjonalnych opakowań z tworzyw sztucznych dla cukiernictwa i branży spożywczej. W ofercie Ringo Plast znajdują się pudełka, tacki, pojemniki i inne opakowania, które charakteryzują się atrakcyjnym designem, trwałością i bezpieczeństwem dla żywności. Produkty Ringo Plast pozwalają na atrakcyjną prezentację wyrobów cukierniczych i skuteczną ochronę podczas transportu."
            },
            {
                "manufacturer": "Rilling",
                "description": "Rilling to niemiecki producent zaawansowanych urządzeń do mycia i dezynfekcji dla przemysłu spożywczego, oferujący technologie mycia wózków, pojemników, blach i innych elementów wyposażenia. Maszyny Rilling zapewniają skuteczne usuwanie zanieczyszczeń, wysoki standard higieny i są zaprojektowane z myślą o długotrwałej, bezawaryjnej eksploatacji. To wybór firm stawiających na najwyższą jakość i niezawodność."
            },
            {
                "manufacturer": "Roboqbo",
                "description": "Roboqbo to włoski producent maszyn do produkcji lodów i gastronomii, łączący innowacyjność z włoskim designem, oferujący urządzenia dla profesjonalistów. W ofercie Roboqbo znajdują się pasteryzatory, dojrzewalniki, frysery oraz inne maszyny do produkcji lodów, a także urządzenia dla gastronomii, takie jak mieszarki i krajalnice. Produkty Roboqbo są cenione za nowoczesną technologię, niezawodność i estetyczny wygląd."
            },
            {
                "manufacturer": "Sancassiano",
                "description": "Sancassiano to włoski producent pieców i linii do produkcji pizzy i pieczywa, oferujący urządzenia, które łączą w sobie tradycję i jakość w każdym detalu. Piece Sancassiano charakteryzują się doskonałą izolacją termiczną, równomiernym rozprowadzaniem ciepła i precyzyjnym sterowaniem, co pozwala na uzyskanie idealnych wypieków o niepowtarzalnym smaku i aromacie. To wybór dla tych, którzy cenią sobie włoską jakość i tradycję."
            },
            {
                "manufacturer": "Sanomat",
                "description": "Sanomat to fiński producent kompaktowych i wydajnych urządzeń do mycia i dezynfekcji, oferujący zmywarki do naczyń i pojemników dla gastronomii i przemysłu spożywczego. Maszyny Sanomat charakteryzują się solidną konstrukcją, niskim zużyciem wody i energii oraz łatwością obsługi, co przekłada się na oszczędności i komfort pracy. To sprawdzone rozwiązanie dla firm dbających o czystość i higienę."
            },
            {
                "manufacturer": "Saleen",
                "description": "Saleen to specjalista w produkcji niezawodnych systemów do pakowania próżniowego dla małych i średnich zakładów produkcyjnych. Maszyny Saleen pozwalają na skuteczne usunięcie powietrza z opakowań, co znacznie wydłuża świeżość produktów i chroni je przed niekorzystnym wpływem czynników zewnętrznych. To ekonomiczne i efektywne rozwiązanie dla producentów dbających o jakość i trwałość swoich wyrobów."
            },
            {
                "manufacturer": "Sasa",
                "description": "Sasa oferuje zaawansowane systemy do dozowania i mieszania składników sypkich dla przemysłu spożywczego, zapewniające precyzję i powtarzalność procesów. Urządzenia Sasa umożliwiają automatyczne odmierzanie i podawanie mąki, cukru, przypraw i innych składników sypkich, co pozwala na optymalizację produkcji i minimalizację strat. To niezawodne rozwiązanie dla firm poszukujących efektywnych technologii dozowania."
            },
            {
                "manufacturer": "Scaritech",
                "description": "Scaritech oferuje nowoczesne technologie pakowania i etykietowania, gwarantując wydajność i precyzję w procesie pakowania produktów spożywczych. Maszyny Scaritech umożliwiają automatyczne pakowanie w różnego rodzaju opakowania, a także precyzyjne etykietowanie z dużą szybkością i dokładnością. To kompleksowe rozwiązanie dla firm chcących zautomatyzować i usprawnić swoje linie pakujące."
            },
            {
                "manufacturer": "Schomaker",
                "description": "Schomaker to niemiecki producent urządzeń do produkcji wafli i gofrów, łączący tradycję z nowoczesną technologią. Maszyny Schomaker pozwalają na uzyskanie doskonałych, chrupiących wafli i gofrów o niepowtarzalnym smaku, które są cenione przez producentów słodkich przekąsek na całym świecie. Firma oferuje zarówno kompaktowe maszyny dla małych punktów, jak i zaawansowane linie produkcyjne dla przemysłu."
            },
            {
                "manufacturer": "Schneider",
                "description": "Schneider Electric to światowy lider w dziedzinie elektrotechniki i automatyki przemysłowej, oferujący szeroką gamę komponentów i systemów sterowania dla nowoczesnych linii produkcyjnych. Produkty Schneider Electric, takie jak sterowniki PLC, falowniki, czujniki i panele operatorskie, pozwalają na precyzyjne sterowanie procesami, zwiększenie wydajności i optymalizację zużycia energii w zakładach produkcyjnych."
            },
            {
                "manufacturer": "Shuffle-Mix",
                "description": "Shuffle-Mix oferuje innowacyjne mieszarki i systemy do mieszania dla przemysłu spożywczego, charakteryzujące się zaawansowaną technologią i wysoką wydajnością. Urządzenia Shuffle-Mix zapewniają szybkie i dokładne mieszanie różnego rodzaju składników, przy jednoczesnym zachowaniu ich struktury i właściwości. To niezawodne rozwiązanie dla firm poszukujących efektywnych i innowacyjnych technologii mieszania."
            },
            {
                "manufacturer": "Sispo",
                "description": "Sispo to polski producent maszyn i urządzeń dla przemysłu spożywczego, oferujący sprawdzone rozwiązania dla piekarnictwa i cukiernictwa. W ofercie Sispo znajdują się mieszarki, dzieże, przesiewacze, piece i inne urządzenia, które charakteryzują się solidną konstrukcją, niezawodnością i atrakcyjną ceną. Produkty Sispo są cenione przez polskich przedsiębiorców za dobrą jakość i dostosowanie do lokalnych potrzeb."
            },
            {
                "manufacturer": "SPM",
                "description": "SPM projektuje i wdraża zaawansowane systemy do transportu i podawania materiałów dla przemysłu spożywczego, oferując kompleksowe rozwiązania logistyczne. Systemy SPM zapewniają efektywny i bezpieczny przepływ surowców i produktów, optymalizując procesy produkcyjne i minimalizując ryzyko przestojów. To partner technologiczny dla firm poszukujących niezawodnych rozwiązań w zakresie transportu wewnętrznego."
            },
            {
                "manufacturer": "Tecfrigo",
                "description": "Tecfrigo to włoski producent urządzeń chłodniczych dla gastronomii i przemysłu, synonim niezawodności i wydajności w przechowywaniu produktów spożywczych. W ofercie Tecfrigo znajdują się szafy chłodnicze, lady, komory i inne urządzenia, które charakteryzują się solidną konstrukcją, precyzyjnym utrzymywaniem temperatury i energooszczędnością. To sprawdzone rozwiązanie dla firm dbających o świeżość i jakość przechowywanych produktów."
            },
            {
                "manufacturer": "TFT",
                "description": "TFT oferuje innowacyjne piece i linie produkcyjne dla wymagających piekarń, wykorzystując zaawansowane technologie piekarnicze. Urządzenia TFT zapewniają precyzyjną kontrolę procesu wypieku, równomierne rozprowadzanie ciepła i wysoką wydajność, co pozwala na uzyskanie doskonałych efektów i optymalizację kosztów produkcji. To wybór dla tych, którzy szukają nowoczesnych i niezawodnych rozwiązań."
            },
            {
                "manufacturer": "Unifiller",
                "description": "Unifiller to amerykański lider w produkcji maszyn do dozowania i nadziewania, oferujący precyzję i wydajność w każdym detalu. Urządzenia Unifiller umożliwiają dokładne i powtarzalne dozowanie ciast, kremów, nadzień i innych produktów, co jest niezbędne w profesjonalnej produkcji cukierniczej i piekarniczej. To niezawodne rozwiązanie dla firm poszukujących wysokiej jakości i precyzyjnych narzędzi."
            },
            {
                "manufacturer": "Unimac-Gherri",
                "description": "Unimac-Gherri to włoski producent zaawansowanych maszyn do pakowania i owijania dla przemysłu spożywczego, oferujący technologie zapewniające skuteczną ochronę i atrakcyjną prezentację produktów. Urządzenia Unimac-Gherri umożliwiają pakowanie w różnego rodzaju folie i materiały, zapewniając szczelność, estetykę i wydajność na najwyższym poziomie. To wybór firm stawiających na jakość i innowacyjność w pakowaniu."
            },
            {
                "manufacturer": "Ultrapower",
                "description": "Ultrapower oferuje zaawansowane systemy do uzdatniania powietrza i filtracji, zapewniające czyste i bezpieczne powietrze w halach produkcyjnych przemysłu spożywczego. Systemy Ultrapower skutecznie usuwają zanieczyszczenia, pyły, alergeny i drobnoustroje, tworząc optymalne warunki do produkcji żywności i chroniąc produkty przed skażeniem. To niezawodne rozwiązanie dla firm dbających o najwyższe standardy higieny."
            },
            {
                "manufacturer": "Weisse",
                "description": "Weisse to niemiecki producent zaawansowanych urządzeń do mycia i dezynfekcji dla przemysłu spożywczego, oferujący technologie mycia wózków, pojemników, blach i tac na najwyższym poziomie. Maszyny Weisse zapewniają skuteczne usuwanie zanieczyszczeń, wysoki standard higieny i są zaprojektowane z myślą o długotrwałej, bezawaryjnej eksploatacji. To wybór firm, dla których czystość i bezpieczeństwo są priorytetem."
            },
            {
                "manufacturer": "Wyoblarz",
                "description": "Wyoblarz to polski producent maszyn i urządzeń dla piekarnictwa, oferujący sprawdzone i niezawodne rozwiązania dla polskich piekarń. W ofercie Wyoblarz znajdują się piece, mieszarki, dzieże, krajalnice i inne urządzenia, które charakteryzują się solidną konstrukcją, prostotą obsługi i dobrą wydajnością. Produkty Wyoblarz są cenione przez polskich piekarzy za trwałość i funkcjonalność."
            },
            {
                "manufacturer": "Whirlpool",
                "description": "Whirlpool to światowy lider w produkcji sprzętu AGD i urządzeń dla gastronomii, oferujący szeroką gamę produktów dla profesjonalistów. W ofercie Whirlpool znajdują się piece, płyty grzewcze, zmywarki, chłodziarki i inne urządzenia, które charakteryzują się nowoczesnym designem, zaawansowaną technologią i niezawodnością. To sprawdzone rozwiązanie dla firm poszukujących sprzętu wysokiej jakości."
            },
            {
                "manufacturer": "WP Riehle",
                "description": "WP Riehle to niemiecki producent maszyn do przygotowania ciasta, synonim jakości i niezawodności w każdej piekarni. Firma oferuje szeroką gamę mieszarek i urządzeń do przygotowania ciasta, które charakteryzują się solidną konstrukcją, precyzją wykonania i łatwością obsługi. Maszyny WP Riehle są cenione przez piekarzy na całym świecie za niezawodność i doskonałe efekty przygotowania ciasta."
            },
            {
                "manufacturer": "Varimixer",
                "description": "Varimixer to duński lider w produkcji mieszarek i robotów kuchennych, oferujący niezawodność i wysoką wydajność, cenione przez cukierników i szefów kuchni na całym świecie. Mieszarki Varimixer charakteryzują się solidną konstrukcją, cichą pracą i precyzyjnym sterowaniem prędkością, co pozwala na optymalne przygotowanie różnego rodzaju mas i ciast. To wybór dla tych, którzy cenią sobie najwyższą jakość i niezawodność."
            },
            {
                "manufacturer": "Zacmi",
                "description": "Zacmi to włoski producent zaawansowanych maszyn do pakowania i dozowania dla przemysłu spożywczego, oferujący technologie zapewniające precyzję, wydajność i niezawodność. Urządzenia Zacmi umożliwiają automatyczne pakowanie produktów w puszki, słoiki i inne opakowania, a także precyzyjne dozowanie płynów i półproduktów. To wybór firm stawiających na innowacyjność i najwyższą jakość w procesie pakowania."
            },
            {
                "manufacturer": "Zeppelin",
                "description": "Zeppelin oferuje zaawansowane systemy do przechowywania i transportu materiałów sypkich dla przemysłu spożywczego, zapewniając kompleksowe rozwiązania logistyczne. Systemy Zeppelin umożliwiają bezpieczne i efektywne magazynowanie, dozowanie i transport mąki, cukru, zbóż i innych surowców, optymalizując procesy produkcyjne i minimalizując straty. To partner technologiczny dla firm poszukujących niezawodnych rozwiązań w gospodarce materiałami sypkimi."
            },
            {
                "manufacturer": "ZCH Góra",
                "description": "ZCH Góra to polski producent maszyn i urządzeń dla przemysłu spożywczego, oferujący sprawdzone rozwiązania dla piekarnictwa i cukiernictwa. W ofercie ZCH Góra znajdują się mieszarki, dzieże, przesiewacze i inne urządzenia, które charakteryzują się solidną konstrukcją, prostotą obsługi i niezawodnością. Produkty ZCH Góra są cenione przez polskich przedsiębiorców za dobrą jakość i atrakcyjną cenę."
            }
        ];



        const logs = getLogos();


        let n = name.toLowerCase().replaceAll(" ", "_");
        const logo = logs.filter(e => {
            if (e.includes(n)) {
                return e
            }
        })

        let d = desc.filter((e: any) => e.manufacturer == name)

        return {
            desc: d[0].description || "",
            logo: logo[0],
            link: createSlug(name),
            name: name,

        };

    } catch (error) {
        return "";
    }



}


