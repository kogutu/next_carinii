import crypto from 'crypto';

export interface CheckoutItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  finalPrice: number;
  quantity: string;
  rowTotal: number;
  image: string;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  street: string;
  postcode: string;
  city: string;
  country: string;
  phone: string;
  company: string | null;
  vatId?: string | null;
}

export interface CheckoutCustomer {
  customerId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  nip: string | null;
  companyName: string | null;
}

export interface CheckoutData {
  orderId: string;
  incrementId: string;
  status: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  customer: CheckoutCustomer;
  billingAddress: CheckoutAddress;
  shippingAddress: CheckoutAddress;
  shippingMethod: string;
  shippingDescription: string;
  paymentMethod: string;
  paymentMethodIns: string;
  paymentMethodCode: string;
  items: CheckoutItem[];
  couponCode: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  grandTotal: number;
  totalPaid: number;
  total: number;
  currency: string;
}

/**
 * Generate Przelewy24 payload from checkout data
 */
export function generateP24Payload(
  checkoutData: CheckoutData,
  sessionId: string,
  merchantId: number,
  crcKey: string
) {
  const amountInGrosze = Math.round(checkoutData.grandTotal * 100);
  
  // Generuj sygnaturę MD5
  const signatureString = `${merchantId}|${sessionId}|${amountInGrosze / 100}|${crcKey}`;
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');

  return {
    merchantId,
    posId: merchantId,
    sessionId,
    amount: amountInGrosze,
    currency: checkoutData.currency,
    description: `Zamówienie ${checkoutData.incrementId}`,
    email: checkoutData.customer.email,
    phone: checkoutData.customer.phone,
    firstName: checkoutData.customer.firstName,
    lastName: checkoutData.customer.lastName,
    sign: signature,
    // Dodatkowe informacje
    orderId: checkoutData.orderId,
    incrementId: checkoutData.incrementId,
    itemsCount: checkoutData.items.length,
    billingAddress: checkoutData.billingAddress,
    shippingAddress: checkoutData.shippingAddress,
    items: checkoutData.items,
  };
}
