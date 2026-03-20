import { SuccessPageContent } from '@/components/success/SuccessPageContent'

interface SuccessPageProps {
    params: Promise<{
        orderid: string
    }>
}

export default async function SuccessPage({ params }: SuccessPageProps) {
    const { orderid } = await params

    return <SuccessPageContent orderId={orderid} />
}
