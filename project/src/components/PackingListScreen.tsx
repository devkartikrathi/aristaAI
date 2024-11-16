import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Item } from '../types';

interface PackingListScreenProps {
  packingList: Item[];
  setPackingList: (items: Item[]) => void;
  onOrganize: () => void;
}

export const PackingListScreen: React.FC<PackingListScreenProps> = ({
  packingList,
  setPackingList,
  onOrganize,
}) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="space-y-6"
  >
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Packing List</h2>
      <button
        onClick={onOrganize}
        className="text-blue-500 hover:text-blue-600 font-medium flex items-center space-x-1"
      >
        <span>Organize Luggage</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>

    <div className="space-y-4">
      {packingList.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm"
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => {
              const newList = [...packingList];
              newList[index].checked = !newList[index].checked;
              setPackingList(newList);
            }}
            className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
          />
          <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
            {item.name}
          </span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);