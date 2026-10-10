import sanitizeHtml from 'sanitize-html'

// Opisy produktów pochodzą z panelu Magento (HTML). Czyszczenie robimy po stronie serwera biblioteką bez jsdom —
// isomorphic-dompurify ciągnie jsdom, który na serwerach Vercel potrafi się nie załadować i wywala cały render karty produktu.
// Funkcja jest tylko serwerowa: wołamy ją w app/[...slug]/page.tsx, a komponenty klienckie dostają już czysty HTML.

const ALLOWED_TAGS = [
    'p', 'br', 'hr', 'span', 'div', 'strong', 'b', 'em', 'i', 'u', 'small', 'sub', 'sup', 'blockquote',
    'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img',
]

export const sanitizeProductHtml = (html: unknown): string => {
    if (typeof html !== 'string' || !html.trim()) return ''

    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'width', 'height'],
            '*': ['class'],
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        allowedSchemesByTag: { img: ['http', 'https'] },
        // jedno <h1> na stronę to nazwa produktu — nagłówki z opisu schodzą poziom niżej
        transformTags: {
            h1: 'h2',
            a: (tagName, attribs) => ({
                tagName,
                attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
            }),
        },
    })
}
