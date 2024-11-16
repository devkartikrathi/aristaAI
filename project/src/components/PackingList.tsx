import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PackingListProps {
  destination: string;
  purpose: string;
  duration: string;
  weather: string;
}

export const PackingList: React.FC<PackingListProps> = ({
  destination,
  purpose,
  duration,
  weather,
}) => {
  const [packingList, setPackingList] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackingList = async () => {
      try {
        const response = await fetch('http://localhost:5000/generate_packing_list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination,
            purpose,
            duration,
            weather,
          }),
        });
        const data = await response.json();
        setPackingList(data.packing_list);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackingList();
  }, [destination, purpose, duration, weather]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-900">Packing List</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {packingList.split('\n').map((item, index) => (
            item.trim() && (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-gray-700">{item.trim()}</span>
              </div>
            )
          ))}
        </div>
      )}
    </motion.div>
  );
};