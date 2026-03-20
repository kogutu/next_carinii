import { Product } from "@/components/product/ProductCardMp"

export function StockLevel({ product, showText }: { product: any, showText?: boolean }) {

    const stockQuantity: any = product?.stock?.stock?.real_quantity || product.qty?.toString() || "0"

    return (


        <div className="stock flex items-baseline gap-3">
            {(!showText) && (
                <span style={{ fontSize: "12px" }} className="dpsss" >Ilość:</span>
            )}
            {parseInt(stockQuantity) < 10 && (
                <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 513" width="20" height="20">

                    <path className="sslow" d="m0 281.9h128.8v230.1h-128.8z"></path>
                    <path className="ssbar" d="m191.6 135.9h128.8v376.1h-128.8z"></path>
                    <path className="ssbar" d="m384.2 0h128.8v512h-128.8z"></path>
                </svg>
            )}
            {(parseInt(stockQuantity) >= 10 && parseInt(stockQuantity) < 40) && (
                <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 513" width="20" height="20">

                    <path className="ssbar" d="m0 281.9h128.8v230.1h-128.8z"></path>
                    <path className="ssmid" d="m191.6 135.9h128.8v376.1h-128.8z"></path>
                    <path className="ssbar" d="m384.2 0h128.8v512h-128.8z"></path>
                </svg>)}
            {parseInt(stockQuantity) >= 40 && (

                <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 513" width="20" height="20">

                    <path className="ssbar" d="m0 281.9h128.8v230.1h-128.8z"></path>
                    <path className="ssbar" d="m191.6 135.9h128.8v376.1h-128.8z"></path>
                    <path className="ssbig" d="m384.2 0h128.8v512h-128.8z"></path>
                </svg>
            )}
            {(showText) && (
                (parseInt(stockQuantity) <= 0) && (
                    <span style={{ fontSize: "12px" }} className="dpsss" >Brak na magazynie</span>
                )
            )}
            {(showText) && (
                (parseInt(stockQuantity) < 10 && parseInt(stockQuantity) > 0) && (
                    <span style={{ fontSize: "12px" }} className="dpsss" >Zaraz zabraknie</span>
                )
            )}
            {(showText) && (
                (parseInt(stockQuantity) >= 10 && parseInt(stockQuantity) < 40) && (
                    <span style={{ fontSize: "12px" }} className="dpsss" >Ostatnie sztuki na magazynie</span>
                )
            )}
            {(showText) && (
                (parseInt(stockQuantity) >= 40) && (
                    <span style={{ fontSize: "12px" }} className="dpsss" >Dostępne</span>
                )
            )}
        </div>

    )
}