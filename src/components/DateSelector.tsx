import React from 'react';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Calendar className="w-4 h-4 text-orange-500" />
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none"
      />
    </div>
  );
};

export default DateSelector;