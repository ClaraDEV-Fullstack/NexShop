// src/pages/FAQ.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronDown, HiQuestionMarkCircle, HiSearch, HiMail } from 'react-icons/hi';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const faqCategories = [
        {
            category: 'Orders & Shipping',
            faqs: [
                {
                    question: 'How can I track my order?',
                    answer: 'Once your order is shipped, you will receive a tracking number via SMS and email. You can also track your order by logging into your account and visiting the "My Orders" section. For any issues, contact us via WhatsApp at +237 699 876 543.'
                },
                {
                    question: 'Do you deliver across Cameroon?',
                    answer: 'Yes! We deliver to all 10 regions of Cameroon. Delivery times vary by location: 1-2 days for Douala and Yaoundé, 3-5 days for other major cities (Bamenda, Bafoussam, Garoua, etc.), and 5-7 days for remote areas.'
                },
                {
                    question: 'How much does shipping cost?',
                    answer: 'Shipping costs depend on your location and order weight. Orders over 25,000 FCFA qualify for free shipping to Douala and Yaoundé. Standard shipping starts at 1,500 FCFA for Douala/Yaoundé and 3,000 FCFA for other regions.'
                },
                {
                    question: 'Can I get same-day delivery?',
                    answer: 'Same-day delivery is available in Douala and Yaoundé for orders placed before 12:00 PM. An additional fee of 2,000 FCFA applies. Select "Express Delivery" at checkout.'
                }
            ]
        },
        {
            category: 'Payments',
            faqs: [
                {
                    question: 'What payment methods do you accept?',
                    answer: 'We accept: MTN Mobile Money (MoMo), Orange Money, Express Union transfers, bank transfers, and Cash on Delivery (COD) for Douala and Yaoundé orders only.'
                },
                {
                    question: 'Is it safe to pay online?',
                    answer: 'Absolutely! All Mobile Money transactions are processed through secure, official APIs from MTN and Orange. We never store your financial information.'
                },
                {
                    question: 'Can I pay when my order arrives?',
                    answer: 'Yes, Cash on Delivery (COD) is available for orders delivered within Douala and Yaoundé. A verification fee of 500 FCFA applies to COD orders.'
                }
            ]
        },
        {
            category: 'Returns & Refunds',
            faqs: [
                {
                    question: 'What is your return policy?',
                    answer: 'We offer a 7-day return policy for unused items in original packaging. Electronics must be returned within 3 days if defective. Contact our support team to initiate a return.'
                },
                {
                    question: 'How do I return an item?',
                    answer: 'Contact us via email or WhatsApp with your order number and reason for return. We\'ll provide return instructions. You can drop off items at our Douala location or arrange a pickup (fees may apply).'
                },
                {
                    question: 'When will I receive my refund?',
                    answer: 'Refunds are processed within 3-5 business days after we receive and inspect the returned item. Mobile Money refunds are typically instant once approved.'
                }
            ]
        },
        {
            category: 'Account & Orders',
            faqs: [
                {
                    question: 'How do I create an account?',
                    answer: 'Click "Sign Up" at the top of the page, enter your email and create a password. You can also sign up during checkout. Having an account lets you track orders and save addresses.'
                },
                {
                    question: 'I forgot my password. What do I do?',
                    answer: 'Click "Login" then "Forgot Password". Enter your email address and we\'ll send you a link to reset your password. Check your spam folder if you don\'t see the email.'
                },
                {
                    question: 'Can I cancel my order?',
                    answer: 'You can cancel orders that haven\'t shipped yet. Go to "My Orders" and click "Cancel". If the order has shipped, you\'ll need to return it instead. Processing orders cannot be cancelled.'
                }
            ]
        },
        {
            category: 'Products',
            faqs: [
                {
                    question: 'Are all products genuine?',
                    answer: 'Yes, we guarantee that all products sold on NetShopSphere are 100% genuine. We work directly with authorized distributors and manufacturers. Fake products are strictly prohibited.'
                },
                {
                    question: 'What if I receive a damaged product?',
                    answer: 'If your product arrives damaged, contact us within 24 hours with photos of the damage. We\'ll arrange a replacement or full refund at no extra cost to you.'
                },
                {
                    question: 'Do products come with warranty?',
                    answer: 'Warranty depends on the product and manufacturer. Electronics typically have 6-12 month warranties. Check the product page for specific warranty information.'
                }
            ]
        }
    ];

    // Filter FAQs based on search
    const filteredCategories = faqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(
            faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.faqs.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16 lg:py-20">
                <div className="page-container text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                        <HiQuestionMarkCircle className="w-4 h-4" />
                        Help Center
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
                    <p className="text-xl text-primary-100 mb-8">
                        Find answers to common questions about orders, payments, and more
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="page-container py-16">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <HiQuestionMarkCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-600 mb-6">Try a different search term or browse categories below</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {filteredCategories.map((category, catIndex) => (
                            <div key={catIndex}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                                        {category.faqs.length}
                                    </span>
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.faqs.map((faq, faqIndex) => {
                                        const globalIndex = `${catIndex}-${faqIndex}`;
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div
                                                key={faqIndex}
                                                className={`bg-white rounded-2xl border transition-all ${isOpen ? 'border-primary-200 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                    className="w-full flex items-center justify-between p-6 text-left"
                                                >
                                                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                                                    <HiChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 pb-6">
                                                        <div className="pt-4 border-t border-gray-100">
                                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Still Need Help */}
                <div className="mt-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 lg:p-12 text-white text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-primary-100 mb-8 max-w-lg mx-auto">
                        Can't find the answer you're looking for? Our support team is happy to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                        >
                            <HiMail className="w-5 h-5" />
                            Contact Support
                        </Link>
                        <a
                            href="https://wa.me/237683669723"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                        >
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;