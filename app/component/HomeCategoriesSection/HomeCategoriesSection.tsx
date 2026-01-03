"use client";

import React, { useState, useEffect } from "react";
import themeColors from "../themeColors/themeColor";
import { FiChevronRight, FiTrendingUp, FiStar, FiClock, FiZap } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import { useRef } from "react";

const categories = [
    { 
        name: "Men's Collection", 
        slug: "men", 
        image: "/Category_Img/bg.jpg",
        icon: <FiTrendingUp />,
        items: "240+ Products",
        color: "from-blue-500 to-cyan-400"
    },
    { 
        name: "Women's Edition", 
        slug: "women", 
        image: "/Category_Img/bg1.jpg",
        icon: <FiStar />,
        items: "180+ Products",
        color: "from-purple-500 to-pink-400"
    },
    { 
        name: "Unisex Essentials", 
        slug: "unisex", 
        image: "/Category_Img/bg2.jpg",
        icon: <FiZap />,
        items: "320+ Products",
        color: "from-orange-500 to-yellow-400"
    },
    { 
        name: "New Arrivals", 
        slug: "new-arrivals", 
        image: "/Category_Img/bg3.jpg",
        icon: <FiClock />,
        items: "Latest Styles",
        color: "from-green-500 to-teal-400",
        badge: "NEW"
    },
    { 
        name: "Limited Edition", 
        slug: "limited-edition", 
        image: "/Category_Img/bg4.jpg",
        icon: <FiStar />,
        items: "Exclusive Drops",
        color: "from-red-500 to-rose-400",
        badge: "LIMITED"
    },
    { 
        name: "Best Sellers", 
        slug: "best-sellers", 
        image: "/Category_Img/bg5.jpg",
        icon: <FiTrendingUp />,
        items: "Top Rated",
        color: "from-indigo-500 to-violet-400",
        badge: "HOT"
    },
];

const HomeCategoriesSection = () => {
    const router = useRouter();
    const theme = themeColors.dark;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [controls, isInView]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut" as const
            }
        }
    };

    return (
        <section
            ref={ref}
            style={{ 
                background: `linear-gradient(135deg, ${theme.background} 0%, #0a0a0a 100%)`,
                color: theme.text 
            }}
            className="relative py-32 px-4 lg:px-8 overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 animate-pulse"></span>
                        <span className="text-sm font-semibold tracking-wider">EXPLORE COLLECTIONS</span>
                    </div>
                    
                    <h2 className="text-6xl md:text-7xl font-bold mb-6">
                        <span className="bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Curated
                        </span>
                        <br />
                        <span>Categories</span>
                    </h2>
                    
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        Discover our premium collections, each crafted with unique design philosophy 
                        and exceptional quality
                    </p>
                </motion.div>

                {/* Categories Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ 
                                y: -8,
                                transition: { duration: 0.3 }
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => router.push(`/category/${cat.slug}`)}
                            className="group relative cursor-pointer"
                        >
                            {/* Card */}
                            <div className="relative h-[380px] rounded-3xl overflow-hidden border border-white/10 bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm">
                                {/* Image Container */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <motion.img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                        animate={{
                                            scale: hoveredIndex === index ? 1.1 : 1
                                        }}
                                        transition={{ duration: 0.7, ease: "easeOut" }}
                                    />
                                    
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-linear-to-t ${cat.color} opacity-80 mix-blend-overlay`}></div>
                                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-70"></div>
                                    
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    {/* Top Badge */}
                                    {cat.badge && (
                                        <div className="self-start">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold bg-linear-to-r ${cat.color} text-white`}>
                                                {cat.badge}
                                            </span>
                                        </div>
                                    )}

                                    {/* Bottom Content */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl bg-linear-to-br ${cat.color} text-white`}>
                                                {cat.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                                                <p className="text-sm text-white/70">{cat.items}</p>
                                            </div>
                                        </div>

                                        {/* Hover Indicator */}
                                        <motion.div
                                            className="flex items-center gap-2 text-white/90 font-medium"
                                            animate={{
                                                x: hoveredIndex === index ? 10 : 0
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <span>Explore Collection</span>
                                            <FiChevronRight className="w-5 h-5" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Border Glow */}
                                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-all duration-500`}></div>
                            </div>

                            {/* Floating Particles */}
                            {hoveredIndex === index && (
                                <>
                                    <motion.div
                                        className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-linear-to-r ${cat.color}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <motion.div
                                        className={`absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-linear-to-r ${cat.color}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    />
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-center mt-20"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/collections')}
                        className="group relative px-12 py-4 rounded-full bg-linear-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 text-white font-semibold text-lg backdrop-blur-sm overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            View All Collections
                            <FiChevronRight className="group-hover:translate-x-2 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                        <motion.div
                            className="absolute inset-0 bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.8 }}
                            style={{ opacity: 0.1 }}
                        />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default HomeCategoriesSection;