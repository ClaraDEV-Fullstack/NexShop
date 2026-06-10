// src/pages/Profile.jsx

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    HiUser, HiMail, HiPhone, HiLocationMarker, HiPencil,
    HiCheck, HiX, HiCamera, HiShieldCheck, HiPhotograph,
    HiUpload, HiHome
} from 'react-icons/hi';
import { authAPI } from '../api/api';
import { loadUser } from '../store/authSlice';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        city: '',
        country: '',
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                country: user.country || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                country: user.country || '',
            });
        }
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dataToSend = {};
            Object.keys(formData).forEach(key => {
                if (formData[key] !== undefined) {
                    dataToSend[key] = formData[key];
                }
            });

            await authAPI.updateProfile(dataToSend);
            await dispatch(loadUser());

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            const errorMessage = error.response?.data
                ? Object.values(error.response.data).flat().join(' ')
                : 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.match('image.*')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const uploadImage = async () => {
        if (!fileInputRef.current?.files[0] && !previewImage) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', fileInputRef.current.files[0]);

        try {
            await authAPI.updateProfilePicture(formData);
            await dispatch(loadUser());
            toast.success('Profile picture updated!');
            setShowAvatarModal(false);
            setPreviewImage(null);
        } catch (error) {
            toast.error('Failed to upload profile picture');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const cancelUpload = () => {
        setShowAvatarModal(false);
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader size="lg" />
                    <p className="text-gray-500 mt-3 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-4 md:py-8">
            {/* Avatar Upload Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-500 rounded-lg flex items-center justify-center">
                                        <HiPhotograph className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">Update Photo</h3>
                                        <p className="text-xs text-gray-500">Choose a new picture</p>
                                    </div>
                                </div>
                                <button onClick={cancelUpload} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                    <HiX className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="p-4">
                            {previewImage ? (
                                <div className="text-center">
                                    <div className="relative inline-block mb-3">
                                        <img src={previewImage} alt="Preview" className="w-28 h-28 rounded-full object-cover border-4 border-primary-100 shadow-lg" />
                                        <button
                                            onClick={() => { setPreviewImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                                        >
                                            <HiX className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">Looking good! Ready to upload?</p>
                                </div>
                            ) : (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                        dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                                    }`}
                                >
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <HiUpload className="w-6 h-6 text-primary-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        {dragActive ? 'Drop here' : 'Drag & drop photo'}
                                    </p>
                                    <p className="text-xs text-gray-500">or click to browse</p>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                            <button onClick={cancelUpload} className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                onClick={uploadImage}
                                disabled={!previewImage || isUploading}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white font-medium rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isUploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><HiCheck className="w-4 h-4" /> Upload</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-container">
                {/* Page Header - Compact */}
                <div className="mb-4 md:mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage your account information</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Sidebar - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            {/* Cover */}
                            <div className="h-16 md:h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-600 relative">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="px-4 pb-4">
                                {/* Avatar */}
                                <div className="relative -mt-10 md:-mt-12 mb-3">
                                    <div className="relative inline-block">
                                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-100 to-primary-100 rounded-xl flex items-center justify-center overflow-hidden border-3 md:border-4 border-white shadow-lg">
                                            {(user.avatar_url || user.avatar) ? (
                                                <img src={user.avatar_url || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <HiUser className="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowAvatarModal(true)}
                                            className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-lg shadow-lg flex items-center justify-center"
                                        >
                                            <HiCamera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center mb-4">
                                    <h2 className="text-base md:text-lg font-bold text-gray-900">
                                        {user.first_name || user.username} {user.last_name}
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 truncate">{user.email}</p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-primary-50 rounded-lg p-2.5 md:p-3 text-center">
                                        <p className="text-lg md:text-xl font-bold text-primary-600">
                                            {new Date().getFullYear() - new Date(user.created_at).getFullYear() || '< 1'}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-gray-500">Years Member</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-lg p-2.5 md:p-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-emerald-600">
                                            <HiShieldCheck className="w-4 h-4" />
                                            <span className="text-sm font-bold">Verified</span>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-gray-500">Status</p>
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div className="text-center pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        Member since <span className="font-semibold text-gray-700">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Update Photo Card - Hidden on Mobile */}
                        <div className="hidden md:block mt-4 bg-gradient-to-br from-primary-600 to-primary-600 rounded-xl p-4 text-white">
                            <HiPhotograph className="w-6 h-6 mb-2 opacity-80" />
                            <h3 className="font-bold text-sm mb-1">Update Your Photo</h3>
                            <p className="text-xs text-primary-100 mb-3">Add a photo to personalize your account</p>
                            <button
                                onClick={() => setShowAvatarModal(true)}
                                className="w-full py-2 bg-white text-primary-600 font-semibold rounded-lg text-sm hover:bg-primary-50"
                            >
                                Choose Photo
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Profile Form */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Profile Information Card */}
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            {/* Card Header */}
                            <div className="p-3 md:p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-lg flex items-center justify-center">
                                            <HiUser className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm md:text-lg font-bold text-gray-900">Profile Information</h2>
                                            <p className="text-[10px] md:text-xs text-gray-500">Update your personal details</p>
                                        </div>
                                    </div>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white text-xs md:text-sm font-medium rounded-lg"
                                        >
                                            <HiPencil className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleCancel}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-lg"
                                        >
                                            <HiX className="w-3.5 h-3.5" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Form - Compact */}
                            <div className="p-3 md:p-5">
                                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                                    {/* Name Fields - 2 columns */}
                                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="First name"
                                                className="w-full px-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="Last name"
                                                className="w-full px-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                        <div className="relative">
                                            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="w-full px-3 py-2 md:py-2.5 pl-9 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                                                Locked
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                        <div className="relative">
                                            <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="+1 (555) 123-4567"
                                                className="w-full px-3 py-2 md:py-2.5 pl-9 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative py-1">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-2 bg-white text-[10px] md:text-xs text-gray-400">Address</span>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                                        <div className="relative">
                                            <HiHome className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="123 Main Street"
                                                className="w-full px-3 py-2 md:py-2.5 pl-9 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* City & Country - 2 columns */}
                                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="City"
                                                className="w-full px-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="Country"
                                                className="w-full px-3 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    {isEditing && (
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="inline-flex items-center gap-1.5 px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-primary-600 to-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-70"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <HiCheck className="w-4 h-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Security Card - Compact */}
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-5 border border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <HiShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">Account Security</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mb-3">
                                        Your account is protected with industry-standard security.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                                        {['Email Verified', 'Secure', 'Encrypted'].map((badge, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] md:text-xs font-medium">
                                                <HiCheck className="w-3 h-3" />
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;