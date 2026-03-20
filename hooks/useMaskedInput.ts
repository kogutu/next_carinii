/**
 * Format NIP (10 digits) to pattern: XX-XXX-XX-X
 */
export const formatNIP = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length === 0) return ''
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
}

/**
 * Format Postcode (5 digits) to pattern: XX-XXX
 */
export const formatPostcode = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 0) return ''
    if (cleaned.length <= 2) return cleaned
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}`
}

/**
 * Format Phone (9 digits) to pattern: +48 XXX XXX XXX
 */
export const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length === 0) return ''
    if (cleaned.length <= 3) return `${cleaned}`
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}
