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
  Check,
  Sun,
  Moon,
  Coffee,
  Sunrise,
  Sunset,
  Wine,
  Bike,
  Sparkle,
  Croissant,
  Recycle,
  ArrowRight
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

  // Stay Progress Widget Logic
  type StayPhase =
    | 'pre_checkin_far'
    | 'pre_checkin_soon'
    | 'pre_checkin_tomorrow'
    | 'checkin_morning'
    | 'checkin_afternoon'
    | 'first_night'
    | 'early_stay'
    | 'mid_stay'
    | 'late_stay'
    | 'pre_checkout'
    | 'checkout_day'
    | 'post_checkout';

  const getStayProgress = () => {
    if (!booking?.checkIn || !booking?.checkOut) return { progress: 0, phase: 'pre_checkin_far' as StayPhase, daysUntilCheckin: 0, daysIntoStay: 0, daysUntilCheckout: 0 };

    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const currentHour = now.getHours();

    // Reset times to midnight for day calculations
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

    const totalNights = calculateNights();
    const msPerDay = 1000 * 60 * 60 * 24;

    const daysUntilCheckin = Math.ceil((checkInDate.getTime() - nowDate.getTime()) / msPerDay);
    const daysIntoStay = Math.floor((nowDate.getTime() - checkInDate.getTime()) / msPerDay);
    const daysUntilCheckout = Math.ceil((checkOutDate.getTime() - nowDate.getTime()) / msPerDay);

    let phase: StayPhase;
    let progress: number;

    // Before check-in
    if (daysUntilCheckin > 7) {
      phase = 'pre_checkin_far';
      progress = 0;
    } else if (daysUntilCheckin > 1) {
      phase = 'pre_checkin_soon';
      progress = 0;
    } else if (daysUntilCheckin === 1) {
      phase = 'pre_checkin_tomorrow';
      progress = 0;
    }
    // Check-in day
    else if (daysUntilCheckin === 0 && daysIntoStay === 0) {
      if (currentHour < 15) {
        phase = 'checkin_morning';
        progress = 5;
      } else {
        phase = 'checkin_afternoon';
        progress = 10;
      }
    }
    // First night (after check-in day)
    else if (daysIntoStay === 1 && currentHour < 12) {
      phase = 'first_night';
      progress = Math.min(15, (1 / totalNights) * 100);
    }
    // During stay
    else if (daysIntoStay >= 0 && daysUntilCheckout > 1) {
      const stayProgress = (daysIntoStay / totalNights) * 100;
      progress = Math.min(Math.max(stayProgress, 15), 85);

      if (daysIntoStay <= Math.ceil(totalNights * 0.25)) {
        phase = 'early_stay';
      } else if (daysIntoStay <= Math.ceil(totalNights * 0.75)) {
        phase = 'mid_stay';
      } else {
        phase = 'late_stay';
      }
    }
    // Day before checkout
    else if (daysUntilCheckout === 1) {
      phase = 'pre_checkout';
      progress = 90;
    }
    // Checkout day
    else if (daysUntilCheckout === 0) {
      phase = 'checkout_day';
      progress = currentHour < 10 ? 95 : 100;
    }
    // After checkout
    else {
      phase = 'post_checkout';
      progress = 100;
    }

    return { progress, phase, daysUntilCheckin, daysIntoStay, daysUntilCheckout, totalNights };
  };

  const getPhaseContent = (phase: StayPhase, daysUntilCheckin: number, daysIntoStay: number, daysUntilCheckout: number, totalNights: number) => {
    const currentHour = new Date().getHours();

    const phaseMessages: Record<StayPhase, { icon: React.ReactNode; title: string; message: string; color: string }> = {
      pre_checkin_far: {
        icon: <Calendar className="h-5 w-5" />,
        title: "Your Trip is Coming Up!",
        message: `${daysUntilCheckin} days until your arrival. Start planning your Puglia adventure!`,
        color: "from-blue-500 to-indigo-600"
      },
      pre_checkin_soon: {
        icon: <Sparkle className="h-5 w-5" />,
        title: "Almost Time!",
        message: `Only ${daysUntilCheckin} days to go! We're preparing everything for your arrival.`,
        color: "from-cyan-500 to-blue-600"
      },
      pre_checkin_tomorrow: {
        icon: <Sunrise className="h-5 w-5" />,
        title: "See You Tomorrow!",
        message: "Your stay begins tomorrow! Don't forget to complete your online check-in.",
        color: "from-amber-500 to-orange-600"
      },
      checkin_morning: {
        icon: <Sun className="h-5 w-5" />,
        title: "Today's the Day!",
        message: "Check-in is from 3 PM. Explore Mola di Bari while you wait!",
        color: "from-yellow-500 to-amber-600"
      },
      checkin_afternoon: {
        icon: <Key className="h-5 w-5" />,
        title: "Welcome!",
        message: "Check-in time is here! Get your access code and make yourself at home.",
        color: "from-green-500 to-emerald-600"
      },
      first_night: {
        icon: <Moon className="h-5 w-5" />,
        title: "Good Morning!",
        message: "Hope you had a great first night! Ready to explore?",
        color: "from-indigo-500 to-purple-600"
      },
      early_stay: {
        icon: <Coffee className="h-5 w-5" />,
        title: currentHour < 12 ? "Good Morning!" : currentHour < 18 ? "Good Afternoon!" : "Good Evening!",
        message: `Day ${daysIntoStay + 1} of ${totalNights} nights. Enjoy discovering Puglia!`,
        color: "from-teal-500 to-cyan-600"
      },
      mid_stay: {
        icon: <Sparkles className="h-5 w-5" />,
        title: "You're Halfway There!",
        message: `${daysUntilCheckout} days left to explore. Make the most of it!`,
        color: "from-purple-500 to-pink-600"
      },
      late_stay: {
        icon: <Sunset className="h-5 w-5" />,
        title: "Final Days",
        message: `Only ${daysUntilCheckout} days remaining. Visited all your must-sees?`,
        color: "from-orange-500 to-rose-600"
      },
      pre_checkout: {
        icon: <Clock className="h-5 w-5" />,
        title: "Last Night",
        message: "Tomorrow is checkout day. Enjoy your final evening in Puglia!",
        color: "from-rose-500 to-pink-600"
      },
      checkout_day: {
        icon: <Home className="h-5 w-5" />,
        title: "Checkout Day",
        message: "Check-out is by 10 AM. Thank you for staying with us!",
        color: "from-gray-500 to-gray-700"
      },
      post_checkout: {
        icon: <CheckCircle2 className="h-5 w-5" />,
        title: "Thank You!",
        message: "We hope you enjoyed your stay. See you next time!",
        color: "from-emerald-500 to-teal-600"
      }
    };

    return phaseMessages[phase];
  };

  const getStayTips = (phase: StayPhase, totalNights: number) => {
    type Tip = { icon: React.ReactNode; title: string; description: string; action?: string; service?: string };
    const tips: Tip[] = [];

    // Pre-stay tips
    if (phase.startsWith('pre_checkin')) {
      tips.push({
        icon: <Ticket className="h-4 w-4" />,
        title: "Get Your VIP Ticket",
        description: "10% discount at our partner restaurants and shops",
        action: "/partners"
      });
      tips.push({
        icon: <MapPin className="h-4 w-4" />,
        title: "Explore the Area",
        description: "Discover attractions near your apartment",
        action: "/explore"
      });
    }

    // Check-in day
    if (phase === 'checkin_morning' || phase === 'checkin_afternoon') {
      tips.push({
        icon: <Wine className="h-4 w-4" />,
        title: "Welcome Drink",
        description: "Order a bottle of local wine or prosecco",
        service: "wine"
      });
      if (phase === 'checkin_afternoon') {
        tips.push({
          icon: <Key className="h-4 w-4" />,
          title: "Get Access Code",
          description: "Retrieve your apartment door code",
          action: "access_code"
        });
      }
    }

    // First morning tips
    if (phase === 'first_night') {
      tips.push({
        icon: <Croissant className="h-4 w-4" />,
        title: "Breakfast Delivery",
        description: "Coffee pods and fresh croissants at your door",
        service: "breakfast"
      });
      tips.push({
        icon: <Bike className="h-4 w-4" />,
        title: "Rent a Bike",
        description: "Explore the coast on two wheels",
        service: "bike"
      });
    }

    // During stay
    if (phase === 'early_stay' || phase === 'mid_stay') {
      if (totalNights >= 3) {
        tips.push({
          icon: <Sparkle className="h-4 w-4" />,
          title: "Mid-Stay Cleaning",
          description: "Request a cleaning service during your stay",
          service: "clean"
        });
      }
      tips.push({
        icon: <Bike className="h-4 w-4" />,
        title: "Bike Tour",
        description: "Explore hidden beaches and coastal paths",
        service: "bike"
      });
      tips.push({
        icon: <Wine className="h-4 w-4" />,
        title: "Local Wine",
        description: "Enjoy authentic Puglia wine in your apartment",
        service: "wine"
      });
    }

    // Late stay / Pre-checkout
    if (phase === 'late_stay' || phase === 'pre_checkout') {
      tips.push({
        icon: <Recycle className="h-4 w-4" />,
        title: "Waste Collection",
        description: "Request extra trash bags before checkout",
        service: "recycle"
      });
      tips.push({
        icon: <MessageCircle className="h-4 w-4" />,
        title: "Need Anything?",
        description: "Contact us if you need late checkout",
        action: "chat"
      });
    }

    // Checkout day
    if (phase === 'checkout_day') {
      tips.push({
        icon: <Clock className="h-4 w-4" />,
        title: "Check-out by 10 AM",
        description: "Leave the keys inside the apartment",
        action: "info"
      });
      tips.push({
        icon: <MessageCircle className="h-4 w-4" />,
        title: "Late Checkout?",
        description: "Contact us to arrange a later departure",
        action: "chat"
      });
    }

    return tips.slice(0, 3); // Max 3 tips
  };

  const handleTipClick = (action?: string, service?: string) => {
    if (service) {
      // Navigate to home page with hash to open specific service modal
      navigate(`/#${service}`);
    } else if (action === 'chat') {
      setShowChatDrawer(true);
    } else if (action === 'access_code') {
      // Scroll to access code section
      const element = document.getElementById('access-code-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'info') {
      // Just informational, no action
    } else if (action) {
      navigate(action);
    }
  };

  // Get current stay progress
  const stayProgress = getStayProgress();
  const phaseContent = getPhaseContent(
    stayProgress.phase,
    stayProgress.daysUntilCheckin,
    stayProgress.daysIntoStay,
    stayProgress.daysUntilCheckout,
    stayProgress.totalNights || calculateNights()
  );
  const stayTips = getStayTips(stayProgress.phase, stayProgress.totalNights || calculateNights());

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

        {/* Stay Progress Widget */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Journey</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stay progress & tips</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
            {/* Phase Header */}
            <div className={`bg-gradient-to-r ${phaseContent.color} px-4 py-3`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  {phaseContent.icon}
                </div>
                <span className="text-white font-bold">{phaseContent.title}</span>
              </div>
            </div>

            <div className="p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Check-in</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Check-out</span>
                </div>
                <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* Animated gradient progress bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stayProgress.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #f59e0b)',
                      backgroundSize: '200% 100%',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #f59e0b)',
                        backgroundSize: '200% 100%',
                      }}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                      }}
                      transition={{
                        duration: 3,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>
                  {/* Progress indicator */}
                  {stayProgress.progress > 0 && stayProgress.progress < 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.3 }}
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-800 rounded-full border-2 border-purple-500 shadow-lg"
                      style={{ left: `calc(${stayProgress.progress}% - 10px)` }}
                    >
                      <motion.div
                        className="absolute inset-1 bg-purple-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-3">
                  {phaseContent.message}
                </p>
              </div>

              {/* Tips Section */}
              {stayTips.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                    Suggestions for you
                  </p>
                  <div className="space-y-2">
                    {stayTips.map((tip, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={() => handleTipClick(tip.action, tip.service)}
                        disabled={tip.action === 'info'}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          tip.action === 'info'
                            ? 'bg-gray-50 dark:bg-gray-700/50 cursor-default'
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md active:scale-[0.98]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                          {tip.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {tip.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tip.description}
                          </p>
                        </div>
                        {tip.action !== 'info' && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
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
          <section id="access-code-section">
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
