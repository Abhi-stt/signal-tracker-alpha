
import React from 'react';
import { MapPin } from 'lucide-react';

export const MapComponent = () => {
  return (
    <div className="w-full h-48 bg-muted/30 rounded-lg relative overflow-hidden border border-border">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20">
        {/* Mock street lines */}
        <div className="absolute top-8 left-4 w-20 h-0.5 bg-gray-400 transform rotate-45"></div>
        <div className="absolute top-16 left-8 w-16 h-0.5 bg-gray-400 transform -rotate-12"></div>
        <div className="absolute top-24 left-12 w-24 h-0.5 bg-gray-400 transform rotate-12"></div>
        <div className="absolute bottom-16 right-8 w-18 h-0.5 bg-gray-400 transform rotate-45"></div>
        <div className="absolute bottom-8 right-4 w-20 h-0.5 bg-gray-400 transform -rotate-30"></div>
        
        {/* Mock buildings/areas */}
        <div className="absolute top-4 right-4 w-8 h-6 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
        <div className="absolute bottom-4 left-4 w-6 h-8 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
        <div className="absolute top-12 left-16 w-4 h-4 bg-green-400 dark:bg-green-600 rounded-full"></div>
        
        {/* Location pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <MapPin className="h-8 w-8 text-red-500 fill-red-500" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full opacity-30 animate-ping"></div>
          </div>
        </div>
      </div>
      
      {/* Mock zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col bg-white dark:bg-gray-800 rounded-md shadow-sm">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <span className="text-sm font-bold">+</span>
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
          <span className="text-sm font-bold">-</span>
        </button>
      </div>
    </div>
  );
};
