import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineCamera,
    HiOutlineArrowLeft,
    HiSun,
    HiMoon,
    HiCheck,
    HiShieldCheck,
    HiPhotograph,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiX,
    HiUpload
} from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../api/api';
import { loadUser } from '../../store/authSlice';
import toast from 'react-hot-toast';

const DashboardSettings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { isDark, toggleTheme } = useTheme();
    const fileInputRef = useRef(null);

    // Profile state
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Avatar state
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Password state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Load user data
    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    // Profile update handler
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);

        try {
            await authAPI.updateProfile(profileData);
            await dispatch(loadUser());
            toast.success('Profile updated successfully');
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Failed to update profile';
            toast.error(errorMsg);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // Password change handler
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsChangingPassword(true);

        try {
            await authAPI.changePassword(passwordData);
            toast.success('Password changed successfully');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            const errors = error.response?.data;
            if (errors) {
                if (errors.current_password) {
                    toast.error(errors.current_password[0] || 'Current password is incorrect');
                } else if (errors.new_password) {
                    toast.error(errors.new_password[0] || 'Invalid new password');
                } else if (errors.confirm_password) {
                    toast.error(errors.confirm_password[0] || 'Passwords do not match');
                } else {
                    toast.error('Failed to change password');
                }
            } else {
                toast.error('Failed to change password');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Avatar handlers
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
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setShowAvatarModal(true);
        };
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

    const uploadAvatar = async () => {
        const file = fileInputRef.current?.files[0];

        if (!file) {
            toast.error('Please select an image first');
            return;
        }

        setIsUploadingAvatar(true);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            await authAPI.updateProfilePicture(formData);
            await dispatch(loadUser());
            toast.success('Profile picture updated successfully!');
            setShowAvatarModal(false);
            setPreviewImage(null);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to upload profile picture';
            toast.error(errorMsg);
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const cancelUpload = () => {
        setShowAvatarModal(false);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-8 lg:py-12">
            {/* Avatar Upload Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                                        <HiPhotograph className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Update Photo</h3>
                                        <p className="text-sm text-gray-500">Preview your new profile picture</p>
                                    </div>
                                </div>
                                <button
                                    onClick={cancelUpload}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <HiX className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-6">
                            {previewImage && (
                                <div className="text-center">
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-40 h-40 rounded-full object-cover border-4 border-primary-100 shadow-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                setPreviewImage(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
                                        >
                                            <HiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Looking good! Ready to upload?</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={cancelUpload}
                                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadAvatar}
                                disabled={!previewImage || isUploadingAvatar}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploadingAvatar ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <HiCheck className="w-5 h-5" />
                                        Upload Photo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4 group transition-colors"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your account settings and preferences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                        <HiOutlineUser className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                                        <p className="text-sm text-gray-500">Update your personal details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Avatar Upload */}
                                <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-2xl">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            {user?.avatar || user?.avatar_url ? (
                                                <img
                                                    src={user.avatar_url || user.avatar}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl font-bold text-primary-500">
                                                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={triggerFileInput}
                                            disabled={isUploadingAvatar}
                                            className="absolute -bottom-2 -right-2 p-2.5 bg-gradient-to-r from-primary-600 to-primary-600 rounded-xl shadow-lg hover:from-primary-700 hover:to-primary-700 transition-all disabled:opacity-50"
                                        >
                                            {isUploadingAvatar ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <HiOutlineCamera className="w-4 h-4 text-white" />
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Profile Photo</p>
                                        <p className="text-sm text-gray-500 mb-2">JPG, PNG, GIF max 5MB</p>
                                        <button
                                            onClick={triggerFileInput}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Click to upload
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.first_name}
                                                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                placeholder="Your first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.last_name}
                                                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                placeholder="Your last name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md">
                                                Locked
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                            placeholder="+237 6XX XXX XXX"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isUpdatingProfile}
                                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isUpdatingProfile ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                                        <HiOutlineLockClosed className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                                        <p className="text-sm text-gray-500">Update your password regularly for security</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                placeholder="Enter current password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.current ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                placeholder="Enter new password"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.new ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordData.confirm_password}
                                                onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.confirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isChangingPassword ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Changing...
                                                </>
                                            ) : (
                                                'Change Password'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Theme Section */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-100 rounded-lg flex items-center justify-center">
                                        {isDark ? <HiMoon className="w-5 h-5 text-primary-600" /> : <HiSun className="w-5 h-5 text-amber-500" />}
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">Dark Mode</p>
                                        <p className="text-sm text-gray-500">Toggle dark theme</p>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${
                                            isDark
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-500'
                                                : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                            isDark ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                                        <HiShieldCheck className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Account Security</h3>
                                </div>
                                <p className="text-gray-500 text-sm mb-4">
                                    Your account is protected with industry-standard security.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        'Secure Connection (HTTPS)',
                                        'Data Encrypted',
                                        'Password Protected'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <HiCheck className="w-3 h-3 text-emerald-600" />
                                            </div>
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Photo Tips */}
                        <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-2xl p-6 border border-primary-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <HiPhotograph className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Photo Tips</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Use a clear, recent photo</li>
                                        <li>• Good lighting helps</li>
                                        <li>• Simple background</li>
                                        <li>• Max size: 5MB</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;