"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroImage {
  src: string;
  title: string;
  subtitle: string;
  ctaText: string;
  overlayColor: string;
}

const Hero = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const images: HeroImage[] = [
    {
      src: '/Slider_Images/bg.jpg',
      title: 'Elevate Your Street Style',
      subtitle: 'Premium hoodies engineered for comfort and unmatched urban aesthetics',
      ctaText: 'Explore Collection',
      overlayColor: 'rgba(0, 0, 0, 0.4)'
    },
    {
      src: '/Slider_Images/bg2.jpg',
      title: 'Urban Comfort Redefined',
      subtitle: 'Where modern design meets everyday luxury',
      ctaText: 'Shop Now',
      overlayColor: 'rgba(0, 0, 0, 0.3)'
    },
    {
      src: '/Slider_Images/bg4.jpg',
      title: 'Limited Edition Drops',
      subtitle: 'Exclusive designs for the contemporary wardrobe',
      ctaText: 'View Drops',
      overlayColor: 'rgba(0, 0, 0, 0.5)'
    }
  ];

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 20;
      const y = ((e.clientY - top) / height - 0.5) * 20;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <section 
      ref={heroRef}
      className="relative h-screen min-h-[700px] overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${images[currentIndex].overlayColor}, ${images[currentIndex].overlayColor}), url(${images[currentIndex].src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.05)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </AnimatePresence>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/20" />
        
        {/* Particle Effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-white/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 + 'vw',
                y: Math.random() * 100 + 'vh',
                scale: 0 
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8"
                >
                  <span className="w-2 h-2 bg-linear-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white/90">
                    New Collection 2024
                  </span>
                </motion.div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                  <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    {images[currentIndex].title.split(' ')[0]}
                  </span>
                  <br />
                  <span className="text-white">
                    {images[currentIndex].title.split(' ').slice(1).join(' ')}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {images[currentIndex].subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/shop')}
                    className="group relative px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white text-lg overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {images[currentIndex].ctaText}
                      <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/collections')}
                    className="px-6 py-3 border-2 border-white/30 hover:border-white rounded-full font-medium text-white text-base backdrop-blur-sm transition-colors"
                  >
                    View All Collections
                  </motion.button>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/10 max-w-2xl mx-auto"
                >
                  {['200+ Styles', 'Premium Quality', 'Free Shipping'].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.split(' ')[0]}
                      </div>
                      <div className="text-sm text-gray-300">
                        {stat.split(' ').slice(1).join(' ')}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 group"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="text-white text-2xl group-hover:text-purple-400 transition-colors" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 group"
        aria-label="Next slide"
      >
        <FiChevronRight className="text-white text-2xl group-hover:text-purple-400 transition-colors" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative group"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`} />
            <motion.div
              className="absolute inset-0 border-2 border-white rounded-full"
              initial={false}
              animate={{ scale: index === currentIndex ? 1.5 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-white/60 tracking-widest">SCROLL</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-linear-to-b from-white/80 to-transparent"
          />
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute top-1/4 left-4 sm:left-8 w-32 h-32 border border-white/10 rounded-full backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-1/4 right-4 sm:right-8 w-24 h-24 border border-white/10 rounded-full backdrop-blur-sm"
      />
    </section>
  );
};

export default Hero;