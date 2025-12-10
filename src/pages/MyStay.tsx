// ============================================
// APP: NVA (React App)
// FILE: src/pages/MyStay.tsx
// PURPOSE: My Stay page - Booking details and access code
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  MapPin,
  Users,
  Home,
  CheckCircle2,
  Clock,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  LogIn,
  Ticket,
  MessageCircle,
  ChevronRight,
  Shield,
  Sparkles,
  Building2,
  Mail,
  AlertCircle,
  Navigation,
  Copy,
  Check
} from "lucide-react";
import { useGuestSession } from "../hooks/useGuestSession";
import { fetchAccessCode, AccessCodeResponse, AccessCodeApartment } from "../lib/guestApi";
import GuestLoginModal from "../components/GuestLoginModal";
import GuestChatDrawer from "../components/GuestChatDrawer";
import { useNotifications } from "../hooks/useNotifications";

const MyStay: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    isLoading: sessionLoading,
    token,
    booking,
    guestName,
    error: sessionError,
    login,
    refreshSession
  } = useGuestSession();

  const { deviceId } = useNotifications();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [accessCodeData, setAccessCodeData] = useState<AccessCodeResponse | null>(null);
  const [accessCodeLoading, setAccessCodeLoading] = useState(false);
  const [accessCodeError, setAccessCodeError] = useState<string | null>(null);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Refresh booking info on mount
  useEffect(() => {
    if (isLoggedIn && token) {
      refreshSession();
    }
  }, []);

  // Listen for openGuestChat event
  useEffect(() => {
    const handleOpenGuestChat = () => {
      if (isLoggedIn) {
        setShowChatDrawer(true);
      }
    };

    window.addEventListener('openGuestChat', handleOpenGuestChat);
    return () => window.removeEventListener('openGuestChat', handleOpenGuestChat);
  }, [isLoggedIn]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Calculate nights
  const calculateNights = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle email verification for access code
  const handleVerifyEmail = async () => {
    if (!token) return;

    setEmailError(null);

    if (!emailInput.trim()) {
      setEmailError("Please enter your email");
      return;
    }

    if (emailInput.toLowerCase().trim() !== booking?.guestEmail?.toLowerCase()) {
      setEmailError("Email does not match booking");
      return;
    }

    setAccessCodeLoading(true);

    try {
      const result = await fetchAccessCode(token, emailInput.trim());

      if (result.success) {
        setAccessCodeData(result);
        setShowAccessCode(true);
      } else {
        setAccessCodeError(result.error || "Failed to get access code");
      }
    } catch (err) {
      setAccessCodeError("Connection error. Please try again.");
    } finally {
      setAccessCodeLoading(false);
    }
  };

  // Copy access code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Open in maps
  const openInMaps = (lat?: number | null, lng?: number | null, address?: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
    }
  };

  // Handle login
  const handleLogin = async (bookingRef: string, email: string): Promise<boolean> => {
    const success = await login(bookingRef, email, deviceId);
    return success;
  };

  // Handle session expired from chat
  const handleSessionExpired = () => {
    setShowChatDrawer(false);
  };

  // Not logged in view
  if (!isLoggedIn) {
    return (
      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900"
        style={{
          bottom: '88px',
          top: 0,
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-sky-500 via-cyan-600 to-blue-700 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative px-5 py-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">
                My Stay
              </h1>
              <p className="text-white/80 text-sm max-w-xs mx-auto">
                Log in to access your booking details, check-in status, and apartment access code
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Guest Benefits</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">What you can access after login</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: Calendar, title: "Booking Details", desc: "View your reservation info" },
              { icon: CheckCircle2, title: "Check-in Status", desc: "Track your online check-in" },
              { icon: Key, title: "Access Code", desc: "Get your apartment door code" },
              { icon: MapPin, title: "Navigation", desc: "Find your apartment easily" },
              { icon: MessageCircle, title: "Direct Chat", desc: "Message our reception" },
              { icon: Ticket, title: "VIP Ticket", desc: "Download your discount pass" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <LogIn className="h-5 w-5" />
            Log In to Your Booking
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Use your booking reference and email to log in
          </p>
        </div>

        <GuestLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          isLoading={sessionLoading}
          error={sessionError}
          redirectToChat={false}
        />
      </div>
    );
  }

  // Logged in view
  return (
    <div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900"
      style={{
        bottom: '88px',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-sky-500 via-cyan-600 to-blue-700 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative px-5 py-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-white/90 text-sm font-medium">Welcome back!</span>
              </div>

              <h1 className="text-2xl font-bold text-white mb-1">
                Hello, {guestName || 'Guest'}
              </h1>
              <p className="text-white/80 text-sm">
                {booking?.apartmentName || 'Your Apartment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Booking Details Card */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Booking Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ref: {booking?.bookingReference}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-sky-200 dark:border-sky-800 overflow-hidden">
            {/* Dates Row */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Check-in</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {formatDate(booking?.checkIn || '')}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Check-out</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {formatDate(booking?.checkOut || '')}
                </p>
              </div>
            </div>

            {/* Info Row */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Guests</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {booking?.numberOfGuests || 1} {(booking?.numberOfGuests || 1) > 1 ? 'Guests' : 'Guest'}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Duration</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {calculateNights()} {calculateNights() > 1 ? 'Nights' : 'Night'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Check-in Status Card */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              {booking?.onlineCheckInCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={1.5} />
              ) : (
                <Clock className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Check-in Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online check-in process</p>
            </div>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 overflow-hidden ${
            booking?.onlineCheckInCompleted
              ? 'border-green-200 dark:border-green-800'
              : 'border-amber-200 dark:border-amber-800'
          }`}>
            <div className={`px-4 py-3 ${
              booking?.onlineCheckInCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  {booking?.onlineCheckInCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Clock className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-white font-bold">
                  {booking?.onlineCheckInCompleted ? 'Check-in Completed' : 'Check-in Pending'}
                </span>
              </div>
            </div>

            <div className="p-4">
              {booking?.onlineCheckInCompleted ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your online check-in is complete!
                    </p>
                    {booking?.onlineCheckInCompletedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Completed on {formatDate(booking.onlineCheckInCompletedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Please complete your online check-in to get your apartment access code.
                  </p>
                  <button
                    onClick={() => navigate('/check-in')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
                  >
                    Complete Check-in
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Access Code Card - Only show if check-in is completed */}
        {booking?.onlineCheckInCompleted && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <Key className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Access Code</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apartment door code</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold">Secure Access</span>
                </div>
              </div>

              <div className="p-4">
                {!showAccessCode ? (
                  <>
                    <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        For security, please verify your email to view the access code.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Booking Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              setEmailError(null);
                            }}
                            placeholder="Enter your booking email"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        {emailError && (
                          <p className="text-sm text-red-500 mt-1.5">{emailError}</p>
                        )}
                      </div>

                      <button
                        onClick={handleVerifyEmail}
                        disabled={accessCodeLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                      >
                        {accessCodeLoading ? (
                          <span>Verifying...</span>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Verify & Show Code
                          </>
                        )}
                      </button>
                    </div>

                    {accessCodeError && (
                      <p className="text-sm text-red-500 mt-3 text-center">{accessCodeError}</p>
                    )}
                  </>
                ) : accessCodeData?.isGroupBooking && accessCodeData?.apartments ? (
                  // Multiple apartments (group booking)
                  <div className="space-y-3">
                    {accessCodeData.apartments.map((apt: AccessCodeApartment, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-indigo-500" />
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {apt.apartmentName}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(apt.accessCode)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            {copiedCode === apt.accessCode ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                            {apt.accessCode}
                          </span>
                          {apt.apartmentLatitude && apt.apartmentLongitude && (
                            <button
                              onClick={() => openInMaps(apt.apartmentLatitude, apt.apartmentLongitude, apt.apartmentAddress)}
                              className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                              <Navigation className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setShowAccessCode(false);
                        setEmailInput("");
                        setAccessCodeData(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2 text-sm"
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide Access Codes
                    </button>
                  </div>
                ) : (
                  // Single apartment
                  <div className="text-center">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {accessCodeData?.apartmentName || booking?.apartmentName}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
                          {accessCodeData?.accessCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(accessCodeData?.accessCode || '')}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          {copiedCode === accessCodeData?.accessCode ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowAccessCode(false);
                        setEmailInput("");
                        setAccessCodeData(null);
                      }}
                      className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2 text-sm mx-auto"
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide Access Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Apartment Location Card */}
        {(booking?.apartmentAddress || (booking?.apartmentLatitude && booking?.apartmentLongitude)) && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Apartment Location</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find your way</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold">{booking?.apartmentName}</span>
                </div>
              </div>

              <div className="p-4">
                {booking?.apartmentAddress && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {booking.apartmentAddress}
                  </p>
                )}

                <button
                  onClick={() => openInMaps(booking?.apartmentLatitude, booking?.apartmentLongitude, booking?.apartmentAddress)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Useful shortcuts</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/partners')}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-amber-200 dark:border-amber-800 p-4 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-3 mx-auto">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-center">VIP Ticket</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">10% OFF partners</p>
            </button>

            <button
              onClick={() => setShowChatDrawer(true)}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-4 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 mx-auto">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-center">Chat</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Contact reception</p>
            </button>
          </div>
        </section>
      </div>

      {/* Guest Chat Drawer */}
      <GuestChatDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        token={token}
        guestName={guestName}
        onSessionExpired={handleSessionExpired}
      />
    </div>
  );
};

export default MyStay;
