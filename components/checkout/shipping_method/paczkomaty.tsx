import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useCallback, useEffect, useRef, useState } from 'react'

const INPOST_SDK_URL = 'https://geowidget.inpost.pl/inpost-geowidget.js'
const INPOST_CSS_URL = 'https://geowidget.inpost.pl/inpost-geowidget.css'
const TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzQlpXVzFNZzVlQnpDYU1XU3JvTlBjRWFveFpXcW9Ua2FuZVB3X291LWxvIn0.eyJleHAiOjIwODk5NTk0OTcsImlhdCI6MTc3NDU5OTQ5NywianRpIjoiMmJkYjJlNDgtMTVkNS00ZDdmLTk0ZTYtZmY2NDkzOWYwYjFlIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5pbnBvc3QucGwvYXV0aC9yZWFsbXMvZXh0ZXJuYWwiLCJzdWIiOiJmOjEyNDc1MDUxLTFjMDMtNGU1OS1iYTBjLTJiNDU2OTVlZjUzNTpjY2VlVUI5QXFvOXdsR3hZcjdGQ2N6bHQ4Q2pQeGhPcmVOX01GS055ODZNIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2hpcHgiLCJzZXNzaW9uX3N0YXRlIjoiYjM1MDY0ZDYtNTI0ZS00ZWEwLTg2ZGYtMjRiY2QwMmQ4MWZjIiwic2NvcGUiOiJvcGVuaWQgYXBpOmFwaXBvaW50cyIsInNpZCI6ImIzNTA2NGQ2LTUyNGUtNGVhMC04NmRmLTI0YmNkMDJkODFmYyIsImFsbG93ZWRfcmVmZXJyZXJzIjoiMTkyLjE2OC4xLjI1IiwidXVpZCI6Ijg1NGFkZmZjLWQyYWEtNGVmZC1iZTA2LTk2MzJjYzkyNGQyYyJ9.IfwMXCiodWSeP3FgAOvyE1bEUtBKl2O2DbB4aC7r08iKJRzeRqVawGd5K3orsOF-HgSmHJe7pn5Yd2eI90GZ06L6ofQFBhFuY14F_EXwUGYkYV5ygp1HnGC8zXElrJcv-F9P282hXsThwzrivg_VdhA_6s8ANTBQqiVp811aXhLgCi2dQdwh0wJeFpW0nY4GOVLpFkhuFmGBx6kZBDBhhGo1ERHdISskyExAJ4UTV1BG7fe3jGJJaDgBDuqV_G4kUOD5R69DPaPVP15PUekvCSqE8cYD8l5hW0ZOeevfHAaZ3pi8qTpbv7_cEGNgHi5MkePBhsee_2VFl53mScSrBw'

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = src
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Nie udało się załadować: ${src}`))
        document.head.appendChild(script)
    })
}

function loadStylesheet(href: string) {
    if (document.querySelector(`link[href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
}

function InpostMap({ onPointSelect }: { onPointSelect: (point: any) => void }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const callbackRef = useRef(onPointSelect)
    callbackRef.current = onPointSelect

    useEffect(() => {
        let cancelled = false

        async function init() {
            loadStylesheet(INPOST_CSS_URL)
            await loadScript(INPOST_SDK_URL)

            if (cancelled || !containerRef.current) return

            // Tworzymy Web Component <inpost-geowidget>
            const geowidget = document.createElement('inpost-geowidget')
            geowidget.setAttribute('token', TOKEN)
            geowidget.setAttribute('sandbox', 'true')
            geowidget.setAttribute('language', 'pl')
            geowidget.setAttribute('config', 'parcelcollect')
            geowidget.style.display = 'block'
            geowidget.style.width = '100%'
            geowidget.style.height = '100%'

            // Nasłuchujemy na event wyboru punktu
            geowidget.addEventListener('inpost.geowidget.init', (event: any) => {
                const api = event.detail.api
                // Opcjonalnie: ustaw pozycję startową
                api.changePosition({ longitude: 20.318968, latitude: 49.731131 }, 16)
            })

            // Globalny callback na wybór punktu
            const handlerName = `__inpostPointSelect_${Date.now()}`
                ; (window as any)[handlerName] = (point: any) => {
                    console.log('Wybrany paczkomat:', point)
                    callbackRef.current(point)
                }
            geowidget.setAttribute('onpoint', handlerName)

            containerRef.current.innerHTML = ''
            containerRef.current.appendChild(geowidget)
        }

        init()

        return () => {
            cancelled = true
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [])

    return <div ref={containerRef} className="h-[600px] w-full" />
}

export default function Paczkomaty({ onSetPoint }: { onSetPoint: any }) {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [point, setPoint] = useState({})

    const handlePointSelect = useCallback((point: any) => {
        onSetPoint({
            "inpost": {
                'name': point.name,
                'address': point.address_details,
                'img': point.image_url
            }
        })

        setPoint({
            'name': point.name,
            'address': point.address_details,
            'img': point.image_url

        })
        console.log('Wybrany paczkomat:', point)
        setOpen(false)
    }, [])

    const PointComponent = () => {
        // Jeśli nie ma punktu, nie wyświetlaj nic

        if (!Object.keys(point).length) return null;

        return (<div className="bg-gray-200 p-4 rounded-2xl mt-4">

            {point.img && <img className="w-full max-w-[250px] overflow rounded-2xl " src={point.img} alt={point.name} />}
            <b>{point.name}</b>
            <span className="block text-xs text-gray-500">
                {Object.values((point?.address ?? {})).join(", ")}
            </span>
        </div>)
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div>

                        <Button className="text-xs bg-[#ffc107]">
                            Wybierz paczkomat
                        </Button>
                        <PointComponent></PointComponent>
                    </div>

                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Wybierz paczkomat</DialogTitle>
                    </DialogHeader>
                    {open && <InpostMap onPointSelect={handlePointSelect} />}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <div>

                    <Button className="text-xs bg-[#ffc107]">
                        Wybierz paczkomat
                    </Button>
                    <PointComponent></PointComponent>
                </div>


            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Wybierz paczkomat</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    {open && <InpostMap onPointSelect={handlePointSelect} />}
                </div>
            </DrawerContent>
        </Drawer>
    )
}