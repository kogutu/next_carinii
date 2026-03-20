

import { CheckCircle2 } from 'lucide-react'
interface headerSucces {

  oid: string
}
export function SuccessHeader({ oid }: headerSucces) {
  return (
    <div className="mb-8 flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <CheckCircle2 className="h-5 w-5 text-[#d6b17b]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-700">Dziękujemy za zamówienie<br /><b className='text-hert'> #{oid}</b></h1>
      </div>
    </div>
  )
}
