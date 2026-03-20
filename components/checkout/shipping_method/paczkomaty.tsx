
import { InpostGeowidgetReact } from 'inpost-geowidget-react'
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
import { useState } from 'react'

export default function Paczkomaty() {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzQlpXVzFNZzVlQnpDYU1XU3JvTlBjRWFveFpXcW9Ua2FuZVB3X291LWxvIn0.eyJleHAiOjIwODkxODU3NTEsImlhdCI6MTc3MzgyNTc1MSwianRpIjoiYjM5ZDA2OTctOTllYi00NWUyLTlmNjQtNThlNWQ2OGNlMWU5IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5pbnBvc3QucGwvYXV0aC9yZWFsbXMvZXh0ZXJuYWwiLCJzdWIiOiJmOjEyNDc1MDUxLTFjMDMtNGU1OS1iYTBjLTJiNDU2OTVlZjUzNTpjY2VlVUI5QXFvOXdsR3hZcjdGQ2N6bHQ4Q2pQeGhPcmVOX01GS055ODZNIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2hpcHgiLCJzZXNzaW9uX3N0YXRlIjoiZjk2OTE4OGMtMWQzMy00ZTExLWE3ZWQtZDU2ZjI4YWYwNzQyIiwic2NvcGUiOiJvcGVuaWQgYXBpOmFwaXBvaW50cyIsInNpZCI6ImY5NjkxODhjLTFkMzMtNGUxMS1hN2VkLWQ1NmYyOGFmMDc0MiIsImFsbG93ZWRfcmVmZXJyZXJzIjoiMTkyLjE2OC4xLjI5IiwidXVpZCI6Ijg1NGFkZmZjLWQyYWEtNGVmZC1iZTA2LTk2MzJjYzkyNGQyYyJ9.SDk6iIZxbWR17rsDWrGcYLMKYhM1hUDLXNzi9OcvxLESlw5kZ1VHHOAc4XKcmVq7lBBc9YeEVgaLmm9nApgQOkYoFSxwIFCDh7E5_OcJ7SJIltA1qBMVWi6t7oDN9odBkBjUmNERQ1Tgt2gHDzenYhovI-A5JrJ7GT-mdCfwTZM_1or-ACtfsGiEfvbAiyNnFvErgpYDVeUCl_IQYssg3-2VvX2sdYqymaKOKA7oszO8h0-QQAaa7SVFoQirCpvu7HVbcBMR3qRzw-fZX8gwSDtHavpyzckGaIMI2RcfFpomO99sD8afIOCzX7VlULj0e43xNbrQTn7wC6lgiWVy5g'
    const identifier = 'Geo1'
    const language = 'pl'
    const config = 'parcelcollect'
    const sandbox = true

    const apiReady = (api: any) => {
        api.changePosition({ longitude: 20.318968, latitude: 49.731131 }, 16)
    }

    const pointSelect = (point: any) => {
        console.log('Wybrany paczkomat: ', point)
        setOpen(false) // Zamknij po wybraniu
    }

    const PaczkomatyContent = () => (
        <div className="h-[600px] w-full">
            <InpostGeowidgetReact
                token={token}
                identifier={identifier}
                apiReady={apiReady}
                pointSelect={pointSelect}
            />
        </div>
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className='text-xs bg-black/70 '>
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