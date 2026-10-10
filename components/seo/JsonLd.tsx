type JsonLdProps = {
    // jeden obiekt schema.org albo kilka (każdy trafi do osobnego <script>)
    data: object | object[]
}

// Dane strukturalne w <script type="application/ld+json">. "<" jest zamieniane, żeby tekst z danych
// nie mógł zamknąć znacznika <script>.
export default function JsonLd({ data }: JsonLdProps) {
    const items = Array.isArray(data) ? data : [data]

    return (
        <>
            {items.map((item, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
                />
            ))}
        </>
    )
}
