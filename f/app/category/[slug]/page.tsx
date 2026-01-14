"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import themeColors from "@/app/component/themeColors/themeColor";
import allProducts from "@/app/data/products";
import { FiArrowLeft, FiArrowUpRight, FiFilter, FiGrid, FiList } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const products = allProducts.filter((prod) => prod.category === slug);
  
  const container = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // --- GSAP Animations ---
  useGSAP(() => {
    const tl = gsap.timeline();

    // Title animation
    tl.fromTo(".hero-char", 
      { y: 100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.02, 
        duration: 0.6, 
        ease: "power3.out" 
      }
    );

    // Controls fade in
    tl.fromTo(".fade-up", 
      { opacity: 0, y: 20 }, 
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.08, 
        duration: 0.4,
      }, 
      "-=0.3"
    );

    // Product cards scroll animation
    const cards = gsap.utils.toArray('.product-card');
    cards.forEach((card: any) => {
      gsap.fromTo(card, 
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

  }, { scope: container });

  // Split text helper
  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="hero-char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
        {char}
      </span>
    ));
  };

  return (
    <div 
      ref={container}
      className="relative min-h-screen w-full bg-zinc-950 text-white overflow-x-hidden"
    >
      {/* Noise texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
      />

      {/* Subtle gradients */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 pt-16 sm:pt-20 px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12 border-b border-zinc-800">
        
        {/* Back button */}
        <div className="fade-up mt-4 mb-6 sm:mb-10">
          <button 
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-all"
          >
            <FiArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-wider">Back</span>
          </button>
        </div>

        {/* Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white">
            {typeof slug === 'string' ? splitText(slug) : slug}
          </h1>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <p className="fade-up text-zinc-400 text-sm sm:text-base max-w-md">
             Curated selection of premium streetwear
           </p>
           
           <div className="fade-up flex items-center gap-3">
              {/* Count */}
              <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                <span className="text-xs font-mono text-zinc-400">
                  {products.length} items
                </span>
              </div>

              {/* View toggle */}
              <div className="flex gap-1 p-1 rounded-full bg-zinc-900 border border-zinc-800">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <FiGrid size={14} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <FiList size={14} />
                </button>
              </div>
           </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        {products.length === 0 ? (
           <div className="h-96 flex items-center justify-center border border-zinc-800 rounded-xl">
             <div className="text-center">
               <h2 className="text-2xl font-light text-zinc-500">Out of Stock</h2>
             </div>
           </div>
        ) : (
          <div className={`
            grid gap-4 sm:gap-5
            ${viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1 max-w-3xl'
            }
          `}>
            {products.map((prod, index) => (
              <div 
                key={prod.id}
                onClick={() => router.push(`/product/${prod.id}`)}
                className={`
                  product-card group cursor-pointer
                  ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row gap-4'}
                `}
              >
                {/* Image */}
                <div className={`
                  relative overflow-hidden bg-zinc-900 rounded-lg
                  ${viewMode === 'grid' ? 'w-full aspect-3/4' : 'w-32 h-32 shrink-0'}
                `}>
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-medium">
                      <span>View</span>
                      <FiArrowUpRight size={12} />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className={`
                  flex flex-col justify-between pt-3
                  ${viewMode === 'list' ? 'flex-1' : ''}
                `}>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-600 mb-1">
                      #{String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1 line-clamp-2 group-hover:text-zinc-300 transition-colors">
                      {prod.name}
                    </h3>
                  </div>
                  <div className="text-sm font-semibold text-white mt-2">
                    {prod.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-zinc-900 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content">
            {Array(8).fill(slug).map((text, i) => (
              <span key={i} className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-zinc-800 mx-4">
                {text} • PREMIUM •
              </span>
            ))}
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .marquee-container {
          display: flex;
          overflow: hidden;
        }
        
        .marquee-content {
          display: flex;
          animation: marquee 25s linear infinite;
          white-space: nowrap;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #18181b;
        }

        ::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;