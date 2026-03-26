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
import { useEffect, useRef, useState } from 'react'

declare global {
    interface Window {
        easyPack: any
    }
}

const INPOST_SDK_URL = 'https://geowidget.inpost.pl/inpost-geowidget.js'
const INPOST_CSS_URL = 'https://geowidget.inpost.pl/inpost-geowidget.css'
const TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzQlpXVzFNZzVlQnpDYU1XU3JvTlBjRWFveFpXcW9Ua2FuZVB3X291LWxvIn0.eyJleHAiOjIwODk5MTIxMDAsImlhdCI6MTc3NDU1MjEwMCwianRpIjoiZTBmODBhYzAtYmMxZC00NTViLWI1ZDAtMGFjNTYxODg5Yjk5IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5pbnBvc3QucGwvYXV0aC9yZWFsbXMvZXh0ZXJuYWwiLCJzdWIiOiJmOjEyNDc1MDUxLTFjMDMtNGU1OS1iYTBjLTJiNDU2OTVlZjUzNTpjY2VlVUI5QXFvOXdsR3hZcjdGQ2N6bHQ4Q2pQeGhPcmVOX01GS055ODZNIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2hpcHgiLCJzZXNzaW9uX3N0YXRlIjoiNjEwOWNlMDItMmQwNi00MjQ3LTg2ZjUtMzQ0NjhjNGIyYWU5Iiwic2NvcGUiOiJvcGVuaWQgYXBpOmFwaXBvaW50cyIsInNpZCI6IjYxMDljZTAyLTJkMDYtNDI0Ny04NmY1LTM0NDY4YzRiMmFlOSIsImFsbG93ZWRfcmVmZXJyZXJzIjoiMTY4LjExOS44LjI1NCIsInV1aWQiOiI4NTRhZGZmYy1kMmFhLTRlZmQtYmUwNi05NjMyY2M5MjRkMmMifQ.MDAOXqxVLJyhlOCScXbTKD98lCqdjZPbjiWU94TR0hNTC0iYi2d_QdHSGjBd8vu02xAkFx_IA23sq-ZZ9Q0rykRn9E4lTxRjnLP5yZ2XdiyM2ja6AE-QAWyDW_hsXt9YBkaqiL_KspyFXx_MhAslQvtju14iwULT9jhj46-qoSZsosmJiHDNNFtPUhdCPm2SKLXrx2Lx5cHgG3gvrcFUBKk0Runj-PvuWwolpmSnOuhAS_9Le9JS9jANe7FIispK7Xb4knj8mEHZdmsB42VRIYvwetxgrsKtbNbeLuobKnqaRlG33IN8klou7JR7Hg9YchLepbPvw9Eq2zsxV4i1og'

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = true
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
    const mapRef = useRef<any>(null)

    useEffect(() => {
        let cancelled = false

        async function init() {
            loadStylesheet(INPOST_CSS_URL)
            await loadScript(INPOST_SDK_URL)

            if (cancelled || !containerRef.current) return

            // Wyczyść kontener gdyby był remount
            containerRef.current.innerHTML = ''

            window.easyPack.init({
                instance: 'pl',
                token: TOKEN,
            })

            mapRef.current = window.easyPack.mapWidget(containerRef.current, (point: any) => {
                console.log('Wybrany paczkomat:', point)
                onPointSelect(point)
            })
        }

        init()

        return () => {
            cancelled = true
            // SDK nie ma oficjalnego destroy, więc czyścimy kontener
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
            mapRef.current = null
        }
    }, [onPointSelect])

    return <div ref={containerRef} className="h-[600px] w-full" />
}

export default function Paczkomaty() {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const handlePointSelect = (point: any) => {
        console.log('Wybrany paczkomat:', point)
        setOpen(false)
    }

    const PaczkomatyContent = () => (
        <InpostMap onPointSelect={handlePointSelect} />
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="text-xs bg-black/70">
                        Wybierz paczkomat
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Wybierz paczkomat</DialogTitle>
                    </DialogHeader>
                    <PaczkomatyContent />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline">
                    Wybierz paczkomat
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Wybierz paczkomat</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    <PaczkomatyContent />
                </div>
            </DrawerContent>
        </Drawer>
    )
}