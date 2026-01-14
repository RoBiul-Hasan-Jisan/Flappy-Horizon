"use client";

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, Variants } from 'framer-motion';
import themeColors from '../themeColors/themeColor';
import { TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';

const HomeAboutSection = () => {
    const theme = themeColors.dark;
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    const stats = [
        { value: "500+", label: "Curated Hoodies", icon: <Sparkles className="w-5 h-5" />, suffix: "Collection" },
        { value: "2k+", label: "Style Revolutionaries", icon: <Users className="w-5 h-5" />, suffix: "Community" },
        { value: "5", label: "Years Defining", icon: <Calendar className="w-5 h-5" />, suffix: "Urban Culture" },
        { value: "98%", label: "Satisfaction", icon: <TrendingUp className="w-5 h-5" />, suffix: "Approval Rate" }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    const floatVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    const badgeVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { delay: 0.5, duration: 0.6, ease: "easeOut" as const }
        }
    };

    const ctaVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    return (
        <section 
            ref={containerRef}
            style={{ 
                background: `linear-gradient(135deg, ${theme.background} 0%, #111 100%)`,
                color: theme.text 
            }}
            className="relative py-28 px-6 md:px-10 overflow-hidden"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-linear-to-r from-purple-500 to-pink-500 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-linear-to-l from-cyan-500 to-blue-500 blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="grid lg:grid-cols-2 gap-16 items-center"
                >
                    {/* Text Content */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 animate-pulse"></span>
                            <span className="text-sm font-medium tracking-wide">URBAN ELEGANCE REDEFINED</span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                            <span className="bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Beyond
                            </span>
                            <br />
                            <span className="relative">
                                Streetwear
                                <motion.div
                                    className="absolute -bottom-2 left-0 h-1 bg-linear-to-r from-cyan-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: "40%" }}
                                    transition={{ delay: 1, duration: 1 }}
                                />
                            </span>
                        </h2>

                        <p className="text-xl text-white/80 leading-relaxed">
                            cX transcends conventional streetwear, crafting elevated urban essentials 
                            that blend premium craftsmanship with contemporary design. Each piece is a 
                            statement of individuality, engineered for those who define culture rather 
                            than follow it.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                    className="group p-6 rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-linear-to-br from-cyan-500/20 to-purple-500/20">
                                            {stat.icon}
                                        </div>
                                        <span className="text-3xl font-bold bg-linear-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                                            {stat.value}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white/70 group-hover:text-cyan-200 transition-colors">
                                        {stat.label}
                                    </div>
                                    <div className="text-xs text-white/40 mt-1">
                                        {stat.suffix}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div variants={itemVariants} className="relative">
                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative overflow-hidden rounded-3xl shadow-2xl"
                            >
                                <img
                                    src="/Img/bg.jpg"
                                    alt="HoodAnix Urban Collection"
                                    className="w-full h-[600px] object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                                
                                {/* Floating Badge */}
                                <motion.div
                                    variants={badgeVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="absolute bottom-8 left-8 p-4 rounded-2xl bg-linear-to-br from-black/80 to-gray-900/80 backdrop-blur-md border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-linear-to-r from-cyan-500 to-purple-500">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Premium Collection</div>
                                            <div className="text-sm text-white/60">Crafted for Impact</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Decorative Elements */}
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute -top-6 -right-6 w-32 h-32 border-2 border-cyan-500/30 rounded-3xl"
                        />
                        <motion.div
                            animate={{
                                y: [0, 10, 0],
                                rotate: [0, -5, 0]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            className="absolute -bottom-6 -left-6 w-24 h-24 border-2 border-purple-500/30 rounded-2xl"
                        />
                    </motion.div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    variants={ctaVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mt-16"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-10 py-4 rounded-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold text-lg overflow-hidden"
                    >
                        <span className="relative z-10">Explore the Collection</span>
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <motion.div
                            className="absolute inset-0 bg-white/20"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default HomeAboutSection;