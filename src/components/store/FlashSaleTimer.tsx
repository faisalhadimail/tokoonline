'use client';

import { useState, useEffect, useRef } from 'react';

interface FlashSaleTimerProps {
  endDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function FlashSaleTimer({ endDate }: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endDate));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endDate]);

  const blocks: { value: number; label: string }[] = [
    { value: timeLeft.days, label: 'Hari' },
    { value: timeLeft.hours, label: 'Jam' },
    { value: timeLeft.minutes, label: 'Menit' },
    { value: timeLeft.seconds, label: 'Detik' },
  ];

  return (
    <div className="flex items-center gap-2">
      {blocks.map((block, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
            {String(block.value).padStart(2, '0')}
          </div>
          <span className="mt-1 text-[10px] text-stone-500 sm:text-xs">{block.label}</span>
        </div>
      ))}
    </div>
  );
}
