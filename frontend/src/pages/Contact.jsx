// src/pages/Contact.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiMail, HiPhone, HiLocationMarker, HiClock, HiChatAlt2,
    HiUser, HiGlobe, HiOfficeBuilding, HiCheckCircle,
    HiArrowRight, HiQuestionMarkCircle
} from 'react-icons/hi';
import { FaWhatsapp, FaGithub, FaLinkedin, FaBehance } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Message sent successfully!');
            setIsSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfo = [
        { icon: HiMail, title: 'Email', value: 'nexshop@gmail.com', link: 'mailto:nexshop@gmail.com', desc: '24hr response' },
        { icon: HiPhone, title: 'Call', value: '+237 683 669 723', link: 'tel:+237683669723', desc: 'Mon-Sat 8am-6pm' },
        { icon: FaWhatsapp, title: 'WhatsApp', value: '+237 683 669 723', link: 'https://wa.me/237683669723', desc: 'Chat instantly' },
        { icon: HiLocationMarker, title: 'Visit', value: 'Akwa, Douala', link: 'https://maps.google.com/?q=Akwa,Douala', desc: 'Cameroon' }
    ];

    const faqs = [
        { q: 'How can I track my order?', a: 'You\'ll receive a tracking number via SMS and email once shipped.' },
        { q: 'What payment methods?', a: 'Mobile Money (MTN, Orange), bank transfers, and cash on delivery.' },
        { q: 'Do you deliver nationwide?', a: 'Yes! 1-2 days for major cities, 3-7 days for other regions.' },
        { q: 'Return policy?', a: '7-day return policy for unused items in original packaging.' }
    ];

    const socialLinks = [
        { icon: FaGithub, url: 'https://github.com/ClaraDEV-Fullstack', color: 'hover:bg-gray-700' },
        { icon: FaLinkedin, url: 'https://linkedin.com/in/clara-beri-794097217/', color: 'hover:bg-primary-600' },
        { icon: FaWhatsapp, url: 'https://wa.me/237683669723', color: 'hover:bg-green-600' },
        { icon: FaBehance, url: 'https://behance.net/claraberi', color: 'hover:bg-primary-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary-50/30">
            {/* Hero Section - Compact */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-10 md:py-16 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl" />
                </div>

                <div className="page-container relative">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium mb-4">
                            <HiChatAlt2 className="w-3.5 h-3.5" />
                            We're here to help
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold mb-3">Get in Touch</h1>
                        <p className="text-sm md:text-base text-primary-100 mb-5">
                            Have questions? Our team is ready to assist you.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                            <a href="mailto:nexshop@gmail.com" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary-700 text-sm font-semibold rounded-lg hover:bg-primary-50">
                                <HiMail className="w-4 h-4" />
                                Email Us
                            </a>
                            <a href="https://wa.me/237683669723" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600">
                                <FaWhatsapp className="w-4 h-4" />
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-container py-6 md:py-12">
                {/* Contact Cards - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 -mt-12 md:-mt-16 mb-6 md:mb-12 relative z-10">
                    {contactInfo.map((info, idx) => (
                        <a
                            key={idx}
                            href={info.link}
                            target={info.link.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="group bg-white rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:scale-105 transition-transform">
                                <info.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-xs md:text-sm">{info.title}</h3>
                            <p className="text-primary-600 font-medium text-xs md:text-sm truncate">{info.value}</p>
                            <p className="text-[10px] md:text-xs text-gray-500">{info.desc}</p>
                        </a>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-4 md:gap-8 mb-8 md:mb-12">
                    {/* Contact Form - Compact */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiCheckCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-sm text-gray-600 mb-4">We'll get back to you within 24 hours.</p>
                                    <button onClick={() => setIsSubmitted(false)} className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700">
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                            <HiChatAlt2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base md:text-xl font-bold text-gray-900">Send a Message</h2>
                                            <p className="text-xs md:text-sm text-gray-500">We'll respond promptly</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                                        {/* Name & Email - 2 columns */}
                                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                                                <div className="relative">
                                                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text" name="name" value={formData.name} onChange={handleChange}
                                                        placeholder="John Doe" required
                                                        className="w-full pl-9 pr-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                                                <div className="relative">
                                                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="email" name="email" value={formData.email} onChange={handleChange}
                                                        placeholder="you@example.com" required
                                                        className="w-full pl-9 pr-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phone & Subject - 2 columns */}
                                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                                <div className="relative">
                                                    <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                                        placeholder="+237 6XX XXX"
                                                        className="w-full pl-9 pr-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
                                                <select
                                                    name="subject" value={formData.subject} onChange={handleChange} required
                                                    className="w-full px-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                                >
                                                    <option value="">Select topic</option>
                                                    <option value="order">Order Inquiry</option>
                                                    <option value="product">Product Question</option>
                                                    <option value="shipping">Shipping</option>
                                                    <option value="returns">Returns</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
                                            <textarea
                                                name="message" value={formData.message} onChange={handleChange}
                                                placeholder="How can we help you?" rows={3} required
                                                className="w-full px-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit" disabled={isSubmitting}
                                            className="w-full py-2.5 md:py-3 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isSubmitting ? (
                                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                                            ) : (
                                                <>Send Message <HiArrowRight className="w-4 h-4" /></>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Compact */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Business Hours */}
                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <HiClock className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">Business Hours</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                {[
                                    { day: 'Mon - Fri', time: '8AM - 6PM' },
                                    { day: 'Saturday', time: '9AM - 4PM' },
                                    { day: 'Sunday', time: 'Closed', closed: true }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-600 text-xs">{item.day}</span>
                                        <span className={`font-medium text-xs ${item.closed ? 'text-amber-600' : 'text-gray-900'}`}>{item.time}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">* West Africa Time (WAT)</p>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                    <HiGlobe className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">Follow Us</h3>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">Stay connected for updates!</p>
                            <div className="flex gap-2">
                                {socialLinks.map((social, i) => (
                                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer"
                                       className={`w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 ${social.color} hover:text-white transition-all`}>
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-4 text-white">
                            <h3 className="text-sm font-bold mb-3">Quick Links</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Returns & Refunds', link: '/returns' },
                                    { label: 'FAQs', link: '/faq' },
                                    { label: 'Track Order', link: '/dashboard/orders' }
                                ].map((item, i) => (
                                    <Link key={i} to={item.link} className="flex items-center justify-between py-1.5 border-b border-white/20 hover:border-white/40 text-sm group">
                                        <span>{item.label}</span>
                                        <HiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section - Compact */}
                <div className="mb-6 md:mb-10">
                    <div className="text-center mb-4 md:mb-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-2">
                            <HiQuestionMarkCircle className="w-3.5 h-3.5" />
                            FAQs
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl p-3 md:p-4 shadow-md border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-1.5 flex items-start gap-2">
                                    <span className="w-5 h-5 md:w-6 md:h-6 bg-primary-100 text-primary-600 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] md:text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="flex-1">{faq.q}</span>
                                </h3>
                                <p className="text-gray-600 text-xs md:text-sm ml-7 md:ml-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Section - Compact */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-3 md:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                    <HiOfficeBuilding className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base md:text-xl font-bold text-gray-900">Our Location</h2>
                                    <p className="text-xs md:text-sm text-gray-500">Douala, Cameroon</p>
                                </div>
                            </div>
                            <a href="https://maps.google.com/?q=Akwa,Douala,Cameroon" target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 bg-primary-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-primary-700">
                                <HiLocationMarker className="w-4 h-4" />
                                Get Directions
                            </a>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="h-48 md:h-72">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15919.247234098074!2d9.692659!3d4.050419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1061128c15fb1f2f%3A0x4d7c8e0e18c0e0d0!2sAkwa%2C%20Douala%2C%20Cameroon!5e0!3m2!1sen!2sus!4v1234567890"
                            width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                            title="Location" referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    {/* Address Footer */}
                    <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">NEXSHOP</p>
                                <p className="text-xs text-gray-600">Joy Street, Akwa, Douala</p>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-3 text-xs">
                                <a href="tel:+237683669723" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
                                    <HiPhone className="w-3.5 h-3.5" />
                                    +237 683 669 723
                                </a>
                                <a href="mailto:nexshop@gmail.com" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
                                    <HiMail className="w-3.5 h-3.5" />
                                    nexshop@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;