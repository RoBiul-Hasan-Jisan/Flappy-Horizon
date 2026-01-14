"use client";

import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import allProducts, { Product } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import themeColors from "@/app/component/themeColors/themeColor";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiX, 
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiCheck,
  FiStar
} from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const ProductDetailPage: React.FC = () => {
  const theme = themeColors.dark;
  const params = useParams() as { id: string };
  const { id } = params;
  const router = useRouter();

  const product: Product | undefined = allProducts.find(
    (prod) => prod.id.toString() === id
  );

  const { addToCart } = useCart();

  if (!product)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-center text-2xl text-zinc-400">Product not found!</p>
      </div>
    );

  const images: string[] = product.images ?? [product.image];

  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const [styleTransform, setStyleTransform] = useState<string>(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)"
  );
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline();

    // Hero image entrance
    tl.fromTo(".hero-image",
      { 
        scale: 0.8, 
        opacity: 0,
        rotationY: -20
      },
      { 
        scale: 1, 
        opacity: 1,
        rotationY: 0,
        duration: 1,
        ease: "power3.out"
      }
    );

    // Thumbnail stagger
    tl.fromTo(".thumb-item",
      { 
        y: 30, 
        opacity: 0,
        scale: 0.8
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(1.5)"
      },
      "-=0.6"
    );

    // Product info cascade
    tl.fromTo(".info-item",
      { 
        x: 50, 
        opacity: 0 
      },
      { 
        x: 0, 
        opacity: 1,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.4"
    );

    // Action buttons pop
    tl.fromTo(".action-btn",
      { 
        scale: 0, 
        opacity: 0,
        rotation: -180
      },
      { 
        scale: 1, 
        opacity: 1,
        rotation: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: "back.out(2)"
      },
      "-=0.3"
    );

    // Related products scroll animation
    const relatedItems = gsap.utils.toArray('.related-item');
    relatedItems.forEach((item: any, index) => {
      gsap.fromTo(item,
        { 
          y: 100, 
          opacity: 0,
          scale: 0.9,
          rotationX: 45
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Floating animation for badges
    gsap.to(".float-badge", {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.3
    });

    // Gradient orbs animation
    gsap.to(".gradient-orb-1", {
      x: 50,
      y: -30,
      scale: 1.1,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(".gradient-orb-2", {
      x: -40,
      y: 40,
      scale: 0.95,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

  }, { scope: containerRef, dependencies: [product.id] });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = imageWrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    const rotateY = ((x - halfW) / halfW) * 12;
    const rotateX = ((halfH - y) / halfH) * 12;

    setStyleTransform(
      `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    );
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setStyleTransform("perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  useEffect(() => {
    const filtered = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    const randomFour = filtered.sort(() => Math.random() - 0.5).slice(0, 4);
    setRelatedProducts(randomFour);
  }, [product.category, product.id]);

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    
    // Animate the button
    gsap.to(".cart-btn", {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    // Reset after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    gsap.fromTo(".hero-image img", 
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    gsap.fromTo(".hero-image img", 
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-zinc-950 text-white overflow-x-hidden"
    >
      {/* Noise texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
      />

      {/* Animated gradients */}
      <div className="gradient-orb-1 fixed top-20 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="gradient-orb-2 fixed bottom-20 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-all duration-300"
        >
          <FiChevronLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-medium uppercase tracking-wider">Back</span>
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left: Image Gallery */}
          <div className="space-y-6">
            <div
              ref={imageWrapperRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="hero-image relative group cursor-pointer"
              style={{
                transform: styleTransform,
                transformStyle: "preserve-3d",
                transition: "transform 150ms ease-out, box-shadow 300ms",
              }}
            >
              {/* Main image container */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900">
                <img
                  src={images[activeIndex]}
                  alt={product.name}
                  className="w-full h-[500px] md:h-[600px] object-cover transition-transform duration-500"
                  style={{
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Zoom icon */}
                <div 
                  onClick={() => setIsModalOpen(true)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium">
                    <FiZoomIn size={16} />
                    <span>View Full Size</span>
                  </div>
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-xs font-mono">
                    {activeIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none rounded-2xl" />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 justify-center flex-wrap">
                {images.map((src, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);
                      gsap.fromTo(".hero-image img",
                        { scale: 0.95, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
                      );
                    }}
                    className={`
                      thumb-item relative rounded-lg overflow-hidden border-2 transition-all duration-300
                      ${index === activeIndex
                        ? "border-white shadow-lg shadow-white/20 scale-110"
                        : "border-zinc-700 hover:border-zinc-500 opacity-60 hover:opacity-100"
                      }
                    `}
                    style={{ width: 80, height: 80 }}
                  >
                    <img src={src} className="w-full h-full object-cover" alt={`Thumbnail ${index + 1}`} />
                    {index === activeIndex && (
                      <div className="absolute inset-0 border-2 border-white rounded-lg" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6 md:sticky md:top-24">
            
            {/* Category badge */}
            <div className="info-item">
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium uppercase tracking-wider text-zinc-400">
                {product.category}
              </span>
            </div>

            {/* Product name */}
            <h1 className="info-item text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="info-item flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={i < 4 ? "fill-yellow-500 text-yellow-500" : "text-zinc-600"}
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-400">(4.0 • 120 reviews)</span>
            </div>

            {/* Description */}
            <p className="info-item text-zinc-400 text-base leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="info-item flex items-baseline gap-4">
              <span className="text-5xl font-black">{product.price}</span>
              <span className="text-zinc-500 line-through text-xl">$299.00</span>
            </div>

            {/* Features */}
            <div className="info-item space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Features</h3>
              <ul className="space-y-2">
                {[
                  "Premium quality materials",
                  "Comfortable all-day wear",
                  "Limited edition design",
                  "Free shipping & returns"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <FiCheck size={12} className="text-green-500" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="info-item flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className={`
                  cart-btn action-btn flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold uppercase text-sm tracking-wider transition-all duration-300
                  ${addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-white text-black hover:bg-zinc-100"
                  }
                `}
              >
                {addedToCart ? (
                  <>
                    <FiCheck size={18} />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`
                  action-btn p-4 rounded-full border-2 transition-all duration-300
                  ${isFavorite
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-zinc-700 hover:border-white text-zinc-400 hover:text-white"
                  }
                `}
              >
                <FiHeart size={20} className={isFavorite ? "fill-current" : ""} />
              </button>

              <button className="action-btn p-4 rounded-full border-2 border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-all duration-300">
                <FiShare2 size={20} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="info-item flex gap-4 pt-6 border-t border-zinc-800">
              <div className="float-badge text-center flex-1">
                <div className="text-2xl font-bold">30</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Day Returns</div>
              </div>
              <div className="float-badge text-center flex-1 border-x border-zinc-800">
                <div className="text-2xl font-bold">Free</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Shipping</div>
              </div>
              <div className="float-badge text-center flex-1">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-zinc-800">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/product/${item.id}`)}
                  className="related-item group cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50 transition-all duration-500 group-hover:border-zinc-600 group-hover:shadow-xl group-hover:shadow-zinc-900/50">
                    <img
                      src={item.image}
                      className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={item.name}
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h3>
                      <p className="text-white font-bold">{item.price}</p>
                    </div>

                    {/* Shimmer */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <FiX size={24} />
          </button>

          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeIndex]}
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              alt={product.name}
            />

            {/* Modal navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
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

export default ProductDetailPage;