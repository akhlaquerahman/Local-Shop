import React, { useState } from 'react';

export const ReviewFilterBar = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onFilterChange({ search: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center bg-surface border border-border rounded-xl p-4">
      <div className="flex-1 min-w-[250px]">
        <input 
          type="text" 
          placeholder="Search Review ID, Customer, Product, Target..." 
          value={searchTerm}
          onChange={handleSearch}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
        />
      </div>
      
      <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary outline-none">
        <option value="">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>

      <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary outline-none">
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="HIDDEN">Hidden</option>
        <option value="REPORTED">Reported</option>
        <option value="DELETED">Deleted</option>
      </select>
    </div>
  );
};
