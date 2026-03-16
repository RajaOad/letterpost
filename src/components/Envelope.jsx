import React from 'react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function Envelope({ color = 'red', children, onClick, isOpen }) {
  const waxColors = {
    red: 'bg-wax-red',
    green: 'bg-wax-green',
    blue: 'bg-wax-blue',
    gold: 'bg-wax-gold',
  }

  return (
    <div 
      className="relative cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="bg-parchment-200 rounded-lg shadow-lg border-2 border-parchment-300 aspect-3/2 relative overflow-hidden">
        {/* Paper texture - desktop only */}
        {!isMobile && (
          <div className="absolute inset-0 bg-paper-texture opacity-30"></div>
        )}
        
        {/* Envelope flap - CSS only animation */}
        <div className={`absolute top-0 left-0 right-0 h-1/2 bg-parchment-300 transform origin-top transition-transform duration-500 ${
          isOpen ? 'rotate-x-180' : ''
        }`} style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
        </div>

        {/* Wax seal - simplified */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full ${waxColors[color]} shadow-md flex items-center justify-center z-10`}>
          <span className="font-script text-xl md:text-2xl text-parchment-100">S</span>
        </div>

        {children}
      </div>
    </div>
  )
}