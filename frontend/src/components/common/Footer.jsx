// src/components/layout/Footer.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiShoppingBag,
    HiShieldCheck,
    HiOutlineArrowRight,
    HiHeart,
    HiCheckCircle,
    HiOutlineExternalLink
} from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaWhatsapp, FaBehance } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsSubscribing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Thanks for subscribing! Check your inbox.');
        setEmail('');
        setIsSubscribing(false);
    };

    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: FaGithub, name: 'GitHub', url: 'https://github.com/ClaraDEV-Fullstack', color: 'hover:bg-gray-700' },
        { icon: FaLinkedin, name: 'LinkedIn', url: 'https://linkedin.com/in/clara-beri-794097217/', color: 'hover:bg-primary-600' },
        { icon: FaWhatsapp, name: 'WhatsApp', url: 'https://wa.me/237683669723', color: 'hover:bg-green-600' },
        { icon: FaBehance, name: 'Behance', url: 'https://behance.net/claraberi', color: 'hover:bg-primary-500' }
    ];

    const shopLinks = [
        { label: 'All Products', path: '/products' },
        { label: 'New Arrivals', path: '/products?sort=newest' },
        { label: 'Best Sellers', path: '/products?sort=popular' },
        { label: 'On Sale', path: '/products?on_sale=true' },
        { label: 'Categories', path: '/categories' }
    ];

    const supportLinks = [
        { label: 'Contact Us', path: '/contact' },
        { label: 'FAQ', path: '/faq' },
        { label: 'About Us', path: '/about' },
        { label: 'Returns & Refunds', path: '/returns' },
        { label: 'Track Order', path: '/dashboard/orders' }
    ];

    return (
        <footer className="bg-gray-900 text-gray-300 relative overflow-hidden text-xs">
            {/* Main Footer */}
            <div className="page-container relative py-6 md:py-8">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">

                    {/* Brand Section - Full width on mobile */}
                    <div className="col-span-2 lg:col-span-4">
                        <Link to="/" className="inline-flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-md">N</span>
                            </div>
                            <span className="text-lg font-bold">
                                <span className="text-primary-400">Next</span>
                                <span className="text-green-500">Shop</span>
                                <span className="text-amber-400">Sphere</span>
                            </span>
                        </Link>

                        <p className="text-gray-400 mb-3 leading-snug text-xs max-w-xs">
                            Your trusted marketplace in Cameroon. Quality products, secure payments, and fast delivery.
                        </p>

                        <div className="flex gap-1.5">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-7 h-7 bg-gray-800 rounded flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all`}
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop Links - Takes 1 column on mobile (side by side with Support) */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="text-white font-bold mb-2 flex items-center gap-1 text-xs md:text-sm">
                            <HiShoppingBag className="w-3.5 h-3.5 text-primary-400" /> Shop
                        </h4>
                        <ul className="space-y-1">
                            {shopLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="group flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-[11px] md:text-xs"
                                    >
                                        <HiOutlineArrowRight className="w-2.5 h-2.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links - Takes 1 column on mobile (side by side with Shop) */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="text-white font-bold mb-2 flex items-center gap-1 text-xs md:text-sm">
                            <HiShieldCheck className="w-3.5 h-3.5 text-primary-400" /> Support
                        </h4>
                        <ul className="space-y-1">
                            {supportLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="group flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-[11px] md:text-xs"
                                    >
                                        <HiOutlineArrowRight className="w-2.5 h-2.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & WhatsApp - Full width on mobile */}
                    <div className="col-span-2 lg:col-span-4 space-y-2">
                        {/* Newsletter */}
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <h4 className="text-white font-bold mb-1 flex items-center gap-1 text-xs md:text-sm">
                                <HiMail className="w-3.5 h-3.5 text-primary-400" /> Subscribe
                            </h4>
                            <p className="text-gray-400 text-[10px] mb-1.5">
                                Exclusive deals and offers delivered to your inbox.
                            </p>
                            <form onSubmit={handleSubscribe} className="flex gap-1.5">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-1 px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-xs"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded flex items-center justify-center gap-1 disabled:opacity-70 text-xs whitespace-nowrap"
                                >
                                    {isSubscribing ? '...' : 'Subscribe'}
                                    {!isSubscribing && <HiOutlineArrowRight className="w-3 h-3 hidden sm:block" />}
                                </button>
                            </form>
                        </div>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/237683669723"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-green-600/10 border border-green-600/30 rounded-lg hover:bg-green-600/20 transition-colors"
                        >
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaWhatsapp className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-[11px]">Chat with us on WhatsApp</p>
                                <p className="text-green-400 text-[10px]">Quick responses, 24/7 support</p>
                            </div>
                            <HiOutlineExternalLink className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 bg-black/20">
                <div className="page-container py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] text-gray-500">
                    <span>© {currentYear} NEXSHOP. All rights reserved.</span>
                    <span className="flex items-center gap-0.5">
                        Made with <HiHeart className="w-2.5 h-2.5 text-red-500 mx-0.5" /> in Cameroon 🇨🇲
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;