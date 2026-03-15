import React from 'react'
import { motion } from 'framer-motion'

export default function Envelope({ color = 'red', children, onClick, isOpen }) {
  const waxColors = {
    red: 'bg-wax-red',
    green: 'bg-wax-green',
    blue: 'bg-wax-blue',
    gold: 'bg-wax-gold',
  }

  return (
    <motion.div 
      className="relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="bg-parchment-200 rounded-lg shadow-lg border-2 border-parchment-300 aspect-[3/2] relative overflow-hidden">
        {/* Paper texture */}
        <div className="absolute inset-0 bg-paper-texture opacity-50"></div>
        
        {/* Envelope flap */}
        <div className={`absolute top-0 left-0 right-0 h-1/2 bg-parchment-300 transform origin-top transition-transform duration-500 ${
          isOpen ? 'rotate-x-180' : ''
        }`} style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
        </div>

        {/* Wax seal */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full ${waxColors[color]} shadow-md flex items-center justify-center z-10`}>
          <span className="font-script text-2xl text-parchment-100">S</span>
        </div>

        {children}
      </div>
    </motion.div>
  )
}