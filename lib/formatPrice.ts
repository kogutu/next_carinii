const plnFormat = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })

/** 1213.99 → „1213,99 zł”. */
export const formatPrice = (value: number): string => plnFormat.format(value)
