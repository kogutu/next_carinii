'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_PHOTOS } from './returnOptions'

type Photo = {
    id: string
    preview: string
    status: 'uploading' | 'done' | 'error'
    token?: string
    error?: string
}

type PhotoUploaderProps = {
    // tokeny wysłanych zdjęć + informacja, czy coś jeszcze się wysyła
    onChange: (tokens: string[], isBusy: boolean) => void
    disabled?: boolean
}

const MAX_SIDE = 1600
const JPEG_QUALITY = 0.82

// Zdjęcie z telefonu waży kilka MB — zmniejszamy je przed wysłaniem (limit żądania na Vercelu to ok. 4,5 MB).
const compressImage = async (file: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('canvas')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()

    return new Promise((resolve, reject) =>
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob'))), 'image/jpeg', JPEG_QUALITY),
    )
}

export default function PhotoUploader({ onChange, disabled = false }: PhotoUploaderProps) {
    const [photos, setPhotos] = useState<Photo[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const previewsRef = useRef<string[]>([])

    useEffect(() => {
        const tokens = photos.filter((photo) => photo.status === 'done' && photo.token).map((photo) => photo.token as string)
        onChange(tokens, photos.some((photo) => photo.status === 'uploading'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photos])

    // zwolnienie adresów podglądu przy opuszczeniu formularza
    useEffect(() => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)), [])

    const update = (id: string, patch: Partial<Photo>) =>
        setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)))

    const upload = async (file: File) => {
        const id = crypto.randomUUID()
        const preview = URL.createObjectURL(file)
        previewsRef.current.push(preview)
        setPhotos((current) => [...current, { id, preview, status: 'uploading' }])

        try {
            const blob = await compressImage(file)
            const form = new FormData()
            form.append('file', blob, 'photo.jpg')

            const response = await fetch('/api/returns/photo', { method: 'POST', body: form })
            const result = await response.json().catch(() => null)

            if (!response.ok || !result?.success) {
                update(id, { status: 'error', error: result?.message ?? 'Nie udało się wysłać zdjęcia' })
                return
            }
            update(id, { status: 'done', token: result.data.token })
        } catch {
            update(id, { status: 'error', error: 'Nie udało się odczytać zdjęcia' })
        }
    }

    const handleFiles = (files: FileList | null) => {
        if (!files) return
        const room = MAX_PHOTOS - photos.length
        Array.from(files).slice(0, Math.max(0, room)).forEach(upload)
        if (inputRef.current) inputRef.current.value = ''
    }

    const remove = (id: string) => setPhotos((current) => current.filter((photo) => photo.id !== id))

    const canAdd = !disabled && photos.length < MAX_PHOTOS

    return (
        <div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((photo) => (
                    <li key={photo.id} className="relative aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photo.preview}
                            alt="Dodane zdjęcie"
                            className={cn(
                                'size-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-black/10',
                                photo.status !== 'done' && 'opacity-60',
                            )}
                        />
                        {photo.status === 'uploading' && (
                            <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label="Wysyłanie zdjęcia">
                                <Loader2 className="size-6 animate-spin text-foreground motion-reduce:animate-none" aria-hidden="true" />
                            </span>
                        )}
                        {photo.status === 'error' && (
                            <span className="absolute inset-x-1 bottom-1 rounded-md bg-destructive px-1.5 py-1 text-[11px] leading-tight text-destructive-foreground" role="alert">
                                {photo.error}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => remove(photo.id)}
                            aria-label="Usuń zdjęcie"
                            className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </li>
                ))}

                {canAdd && (
                    <li className="aspect-square">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="flex size-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                        >
                            <ImagePlus className="size-6" aria-hidden="true" />
                            <span className="text-xs font-medium">Dodaj zdjęcie</span>
                        </button>
                    </li>
                )}
            </ul>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => handleFiles(event.target.files)}
            />

            <p className="mt-3 text-xs tabular-nums text-muted-foreground">
                {photos.length}/{MAX_PHOTOS} zdjęć · JPG, PNG lub WebP
            </p>
        </div>
    )
}
