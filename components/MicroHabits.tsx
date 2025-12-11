import React, { useState } from 'react';
import { MicroHabit } from '../types';
import { Check, Plus } from 'lucide-react';

interface MicroHabitsProps {
    isDarkMode: boolean;
}

export const MicroHabits: React.FC<MicroHabitsProps> = ({ isDarkMode }) => {
  const [habits, setHabits] = useState<MicroHabit[]>([
    { id: '1', text: 'Deep breath', completed: false }
  ]);
  const [newHabit, setNewHabit] = useState('');

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now().toString(), text: newHabit, completed: false }]);
    setNewHabit('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">Micro-Habits</h3>
        <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-md text-xs font-bold">
            {habits.filter(h => h.completed).length}/{habits.length}
        </span>
      </div>
      
      <p className="text-xs text-gray-400 mb-6 italic">Add small steps to build momentum.</p>

      <div className="flex-1 space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            onClick={() => toggleHabit(habit.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                habit.completed 
                ? 'bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:border-teal-900/30' 
                : 'bg-gray-50 border-gray-100 dark:bg-slate-900 dark:border-slate-700 hover:border-teal-200'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                habit.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-300 dark:border-slate-500'
            }`}>
                {habit.completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${habit.completed ? 'text-gray-400 line-through' : ''}`}>
              {habit.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={addHabit} className="relative">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add a tiny habit..."
          className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
        />
        <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
