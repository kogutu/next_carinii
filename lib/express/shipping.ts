import methods from '../../data/shipping_payment_methods.json'

// Szybka płatność oferuje tylko kurierów: paczkomat wymaga wyboru punktu na mapie, a pobranie wyklucza płatność online.
const EXPRESS_SHIPPING_CODES = ['dhl_dhl24pl_courier', 'flatrate5_flatrate5']

export type ExpressShippingOption = {
    code: string
    label: string
    price: number
}

export const getExpressShippingOptions = (): ExpressShippingOption[] =>
    methods.shipping_methods.PL
        .filter((method) => EXPRESS_SHIPPING_CODES.includes(method.code))
        .map((method) => ({ code: method.code, label: method.title, price: Number(method.price) }))

export const findShippingOption = (options: ExpressShippingOption[], code: string): ExpressShippingOption =>
    options.find((option) => option.code === code) ?? options[0]
