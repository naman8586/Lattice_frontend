import { motion } from 'framer-motion';

export default function WeatherCard({ title, value, subtitle, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl hover:bg-white/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 font-medium text-sm drop-shadow-sm">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-purple-300" />}
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-white drop-shadow-md">{value}</span>
        {subtitle && <span className="text-sm text-gray-400 mt-1">{subtitle}</span>}
      </div>
    </motion.div>
  );
}
