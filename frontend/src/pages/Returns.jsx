// src/pages/Returns.jsx

import { Link } from 'react-router-dom';
import { HiRefresh, HiShieldCheck, HiClock, HiExclamation, HiCheckCircle, HiMail } from 'react-icons/hi';

const Returns = () => {
    const steps = [
        { step: 1, title: 'Contact Us', desc: 'Email or WhatsApp us with your order number and reason for return' },
        { step: 2, title: 'Get Approval', desc: 'We\'ll review your request and send return instructions within 24 hours' },
        { step: 3, title: 'Ship Item', desc: 'Drop off at our Douala location or arrange pickup' },
        { step: 4, title: 'Get Refund', desc: 'Refund processed within 3-5 days after inspection' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16 lg:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                        <HiRefresh className="w-4 h-4" />
                        Easy Returns
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6">Returns & Refunds</h1>
                    <p className="text-xl text-primary-100">
                        Not satisfied? We make returns simple and hassle-free.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Return Policy Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <HiShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Return Policy</h2>
                            <p className="text-gray-600">
                                We want you to be completely satisfied with your purchase. If you're not happy,
                                we offer a <strong>7-day return policy</strong> for most items.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">7 Days</p>
                            <p className="text-sm text-green-700">Return window</p>
                        </div>
                        <div className="bg-primary-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-primary-600">3-5 Days</p>
                            <p className="text-sm text-primary-700">Refund processing</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">Free</p>
                            <p className="text-sm text-amber-700">For defective items</p>
                        </div>
                    </div>
                </div>

                {/* How to Return */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to Return an Item</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 h-full">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold mb-4">
                                        {step.step}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-sm">{step.desc}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Eligibility */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <HiCheckCircle className="w-6 h-6 text-green-500" />
                            Eligible for Return
                        </h3>
                        <ul className="space-y-3 text-gray-600">
                            <li>• Unused items in original packaging</li>
                            <li>• Items with all tags attached</li>
                            <li>• Defective or damaged products</li>
                            <li>• Wrong item received</li>
                            <li>• Items returned within 7 days</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <HiExclamation className="w-6 h-6 text-amber-500" />
                            Not Eligible for Return
                        </h3>
                        <ul className="space-y-3 text-gray-600">
                            <li>• Underwear and intimate apparel</li>
                            <li>• Opened cosmetics or personal care</li>
                            <li>• Customized or personalized items</li>
                            <li>• Items damaged by customer</li>
                            <li>• Items returned after 7 days</li>
                        </ul>
                    </div>
                </div>

                {/* Refund Info */}
                <div className="bg-primary-50 rounded-2xl p-8 mb-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <HiClock className="w-6 h-6 text-primary-600" />
                        Refund Timeline
                    </h3>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            <strong>Mobile Money (MTN MoMo / Orange Money):</strong> Refunds are instant once approved.
                            You'll receive your money within minutes.
                        </p>
                        <p>
                            <strong>Bank Transfer:</strong> Refunds take 3-5 business days to appear in your account.
                        </p>
                        <p>
                            <strong>Cash on Delivery orders:</strong> Refunds are processed via Mobile Money.
                            Please provide your MoMo or OM number.
                        </p>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Need to Start a Return?</h2>
                    <p className="text-primary-100 mb-6">Contact our support team with your order number</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:nexshop@gmail.com"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                        >
                            <HiMail className="w-5 h-5" />
                            netshopsphere@gmail.com
                        </a>
                        <a
                            href="https://wa.me/237683669723"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                        >
                            WhatsApp Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Returns;