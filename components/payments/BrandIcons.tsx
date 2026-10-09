import type { ReactElement } from 'react'
import { cn } from '@/lib/utils'

// Znaki płatności używane w koszyku i na stronie zamówienia. Wszystkie są dekoracyjne (aria-hidden) —
// nazwę metody zawsze podaje tekst obok.

type IconProps = { className?: string }

// Logotypy kart mają własne tło — obrys 1px w czerni 10% oddziela je od białych powierzchni
const CARD_LOGO = 'h-6 w-auto rounded-[3px] outline outline-1 -outline-offset-1 outline-black/10'

export const VisaIcon = ({ className }: IconProps): ReactElement => (
    <svg className={cn(CARD_LOGO, className)} viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="780" height="500" rx="40" fill="#1A1F71" />
        <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8zM540.7 157.2c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-32 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.1 0 92.5-26.3 92.9-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.3-42.9zM676.3 152.9h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.3 179.5h56.1s9.2-24.1 11.2-29.4c6.1 0 60.7.1 68.5.1 1.6 6.9 6.5 29.3 6.5 29.3h49.6l-43.3-195.8zm-65.8 126.3c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.6h-44.6zM231.4 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65.1-73.7-82l47.8 171.3 56.5-.1 84.1-195.7h-56.8z" fill="#fff" />
        <path d="M131.9 152.9H46.3l-.7 4c67 16.2 111.3 55.3 129.7 102.3l-18.7-90c-3.2-12.4-12.6-16-24.7-16.3z" fill="#F9A533" />
    </svg>
)

export const MastercardIcon = ({ className }: IconProps): ReactElement => (
    <svg className={cn(CARD_LOGO, className)} viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="780" height="500" rx="40" fill="#fff" />
        <circle cx="310" cy="250" r="170" fill="#EB001B" />
        <circle cx="470" cy="250" r="170" fill="#F79E1B" />
        <path d="M390 120.8c-44.5 35.1-73 89.4-73 150.2s28.5 115.1 73 150.2c44.5-35.1 73-89.4 73-150.2S434.5 155.9 390 120.8z" fill="#FF5F00" />
    </svg>
)

// „G” Google w czterech kolorach
export const GoogleGIcon = ({ className }: IconProps): ReactElement => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        <path fill="#34A853" d="M6.3 14.7l7 5.1C15 15.6 19.1 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.6 6.3 14.7z" />
        <path fill="#FBBC04" d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 37.4 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.6 41.4 15.2 46 24 46z" />
        <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3.2-3 5.8-5.7 7.5l6.5 5.5C40.6 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z" />
    </svg>
)

// Znak „G Pay”: kolorowe „G” + napis w kolorze tekstu (działa na ciemnym i jasnym tle)
export const GooglePayMark = ({ className }: IconProps): ReactElement => (
    <span className={cn('inline-flex items-center gap-1 font-medium tracking-tight', className)} aria-hidden="true">
        <GoogleGIcon className="size-[1.15em]" />
        <span>Pay</span>
    </span>
)

const APPLE_GLYPH =
    'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701'

// Znak „Apple Pay”: logo jabłka + napis w kolorze tekstu
export const ApplePayMark = ({ className }: IconProps): ReactElement => (
    <span className={cn('inline-flex items-center gap-1 font-semibold tracking-tight', className)} aria-hidden="true">
        <svg className="size-[1.15em]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d={APPLE_GLYPH} />
        </svg>
        <span>Pay</span>
    </span>
)

// Plakietka na jasnym tle (lista metod płatności w koszyku)
const BADGE = 'inline-flex h-6 items-center rounded-[3px] bg-white px-1.5 text-[11px] text-black outline outline-1 -outline-offset-1 outline-black/10'

export const GooglePayBadge = (): ReactElement => (
    <span className={BADGE}>
        <GooglePayMark />
    </span>
)

export const ApplePayBadge = (): ReactElement => (
    <span className={BADGE}>
        <ApplePayMark />
    </span>
)

export const BlikIcon = ({ className }: IconProps): ReactElement => (
    <svg className={cn('h-6 w-auto rounded-[3px] outline outline-1 -outline-offset-1 outline-black/10', className)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.64 64.18"> <linearGradient id="blik-a" x1="67.82" y1="63.051" x2="67.82" y2="1.128" gradientUnits="userSpaceOnUse"> <stop stopColor="#5a5a5a" offset="0" /> <stop stopColor="#484848" offset="0.146" /> <stop stopColor="#212121" offset="0.52" /> <stop stopColor="#080808" offset="0.817" /> <stop offset="1" /> </linearGradient> <linearGradient id="blik-o" x1="39.667" y1="19.898" x2="49.695" y2="9.87" gradientUnits="userSpaceOnUse"> <stop stopColor="#e52f08" offset="0" /> <stop stopColor="#e94f96" offset="1" /> </linearGradient> <filter id="blik-b" x="21.709" y="10.07" width="99.399" height="50.159" filterUnits="userSpaceOnUse"> <feOffset dx="2.379" dy="2.973" /> <feGaussianBlur result="blur" stdDeviation="0.743" /> <feFlood floodOpacity="0.949" /> <feComposite in2="blur" operator="in" result="result1" /> <feComposite in="SourceGraphic" in2="result1" /> </filter> <path fill="url(#blik-a)" d="M 127.725,0.827 H 7.915 A 7.083,7.083 0 0 0 0.828,7.906 v 48.368 a 7.082,7.082 0 0 0 7.087,7.078 h 119.81 a 7.082,7.082 0 0 0 7.086,-7.078 V 7.906 a 7.083,7.083 0 0 0 -7.086,-7.079 z" /> <path fill="url(#blik-o)" d="m 51.769,14.884 a 7.088,7.088 0 0 1 -7.088,7.088 7.088,7.088 0 0 1 -7.088,-7.088 7.088,7.088 0 0 1 7.088,-7.088 7.088,7.088 0 0 1 7.088,7.088 z" /> <path fill="#ffffff" filter="url(#blik-b)" d="m 106.28,55.03 h 10.206 L 104.224,39.193 115.343,25.585 h -9.257 L 95.167,39.278 v -29.2 H 87.242 V 55.03 h 7.925 L 95.161,39.316 Z M 72.294,25.58 h 7.923 V 55.025 H 72.294 Z M 57.34,10.069 h 7.923 V 55.025 H 57.34 Z M 36.741,25.286 a 14.968,14.968 0 0 0 -7.108,1.784 v -17 H 21.709 V 40.312 A 15.03,15.03 0 1 0 36.741,25.286 Z m 0,22.26 a 7.233,7.233 0 1 1 7.233,-7.234 7.231,7.231 0 0 1 -7.233,7.234 z" /> </svg>
)

export const PayPoIcon = ({ className }: IconProps): ReactElement => (
    <svg className={cn('h-5 w-auto', className)} aria-hidden="true" viewBox="0 0 141 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20.1953 30.8863V22.751H11.9842V30.8863H20.1953Z" fill="#A60585" />
                                            <path d="M20.1602 19.9158V11.7135H11.9491V19.9158H20.1602Z" fill="#36B587" />
                                            <path d="M9.21094 30.8523V22.65H0.999872V30.8523H9.21094Z" fill="#FAD15C" />
                                            <path d="M44.6722 11.1995C44.6722 16.8537 40.1178 21.4046 34.2441 21.4046H29.7745V30.7579H22.9648V1H34.2441C40.1178 1 44.6722 5.54954 44.6722 11.1995ZM37.8624 11.1995C37.8624 9.03004 36.3297 7.37181 34.2441 7.37181H29.7745V15.0273H34.2441C36.3297 15.0273 37.8624 13.3732 37.8624 11.1995Z" fill="black" />
                                            <path d="M68.4263 8.92355V30.7485H61.8725V28.6979C60.43 30.3561 58.2897 31.3609 55.3611 31.3609C49.638 31.3609 44.918 26.3411 44.918 19.8367C44.918 13.3323 49.638 8.31384 55.3611 8.31384C58.2897 8.31384 60.4246 9.31726 61.8725 10.9769V8.92628L68.4263 8.92355ZM61.8725 19.8353C61.8725 16.5626 59.6828 14.5107 56.6721 14.5107C53.6614 14.5107 51.4718 16.5612 51.4718 19.8353C51.4718 23.1094 53.6614 25.1668 56.6721 25.1668C59.6828 25.1668 61.8725 23.1094 61.8725 19.8353Z" fill="black" />
                                            <path d="M93.323 8.92334L85.9057 29.9472C83.4752 36.8398 79.6105 39.5712 73.5385 39.2677V33.198C76.5752 33.198 78.008 32.2411 78.9632 29.6013L70.332 8.92334H77.4921L82.3092 22.1837L86.3888 8.92334H93.323Z" fill="black" />
                                            <path d="M117.588 11.1995C117.588 16.8537 113.032 21.4046 107.158 21.4046H102.689V30.7579H95.8789V1H107.158C113.028 1 117.588 5.54954 117.588 11.1995ZM110.777 11.1995C110.777 9.03004 109.244 7.37181 107.158 7.37181H102.689V15.0273H107.158C109.244 15.0273 110.777 13.3732 110.777 11.1995Z" fill="black" />
                                            <path d="M118.441 20.1333C118.441 13.7984 123.464 8.90845 129.721 8.90845C135.977 8.90845 141.001 13.7984 141.001 20.1333C141.001 26.4682 135.977 31.3595 129.721 31.3595C123.464 31.3595 118.441 26.4695 118.441 20.1333ZM134.616 20.1333C134.616 17.1148 132.488 15.1162 129.721 15.1162C126.954 15.1162 124.826 17.1148 124.826 20.1333C124.826 23.1517 126.954 25.1517 129.721 25.1517C132.488 25.1517 134.616 23.1531 134.616 20.1333Z" fill="black" />
                                        </svg>
)
