import Image from "next/image"

interface ProductDimensionsProps {
  dimensions: {
    length?: number
    width?: number
    height?: number
  }
}

export function ProductDimensions({ dimensions }: ProductDimensionsProps) {
  return (
    <div className="grid-cols-4 grid gap-2">
      <div className="box_dimension bg-mpwhite rounded-2xl text-center flex justify-center items-center flex-wrap">
        <span className="text-sm p-2">długość</span>
        <div className="w-full text-center">
          <Image src="/dimensions/dl.png" className="mx-auto" alt="wy" width={52} height={52} />
        </div>
        <span className="text-center  w-full mx-2 bg-white mt-2 mb-2 rounded px-2">60 cm</span>
      </div>
      <div className="box_dimension bg-mpwhite rounded-2xl text-center flex justify-center items-center flex-wrap">
        <span className="text-sm p-2">szerokość</span>
        <div className="w-full text-center">
          <Image src="/dimensions/sz.png" className="mx-auto" alt="sz" width={52} height={52} />
        </div>
        <span className="text-center  w-full mx-2 bg-white mt-2 mb-2 rounded px-2">58 cm</span>
      </div>
      <div className="box_dimension bg-mpwhite rounded-2xl text-center flex justify-center items-center flex-wrap">
        <span className="text-sm p-2">wysokość</span>
        <div className="w-full text-center">
          <Image src="/dimensions/wy.png" className="mx-auto" alt="dl" width={52} height={52} />
        </div>
        <span className="text-center w-full mx-2 bg-white mt-2 mb-2 rounded px-2">86 cm</span>
      </div>

      <div className="box_dimension bg-mpwhite rounded-2xl text-center flex justify-center items-center flex-wrap">
        <span className="text-sm p-2">waga</span>
        <div className="w-full text-center">
          <svg width="47" className="mx-auto" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_90_257)">
              <path d="M43.0849 0H3.91505C1.75402 0 0 1.75402 0 3.91505V43.0849C0 45.246 1.75402 47 3.91505 47H43.0849C45.246 47 47 45.246 47 43.0849V3.91505C47 1.75402 45.246 0 43.0849 0ZM44.3932 43.0849C44.3932 43.8021 43.8118 44.3932 43.0849 44.3932H24.8082V24.2074C24.8082 23.4903 24.2268 22.8992 23.5 22.8992C22.7829 22.8992 22.1918 23.4806 22.1918 24.2074V44.3932H3.91505C3.19794 44.3932 2.6068 43.8118 2.6068 43.0849V34.499H5.09732C5.81443 34.499 6.40557 33.9175 6.40557 33.1907C6.40557 32.4639 5.82412 31.8825 5.09732 31.8825H2.6068V29.2757H7.71381C8.43093 29.2757 9.02206 28.6942 9.02206 27.9674C9.02206 27.2503 8.44062 26.6592 7.71381 26.6592H2.6068V3.91505C2.6068 3.19794 3.18825 2.6068 3.91505 2.6068H43.0849C43.8021 2.6068 44.3932 3.18825 44.3932 3.91505V43.0849Z" fill="#D3C19E" />
              <path d="M37.067 8.3728C36.9604 8.04332 36.7182 7.78167 36.4081 7.62662C32.3961 5.74662 27.9287 4.74847 23.5 4.74847C19.0714 4.74847 14.6039 5.74662 10.592 7.63631C10.2819 7.78167 10.0396 8.05301 9.92332 8.3728C9.80703 8.70229 9.82641 9.06085 9.97177 9.37095L13.9934 17.9279C14.1388 18.238 14.4101 18.4802 14.7299 18.5965C15.0594 18.7128 15.418 18.6934 15.7281 18.5481C18.141 17.4142 20.7285 16.8134 23.5 16.8134C26.165 16.8134 28.8493 17.4142 31.2623 18.5481C31.4367 18.6353 31.8147 18.7322 32.2604 18.5965C32.5899 18.4899 32.8516 18.238 32.9969 17.9279L37.0186 9.37095C37.1639 9.06085 37.1833 8.70229 37.067 8.3728ZM31.1848 15.6699C29.1497 14.8656 26.9887 14.3907 24.8083 14.2454V10.3594C24.8083 9.64229 24.2268 9.05116 23.5 9.05116C22.7829 9.05116 22.1918 9.6326 22.1918 10.3594V14.2454C20.0114 14.3811 17.8503 14.8656 15.8153 15.6699L12.8984 9.46786C16.2417 8.08208 19.8854 7.35528 23.5 7.35528C27.1147 7.35528 30.7487 8.08208 34.1017 9.46786L31.1848 15.6699Z" fill="#D3C19E" />
            </g>
            <defs>
              <clipPath id="clip0_90_257">
                <rect width="47" height="47" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <span className="text-center w-full mx-2  bg-white mt-2 mb-2 rounded px-2">18 kg</span>
      </div>



    </div>
  )
}
