import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Correct import for Heroicons v2

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Scheduler = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'week'

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });
  const daysInWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: addDays(startOfCurrentWeek, 6) });

  const handlePrevious = () => {
    setCurrentDate(view === 'month' ? addDays(startOfCurrentMonth, -1) : addDays(startOfCurrentWeek, -7));
  };

  const handleNext = () => {
    setCurrentDate(view === 'month' ? addDays(endOfCurrentMonth, 1) : addDays(startOfCurrentWeek, 7));
  };

  const renderDays = (days) => {
    return days.map((day) => (
      <div key={day.toString()} className="p-2 border">
        <div className={classNames(isSameDay(day, new Date()) && 'bg-blue-500 text-white', 'p-1 rounded')}>
          {format(day, 'd')}
        </div>
        <div className="mt-1">
          {events.filter((event) => isSameDay(parseISO(event.start), day)).map((event) => (
            <div key={event.title} className="mt-1 p-1 bg-gray-200 rounded">
              {event.title}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevious} className="p-2">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
        </h2>
        <button onClick={handleNext} className="p-2">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-center mb-4">
        <button onClick={() => setView('month')} className={classNames(view === 'month' && 'bg-blue-500 text-white', 'p-2 rounded')}>
          Month
        </button>
        <button onClick={() => setView('week')} className={classNames(view === 'week' && 'bg-blue-500 text-white', 'p-2 rounded ml-2')}>
          Week
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {view === 'month' ? renderDays(daysInMonth) : renderDays(daysInWeek)}
      </div>
    </div>
  );
};

export default Scheduler;
