'use client'

// Template dla zwykłych stron CMS
import { ENTER, EYEBROW, SurfaceCard } from '@/components/ui/surface'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from "react"

interface CmsPageTemplateProps {
    slug: string[]
    content?: {
        h1?: string
        content?: string
        meta_title?: string
        meta_description?: string
    }
}

export default function CmsPageTemplate({ slug, content }: CmsPageTemplateProps) {
    const slugString = slug.join("-")
    const defaultTitle = slugString
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

    const accordionRef = useRef<HTMLDivElement>(null)

    // Funkcja do otwierania accordionu na podstawie ID
    const openAccordionById = (id: string) => {
        if (!accordionRef.current) return

        const targetButton = accordionRef.current.querySelector(`#${id}`) as HTMLButtonElement
        if (targetButton && targetButton.classList.contains('accordion')) {
            // Otwórz accordion jeśli nie jest otwarty
            if (!targetButton.classList.contains('active')) {
                targetButton.classList.add('active')
                const panel = targetButton.nextElementSibling as HTMLElement
                if (panel) {
                    panel.style.maxHeight = panel.scrollHeight + 'px'
                }
            }

            // Przewiń do accordionu
            setTimeout(() => {
                targetButton.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }

    useEffect(() => {
        if (!accordionRef.current) return

        const accordions = accordionRef.current.querySelectorAll('.accordion')

        const handleAccordionClick = (event: Event) => {
            const button = event.currentTarget as HTMLButtonElement
            button.classList.toggle('active')

            const panel = button.nextElementSibling as HTMLElement
            if (panel) {
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = ''
                } else {
                    panel.style.maxHeight = panel.scrollHeight + 'px'
                }
            }
        }

        accordions.forEach(accordion => {
            accordion.addEventListener('click', handleAccordionClick)
        })

        // Sprawdź czy URL ma hasztag i otwórz odpowiedni accordion
        const hash = window.location.hash.substring(1) // usuń #
        if (hash) {
            // Mały timeout aby upewnić się, że DOM jest w pełni załadowany
            setTimeout(() => {
                openAccordionById(hash)
            }, 200)
        }

        // Nasłuchuj na zmiany hasztaga (np. gdy użytkownik kliknie link z hasztagiem)
        const handleHashChange = () => {
            const newHash = window.location.hash.substring(1)
            if (newHash) {
                openAccordionById(newHash)
            }
        }

        window.addEventListener('hashchange', handleHashChange)

        return () => {
            accordions.forEach(accordion => {
                accordion.removeEventListener('click', handleAccordionClick)
            })
            window.removeEventListener('hashchange', handleHashChange)
        }
    }, [content?.content])

    const title = content?.h1 || defaultTitle

    // Treść z Magento często zaczyna się własnym <h1> z tym samym tytułem — strona ma już nagłówek
    const stripDuplicateTitle = (html: string): string => {
        const match = html.match(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>\s*/i)
        if (!match) return html
        const heading = match[1].replace(/<[^>]+>/g, '').trim().toLowerCase()
        return heading === title.trim().toLowerCase() ? html.slice(match[0].length) : html
    }

    // Style akordeonu wstrzykiwane razem z treścią CMS (kolory z tokenów strony)
    const processHtml = (rawHtml: string) => {
        const html = stripDuplicateTitle(rawHtml)
        const styles = `
            <style>
                .accordion {
                    background-color: var(--muted);
                    color: var(--foreground);
                    cursor: pointer;
                    padding: 18px;
                    width: 100%;
                    text-align: left;
                    border: none;
                    border-bottom: 1px solid var(--border);
                    outline: none;
                    transition: background-color 0.2s;
                    font-weight: 600;
                    font-size: 1.05rem;
                    position: relative;
                }

                .accordion:hover,
                .accordion.active {
                    background-color: oklch(0.93 0 0);
                }

                .accordion:focus-visible {
                    box-shadow: inset 0 0 0 2px var(--foreground);
                }

                .accordion:after {
                    content: '\\002B';
                    color: var(--muted-foreground);
                    font-weight: bold;
                    float: right;
                    margin-left: 5px;
                }

                .accordion.active:after {
                    content: '\\2212';
                }

                .panel {
                    padding: 0 18px;
                    background-color: var(--background);
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    border-bottom: 1px solid var(--border);
                }

                .panel p, .panel ul {
                    margin: 16px 0;
                }

                .panel ul {
                    padding-left: 20px;
                }

                .panel li {
                    margin: 8px 0;
                }

                .icon {
                    vertical-align: middle;
                    margin-right: 8px;
                }

                .accordion-container {
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .accordion:last-of-type,
                .accordion:last-of-type.active,
                .panel:last-of-type {
                    border-bottom: none;
                }

                /* aktywny akordeon (też po przejściu z linku z hasztagiem) */
                .accordion.active {
                    box-shadow: inset 3px 0 0 var(--foreground);
                }

                @media (prefers-reduced-motion: reduce) {
                    .accordion, .panel { transition: none; }
                }
            </style>
        `

        // Sprawdź czy HTML zawiera strukturę accordionu
        if (html.includes('accordion-container') && html.includes('accordion')) {
            return styles + html
        }

        return html
    }

    return (
        <main className="bg-background">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <header className={cn(ENTER, 'max-w-3xl')}>
                    <p className={EYEBROW}>Informacje</p>
                    <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                        {title}
                    </h1>
                </header>

                <SurfaceCard className={cn(ENTER, 'mt-10 delay-100')}>
                    {content?.content ? (
                        <div
                            ref={accordionRef}
                            className="cms-content"
                            dangerouslySetInnerHTML={{
                                __html: processHtml(content.content)
                            }}
                        />
                    ) : (
                        <p className="text-muted-foreground">Strona CMS: {slugString}</p>
                    )}
                </SurfaceCard>
            </div>
        </main>
    )
}
