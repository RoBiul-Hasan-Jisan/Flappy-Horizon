"use client";

import React, { useEffect, useRef } from "react";
import { FiTruck, FiRepeat, FiShield, FiEdit3, FiCheckCircle, FiStar, FiGlobe, FiPackage } from "react-icons/fi";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import themeColors from "../themeColors/themeColor";

const services = [
  {
    title: "Premium Quality Fabric",
    description: "Ultra-soft, breathable fabrics with advanced moisture-wicking technology for ultimate comfort and durability.",
    icon: <FiShield className="w-12 h-12" />,
    color: "from-cyan-500 to-blue-500",
    features: ["Organic Cotton", "Premium Fleece", "Anti-Pilling", "Eco-Friendly"],
    delay: 0.1
  },
  {
    title: "Custom Hoodie Printing",
    description: "Professional-grade digital printing and embroidery with unlimited color options and precise detailing.",
    icon: <FiEdit3 className="w-12 h-12" />,
    color: "from-purple-500 to-pink-500",
    features: ["HD Printing", "Embroidery", "No Minimum Order", "Design Assistance"],
    delay: 0.2
  },
  {  
    title: "Global Fast Delivery",
    description: "Worldwide shipping with real-time tracking and premium packaging for perfect arrival every time.",
    icon: <FiGlobe className="w-12 h-12" />,
    color: "from-orange-500 to-yellow-500",
    features: ["24/7 Tracking", "Express Options", "Secure Packaging", "Global Reach"],
    delay: 0.3
  },
  {
    title: "Hassle-Free Returns",
    description: "30-day satisfaction guarantee with free returns and exchanges for the perfect fit and style.",
    icon: <FiRepeat className="w-12 h-12" />,
    color: "from-green-500 to-emerald-500",
    features: ["30-Day Window", "Free Returns", "Quick Refunds", "Size Exchange"],
    delay: 0.4
  },
  {
    title: "Sustainable Production",
    description: "Eco-conscious manufacturing using recycled materials and ethical production practices.",
    icon: <FiStar className="w-12 h-12" />,
    color: "from-indigo-500 to-violet-500",
    features: ["Recycled Materials", "Low Impact Dyes", "Ethical Labor", "Carbon Neutral"],
    delay: 0.5
  },
  {
    title: "Premium Packaging",
    description: "Luxury unboxing experience with custom packaging that protects and presents your hoodie perfectly.",
    icon: <FiPackage className="w-12 h-12" />,
    color: "from-rose-500 to-red-500",
    features: ["Custom Boxes", "Tissue Wrap", "Thank You Cards", "Gift Ready"],
    delay: 0.6
  },
];

const HomeServicesSection = () => {
  const theme = themeColors.dark;
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
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      y: 40,
      opacity: 0,
      scale: 0.9 
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  return (
    <section
      ref={ref}
      style={{ 
        background: `linear-gradient(135deg, ${theme.background} 0%, #0c0c0c 100%)`,
        color: theme.text 
      }}
      className="relative py-32 px-4 lg:px-8 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-linear-to-l from-blue-500/10 via-indigo-500/10 to-violet-500/10 blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                             linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate={controls}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-widest uppercase">PREMIUM EXPERIENCE</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Elevated
            </span>
            <br />
            <span>Service Standards</span>
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            We redefine streetwear excellence through unparalleled quality, craftsmanship, 
            and customer-centric experiences that transcend expectations.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-transparent backdrop-blur-xl overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Animated Border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500`}></div>

                {/* Icon Container */}
                <div className={`relative mb-8 p-5 rounded-2xl bg-linear-to-br ${service.color} text-white w-fit`}>
                  {service.icon}
                  {/* Icon Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${service.color} blur-xl opacity-30`}></div>
                </div>

                {/* Content */}
                <div className="relative space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    {service.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FiCheckCircle className={`w-4 h-4 bg-linear-to-br ${service.color} text-transparent bg-clip-text`} />
                          <span className="text-sm text-white/60">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-white/40 group-hover:text-white/70 transition-colors duration-300">
                      <span className="font-medium">Learn More</span>
                      <div className={`w-6 h-px bg-linear-to-r ${service.color} group-hover:w-12 transition-all duration-300`}></div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className={`absolute -top-3 -right-3 w-6 h-6 rounded-full bg-linear-to-br ${service.color}`}
                  animate={{
                    y: [0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: service.delay
                  }}
                />
                <motion.div
                  className={`absolute -bottom-3 -left-3 w-4 h-4 rounded-full bg-linear-to-br ${service.color}`}
                  animate={{
                    y: [0, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: service.delay + 0.5
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-20 p-8 rounded-3xl border border-white/10 bg-linear-to-r from-white/5 to-transparent backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Customer Satisfaction" },
              { value: "24h", label: "Avg. Delivery Time" },
              { value: "10k+", label: "Happy Customers" },
              { value: "100%", label: "Quality Guarantee" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeServicesSection;