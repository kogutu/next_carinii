'use client'

// Template dla zwykłych stron CMS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    // Funkcja do przetworzenia HTML i dodania stylów
    const processHtml = (html: string) => {
        // Dodaj style dla accordionu
        const styles = `
            <style>
                .accordion {
                    background-color: #f8f9fa;
                    color: #333;
                    cursor: pointer;
                    padding: 18px;
                    width: 100%;
                    text-align: left;
                    border: none;
                    border-bottom: 1px solid #dee2e6;
                    outline: none;
                    transition: 0.4s;
                    font-weight: 600;
                    font-size: 1.1rem;
                    position: relative;
                }
                
                .accordion:hover {
                    background-color: #e9ecef;
                }
                
                .accordion.active {
                    background-color: #e9ecef;
                    border-bottom: none;
                }
                
                .accordion:after {
                    content: '\\002B';
                    color: #777;
                    font-weight: bold;
                    float: right;
                    margin-left: 5px;
                }
                
                .accordion.active:after {
                    content: '\\2212';
                }
                
                .panel {
                    padding: 0 18px;
                    background-color: white;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    border-bottom: 1px solid #dee2e6;
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
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .accordion:first-child {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                
                .accordion:last-of-type {
                    border-bottom: none;
                }
                
                .accordion:last-of-type.active {
                    border-bottom: none;
                }
                
                .panel:last-of-type {
                    border-bottom: none;
                }
                
                /* Styl dla aktywnego accordionu z hasztaga */
                .accordion.active {
                    background-color: #e3f2fd;
                    border-left: 4px solid #0d6efd;
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
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{content?.h1 || defaultTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        {content?.content ? (
                            <div
                                ref={accordionRef}
                                dangerouslySetInnerHTML={{
                                    __html: processHtml(content.content)
                                }}
                            />
                        ) : (
                            <p className="text-muted-foreground">Strona CMS: {slugString}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}