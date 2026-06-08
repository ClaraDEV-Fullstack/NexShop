import { Link } from 'react-router-dom';
import {
    HiShieldCheck,
    HiTruck,
    HiCurrencyDollar,
    HiUserGroup,
    HiGlobe,
    HiHeart,
    HiLightningBolt,
    HiStar,
    HiArrowRight,
    HiSparkles,
    HiCheckCircle,
    HiLocationMarker,
    HiPhone,
    HiMail,
    HiClock,
    HiAcademicCap,
    HiBadgeCheck,
    HiUsers
} from 'react-icons/hi';

const About = () => {
    const stats = [
        { value: '50K+', label: 'Happy Customers', icon: HiUsers },
        { value: '1000+', label: 'Products', icon: HiSparkles },
        { value: '10', label: 'Regions Covered', icon: HiLocationMarker },
        { value: '24/7', label: 'Support', icon: HiClock }
    ];

    const values = [
        {
            icon: HiShieldCheck,
            title: 'Quality Assurance',
            description: 'We carefully select and verify all products to ensure you receive only the best quality items.',
            color: 'from-primary-500 to-primary-600'
        },
        {
            icon: HiTruck,
            title: 'Fast Delivery',
            description: 'We deliver across all 10 regions of Cameroon with tracking available for every order.',
            color: 'from-primary-500 to-primary-600'
        },
        {
            icon: HiCurrencyDollar,
            title: 'Fair Pricing',
            description: 'We offer competitive prices and accept Mobile Money, making shopping accessible to everyone.',
            color: 'from-green-500 to-green-600'
        },
        {
            icon: HiHeart,
            title: 'Customer First',
            description: 'Your satisfaction is our priority. Our support team is always ready to help.',
            color: 'from-red-500 to-red-600'
        }
    ];

    const features = [
        'Nationwide delivery across all 10 regions',
        'Mobile Money payments (MTN MoMo & Orange Money)',
        'Cash on delivery in Douala & Yaoundé',
        '7-day return policy',
        'Genuine products with quality guarantee',
        'Bilingual support (French & English)'
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
            {/* Hero Section - More Compact and Modern */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4 text-white">
                            <HiGlobe className="w-4 h-4" />
                            Made in Cameroon
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                            About NEXSHOP
                        </h1>
                        <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto">
                            Your trusted online marketplace bringing quality products to every corner of Cameroon.
                            We're on a mission to make online shopping accessible, affordable, and enjoyable for everyone.
                        </p>

                        {/* Stats in Hero */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-white" />
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-primary-100">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/30 rounded-full blur-3xl"></div>
            </div>

            {/* Our Story Section - More Compact and Modern */}
            <section className="py-10 sm:py-12 lg:py-16 bg-white dark:bg-secondary-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
                                <HiLightningBolt className="w-4 h-4" />
                                Our Story
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                From Douala to All of Cameroon
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                <p>
                                    NEXSHOP was founded in 2024 in Douala, Cameroon, with a simple vision:
                                    to bring the convenience of online shopping to every Cameroonian.
                                </p>
                                <p>
                                    We noticed that many people in Cameroon didn't have access to quality products
                                    at fair prices, and those who did often had to travel long distances
                                    to find them.
                                </p>
                                <p>
                                    Today, we deliver to all 10 regions of Cameroon, accept Mobile Money
                                    (MTN MoMo & Orange Money), and have helped thousands of customers discover
                                    products they love.
                                </p>
                            </div>

                            {/* Key Achievements */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                        <HiStar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">4.8 Rating</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">2,000+ reviews</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <HiAcademicCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Expert Team</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Dedicated support</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                <img
                                    src="/images/about-store.jpg"
                                    alt="NEXSHOP Store"
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.pexels.com/photos/8550655/pexels-photo-8550655.jpeg';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values Section - More Compact and Modern */}
            <section className="py-10 sm:py-12 lg:py-16 bg-gray-50 dark:bg-secondary-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 lg:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            These principles guide everything we do at NEXSHOP
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
                        {values.map((value, index) => (
                            <div key={index} className="group relative bg-white dark:bg-secondary-800 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`}></div>
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                                    <value.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section - More Compact and Modern */}
            <section className="py-10 sm:py-12 lg:py-16 bg-white dark:bg-secondary-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
                                <HiStar className="w-4 h-4" />
                                Why Choose Us
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                What Makes NEXSHOP Special
                            </h2>
                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Start Shopping
                                    <HiArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 text-center shadow-md">
                                        <HiTruck className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                                        <p className="font-semibold text-gray-900 dark:text-white">Free Shipping</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Orders above 10,000 XAF</p>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 text-center shadow-md">
                                        <HiShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                                        <p className="font-semibold text-gray-900 dark:text-white">Secure Payment</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">100% Secure</p>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 text-center shadow-md">
                                        <HiCurrencyDollar className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                                        <p className="font-semibold text-gray-900 dark:text-white">Best Price</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Guaranteed</p>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 text-center shadow-md">
                                        <HiHeart className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                                        <p className="font-semibold text-gray-900 dark:text-white">Customer Care</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">24/7 Support</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA Section - More Compact and Modern */}
            <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-br from-primary-600 to-primary-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Have Questions?</h2>
                    <p className="text-primary-100 max-w-2xl mx-auto mb-8">
                        Our team is here to help. Contact us anytime and we'll get back to you within 24 hours.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <HiPhone className="w-6 h-6 mx-auto mb-2 text-white" />
                            <p className="text-sm text-primary-100">Call Us</p>
                            <p className="font-semibold text-white">+237 683 669 723</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <HiMail className="w-6 h-6 mx-auto mb-2 text-white" />
                            <p className="text-sm text-primary-100">Email Us</p>
                            <p className="font-semibold text-white">nexshop@gmail.com</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <HiLocationMarker className="w-6 h-6 mx-auto mb-2 text-white" />
                            <p className="text-sm text-primary-100">Visit Us</p>
                            <p className="font-semibold text-white">Douala, Cameroon</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                        >
                            <HiUserGroup className="w-5 h-5" />
                            Contact Us
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-primary-500/30 transition-colors"
                        >
                            Browse Products
                            <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;