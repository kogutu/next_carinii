
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

    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzQlpXVzFNZzVlQnpDYU1XU3JvTlBjRWFveFpXcW9Ua2FuZVB3X291LWxvIn0.eyJleHAiOjIwODk5MTIxMDAsImlhdCI6MTc3NDU1MjEwMCwianRpIjoiZTBmODBhYzAtYmMxZC00NTViLWI1ZDAtMGFjNTYxODg5Yjk5IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5pbnBvc3QucGwvYXV0aC9yZWFsbXMvZXh0ZXJuYWwiLCJzdWIiOiJmOjEyNDc1MDUxLTFjMDMtNGU1OS1iYTBjLTJiNDU2OTVlZjUzNTpjY2VlVUI5QXFvOXdsR3hZcjdGQ2N6bHQ4Q2pQeGhPcmVOX01GS055ODZNIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2hpcHgiLCJzZXNzaW9uX3N0YXRlIjoiNjEwOWNlMDItMmQwNi00MjQ3LTg2ZjUtMzQ0NjhjNGIyYWU5Iiwic2NvcGUiOiJvcGVuaWQgYXBpOmFwaXBvaW50cyIsInNpZCI6IjYxMDljZTAyLTJkMDYtNDI0Ny04NmY1LTM0NDY4YzRiMmFlOSIsImFsbG93ZWRfcmVmZXJyZXJzIjoiMTY4LjExOS44LjI1NCIsInV1aWQiOiI4NTRhZGZmYy1kMmFhLTRlZmQtYmUwNi05NjMyY2M5MjRkMmMifQ.MDAOXqxVLJyhlOCScXbTKD98lCqdjZPbjiWU94TR0hNTC0iYi2d_QdHSGjBd8vu02xAkFx_IA23sq-ZZ9Q0rykRn9E4lTxRjnLP5yZ2XdiyM2ja6AE-QAWyDW_hsXt9YBkaqiL_KspyFXx_MhAslQvtju14iwULT9jhj46-qoSZsosmJiHDNNFtPUhdCPm2SKLXrx2Lx5cHgG3gvrcFUBKk0Runj-PvuWwolpmSnOuhAS_9Le9JS9jANe7FIispK7Xb4knj8mEHZdmsB42VRIYvwetxgrsKtbNbeLuobKnqaRlG33IN8klou7JR7Hg9YchLepbPvw9Eq2zsxV4i1og'
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