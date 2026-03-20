
interface OrderSummaryDetailsProps {
  items: Array<{
    name: string
    sku: string
    quantity: number
    image: string,
    price: number
  }>
  subtotal: number
  shipping: number
  total: number
}

export function OrderSummaryDetails({ items, subtotal, shipping, total }: OrderSummaryDetailsProps) {
  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
            <th className="text-left py-3 px-3 font-semibold text-gray-900 text-xs uppercase">Produkt</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-900 text-xs uppercase">Cena</th>
            <th className="text-center py-3 px-3 font-semibold text-gray-900 text-xs uppercase">Ilość</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-900 text-xs uppercase">Wartość</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-3">
                <div className="flex gap-4 items-center">
                  <img src={item.image} alt="" className="h-20" />

                  <div>
                    <p className="text-gray-900 font-medium text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs mt-1">SKU: {item.sku}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-gray-700 text-sm">{item.price.toFixed(2)} zł</td>
              <td className="py-3 px-3 text-center text-gray-700 text-sm">{item.quantity}</td>
              <td className="py-3 px-3 text-right font-semibold text-gray-900 text-sm">
                {(item.price * item.quantity).toFixed(2)} zł
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-8 space-y-2 text-right max-w-sm ml-auto">
        <div className="flex justify-between text-gray-700 pb-2 text-sm">
          <span>Razem (netto):</span>
          <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between text-gray-700 pb-3 border-b border-gray-200 text-sm">
          <span>Koszt wysyłki:</span>
          <span className="font-semibold text-gray-900">{shipping.toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-3 px-4 py-3 rounded-lg bg-hert text-white">
          <span>RAZEM:</span>
          <span>{total.toFixed(2)} zł</span>
        </div>
      </div>
    </div>
  )
}
