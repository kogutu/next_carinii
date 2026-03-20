import React, { useState, useEffect } from 'react';

const ShippingCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({
        hours: '00',
        minutes: '00',
        seconds: '00',
    });

    useEffect(() => {
        const updateTimer = () => {
            const now: any = new Date();

            // Ustawiamy deadline na najbliższe 6:00 rano
            const deadline: any = new Date(now);
            deadline.setHours(6, 0, 0, 0);

            // Jeśli już minęło 6:00 dzisiaj, przesuwamy na jutro
            if (now >= deadline) {
                deadline.setDate(deadline.getDate() + 1);
            }

            let diff = Math.max(0, deadline - now);

            if (diff === 0) {
                setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({
                hours: hours.toString().padStart(2, '0'),
                minutes: minutes.toString().padStart(2, '0'),
                seconds: seconds.toString().padStart(2, '0'),
            });
        };

        updateTimer(); // pierwsze wywołanie
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-100 rounded-lg p-6 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-4xl">
            <div className="grid grid-cols-[1fr_1fr] items-center w-full">
                {/* Lewa część – tekst */}
                <div className="flex flex-col leading-3">
                    <h2 className="font-bold text-mpgreen">Wysyłka za:</h2>
                    <p className="text-gray-600 mt-2">Zamów już teraz</p>
                </div>

                {/* Prawa część – licznik */}
                <div className="flex gap-2 md:gap-2 justify-end">
                    <div className="text-center">
                        <div className="bg-white rounded-lg shadow-md  w-12 h-12 flex items-center justify-center text-xl font-bold text-gray-900">
                            {timeLeft.hours}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">godzin</p>
                    </div>

                    <div className="text-center">
                        <div className="bg-white rounded-lg shadow-md w-12 h-12 flex items-center justify-center text-xl font-bold text-gray-900">
                            {timeLeft.minutes}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">minut</p>
                    </div>

                    <div className="text-center">
                        <div className="bg-white rounded-lg shadow-md w-12 h-12 flex items-center justify-center text-xl  font-bold text-gray-900">
                            {timeLeft.seconds}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">sekund</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingCountdown;