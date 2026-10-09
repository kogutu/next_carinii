const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7]

export const normalizeNip = (value: string): string => value.replace(/\D/g, '')

export const isValidNip = (value: string): boolean => {
    const nip = normalizeNip(value)
    if (nip.length !== 10) return false

    const digits = nip.split('').map(Number)
    const checksum = NIP_WEIGHTS.reduce((sum, weight, i) => sum + weight * digits[i], 0) % 11

    return checksum !== 10 && checksum === digits[9]
}
