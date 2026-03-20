import { Package, Truck, Weight } from "lucide-react"

interface ProductShippingProps {

  shipping_client: number
  shippingAmount: number
  weight: number
  packages: number
  nextDeliveryTime?: string
}

export function ProductShipping({
  shipping_client,
  shippingAmount,
  weight,
  packages,
  nextDeliveryTime,
}: ProductShippingProps) {
  return (
    <div className="border rounded-lg ">
      <h3 className="font-semibold mb-3 bg-gray-100 p-2 ">wysyłka:</h3>
      <div className="grid grid-cols-3 gap-4 text-center pb-2">
        <div>

          <div className="flex flex-col items-center">
            <Truck className="h-10 w-10 mb-1 text-mpgoldb" />
            <div className="text-xl font-bold">{shippingAmount} zł</div>
            <div className="text-xs text-muted-foreground mb-1">dostawa</div>


          </div>
        </div>
        <div>
          <div className="flex flex-col items-center">
            <Package className="h-10 w-10 mb-1 text-mpgoldb" />

            <div className="text-xl font-bold">


              {shipping_client == 1 ? 24 : shipping_client}
              {shipping_client == 1 && (<small className="text-xs"> h</small>)}


              {shipping_client > 1 && (<small className="text-xs"> dni</small>)}

            </div>
            <div className="text-xs text-muted-foreground mb-1">wysłka</div>

          </div>
        </div>
        <div>
          <div className="flex flex-col items-center">
            <Weight className="h-10 w-10 mb-1 text-mpgoldb" />

            <div className="text-xl font-bold">{weight} <small className="text-xs">kg</small></div>
            <div className="text-xs text-muted-foreground mb-1">waga</div>

          </div>
        </div>
      </div>

      {nextDeliveryTime && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-center">
          <div className="text-sm font-medium">następna możliwa wysyłka:</div>
          <div className="text-lg font-bold text-blue-600">{nextDeliveryTime}</div>
        </div>
      )}
    </div>
  )
}
