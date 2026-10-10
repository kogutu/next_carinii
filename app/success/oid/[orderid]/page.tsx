import { SuccessPageContent } from '@/components/success/SuccessPageContent'
import { executeSQL } from '@/lib/db-mysql'
import { initPayment } from '@/lib/p24/payment_calbacks'
import { setUrlsP24 } from '@/lib/p24/p24-sdk'
import { getTrackingProducts } from '@/lib/typesense'
import { modelSku } from '@/lib/trackingProducts'
interface SuccessPageProps {
    params: Promise<{
        orderid: string
    }>
}

async function getOrderData(orderId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}`
        : 'http://localhost:3000'

    console.log(`${baseUrl}/api/orders/${orderId}`);
    const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error('Nie znaleziono zamówienia')
    }



    return response.json()
}

export default async function SuccessPage({ params }: SuccessPageProps) {
    const { orderid } = await params
    console.log(orderid);
    const orderData = await getOrderData(orderid)
    const sessionId: string = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setUrlsP24(orderData.incrementId);

    // return '';
    initPayment(orderData.incrementId, orderData.paymentMethod, sessionId);



    // dane produktów (ID produktu głównego, zdjęcia, kategorie) dla zdarzeń analitycznych zakupu
    const trackingProducts = await getTrackingProducts(
        (orderData.items ?? []).map((item: { sku: string }) => modelSku(String(item.sku))),
    )

    return <SuccessPageContent orderData={orderData} sessionid={sessionId} trackingProducts={trackingProducts} />
}