"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

interface CalendarCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function CustomCalendar({ value, onChange }: Props) {
  // Current viewing month & year
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    const updated = new Date(now);
    updated.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(updated);
  };

  // Calendar matrix computation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Grid days: [prevMonthDays, currentMonthDays, nextMonthDays]
  const calendarCells: CalendarCell[] = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      month: viewMonth - 1,
      year: viewYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  // Next month padding (to complete row of 7)
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      day: d,
      month: viewMonth + 1,
      year: viewYear,
      isCurrentMonth: false,
    });
  }

  const handleSelectDay = (cell: CalendarCell) => {
    const newDate = new Date(value);
    newDate.setFullYear(cell.year, cell.month, cell.day);
    onChange(newDate);

    // If day from prev/next month was clicked, navigate view
    if (cell.month !== viewMonth) {
      setViewMonth(newDate.getMonth());
      setViewYear(newDate.getFullYear());
    }
  };

  const handleHourChange = (newHour: number) => {
    const h = Math.max(0, Math.min(23, isNaN(newHour) ? 0 : newHour));
    const newDate = new Date(value);
    newDate.setHours(h);
    onChange(newDate);
  };

  const handleMinuteChange = (newMin: number) => {
    const m = Math.max(0, Math.min(59, isNaN(newMin) ? 0 : newMin));
    const newDate = new Date(value);
    newDate.setMinutes(m);
    onChange(newDate);
  };

  const isSelected = (cell: CalendarCell) => {
    return (
      cell.day === value.getDate() &&
      cell.month === value.getMonth() &&
      cell.year === value.getFullYear()
    );
  };

  const isToday = (cell: CalendarCell) => {
    const today = new Date();
    return (
      cell.day === today.getDate() &&
      cell.month === today.getMonth() &&
      cell.year === today.getFullYear()
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-900">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goToToday}
            className="text-[10px] font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {WEEK_DAYS.map((wd) => (
          <span key={wd} className="text-[11px] font-semibold text-slate-400 py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          const selected = isSelected(cell);
          const today = isToday(cell);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectDay(cell)}
              className={`
                relative h-9 w-full rounded-xl text-xs font-medium flex items-center justify-center transition-all
                ${
                  selected
                    ? "bg-orange-600 text-white font-bold shadow-sm"
                    : cell.isCurrentMonth
                    ? "text-slate-800 hover:bg-orange-50/70 hover:text-orange-700"
                    : "text-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {cell.day}
              {today && !selected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time Picker */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
          <Clock size={14} className="text-slate-400" />
          <span>Launch Time:</span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {/* Hour input */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <input
              type="number"
              min={0}
              max={23}
              value={value.getHours()}
              onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
              className="w-8 bg-transparent text-center font-mono font-bold text-slate-900 outline-none"
            />
            <span className="text-slate-400 text-[10px]">HR</span>
          </div>

          <span className="text-slate-400 font-bold">:</span>

          {/* Minute input */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <input
              type="number"
              min={0}
              max={59}
              value={value.getMinutes()}
              onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
              className="w-8 bg-transparent text-center font-mono font-bold text-slate-900 outline-none"
            />
            <span className="text-slate-400 text-[10px]">MIN</span>
          </div>
        </div>
      </div>
    </div>
  );
}