"use client";

import React, { useState } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMapPin,
  FiMail,
  FiPhone,
  FiChevronRight,
  FiArrowRight
} from "react-icons/fi";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Subscribed with: ${email}`);
    setEmail("");
    setIsSubmitting(false);
  };

  const quickLinks = [
    { label: "Home", path: "/", icon: <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" /> },
    { label: "Shop All", path: "/shop", icon: <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" /> },
    { label: "New Arrivals", path: "/shop?new=true", icon: <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" /> },
    { label: "Best Sellers", path: "/shop?bestsellers=true", icon: <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" /> },
    { label: "Limited Edition", path: "/shop?limited=true", icon: <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" /> },
  ];

  const companyLinks = [
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Blog", path: "/blog" },
    { label: "Careers", path: "/careers" },
    { label: "Press", path: "/press" },
  ];

  const supportLinks = [
    { label: "FAQs", path: "/faq" },
    { label: "Shipping", path: "/shipping" },
    { label: "Returns", path: "/returns" },
    { label: "Size Guide", path: "/size-guide" },
    { label: "Privacy Policy", path: "/privacy" },
  ];

  const socialLinks = [
    { icon: <FiInstagram />, label: "Instagram", color: "hover:text-pink-500" },
    { icon: <FiFacebook />, label: "Facebook", color: "hover:text-blue-600" },
    { icon: <FiTwitter />, label: "Twitter", color: "hover:text-sky-500" },
  ];

  return (
    <footer className="bg-linear-to-b from-gray-900 to-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg">C</span>
              </div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                cX
              </h2>
            </div>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Elevating streetwear with premium hoodies crafted for the modern lifestyle. 
              Where comfort meets cutting-edge style.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <button
                  key={social.label}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20"
                  onMouseEnter={() => setIsHovered(social.label)}
                  onMouseLeave={() => setIsHovered(null)}
                  aria-label={social.label}
                >
                  <span className={`text-lg transition-colors ${social.color}`}>
                    {social.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 relative pb-2">
              Shop
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-linear-to-r from-purple-500 to-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => router.push(link.path)}
                    className="group flex items-center justify-between text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1"
                  >
                    <span>{link.label}</span>
                    {link.icon}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 relative pb-2">
              Company
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-linear-to-r from-blue-500 to-cyan-500"></span>
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => router.push(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 relative pb-2">
              Support
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-linear-to-r from-cyan-500 to-teal-500"></span>
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => router.push(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-10 border-t border-gray-800">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold mb-3">Stay in the Loop</h3>
            <p className="text-gray-400 mb-6">
              Be the first to know about new drops, exclusive offers, and style inspiration.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <FiPhone className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Call us</p>
                <p className="font-medium"> 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <FiMail className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email us</p>
                <p className="font-medium">support@cX.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <FiMapPin className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Visit us</p>
                <p className="font-medium">123 Fashion St, BD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-900 bg-black">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} cX. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => router.push("/terms")}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => router.push("/privacy")}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => router.push("/cookies")}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;