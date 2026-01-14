"use client"

import React, { useState, useEffect } from 'react'
import themeColors from '../themeColors/themeColor'
import { FiLogOut, FiMenu, FiShoppingCart, FiUser, FiX, FiChevronDown, FiSearch } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useCart } from "@/app/context/CartContext";
import SearchBar from '@/app/component/SearchBar/SearchBar'
import { signOut, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const Navbar = () => {
    const theme = themeColors.dark;
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    
    // Router & Hooks
    const router = useRouter();
    const { cart } = useCart();
    const { data: session, status } = useSession();

    // Scroll Effect Listener
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Welcome Toast Logic
    useEffect(() => {
        if (status === "authenticated") {
            const shown = localStorage.getItem("welcome_shown");
            if (!shown) {
                setTimeout(() => toast.success(`Welcome back, ${session.user?.name}`), 300);
                localStorage.setItem("welcome_shown", "true");
            }
        } else if (status === "unauthenticated") {
            localStorage.removeItem("welcome_shown");
        }
    }, [status, session]);

    const totalItems = cart.reduce((total: number, item: any) => total + (item.quantity || 1), 0);

    const categories = [
        { name: "Men", slug: "men" },
        { name: "Women", slug: "women" },
        { name: "Unisex", slug: "unisex" },
        { name: "New Arrivals", slug: "new-arrivals" },
        { name: "Limited Edition", slug: "limited-edition" },
        { name: "Best Sellers", slug: "best-sellers" }
    ];

    // Helper for Navigation
    const handleNav = (path: string) => {
        router.push(path);
        setMenuOpen(false);
        setUserMenuOpen(false);
    };

    return (
        <>
            <nav
                style={{ backgroundColor: scrolled ? `${theme.background}E6` : theme.background, color: theme.text }}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
                    scrolled ? 'py-3 shadow-lg backdrop-blur-md' : 'py-5 shadow-none'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    
                    {/* --- Logo --- */}
                    <div 
                        className="font-extrabold text-2xl tracking-tighter cursor-pointer hover:opacity-80 transition"
                        onClick={() => router.push("/")}
                    >
                        cX<span className="text-blue-500">.</span>
                    </div>

                    {/* --- Desktop Navigation --- */}
                    <ul className="hidden lg:flex gap-8 items-center font-medium text-sm tracking-wide">
                        <li className='cursor-pointer hover:text-blue-400 transition-colors' onClick={() => router.push("/")}>Home</li>
                        <li className='cursor-pointer hover:text-blue-400 transition-colors' onClick={() => router.push("/about")}>About</li>

                        {/* Dropdown Group */}
                        <li className="relative group h-full py-2 cursor-pointer">
                            <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                Categories <FiChevronDown className="group-hover:rotate-180 transition-transform duration-300"/>
                            </div>
                            
                            {/* Dropdown Menu */}
                            <ul 
                                style={{ background: theme.background }}
                                className="absolute top-full -left-4 mt-2 w-56 py-2 rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0"
                            >
                                {categories.map((cat, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleNav(`/category/${cat.slug}`)}
                                        className="px-4 py-2.5 hover:bg-white/10 hover:pl-6 transition-all duration-200 cursor-pointer text-sm"
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li className='cursor-pointer hover:text-blue-400 transition-colors' onClick={() => router.push("/shop")}>Shop</li>
                        <li className='cursor-pointer hover:text-blue-400 transition-colors' onClick={() => router.push("/contact")}>Contact</li>
                    </ul>

                    {/* --- Right Actions --- */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:block w-64 transition-all focus-within:w-72">
                            <SearchBar />
                        </div>

                        {/* User Profile */}
                        <div className="relative">
                            {session ? (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 text-sm font-medium"
                                >
                                    <FiLogOut /> <span>Logout</span>
                                </button>
                            ) : (
                                <div className="relative">
                                    <button 
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <FiUser size={22} />
                                    </button>

                                    {/* User Dropdown */}
                                    {userMenuOpen && (
                                        <div 
                                            style={{ background: theme.background }}
                                            className="absolute top-full right-0 mt-3 w-48 py-1 rounded-xl shadow-xl border border-white/10 animate-fade-in-down"
                                        >
                                            <button
                                                onClick={() => handleNav("/auth")}
                                                className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors text-sm"
                                            >
                                                Sign In / Register
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart Icon */}
                        <div className="relative group cursor-pointer" onClick={() => router.push("/cart")}>
                            <FiShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-transparent animate-pulse">
                                    {totalItems}
                                </span>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden cursor-pointer p-1" onClick={() => setMenuOpen(true)}>
                            <FiMenu size={24} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Mobile Sidebar (Drawer) --- */}
            {/* Overlay */}
            <div 
                className={`fixed inset-0 z-60 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                    menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar Content */}
            <div 
                style={{ background: theme.background, color: theme.text }}
                className={`fixed top-0 right-0 z-70 h-full w-[80%] max-w-[300px] shadow-2xl transition-transform duration-300 ease-out lg:hidden transform ${
                    menuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <span className="font-bold text-xl">Menu</span>
                        <FiX size={24} className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setMenuOpen(false)} />
                    </div>

                    {/* Search Mobile */}
                    <div className="mb-6">
                        <SearchBar onSearch={() => setMenuOpen(false)} />
                    </div>

                    {/* Links */}
                    <ul className="flex flex-col gap-4 text-lg font-medium">
                        <li className='hover:text-blue-400 cursor-pointer' onClick={() => handleNav("/")}>Home</li>
                        <li className='hover:text-blue-400 cursor-pointer' onClick={() => handleNav("/about")}>About</li>
                        <li className='hover:text-blue-400 cursor-pointer' onClick={() => handleNav("/shop")}>Shop</li>
                        
                        {/* Mobile Categories Accordion */}
                        <li className='flex flex-col gap-2'>
                            <span className="opacity-60 text-sm uppercase tracking-wider mt-2">Categories</span>
                            <div className="pl-4 border-l-2 border-white/10 flex flex-col gap-3">
                                {categories.map((cat, i) => (
                                    <span 
                                        key={i} 
                                        className="text-base cursor-pointer hover:text-blue-400"
                                        onClick={() => handleNav(`/category/${cat.slug}`)}
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        </li>

                        <li className='hover:text-blue-400 cursor-pointer mt-2' onClick={() => handleNav("/contact")}>Contact</li>
                    </ul>

                    {/* Footer Actions */}
                    <div className="mt-auto border-t border-white/10 pt-6">
                        {session ? (
                             <button
                                onClick={() => { signOut(); setMenuOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <FiLogOut /> Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => handleNav("/auth")}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <FiUser /> Login / Register
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar