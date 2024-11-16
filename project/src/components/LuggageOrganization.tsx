import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export const LuggageOrganization: React.FC = () => {
  const compartments = [
    {
      name: 'Main Compartment',
      items: ['Clothes', 'Toiletries', 'Shoes'],
    },
    {
      name: 'Front Pocket',
      items: ['Passport', 'Documents', 'Phone Charger'],
    },
    {
      name: 'Side Pocket',
      items: ['Water Bottle', 'Snacks', 'Umbrella'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Luggage Organization</h2>
      <div className="grid gap-4">
        {compartments.map((compartment, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Package className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">{compartment.name}</h3>
            </div>
            <ul className="space-y-2">
              {compartment.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="text-gray-600 pl-4 border-l-2 border-blue-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
};