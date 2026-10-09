export type Country = {
    name: string
    iso: string
    phoneCode: string
}

export const COUNTRIES: Country[] = [
    { name: 'Polska', iso: 'PL', phoneCode: '+48' },
    { name: 'Wielka Brytania', iso: 'GB', phoneCode: '+44' },
    { name: 'Francja', iso: 'FR', phoneCode: '+33' },
    { name: 'Niemcy', iso: 'DE', phoneCode: '+49' },
    { name: 'Włochy', iso: 'IT', phoneCode: '+39' },
    { name: 'Hiszpania', iso: 'ES', phoneCode: '+34' },
    { name: 'Holandia', iso: 'NL', phoneCode: '+31' },
    { name: 'Austria', iso: 'AT', phoneCode: '+43' },
    { name: 'Szwajcaria', iso: 'CH', phoneCode: '+41' },
    { name: 'Szwecja', iso: 'SE', phoneCode: '+46' },
    { name: 'Norwegia', iso: 'NO', phoneCode: '+47' },
    { name: 'Dania', iso: 'DK', phoneCode: '+45' },
    { name: 'Finlandia', iso: 'FI', phoneCode: '+358' },
    { name: 'Irlandia', iso: 'IE', phoneCode: '+353' },
    { name: 'Grecja', iso: 'GR', phoneCode: '+30' },
    { name: 'Belgia', iso: 'BE', phoneCode: '+32' },
    { name: 'Luksemburg', iso: 'LU', phoneCode: '+352' },
    { name: 'Rumunia', iso: 'RO', phoneCode: '+40' },
    { name: 'Węgry', iso: 'HU', phoneCode: '+36' },
    { name: 'Czechy', iso: 'CZ', phoneCode: '+420' },
    { name: 'Słowacja', iso: 'SK', phoneCode: '+421' },
]

export const DEFAULT_COUNTRY = 'Polska'

export const countryIso = (name: string): string =>
    COUNTRIES.find((country) => country.name === name)?.iso ?? 'PL'
