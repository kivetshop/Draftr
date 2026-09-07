"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function DigitTile({ digit }: { digit: string }) {
  return (
    <div
      className="
        w-8 h-8 sm:w-9 sm:h-9
        flex items-center justify-center
        bg-[#e8e8e8] border border-[#d4d4d4]
        rounded-sm
        text-[#1a1a1a] font-bold text-base sm:text-lg
        leading-none select-none
      "
      style={{ fontFamily: "var(--font-zen-dots)" }}
    >
      {digit}
    </div>
  );
}

function CounterUnit({
  value,
  label,
  digits,
}: {
  value: number;
  label: string;
  digits: 1 | 2;
}) {
  const str = digits === 1 ? String(value) : pad2(value);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {str.split("").map((d, i) => (
          <DigitTile key={i} digit={d} />
        ))}
      </div>
      <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] text-[#666] uppercase">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [targetDate, setTargetDate] = useState<Date>(() => {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  });

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch dynamic countdown target from API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/waitlist/countdown")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.targetDate) {
          const d = new Date(data.targetDate);
          if (!isNaN(d.getTime())) {
            setTargetDate(d);
          }
        }
      })
      .catch((err) => console.error("Error fetching countdown:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Tick calculation
  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex items-end gap-5 sm:gap-6">
      <CounterUnit value={timeLeft.days} label="DAYS" digits={1} />
      <CounterUnit value={timeLeft.hours} label="HOURS" digits={2} />
      <CounterUnit value={timeLeft.minutes} label="MINUTES" digits={2} />
      <CounterUnit value={timeLeft.seconds} label="SECONDS" digits={2} />
    </div>
  );
}