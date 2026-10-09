import { NextRequest, NextResponse } from 'next/server'
import { generateOrderNumber } from '@/lib/orderNumber'

type OrderAddress = {
    firstName: string
    lastName: string
    street: string
    postcode: string
    city: string
    phone: string
    // ISO 3166-1 alpha-2
    country?: string
    // tylko adres rozliczeniowy przy fakturze na firmę
    company?: string
    vatId?: string
}

interface OrderData {
    customer: {
        firstName: string
        lastName: string
        email: string
        phone: string
        phoneCode?: string
        type: 'private' | 'company'
        nip?: string
        companyName?: string
    }
    documentType?: 'receipt' | 'invoice'
    billingAddress: OrderAddress
    shippingAddress: OrderAddress
    shippingMethod: string
    paymentMethod: string
    items: Array<{
        productId: string
        sku: string
        name: string
        price: number
        quantity: number
        variantId: string
        variant: any
    }>
    couponCode?: string
    Inpost?: any
    notes?: string
    agreeToNewsletter: boolean
    // Klient wysyła *Netto/*Brutto — ceny i tak przelicza createOrder.php
    subtotal?: number
    shipping?: number
    grandTotal?: number
}

export async function POST(request: NextRequest) {
    try {
        const orderData: OrderData = await request.json()

        // Walidacja danych
        if (!orderData.customer.email || !orderData.items.length) {
            return NextResponse.json(
                { message: 'Brakuje wymaganych danych: email i produkty' },
                { status: 400 }
            )
        }

        // Tutaj wysyłasz dane do Magento 2
        const magentoResponse = await sendToMagento(orderData)
        if (!magentoResponse.success) {

            // console.log(Not all products are available in the requested quantity - +-81214);
            let err = JSON.parse(magentoResponse.error) ?? { message: "" };
            let errItemId = "";
            if (err.message.length > 0) {
                errItemId = err.message.split("-+-")[1] ?? 0;
            }
            let errMsg = "";
            if (err.message.includes("Not all products are available")) errMsg = "Produkt już niedostępny";
            return NextResponse.json(
                {
                    success: false,
                    message: errMsg,
                    message_org: JSON.parse(magentoResponse.error),
                    errItemId: errItemId
                },
                { status: 200 }
            )
        }
        return NextResponse.json(
            {
                success: true,
                message: 'Zamówienie zostało wysłane do Magento 2',
                orderId: magentoResponse.orderId,
                externalOrderId: magentoResponse.externalOrderId
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[v0] Error processing order:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}

async function sendToMagento(orderData: OrderData) {
    // Konfiguracja Magento (zmień na swoje dane)
    const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL || 'http://magento.local'
    const MAGENTO_ENDPOINT = `https://sklep.carinii.com.pl/directseo/nextjs/orders/createOrder.php`


    // Transformacja danych na format Magento 2
    const magentoOrderPayload = {
        entity: {
            increment_id: generateOrderNumber(),
            status: 'pending',
            state: 'new',
            customer_email: orderData.customer.email,
            customer_firstname: orderData.customer.firstName,
            customer_lastname: orderData.customer.lastName,
            customer_is_guest: true,
            customer_taxvat: orderData.customer.nip || null,
            customer_company: orderData.customer.companyName || null,
            document_type: orderData.documentType ?? 'receipt',
            invoice_requested: orderData.documentType === 'invoice',
            store_id: 1,
            global_currency_code: 'PLN',
            base_currency_code: 'PLN',
            order_currency_code: 'PLN',
            subtotal: orderData.subtotal,
            base_subtotal: orderData.subtotal,
            shipping_amount: orderData.shipping,
            base_shipping_amount: orderData.shipping,
            grand_total: orderData.grandTotal,
            base_grand_total: orderData.grandTotal,
            payment: {
                method: orderData.paymentMethod,
                additional_information: [
                ]
            },
            billing_address: {
                firstname: orderData.billingAddress.firstName,
                lastname: orderData.billingAddress.lastName,
                street: orderData.billingAddress.street,
                city: orderData.billingAddress.city,
                postcode: orderData.billingAddress.postcode,
                telephone: orderData.billingAddress.phone,
                company: orderData.billingAddress.company || null,
                vat_id: orderData.billingAddress.vatId || null,
                country_id: orderData.billingAddress.country ?? 'PL',
                address_type: 'billing'
            },
            shipping_address: {
                firstname: orderData.shippingAddress.firstName,
                lastname: orderData.shippingAddress.lastName,
                street: orderData.shippingAddress.street,
                city: orderData.shippingAddress.city,
                postcode: orderData.shippingAddress.postcode,
                telephone: orderData.shippingAddress.phone,
                country_id: orderData.shippingAddress.country ?? 'PL',
                address_type: 'shipping'
            },
            inpost:
            {
                parcel_target_machine_id: orderData.Inpost?.name,
                receiver_phone: orderData.shippingAddress.phone,
                parcel_size: 'A',
                parcel_target_machine_detail: { "description": "Order Magento", "receiver": { "email": orderData.customer.email, "phone": orderData.shippingAddress.phone }, "size": "A", "tmp_id": "780566902252121", "target_machine": orderData.Inpost?.name, "cod_amount": "" }
            },
            shipping_method: orderData.shippingMethod,
            // createOrder.php zapisuje notatkę i zgodę newsletter w historii zamówienia, a kupon przypina do koszyka
            notes: orderData.notes || null,
            agreeToNewsletter: Boolean(orderData.agreeToNewsletter),
            coupon_code: orderData.couponCode || null,
            items: orderData.items.map(item => ({
                sku: item.sku,
                name: item.name,
                product_id: item.productId,
                variant_id: item.variantId,
                variant: item.variant,
                qty_ordered: item.quantity,
                price: item.price,
                base_price: item.price,
                row_total: item.price * item.quantity,
                base_row_total: item.price * item.quantity
            }))
        }


    }

    try {
        const response = await fetch(MAGENTO_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAGENTO_API_TOKEN}`
            },
            body: JSON.stringify(magentoOrderPayload)
        })

        if (!response.ok) {
            const error = await response.text()
            return {
                success: false,
                type: "not ok",
                error: error
            }
        }

        const result = await response.json()

        return {
            success: true,
            orderId: result.orderId,
            externalOrderId: result.incrementId,
            orderData: result.orderData
        }
    } catch (error) {
        console.error('[v0] Magento API error:', error)
        // Fallback - zwróć wewnętrzne ID
        return {
            success: false,
            error: error
        }
    }
}
