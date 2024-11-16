import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface SuggestionsProps {
  destination: string;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ destination }) => {
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/get_suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ destination }),
        });
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [destination]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Travel Suggestions</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.split('\n').map((suggestion, index) => (
            suggestion.trim() && (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-gray-700">{suggestion.trim()}</p>
              </div>
            )
          ))}
        </div>
      )}
    </motion.div>
  );
};