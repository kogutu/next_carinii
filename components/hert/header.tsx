'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronDown, Menu } from 'lucide-react';

import SearchBar from './searchBar';
import { AccountModal } from './items_modal/AccountModal';
import { SupportModal } from './items_modal/SupportModal';
import { CartDrawerContent } from './items_modal/CartDrawer';
import { CartIcon } from './items_modal/CartIcon';
import { CurrencySelector } from './items_modal/CurrencySelector';
import { AccountIcon } from './items_modal/AccountIcon';
import Link from 'next/link';
import LanguageSelector from './language-selector';
import CariniiMegaMenu from './Menu';
import TopHeader from './topHeader';
type Props = {
  currency: string
}
export default function Header({ currency }: Props) {

  const [isOpen, setIsOpen] = useState(false);
  const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('right');
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const categories = [
    { name: 'Piekarnictwo', submenu: ['Piekarnik', 'Mikser', 'Akcesoria'] },
    { name: 'Cukiernictwo', submenu: ['Mikser do ciasta', 'Glazownica', 'Formy'] },
    { name: 'Gastronomia', submenu: ['Kuchenka', 'Frytkownica', 'Blacha'] },
    { name: 'Higiena', submenu: ['Fartuchy', 'Czapki', 'Rękawiczki'] },
    { name: 'Przemysł spożywczy', submenu: ['Maszyny', 'Transportery'] },
    { name: 'Wyposażenie obiektu', submenu: ['Mebel', 'Oświetlenie', 'Dekoracje'] },
    { name: 'Używane', submenu: ['Piekarniki', 'Lodówki'] },
    { name: 'Promocje %', submenu: [], className: 'text-orange-600' },
    { name: 'Serwis', submenu: [] },
  ];
  const Logo = ({ width = 160, height = 40, color = "#441C49" }) => {
    return (
      <svg
        width={width}
        className="max-w-[160px] sm:max-w-[250px]"
        viewBox="0 0 767.3 159"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{ height: "auto" }}
      >
        <g>
          <polygon points="33.1,22.4 2,22.4 2,123 58.3,72.8 "></polygon>
          <polygon points="133.9,47.9 80.2,98.9 106.8,149.4 133.9,149.4 "></polygon>
          <polygon points="51.4,97.9 133.9,39.3 133.9,22.4 42.8,22.4 86.8,71.9 2,131 2,149.4 98.6,149.4 61.7,108.1 "></polygon>
        </g>
        <g>
          <path d="M236.4,43.2c-8-6.3-16.8-9.4-26.3-9.3c-6,0-11.8,1.2-17.3,3.6c-6.2,2.6-11.3,6.3-15.2,11.1c-3.9,4.7-6.8,10.2-8.6,16.5c-2,6.8-3,14-2.9,21.5c-0.1,6.1,0.6,11.9,2,17.4c1.5,6.3,4.2,12,8.3,17.1c4.3,5.6,9.5,9.8,15.6,12.6c5.5,2.6,11.6,3.9,18.2,3.8c5.8,0,11.5-1,17.1-3.1c4.2-1.5,8.1-3.5,11.8-6.2l5.7-4.4l1.2,1.9l-0.9,4.9l-0.6,4.9l-4.6,2.5c-9.1,4.5-19.9,6.8-32.3,6.8c-18.4,0-32.6-5.3-42.8-16c-5.8-5.9-9.9-12.9-12.5-21c-2.2-6.4-3.2-13.4-3.2-21c0-18.2,5.8-32.8,17.3-44c11.1-10.8,26-16.1,44.6-16.1c7,0,13.6,0.6,19.8,1.9c4.2,0.9,8.1,2,11.8,3.4l5.4,2.4l-1.9,6.3l-1.9,7l-2.5,0.1L236.4,43.2z"></path>
          <path d="M257.6,136.8l7.9-16c5-10.6,9.2-19.6,12.4-26.9l14-31.9l7.4-16.8l7-16.3h4l6.7,16l7.1,16.2l14.2,32.9c5.9,14,9.8,23.1,11.8,27.3l7.2,14.9l3.2,6.5l-8.8-0.4l-9.2,0.4l-2.6-6.5l-5.6-14.7l-6.5-15.4l-2.8-6.4l-7.6-0.8c-3.9-0.3-8.6-0.4-14.2-0.5c-4.3,0-7.9,0.1-10.6,0.3l-8.8,1l-2.5,5.9l-6.1,15.1c-2.6,6.8-4.6,12.2-6,16l-1.9,5.9l-6-0.4l-6.7,0.4L257.6,136.8z M288.5,89.1l4.3,0.5c4.2,0.4,8.4,0.6,12.6,0.6c3.6,0,6.8-0.2,9.6-0.5l5.1-0.7l-1.9-5c-1.5-3.7-4.7-11.1-9.6-22.4l-4.1-9.2l-4.1,9.2L291,82.9L288.5,89.1z"></path>
          <path d="M378,137.3l0.4-13.2l0.3-26.1l0.2-34.4l-0.1-17.9l-0.7-10.9l-0.5-6.2l5.9,0.2l12,0.2l21.7-0.4c10.4,0.1,18,1.9,22.8,5.3c6.9,5.1,10.3,11.9,10.3,20.4c-0.1,8.1-2.7,14.7-7.9,20c-2.8,2.9-6.1,5.2-10.1,7.1c-2.9,1.4-6,2.4-9.3,3.1l-6.4,1.1l8.1,10.7l13.9,17.6c7.2,9.1,13.3,16.5,18.4,22.2l5.9,6.7l-11-0.4l-10.2,0.4l-4.1-5.7c-9.5-13.2-19.6-26.4-30.4-39.6l-8.3-10.2h-5.7l0.1,10.7l0.2,26.3l0.7,12.6l0.3,5.8l-8.3-0.4l-8.4,0.4L378,137.3z M393.2,79.1l5.1,0.1c4.4,0,8.8-0.4,13.1-1.3c5-0.9,9.3-2.5,12.9-4.8c3-1.8,5.4-4.5,7.1-8.1c1.4-2.7,2-5.6,2-8.7c-0.1-12.4-9.2-18.8-27.4-19l-7.4,0.2l-5,0.2L393.2,79.1z"></path>
          <path d="M479.6,136.7l0.3-9.2l0.3-14.4l0.2-15.6l0.2-25.8L480.3,56l-0.4-14.4l-0.2-7l-0.4-6.1l8.8,0.4l7.9-0.4l-0.4,6.2l-0.3,7.1l-0.4,14l-0.2,16v25.2l0.2,15.9l0.3,14.2l0.3,9.2l0.5,6.2l-8.1-0.4l-8.7,0.4L479.6,136.7z"></path>
          <path d="M527.5,137l0.4-13.7l0.4-18.8l0.2-18.8l-0.2-27.4l-0.6-18.1L527.2,29h4.4l9.7,10.5L556.1,55l29.5,31.5l17.8,18.7l10,10.2V82.9l-0.2-23.7l-0.3-14.8l-0.5-10.6l-0.2-5.3l5.8,0.4l5.4-0.4l-0.3,5.3l-0.4,10.5l-0.2,15L622,82.9c-0.1,11.3,0.1,21.6,0.3,31l0.5,17.3l0.5,13.5h-4.4l-11.6-13.2c-4.9-5.5-11.8-13-20.6-22.4l-22.6-23.8l-18.5-18.9l-8.8-9l0.2,28.3l0.1,19l0.5,19l0.4,13.1l0.3,6l-5-0.4l-6.2,0.4L527.5,137z"></path>
          <path d="M654.8,136.7l0.3-9.2l0.3-14.4l0.2-15.6l0.2-25.8L655.6,56l-0.4-14.4l-0.2-7l-0.4-6.1l8.8,0.4l7.9-0.4l-0.4,6.2l-0.3,7.1l-0.4,14L670,72v25.2l0.2,15.9l0.3,14.2l0.3,9.2l0.5,6.2l-8.1-0.4l-8.7,0.4L654.8,136.7z"></path>
          <path d="M700.9,136.7l0.3-9.2l0.3-14.4l0.2-15.6l0.2-25.8L701.7,56l-0.4-14.4l-0.2-7l-0.4-6.1l8.8,0.4l7.9-0.4l-0.4,6.2l-0.3,7.1l-0.4,14l-0.2,16v25.2l0.2,15.9l0.3,14.2l0.3,9.2l0.5,6.2l-8.1-0.4l-8.7,0.4L700.9,136.7z"></path>
        </g>
        <g>
          <path d="M763,24.2c0,7.1-5.8,12.7-13.2,12.7c-7.3,0-13.2-5.7-13.2-12.7c0-7,5.9-12.7,13.3-12.7C757.2,11.4,763,17.2,763,24.2z M740.5,24.2c0,5.3,3.9,9.5,9.3,9.5c5.4,0.1,9.3-4.2,9.3-9.6c0-5.3-3.9-9.6-9.4-9.6C744.4,14.6,740.5,18.9,740.5,24.2z M748.2,30.1h-3.7V18.5c0.9-0.1,2.9-0.4,5.3-0.4c2.8,0,4,0.4,4.8,0.9c0.8,0.5,1.3,1.4,1.3,2.5c0,1.2-1.1,2.2-2.7,2.7v0.1c1.3,0.4,2.1,1.4,2.4,3c0.4,1.7,0.6,2.4,0.8,2.8h-4.1c-0.4-0.4-0.6-1.4-0.9-2.4c-0.2-1.2-0.9-1.7-2-1.7h-1.2V30.1z M748.3,23.5h1.1c1.4,0,2.2-0.6,2.2-1.4c0-0.9-0.8-1.4-2.1-1.4c-0.4,0-0.9,0.1-1.2,0.1V23.5z"></path>
        </g>
      </svg>
    );
  };
  useEffect(() => {
    // const checkMenuPosition = () => {


    //   // if (menuRef.current) {
    //   //   const rect = menuRef.current.getBoundingClientRect();
    //   //   if (rect.right + 200 > window.innerWidth) {
    //   //     setMenuDirection('left');
    //   //   } else {
    //   //     setMenuDirection('right');
    //   //   }
    //   // }
    // };

    // checkMenuPosition();
  }, [setIsMenuOpen]);

  const handeMobileMenuToggle = () => {
    setIsMenuOpen(false)
  }

  return (
    <>      <TopHeader />
      <header className="w-ful sticky top-0  bg-white relative z-[30]">
        {/* Top bar */}



        {/* Main header */}
        <div className="bg-white  py-5 sticky top-0 z-50 ">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            {/* Logo */}
            {/* Mobile menu toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center"
              >
                {isMenuOpen ? <X size={34} /> : <Menu size={34} />}
              </button>
              <div className="text-3xl font-black text-hert tracking-tight">
                <Link href="/">
                  <Logo color="#00000" width={350} height={175} ></Logo>
                </Link>
              </div>
            </div>

            {/* Search bar - Hidden on mobile */}
            <SearchBar type={'desktop'} />

            {/* Right section - Icons and account */}
            <div className="flex items-center space-x-1">


              {/* Account Modal */}
              <AccountModal />

              {/* Support Modal */}
              <SupportModal />

              {/* Mini Cart Drawer */}
              <CartIcon />
              <CartDrawerContent />
            </div>
          </div>
          <SearchBar type={'mobile'} />

        </div>


        <CariniiMegaMenu isMobileMenuOpen={isMenuOpen} onMobileMenuToggle={() => handeMobileMenuToggle()}></CariniiMegaMenu>

        {/* <HMenu isMobileMenuOpen={isMenuOpen} onMobileMenuToggle={setIsMenuOpen} /> */}

      </header>
    </>
  );
}
