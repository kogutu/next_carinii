interface ProductJsonLdProps {
    product: any
}
function stripTagsAndLimit(html: string, maxLength = 50, suffix = '...') {
    if (!html) return '';

    // 1. Zamień tagi blokowe na rzeczywiste znaki nowej linii
    let text = html
        .replace(/<(h[1-6]|div|p)[^>]*>/gi, (match) => '\n')  // Natychmiast zamień na \n
        .replace(/<\/(h[1-6]|div|p)[^>]*>/gi, '\n')
        .replace(/<(br|hr)[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, '');  // Usuń pozostałe tagi

    // 2. Normalizuj białe znaki (zachowując rzeczywiste \n które są już w stringu)
    text = text
        .replace(/[ \t]+/g, ' ')       // wiele spacji/tabulacji → jedna spacja
        .replace(/\n[ \t]+/g, '\n')    // spacje po nowej linii
        .replace(/[ \t]+\n/g, '\n')    // spacje przed nową linią
        .replace(/\n{3,}/g, '\n\n')    // maks 2 puste linie
        .trim();

    // 3. Przycinanie z uwzględnieniem linii
    return trimWithLineAwareness(text, maxLength, suffix);
}

function trimWithLineAwareness(text: string, maxLength: number, suffix: string) {
    const lines = text.split('\n');
    let result = [];
    let currentLength = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.length;
        const newlineLength = 1; // \n dodaje 1 do długości

        // Jeśli możemy dodać całą linię
        if (currentLength + lineLength + (i > 0 ? newlineLength : 0) <= maxLength) {
            result.push(line);
            currentLength += lineLength + (i > 0 ? newlineLength : 0);
            continue;
        }

        // Ostatnia linia - trzeba przyciąć
        const spaceLeft = maxLength - currentLength - (i > 0 ? newlineLength : 0) - suffix.length;

        if (spaceLeft > 0) {
            // Przycinamy bierzącą linię
            const trimmedLine = line.substring(0, spaceLeft) + suffix;
            result.push(trimmedLine);
        } else if (result.length > 0) {
            // Nie ma miejsca na tę linię, dodaj suffix do poprzedniej
            const lastLine: any = result.pop();
            const trimmedLastLine = lastLine.substring(0, lastLine.length - suffix.length) + suffix;
            result.push(trimmedLastLine);
        } else {
            // To pierwsza linia i jest za długa
            result.push(line.substring(0, maxLength - suffix.length) + suffix);
        }
        break;
    }

    // Połącz linie z rzeczywistymi znakami nowej linii
    return result.join('\n');
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
    const doc = product.document || product

    // Build structured data
    const structuredData: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: doc.name || "Nazwa produktu",
        image: doc.imgs?.map((img: any) => `${img.url}`) || [],
        description: stripTagsAndLimit(doc.description, 120) || "Opis produktu",
        sku: doc.sku || "Mebel-Partner",
        mpn: doc.model || "Mebel-Partner",
        gtin13: doc.ean || "1234567890123",
        brand: {
            "@type": "Brand",
            name: "Mebel-Partner", // Uzupełnij swoją markę
        },
        offers: {
            "@type": "Offer",
            url: `/${doc.url}`,
            priceCurrency: "PLN",
            price: doc.price || 0,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 dni od teraz
            itemCondition: "https://schema.org/NewCondition",
            availability:
                doc.qty > 0
                    ? "https://schema.org/InStock"
                    : doc.ispresale
                        ? "https://schema.org/PreOrder"
                        : "https://schema.org/OutOfStock",
            shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                    "@type": "MonetaryAmount",
                    value: doc.shipping_amount || 0,
                    currency: "PLN",
                },
                deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: {
                        "@type": "QuantitativeValue",
                        minValue: 1,
                        maxValue: doc.shipping_realizacja || 2,
                        unitCode: "DAY",
                    },
                    transitTime: {
                        "@type": "QuantitativeValue",
                        minValue: 1,
                        maxValue: doc.shipping_client || 3,
                        unitCode: "DAY",
                    },
                },
            },
            seller: {
                "@type": "Organization",
                name: "Mebel-Partner", // Uzupełnij nazwę firmy
            },
        },
    }

    // Add aggregate rating if available
    if (doc.reviews_count > 0 || doc.revs?.count > 0) {
        structuredData.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: doc.reviews_stars || doc.revs?.avg_stars || 0,
            reviewCount: doc.reviews_count || doc.revs?.count || 0,
            bestRating: 5,
            worstRating: 1,
        }
    }

    // Add reviews if available
    if (doc.revs?.revs && doc.revs.revs.length > 0) {

        console.clear();
        console.log(doc.revs.revs);
        structuredData.review = doc.revs.revs.slice(0, 5).map((review: any) => ({
            "@type": "Review",
            author: {
                "@type": "Person",
                name: review.name || "Klient",
            },
            datePublished: review.created_at.split(" ")[0] || new Date().toISOString().split("T")[0],
            reviewBody: review.oreview || review.review || "1",
            reviewRating: {
                "@type": "Rating",
                ratingValue: review.orate || review.rating || 5,
                bestRating: 5,
                worstRating: 1,
            },
        }))
    }

    // Add warranty if available
    if (doc.warranty) {
        structuredData.warranty = {
            "@type": "WarrantyPromise",
            durationOfWarranty: {
                "@type": "QuantitativeValue",
                value: Number.parseInt(doc.warranty) || 24,
                unitCode: "MON",
            },
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData, null, 2),
                }}
            />
        </>
    )
}
