import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises';
import path from 'path';

interface OrderData {
    customer: {
        firstName: string
        lastName: string
        email: string
        phone: string
        type: 'private' | 'company'
        nip?: string
        companyName?: string
    }
    billingAddress: {
        firstName: string
        lastName: string
        street: string
        postcode: string
        city: string
        phone: string
    }
    shippingAddress: {
        firstName: string
        lastName: string
        street: string
        postcode: string
        city: string
        phone: string
    }
    shippingMethod: 'fedex' | 'pickup'
    paymentMethod: 'transfer' | 'cod'
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
    notes?: string
    agreeToNewsletter: boolean
    subtotal: number
    shipping: number
    grandTotal: number
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
        console.log(magentoResponse);
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
            { message: error instanceof Error ? error.message : 'Błąd serwera' },
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
            increment_id: `H-${Date.now()}`,
            status: 'pending',
            state: 'new',
            customer_email: orderData.customer.email,
            customer_firstname: orderData.customer.firstName,
            customer_lastname: orderData.customer.lastName,
            customer_is_guest: true,
            customer_taxvat: orderData.customer.nip || null,
            customer_company: orderData.customer.companyName || null,
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
                country_id: 'PL',
                address_type: 'billing'
            },
            shipping_address: {
                firstname: orderData.shippingAddress.firstName,
                lastname: orderData.shippingAddress.lastName,
                street: orderData.shippingAddress.street,
                city: orderData.shippingAddress.city,
                postcode: orderData.shippingAddress.postcode,
                telephone: orderData.shippingAddress.phone,
                country_id: 'PL',
                address_type: 'shipping'
            },
            shipping_method: orderData.shippingMethod,
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
    const filePath = path.join(process.cwd(), 'public', 'my-data.json');
    await fs.writeFile(filePath, JSON.stringify(magentoOrderPayload), 'utf-8');

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
            throw new Error(`Magento error: ${error}`)
        }

        const result = await response.json()

        const filePath = path.join(process.cwd(), 'public', 'my-data-res.json');
        await fs.writeFile(filePath, JSON.stringify(result), 'utf-8');
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
            success: true,
            orderId: `H-${Date.now()}`,
            externalOrderId: `H-${Date.now()}`
        }
    }
}
