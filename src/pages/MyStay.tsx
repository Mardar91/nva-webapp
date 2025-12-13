// ============================================
// APP: NVA (React App)
// FILE: src/pages/MyStay.tsx
// PURPOSE: My Stay page - Booking details and access code
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  ArrowRight,
  Star,
  Gift,
  X
} from "lucide-react";
import { useGuestSession } from "../hooks/useGuestSession";
import { fetchAccessCode, AccessCodeResponse, AccessCodeApartment, sendChatMessage } from "../lib/guestApi";
import GuestLoginModal from "../components/GuestLoginModal";
import GuestChatDrawer from "../components/GuestChatDrawer";
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "../hooks/useNotifications";

const MyStay: React.FC = () => {
  const { t, i18n } = useTranslation();
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
  const [showFiveStarModal, setShowFiveStarModal] = useState(false);
  const [fiveStarSent, setFiveStarSent] = useState(false);
  const [fiveStarLoading, setFiveStarLoading] = useState(false);

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
    return new Intl.DateTimeFormat(i18n.language === 'it' ? 'it-IT' : 'en-US', {
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
    | 'pre_checkin_two_days'
    | 'pre_checkin_tomorrow'
    | 'checkin_early_morning'
    | 'checkin_morning'
    | 'checkin_midday'
    | 'checkin_afternoon'
    | 'checkin_evening'
    | 'checkin_night'
    | 'first_night'
    | 'early_stay'
    | 'mid_stay'
    | 'late_stay'
    | 'pre_checkout_evening'
    | 'pre_checkout_night'
    | 'checkout_early_morning'
    | 'checkout_morning'
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

    // After checkout (check first to fix 1-night booking bug)
    if (daysUntilCheckout < 0 || (daysUntilCheckout === 0 && currentHour >= 10)) {
      phase = 'post_checkout';
      progress = 100;
    }
    // Checkout day (before 10 AM)
    else if (daysUntilCheckout === 0) {
      if (currentHour < 5) {
        phase = 'pre_checkout_night';
        progress = 92;
      } else if (currentHour < 8) {
        phase = 'checkout_early_morning';
        progress = 94;
      } else {
        phase = 'checkout_morning';
        progress = 97;
      }
    }
    // Day before checkout
    else if (daysUntilCheckout === 1) {
      if (currentHour >= 18) {
        phase = 'pre_checkout_evening';
        progress = 88;
      } else if (currentHour < 6) {
        phase = 'pre_checkout_night';
        progress = 85;
      } else {
        phase = 'late_stay';
        progress = 85;
      }
    }
    // Before check-in
    else if (daysUntilCheckin > 7) {
      phase = 'pre_checkin_far';
      progress = 0;
    } else if (daysUntilCheckin > 2) {
      phase = 'pre_checkin_soon';
      progress = 0;
    } else if (daysUntilCheckin === 2) {
      phase = 'pre_checkin_two_days';
      progress = 0;
    } else if (daysUntilCheckin === 1) {
      phase = 'pre_checkin_tomorrow';
      progress = 0;
    }
    // Check-in day
    else if (daysUntilCheckin === 0 && daysIntoStay === 0) {
      if (currentHour < 8) {
        phase = 'checkin_early_morning';
        progress = 3;
      } else if (currentHour < 12) {
        phase = 'checkin_morning';
        progress = 5;
      } else if (currentHour < 15) {
        phase = 'checkin_midday';
        progress = 8;
      } else if (currentHour < 18) {
        phase = 'checkin_afternoon';
        progress = 10;
      } else if (currentHour < 21) {
        phase = 'checkin_evening';
        progress = 12;
      } else {
        phase = 'checkin_night';
        progress = 14;
      }
    }
    // First night (morning after check-in day)
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
    // Fallback
    else {
      phase = 'post_checkout';
      progress = 100;
    }

    return { progress, phase, daysUntilCheckin, daysIntoStay, daysUntilCheckout, totalNights };
  };

  const getPhaseContent = (phase: StayPhase, daysUntilCheckin: number, daysIntoStay: number, daysUntilCheckout: number, totalNights: number) => {
    const currentHour = new Date().getHours();

    // Helper to get time-based title and message for early_stay
    const getEarlyStayContent = () => {
      if (currentHour < 6) {
        return {
          title: t('myStay.stayPhases.earlyStay.titleNight'),
          message: t('myStay.stayPhases.earlyStay.messageNight')
        };
      } else if (currentHour < 9) {
        return {
          title: t('myStay.stayPhases.earlyStay.titleEarlyMorning'),
          message: t('myStay.stayPhases.earlyStay.messageEarlyMorning', { current: daysIntoStay + 1, total: totalNights })
        };
      } else if (currentHour < 12) {
        return {
          title: t('myStay.stayPhases.earlyStay.titleMorning'),
          message: t('myStay.stayPhases.earlyStay.messageMorning', { current: daysIntoStay + 1, total: totalNights })
        };
      } else if (currentHour < 15) {
        return {
          title: t('myStay.stayPhases.earlyStay.titleMidday'),
          message: t('myStay.stayPhases.earlyStay.messageMidday')
        };
      } else if (currentHour < 18) {
        return {
          title: t('myStay.stayPhases.earlyStay.titleAfternoon'),
          message: t('myStay.stayPhases.earlyStay.messageAfternoon', { current: daysIntoStay + 1, total: totalNights })
        };
      } else if (currentHour < 21) {
        return {
          title: t('myStay.stayPhases.earlyStay.titleEvening'),
          message: t('myStay.stayPhases.earlyStay.messageEvening')
        };
      } else {
        return {
          title: t('myStay.stayPhases.earlyStay.titleNight'),
          message: t('myStay.stayPhases.earlyStay.messageNight')
        };
      }
    };

    const earlyStayContent = getEarlyStayContent();

    const phaseMessages: Record<StayPhase, { icon: React.ReactNode; title: string; message: string; color: string }> = {
      pre_checkin_far: {
        icon: <Calendar className="h-5 w-5" />,
        title: t('myStay.stayPhases.preFar.title'),
        message: t('myStay.stayPhases.preFar.message', { days: daysUntilCheckin }),
        color: "from-blue-500 to-indigo-600"
      },
      pre_checkin_soon: {
        icon: <Sparkle className="h-5 w-5" />,
        title: t('myStay.stayPhases.preSoon.title'),
        message: t('myStay.stayPhases.preSoon.message', { days: daysUntilCheckin }),
        color: "from-cyan-500 to-blue-600"
      },
      pre_checkin_two_days: {
        icon: <Sparkle className="h-5 w-5" />,
        title: t('myStay.stayPhases.preTwoDays.title'),
        message: t('myStay.stayPhases.preTwoDays.message'),
        color: "from-cyan-500 to-blue-600"
      },
      pre_checkin_tomorrow: {
        icon: <Sunrise className="h-5 w-5" />,
        title: t('myStay.stayPhases.preTomorrow.title'),
        message: t('myStay.stayPhases.preTomorrow.message'),
        color: "from-amber-500 to-orange-600"
      },
      checkin_early_morning: {
        icon: <Sunrise className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkinEarlyMorning.title'),
        message: t('myStay.stayPhases.checkinEarlyMorning.message'),
        color: "from-amber-400 to-yellow-500"
      },
      checkin_morning: {
        icon: <Sun className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkinMorning.title'),
        message: t('myStay.stayPhases.checkinMorning.message'),
        color: "from-yellow-500 to-amber-600"
      },
      checkin_midday: {
        icon: <Sun className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkinMidday.title'),
        message: t('myStay.stayPhases.checkinMidday.message'),
        color: "from-orange-400 to-amber-500"
      },
      checkin_afternoon: {
        icon: <Key className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkinAfternoon.title'),
        message: t('myStay.stayPhases.checkinAfternoon.message'),
        color: "from-green-500 to-emerald-600"
      },
      checkin_evening: {
        icon: <Sunset className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkinEvening.title'),
        message: t('myStay.stayPhases.checkinEvening.message'),
        color: "from-orange-500 to-rose-600"
      },
      checkin_night: {
        icon: <Moon className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkinNight.title'),
        message: t('myStay.stayPhases.checkinNight.message'),
        color: "from-indigo-500 to-purple-600"
      },
      first_night: {
        icon: <Coffee className="h-5 w-5" />,
        title: t('myStay.stayPhases.firstNight.title'),
        message: t('myStay.stayPhases.firstNight.message'),
        color: "from-teal-500 to-cyan-600"
      },
      early_stay: {
        icon: currentHour < 12 ? <Coffee className="h-5 w-5" /> : currentHour < 18 ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
        title: earlyStayContent.title,
        message: earlyStayContent.message,
        color: currentHour < 12 ? "from-teal-500 to-cyan-600" : currentHour < 18 ? "from-amber-500 to-orange-500" : "from-indigo-500 to-purple-600"
      },
      mid_stay: {
        icon: <Sparkles className="h-5 w-5" />,
        title: t('myStay.stayPhases.midStay.title'),
        message: t('myStay.stayPhases.midStay.message', { days: daysUntilCheckout }),
        color: "from-purple-500 to-pink-600"
      },
      late_stay: {
        icon: <Sunset className="h-5 w-5" />,
        title: t('myStay.stayPhases.lateStay.title'),
        message: t('myStay.stayPhases.lateStay.message', { days: daysUntilCheckout }),
        color: "from-orange-500 to-rose-600"
      },
      pre_checkout_evening: {
        icon: <Sunset className="h-5 w-5" />,
        title: t('myStay.stayPhases.preCheckoutEvening.title'),
        message: t('myStay.stayPhases.preCheckoutEvening.message'),
        color: "from-rose-500 to-pink-600"
      },
      pre_checkout_night: {
        icon: <Moon className="h-5 w-5" />,
        title: t('myStay.stayPhases.preCheckoutNight.title'),
        message: t('myStay.stayPhases.preCheckoutNight.message'),
        color: "from-indigo-500 to-purple-600"
      },
      checkout_early_morning: {
        icon: <Sunrise className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkoutEarlyMorning.title'),
        message: t('myStay.stayPhases.checkoutEarlyMorning.message'),
        color: "from-amber-500 to-orange-600"
      },
      checkout_morning: {
        icon: <Clock className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkoutMorning.title'),
        message: t('myStay.stayPhases.checkoutMorning.message'),
        color: "from-red-500 to-rose-600"
      },
      checkout_day: {
        icon: <Home className="h-5 w-5" />,
        title: t('myStay.stayPhases.checkoutDay.title'),
        message: t('myStay.stayPhases.checkoutDay.message'),
        color: "from-gray-500 to-gray-700"
      },
      post_checkout: {
        icon: <CheckCircle2 className="h-5 w-5" />,
        title: t('myStay.stayPhases.postCheckout.title'),
        message: t('myStay.stayPhases.postCheckout.message'),
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
        title: t('myStay.tips.vipTicket.title'),
        description: t('myStay.tips.vipTicket.description'),
        action: "/partners"
      });
      tips.push({
        icon: <MapPin className="h-4 w-4" />,
        title: t('myStay.tips.exploreArea.title'),
        description: t('myStay.tips.exploreArea.description'),
        action: "/explore"
      });
    }

    // Check-in day
    if (phase === 'checkin_morning' || phase === 'checkin_afternoon') {
      tips.push({
        icon: <Wine className="h-4 w-4" />,
        title: t('myStay.tips.welcomeDrink.title'),
        description: t('myStay.tips.welcomeDrink.description'),
        service: "wine"
      });
      if (phase === 'checkin_afternoon') {
        tips.push({
          icon: <Key className="h-4 w-4" />,
          title: t('myStay.tips.getAccessCode.title'),
          description: t('myStay.tips.getAccessCode.description'),
          action: "access_code"
        });
      }
    }

    // First morning tips
    if (phase === 'first_night') {
      tips.push({
        icon: <Croissant className="h-4 w-4" />,
        title: t('myStay.tips.breakfast.title'),
        description: t('myStay.tips.breakfast.description'),
        service: "breakfast"
      });
      tips.push({
        icon: <Bike className="h-4 w-4" />,
        title: t('myStay.tips.rentBike.title'),
        description: t('myStay.tips.rentBike.description'),
        service: "bike"
      });
    }

    // During stay
    if (phase === 'early_stay' || phase === 'mid_stay') {
      if (totalNights >= 3) {
        tips.push({
          icon: <Sparkle className="h-4 w-4" />,
          title: t('myStay.tips.midStayCleaning.title'),
          description: t('myStay.tips.midStayCleaning.description'),
          service: "clean"
        });
        tips.push({
          icon: <Recycle className="h-4 w-4" />,
          title: t('myStay.tips.midStayWaste.title'),
          description: t('myStay.tips.midStayWaste.description'),
          service: "recycle"
        });
      }
      tips.push({
        icon: <Bike className="h-4 w-4" />,
        title: t('myStay.tips.bikeTour.title'),
        description: t('myStay.tips.bikeTour.description'),
        service: "bike"
      });
      tips.push({
        icon: <Wine className="h-4 w-4" />,
        title: t('myStay.tips.localWine.title'),
        description: t('myStay.tips.localWine.description'),
        service: "wine"
      });
    }

    // Late stay / Pre-checkout
    if (phase === 'late_stay' || phase === 'pre_checkout') {
      tips.push({
        icon: <Recycle className="h-4 w-4" />,
        title: t('myStay.tips.wasteCollection.title'),
        description: t('myStay.tips.wasteCollection.description'),
        service: "recycle"
      });
      tips.push({
        icon: <MessageCircle className="h-4 w-4" />,
        title: t('myStay.tips.needAnything.title'),
        description: t('myStay.tips.needAnything.description'),
        action: "chat"
      });
    }

    // Checkout day
    if (phase === 'checkout_day') {
      tips.push({
        icon: <Clock className="h-4 w-4" />,
        title: t('myStay.tips.checkoutTime.title'),
        description: t('myStay.tips.checkoutTime.description'),
        action: "info"
      });
      tips.push({
        icon: <MessageCircle className="h-4 w-4" />,
        title: t('myStay.tips.extendStay.title'),
        description: t('myStay.tips.extendStay.description'),
        action: "chat"
      });
    }

    // Post-checkout
    if (phase === 'post_checkout') {
      tips.push({
        icon: <Star className="h-4 w-4" />,
        title: t('myStay.tips.fiveStarReview.title'),
        description: t('myStay.tips.fiveStarReview.description'),
        action: "five_star_promo"
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
    } else if (action === 'five_star_promo') {
      setShowFiveStarModal(true);
    } else if (action === 'info') {
      // Just informational, no action
    } else if (action) {
      navigate(action);
    }
  };

  // Handle 5-star promo participation
  const handleFiveStarParticipate = async () => {
    if (!token) return;

    setFiveStarLoading(true);

    try {
      const message = t('myStay.fiveStarPromo.autoMessage', {
        name: guestName || 'Guest',
        apartment: booking?.apartmentName || 'Apartment'
      });

      const response = await sendChatMessage(token, message);

      if (response.success) {
        setFiveStarSent(true);
      }
    } catch (error) {
      console.error('Error sending five star promo message:', error);
    } finally {
      setFiveStarLoading(false);
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
      setEmailError(t('accessCode.errors.enterEmail'));
      return;
    }

    if (emailInput.toLowerCase().trim() !== booking?.guestEmail?.toLowerCase()) {
      setEmailError(t('accessCode.errors.emailNoMatch'));
      return;
    }

    setAccessCodeLoading(true);

    try {
      const result = await fetchAccessCode(token, emailInput.trim());

      if (result.success) {
        setAccessCodeData(result);
        setShowAccessCode(true);
      } else {
        setAccessCodeError(result.error || t('accessCode.errors.fetchFailed'));
      }
    } catch (err) {
      setAccessCodeError(t('accessCode.errors.connectionError'));
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
          bottom: 'calc(72px + env(safe-area-inset-bottom))',
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
                {t('myStay.title')}
              </h1>
              <p className="text-white/80 text-sm max-w-xs mx-auto">
                {t('myStay.subtitle')}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('myStay.guestBenefits')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('myStay.whatYouCanAccess')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: Calendar, title: t('myStay.benefits.bookingDetails'), desc: t('myStay.benefits.viewReservation') },
              { icon: CheckCircle2, title: t('myStay.benefits.checkInStatus'), desc: t('myStay.benefits.trackCheckIn') },
              { icon: Key, title: t('myStay.benefits.accessCode'), desc: t('myStay.benefits.getAccessCode') },
              { icon: MapPin, title: t('myStay.benefits.navigation'), desc: t('myStay.benefits.findApartment') },
              { icon: MessageCircle, title: t('myStay.benefits.directChat'), desc: t('myStay.benefits.messageReception') },
              { icon: Ticket, title: t('myStay.benefits.vipTicket'), desc: t('myStay.benefits.downloadPass') },
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
            {t('myStay.loginToBooking')}
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            {t('myStay.loginHint')}
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
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
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
                <span className="text-white/90 text-sm font-medium">{t('myStay.welcomeBack')}</span>
              </div>

              <h1 className="text-2xl font-bold text-white mb-1">
                {t('myStay.hello', { name: guestName || t('common.guest') })}
              </h1>
              <p className="text-white/80 text-sm">
                {booking?.apartmentName || t('common.apartment')}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('myStay.bookingDetails')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('myStay.ref', { ref: booking?.id?.substring(0, 8) })}</p>
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dates.checkIn')}</span>
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dates.checkOut')}</span>
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('common.guests')}</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {booking?.numberOfGuests || 1} {(booking?.numberOfGuests || 1) > 1 ? t('common.guests') : t('common.guest')}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('myStay.duration')}</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {calculateNights()} {calculateNights() > 1 ? t('common.nights') : t('common.night')}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('myStay.yourJourney')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('myStay.stayProgressTips')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
            {/* Phase Header */}
            <div className={`bg-gradient-to-r ${phaseContent.color} px-4 py-3 rounded-t-xl`}>
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dates.checkIn')}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dates.checkOut')}</span>
                </div>
                <div className="relative h-3">
                  {/* Progress bar track */}
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
                  </div>
                  {/* Progress indicator - outside overflow-hidden container */}
                  {stayProgress.progress > 0 && stayProgress.progress < 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.3 }}
                      className="absolute w-5 h-5 bg-white dark:bg-gray-800 rounded-full border-2 border-purple-500 shadow-lg"
                      style={{
                        left: `calc(${stayProgress.progress}% - 10px)`,
                        top: '50%',
                        marginTop: '-10px'
                      }}
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
                    {t('myStay.suggestionsForYou')}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('myStay.checkInStatus')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('myStay.onlineCheckInProcess')}</p>
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
                  {booking?.onlineCheckInCompleted ? t('checkIn.status.completed') : t('checkIn.status.pending')}
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
                      {t('myStay.checkInComplete')}
                    </p>
                    {booking?.onlineCheckInCompletedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('myStay.completedOn', { date: formatDate(booking.onlineCheckInCompletedAt) })}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {t('myStay.completeCheckInMessage')}
                  </p>
                  <button
                    onClick={() => navigate('/check-in')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
                  >
                    {t('myStay.completeCheckIn')}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('accessCode.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('accessCode.subtitle')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold">{t('accessCode.secureAccess')}</span>
                </div>
              </div>

              <div className="p-4">
                {!showAccessCode ? (
                  <>
                    <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {t('accessCode.verifyEmail')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          {t('accessCode.bookingEmail')}
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
                            placeholder={t('accessCode.enterEmail')}
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
                          <span>{t('common.verifying')}</span>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            {t('accessCode.verifyShow')}
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
                      {t('accessCode.hideMultiple')}
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
                      {t('accessCode.hide')}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('myStay.apartmentLocation')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('myStay.findYourWay')}</p>
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
                  {t('myStay.getDirections')}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('myStay.quickActions')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('myStay.usefulShortcuts')}</p>
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
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-center">{t('myStay.vipTicket')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{t('myStay.discountPartners')}</p>
            </button>

            <button
              onClick={() => setShowChatDrawer(true)}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-4 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 mx-auto">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-center">{t('myStay.chat')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{t('myStay.contactReception')}</p>
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

      {/* Five Star Promo Modal */}
      <AnimatePresence>
        {showFiveStarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!fiveStarSent) {
                setShowFiveStarModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 px-5 py-4 rounded-t-2xl relative">
                <button
                  onClick={() => {
                    setShowFiveStarModal(false);
                    if (fiveStarSent) {
                      setFiveStarSent(false);
                    }
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-white fill-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {t('myStay.fiveStarPromo.title')}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {t('myStay.fiveStarPromo.subtitle')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {fiveStarSent ? (
                  /* Success State */
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('myStay.fiveStarPromo.messageSent')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('myStay.fiveStarPromo.messageConfirmation')}
                    </p>
                    <button
                      onClick={() => {
                        setShowFiveStarModal(false);
                        setFiveStarSent(false);
                      }}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      {t('myStay.fiveStarPromo.close')}
                    </button>
                  </motion.div>
                ) : (
                  /* Promo Content */
                  <>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {t('myStay.fiveStarPromo.description')}
                    </p>

                    {/* Benefits */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                          {t('myStay.fiveStarPromo.benefit1')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Wine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                          {t('myStay.fiveStarPromo.benefit2')}
                        </p>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t('myStay.fiveStarPromo.howItWorks')}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            1
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {t('myStay.fiveStarPromo.step1')}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            2
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {t('myStay.fiveStarPromo.step2')}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            3
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {t('myStay.fiveStarPromo.step3')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-6">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('myStay.fiveStarPromo.disclaimer')}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleFiveStarParticipate}
                      disabled={fiveStarLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                    >
                      {fiveStarLoading ? (
                        <span>{t('common.loading')}</span>
                      ) : (
                        <>
                          <Gift className="h-5 w-5" />
                          {t('myStay.fiveStarPromo.participate')}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyStay;
