import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Car,
  Wine,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Sailboat,
  ParkingCircle,
  Croissant,
  Heart,
  Bike,
  WashingMachine,
  AlertTriangle,
  Pill,
  Recycle,
  Gamepad2,
  Compass,
  Info,
  Phone,
  MessageCircle,
  ExternalLink,
  MapPin,
  Clock,
  FileText,
  X,
  Check,
  CreditCard,
  Banknote,
  Send,
  Calendar,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useGuestSession } from "../hooks/useGuestSession";
import { sendChatMessage } from "../lib/guestApi";

const MemoryGame = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([
    { id: 1, emoji: "🍕", isFlipped: false, isMatched: false },
    { id: 2, emoji: "🍕", isFlipped: false, isMatched: false },
    { id: 3, emoji: "🍝", isFlipped: false, isMatched: false },
    { id: 4, emoji: "🍝", isFlipped: false, isMatched: false },
    { id: 5, emoji: "🍷", isFlipped: false, isMatched: false },
    { id: 6, emoji: "🍷", isFlipped: false, isMatched: false },
    { id: 7, emoji: "🏖️", isFlipped: false, isMatched: false },
    { id: 8, emoji: "🏖️", isFlipped: false, isMatched: false },
  ].sort(() => Math.random() - 0.5));

  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isMatched || cards[index].isFlipped) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = newFlippedCards;

      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);

        if (newCards.every(card => card.isMatched)) {
          setIsWon(true);
        }
      } else {
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(cards.map(card => ({ ...card, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto w-full">
      <div className="text-center mb-4 w-full">
        <p className="text-lg font-semibold">{t('services.memoryGame.moves', { count: moves })}</p>
        {isWon && (
          <div className="mt-4">
            <p className="text-xl font-bold text-green-600">{t('services.memoryGame.congratulations')}</p>
            <Button onClick={resetGame} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
              {t('services.memoryGame.playAgain')}
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4 w-full">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`
              aspect-square w-full rounded-lg flex items-center justify-center text-2xl font-bold
              transition-all duration-300 ease-in-out transform hover:scale-105
              ${card.isFlipped || card.isMatched
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
              }
            `}
            disabled={card.isMatched}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : "?"}
          </button>
        ))}
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, token, booking } = useGuestSession();
  const location = useLocation();
  const navigate = useNavigate();

  const [openWineModal, setOpenWineModal] = useState(false);
  const [openCleanModal, setOpenCleanModal] = useState(false);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const [openRentCarModal, setOpenRentCarModal] = useState(false);
  const [openExcursionsModal, setOpenExcursionsModal] = useState(false);
  const [openParkingModal, setOpenParkingModal] = useState(false);
  const [openBreakfastModal, setOpenBreakfastModal] = useState(false);
  const [openMassageModal, setOpenMassageModal] = useState(false);
  const [openRentBikeModal, setOpenRentBikeModal] = useState(false);
  const [openLaundryModal, setOpenLaundryModal] = useState(false);
  const [openEmergencyModal, setOpenEmergencyModal] = useState(false);
  const [openPharmacyModal, setOpenPharmacyModal] = useState(false);
  const [openRecycleModal, setOpenRecycleModal] = useState(false);
  const [openGameModal, setOpenGameModal] = useState(false);

  // Form states for logged users
  const [wineType, setWineType] = useState<'wine' | 'prosecco'>('prosecco');
  const [winePayment, setWinePayment] = useState<'cash' | 'transfer'>('cash');
  const [cleanDate, setCleanDate] = useState('');
  const [cleanPayment, setCleanPayment] = useState<'cash' | 'transfer'>('cash');
  const [coffeePods, setCoffeePods] = useState(0);
  const [croissants, setCroissants] = useState(0);
  const [breakfastOffer, setBreakfastOffer] = useState(false);
  const [breakfastPayment, setBreakfastPayment] = useState<'cash' | 'transfer'>('cash');
  const [bikeCount, setBikeCount] = useState(1);
  const [bikeDate, setBikeDate] = useState('');
  const [recycleBags, setRecycleBags] = useState(1);
  const [recycleTypes, setRecycleTypes] = useState<string[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Handle hash navigation to open specific service modals
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Small delay to ensure component is mounted
      setTimeout(() => {
        switch (hash) {
          case 'wine':
            setOpenWineModal(true);
            break;
          case 'clean':
            setOpenCleanModal(true);
            break;
          case 'breakfast':
            setOpenBreakfastModal(true);
            break;
          case 'bike':
            setOpenRentBikeModal(true);
            break;
          case 'recycle':
            setOpenRecycleModal(true);
            break;
        }
        // Clear the hash after opening modal
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [location.hash, navigate, location.pathname]);

  // Helper to get valid dates for cleaning (day after check-in to day before checkout)
  const getCleaningDateRange = () => {
    if (!booking?.checkIn || !booking?.checkOut) return { min: '', max: '' };
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const minDate = new Date(checkIn);
    minDate.setDate(minDate.getDate() + 1); // Day after check-in
    const maxDate = new Date(checkOut);
    maxDate.setDate(maxDate.getDate() - 1); // Day before checkout
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  // Helper to get valid dates for bike rental (from check-in day to checkout)
  const getBikeDateRange = () => {
    if (!booking?.checkIn || !booking?.checkOut) return { min: '', max: '' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    // Start from today or check-in, whichever is later
    const minDate = today > checkIn ? today : checkIn;
    return {
      min: minDate.toISOString().split('T')[0],
      max: checkOut.toISOString().split('T')[0]
    };
  };

  // Format date for display (locale-aware)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(i18n.language === 'it' ? 'it-IT' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Send message via chat
  const handleSendChatMessage = async (message: string, closeModal: () => void) => {
    if (!token) return;
    setSendingMessage(true);
    try {
      const result = await sendChatMessage(token, message);
      if (result.success) {
        setMessageSent(true);
        setTimeout(() => {
          setMessageSent(false);
          closeModal();
          // Reset form states
          setWineType('prosecco');
          setCleanDate('');
          setCleanPayment('cash');
          setCoffeePods(0);
          setCroissants(0);
          setBreakfastOffer(false);
          setBreakfastPayment('cash');
          setBikeCount(1);
          setBikeDate('');
          setRecycleBags(1);
          setRecycleTypes([]);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Calculate breakfast total
  const calculateBreakfastTotal = () => {
    if (breakfastOffer) return 7;
    return coffeePods + croissants;
  };

  const services = [
    { nameKey: "taxi", icon: Car, color: "amber", onClick: () => (window.location.href = "/taxi") },
    { nameKey: "wine", icon: Wine, color: "rose", onClick: () => setOpenWineModal(true) },
    { nameKey: "clean", icon: Sparkles, color: "cyan", onClick: () => setOpenCleanModal(true) },
    { nameKey: "shop", icon: ShoppingBag, color: "violet", onClick: () => window.open("https://store.nonnavittoriaapartments.it", "_blank") },
    { nameKey: "delivery", icon: UtensilsCrossed, color: "orange", onClick: () => setOpenDeliveryModal(true) },
    { nameKey: "rentCar", icon: Car, color: "slate", onClick: () => setOpenRentCarModal(true) },
    { nameKey: "excursions", icon: Sailboat, color: "sky", onClick: () => setOpenExcursionsModal(true) },
    { nameKey: "parking", icon: ParkingCircle, color: "blue", onClick: () => setOpenParkingModal(true) },
    { nameKey: "breakfast", icon: Croissant, color: "yellow", onClick: () => setOpenBreakfastModal(true) },
    { nameKey: "massage", icon: Heart, color: "pink", onClick: () => setOpenMassageModal(true) },
    { nameKey: "rentBike", icon: Bike, color: "emerald", onClick: () => setOpenRentBikeModal(true) },
    { nameKey: "laundry", icon: WashingMachine, color: "teal", onClick: () => setOpenLaundryModal(true) },
  ];

  const utilities = [
    { nameKey: "emergency", icon: AlertTriangle, color: "red", onClick: () => setOpenEmergencyModal(true) },
    { nameKey: "pharmacy", icon: Pill, color: "green", onClick: () => setOpenPharmacyModal(true) },
    { nameKey: "recycle", icon: Recycle, color: "lime", onClick: () => setOpenRecycleModal(true) },
    { nameKey: "game", icon: Gamepad2, color: "purple", onClick: () => setOpenGameModal(true) },
  ];

  const parkingStreets = [
    {
      name: "Corso Regina Margherita",
      address: "Corso Regina Margherita, 70042 Mola di Bari",
    },
    {
      name: "Via Enrico Toti",
      address: "Via Enrico Toti, 70042 Mola di Bari",
    },
    {
      name: "Via De Gasperi",
      address: "Via De Gasperi, 70042 Mola di Bari",
    },
    {
      name: "Via Gramsci",
      address: "Via Gramsci, 70042 Mola di Bari",
    },
  ];

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 pt-6 pb-8">
      <div className="px-5">
        {/* Services Section Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Compass className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('services.title')}</h2>
        </div>

        {/* Services Grid - Clean Outline Style with Color Accents */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            const colorClasses: Record<string, { border: string; bg: string; bgHover: string; icon: string; iconHover: string; text: string }> = {
              amber: { border: "border-amber-300 dark:border-amber-700", bg: "bg-amber-50 dark:bg-amber-900/20", bgHover: "group-hover:bg-amber-500 dark:group-hover:bg-amber-500", icon: "text-amber-500 dark:text-amber-400", iconHover: "group-hover:text-white", text: "text-amber-700 dark:text-amber-400" },
              rose: { border: "border-rose-300 dark:border-rose-700", bg: "bg-rose-50 dark:bg-rose-900/20", bgHover: "group-hover:bg-rose-500 dark:group-hover:bg-rose-500", icon: "text-rose-500 dark:text-rose-400", iconHover: "group-hover:text-white", text: "text-rose-700 dark:text-rose-400" },
              cyan: { border: "border-cyan-300 dark:border-cyan-700", bg: "bg-cyan-50 dark:bg-cyan-900/20", bgHover: "group-hover:bg-cyan-500 dark:group-hover:bg-cyan-500", icon: "text-cyan-500 dark:text-cyan-400", iconHover: "group-hover:text-white", text: "text-cyan-700 dark:text-cyan-400" },
              violet: { border: "border-violet-300 dark:border-violet-700", bg: "bg-violet-50 dark:bg-violet-900/20", bgHover: "group-hover:bg-violet-500 dark:group-hover:bg-violet-500", icon: "text-violet-500 dark:text-violet-400", iconHover: "group-hover:text-white", text: "text-violet-700 dark:text-violet-400" },
              orange: { border: "border-orange-300 dark:border-orange-700", bg: "bg-orange-50 dark:bg-orange-900/20", bgHover: "group-hover:bg-orange-500 dark:group-hover:bg-orange-500", icon: "text-orange-500 dark:text-orange-400", iconHover: "group-hover:text-white", text: "text-orange-700 dark:text-orange-400" },
              slate: { border: "border-slate-400 dark:border-slate-600", bg: "bg-slate-100 dark:bg-slate-800/50", bgHover: "group-hover:bg-slate-500 dark:group-hover:bg-slate-500", icon: "text-slate-500 dark:text-slate-400", iconHover: "group-hover:text-white", text: "text-slate-700 dark:text-slate-400" },
              sky: { border: "border-sky-300 dark:border-sky-700", bg: "bg-sky-50 dark:bg-sky-900/20", bgHover: "group-hover:bg-sky-500 dark:group-hover:bg-sky-500", icon: "text-sky-500 dark:text-sky-400", iconHover: "group-hover:text-white", text: "text-sky-700 dark:text-sky-400" },
              blue: { border: "border-blue-300 dark:border-blue-700", bg: "bg-blue-50 dark:bg-blue-900/20", bgHover: "group-hover:bg-blue-500 dark:group-hover:bg-blue-500", icon: "text-blue-500 dark:text-blue-400", iconHover: "group-hover:text-white", text: "text-blue-700 dark:text-blue-400" },
              yellow: { border: "border-yellow-400 dark:border-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", bgHover: "group-hover:bg-yellow-500 dark:group-hover:bg-yellow-500", icon: "text-yellow-500 dark:text-yellow-400", iconHover: "group-hover:text-white", text: "text-yellow-700 dark:text-yellow-400" },
              pink: { border: "border-pink-300 dark:border-pink-700", bg: "bg-pink-50 dark:bg-pink-900/20", bgHover: "group-hover:bg-pink-500 dark:group-hover:bg-pink-500", icon: "text-pink-500 dark:text-pink-400", iconHover: "group-hover:text-white", text: "text-pink-700 dark:text-pink-400" },
              emerald: { border: "border-emerald-300 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900/20", bgHover: "group-hover:bg-emerald-500 dark:group-hover:bg-emerald-500", icon: "text-emerald-500 dark:text-emerald-400", iconHover: "group-hover:text-white", text: "text-emerald-700 dark:text-emerald-400" },
              teal: { border: "border-teal-300 dark:border-teal-700", bg: "bg-teal-50 dark:bg-teal-900/20", bgHover: "group-hover:bg-teal-500 dark:group-hover:bg-teal-500", icon: "text-teal-500 dark:text-teal-400", iconHover: "group-hover:text-white", text: "text-teal-700 dark:text-teal-400" },
            };
            const colors = colorClasses[service.color] || colorClasses.blue;
            return (
              <button
                key={service.nameKey}
                onClick={service.onClick}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-800 border ${colors.border} transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.bgHover} border ${colors.border} flex items-center justify-center mb-2 transition-all duration-200`}>
                  <IconComponent className={`h-5 w-5 ${colors.icon} ${colors.iconHover} transition-colors duration-200`} strokeWidth={1.5} />
                </div>
                <span className={`text-[11px] font-medium ${colors.text} text-center leading-tight transition-colors duration-200`}>
                  {t(`services.names.${service.nameKey}`)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Utilities Section Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('services.usefulInfo')}</h2>
        </div>

        {/* Utilities Grid - Clean Outline Style with Color Accents */}
        <div className="grid grid-cols-4 gap-3">
          {utilities.map((utility) => {
            const IconComponent = utility.icon;
            const colorClasses: Record<string, { border: string; bg: string; bgHover: string; icon: string; iconHover: string; text: string }> = {
              red: { border: "border-red-300 dark:border-red-700", bg: "bg-red-50 dark:bg-red-900/20", bgHover: "group-hover:bg-red-500 dark:group-hover:bg-red-500", icon: "text-red-500 dark:text-red-400", iconHover: "group-hover:text-white", text: "text-red-700 dark:text-red-400" },
              green: { border: "border-green-300 dark:border-green-700", bg: "bg-green-50 dark:bg-green-900/20", bgHover: "group-hover:bg-green-500 dark:group-hover:bg-green-500", icon: "text-green-500 dark:text-green-400", iconHover: "group-hover:text-white", text: "text-green-700 dark:text-green-400" },
              lime: { border: "border-lime-400 dark:border-lime-600", bg: "bg-lime-50 dark:bg-lime-900/20", bgHover: "group-hover:bg-lime-500 dark:group-hover:bg-lime-500", icon: "text-lime-500 dark:text-lime-400", iconHover: "group-hover:text-white", text: "text-lime-700 dark:text-lime-400" },
              purple: { border: "border-purple-300 dark:border-purple-700", bg: "bg-purple-50 dark:bg-purple-900/20", bgHover: "group-hover:bg-purple-500 dark:group-hover:bg-purple-500", icon: "text-purple-500 dark:text-purple-400", iconHover: "group-hover:text-white", text: "text-purple-700 dark:text-purple-400" },
            };
            const colors = colorClasses[utility.color] || colorClasses.red;
            return (
              <button
                key={utility.nameKey}
                onClick={utility.onClick}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-800 border ${colors.border} transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.bgHover} border ${colors.border} flex items-center justify-center mb-2 transition-all duration-200`}>
                  <IconComponent className={`h-5 w-5 ${colors.icon} ${colors.iconHover} transition-colors duration-200`} strokeWidth={1.5} />
                </div>
                <span className={`text-[11px] font-medium ${colors.text} text-center leading-tight transition-colors duration-200`}>
                  {t(`services.names.${utility.nameKey}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Modal */}
      <Dialog open={openDeliveryModal} onOpenChange={setOpenDeliveryModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.delivery.title')}</DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('services.delivery.description')}
            </p>

            {/* Schedule */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{t('services.delivery.mondaySaturday')}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('services.delivery.mondaySaturdayHours')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{t('services.delivery.sunday')}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('services.delivery.sundayHours')}</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => window.open("https://www.pugliainbocca.it/wp-content/uploads/2023/03/pugliainbocca-menu-2023.pdf", "_blank")}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <FileText className="h-4 w-4" />
                {t('services.delivery.viewMenu')}
              </button>
              <button
                onClick={() => window.location.href = "tel:+390804741063"}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <Phone className="h-4 w-4" />
                {t('services.delivery.callNow')}
              </button>
            </div>

            {/* Discount Code */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 mb-4 text-center border border-orange-200 dark:border-orange-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('services.delivery.orderOnlineWith')}</p>
              <p className="font-bold text-orange-600 dark:text-orange-400 text-xl mb-1">NONNAVITTORIA</p>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">{t('services.delivery.getDiscount')}</p>
            </div>

            <button
              onClick={() => window.open("https://2ly.link/1yEMK", "_blank")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <ExternalLink className="h-4 w-4" />
              {t('services.delivery.downloadApp')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rent Car Modal */}
      <Dialog open={openRentCarModal} onOpenChange={setOpenRentCarModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-600 to-slate-800 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.rentCar.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {t('services.rentCar.description')}
            </p>
            <button
              onClick={() => window.location.href = "tel:+393493425023"}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <Phone className="h-4 w-4" />
              {t('services.rentCar.callNow')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wine Modal */}
      <Dialog open={openWineModal} onOpenChange={setOpenWineModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-red-500 to-rose-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Wine className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.wine.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('services.wine.requestSent')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('services.wine.wellGetBack')}</p>
              </div>
            ) : isLoggedIn ? (
              <>
                {/* Price Box */}
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 mb-4 text-center border border-rose-200 dark:border-rose-800">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('services.wine.servicePrice')}</p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">€15</p>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {t('services.wine.descriptionLogged')}
                </p>

                {/* Wine Type Selection */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.wine.selectBeverage')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWineType('wine')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        wineType === 'wine'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-rose-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">🍷</span>
                      <span className={`font-semibold ${wineType === 'wine' ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.wine.wineOption')}</span>
                    </button>
                    <button
                      onClick={() => setWineType('prosecco')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        wineType === 'prosecco'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-rose-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">🥂</span>
                      <span className={`font-semibold ${wineType === 'prosecco' ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.wine.proseccoOption')}</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.wine.paymentMethod')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWinePayment('cash')}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        winePayment === 'cash'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Banknote className={`h-5 w-5 ${winePayment === 'cash' ? 'text-rose-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${winePayment === 'cash' ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.wine.cash')}</span>
                    </button>
                    <button
                      onClick={() => setWinePayment('transfer')}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        winePayment === 'transfer'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 ${winePayment === 'transfer' ? 'text-rose-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${winePayment === 'transfer' ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.wine.transfer')}</span>
                    </button>
                  </div>
                </div>

                {/* Preview Message */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('services.wine.messagePreview')}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: `"${t('services.wine.messageLogged', { type: wineType === 'wine' ? t('services.wine.wineOption') : t('services.wine.proseccoOption'), apartment: booking?.apartmentName, payment: winePayment === 'cash' ? t('services.wine.cash') : t('services.wine.instantBankTransfer') })}"` }} />
                </div>

                <button
                  onClick={() => {
                    const message = `I would like to request a bottle of ${wineType === 'wine' ? 'Wine' : 'Prosecco'} for ${booking?.apartmentName}. Payment method: ${winePayment === 'cash' ? 'Cash' : 'Instant Bank Transfer'}.`;
                    handleSendChatMessage(message, () => setOpenWineModal(false));
                  }}
                  disabled={sendingMessage}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <span>{t('services.common.sending')}</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('services.wine.sendRequest')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {t('services.wine.descriptionNotLogged')}
                </p>
                <button
                  onClick={() => {
                    window.location.href = "https://wa.me/+393458381107";
                    setOpenWineModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('services.wine.contactWhatsApp')}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Clean Modal */}
      <Dialog open={openCleanModal} onOpenChange={setOpenCleanModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.clean.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 mb-4 text-center border border-cyan-200 dark:border-cyan-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('services.clean.servicePrice')}</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">€20</p>
            </div>

            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('services.clean.requestSent')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('services.clean.wellConfirm')}</p>
              </div>
            ) : isLoggedIn ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {t('services.clean.descriptionLogged')}
                </p>

                {/* Date Selection */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.clean.selectDate')}</label>
                  <div className="relative overflow-hidden date-input-container">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <input
                      type="date"
                      value={cleanDate}
                      onChange={(e) => setCleanDate(e.target.value)}
                      min={getCleaningDateRange().min}
                      max={getCleaningDateRange().max}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 box-border"
                    />
                  </div>
                  {cleanDate && (
                    <p className="text-sm text-cyan-600 dark:text-cyan-400">{formatDateDisplay(cleanDate)}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.clean.paymentMethod')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCleanPayment('cash')}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        cleanPayment === 'cash'
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Banknote className={`h-5 w-5 ${cleanPayment === 'cash' ? 'text-cyan-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${cleanPayment === 'cash' ? 'text-cyan-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.clean.cash')}</span>
                    </button>
                    <button
                      onClick={() => setCleanPayment('transfer')}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        cleanPayment === 'transfer'
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 ${cleanPayment === 'transfer' ? 'text-cyan-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${cleanPayment === 'transfer' ? 'text-cyan-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.clean.transfer')}</span>
                    </button>
                  </div>
                </div>

                {/* Preview Message */}
                {cleanDate && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('services.clean.messagePreview')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: `"${t('services.clean.messageLogged', { apartment: booking?.apartmentName, date: formatDateDisplay(cleanDate), payment: cleanPayment === 'cash' ? t('services.clean.cash') : t('services.clean.instantBankTransfer') })}"` }} />
                  </div>
                )}

                <button
                  onClick={() => {
                    const message = `I would like to request a cleaning service for ${booking?.apartmentName} on ${formatDateDisplay(cleanDate)}. Payment method: ${cleanPayment === 'cash' ? 'Cash' : 'Instant Bank Transfer'}.`;
                    handleSendChatMessage(message, () => setOpenCleanModal(false));
                  }}
                  disabled={sendingMessage || !cleanDate}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <span>{t('services.common.sending')}</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('services.clean.sendRequest')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {t('services.clean.descriptionNotLogged')}
                </p>
                <button
                  onClick={() => {
                    const message = encodeURIComponent("Hello, I would like to request a cleaning service for my apartment. Please let me know the available time slots.");
                    window.location.href = `https://wa.me/+393458381107?text=${message}`;
                    setOpenCleanModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('services.clean.requestWhatsApp')}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Excursions Modal */}
      <Dialog open={openExcursionsModal} onOpenChange={setOpenExcursionsModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-sky-500 to-blue-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Sailboat className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.excursions.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {t('services.excursions.description')}
            </p>
            <button
              onClick={() => window.open("https://www.getyourguide.com/monopoli-l98256/polignano-a-mare-tour-privato-in-barca-con-aperitivo-t787847", "_blank")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-700 hover:from-sky-600 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <Sailboat className="h-4 w-4" />
              {t('services.excursions.boatTours')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parking Modal */}
      <Dialog open={openParkingModal} onOpenChange={setOpenParkingModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <ParkingCircle className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.parking.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('services.parking.description')}
            </p>
            <div className="space-y-2">
              {parkingStreets.map((street) => (
                <button
                  key={street.name}
                  onClick={() => openInMaps(street.address)}
                  className="w-full flex items-center gap-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium text-sm">{street.name}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breakfast Modal */}
      <Dialog open={openBreakfastModal} onOpenChange={setOpenBreakfastModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-amber-500 to-yellow-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Croissant className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.breakfast.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('services.breakfast.orderSent')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('services.breakfast.wellPrepare')}</p>
              </div>
            ) : isLoggedIn ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4 text-sm">
                  {t('services.breakfast.descriptionLogged')}
                </p>

                {/* Special Offer */}
                <button
                  onClick={() => {
                    setBreakfastOffer(!breakfastOffer);
                    if (!breakfastOffer) {
                      setCoffeePods(5);
                      setCroissants(5);
                    }
                  }}
                  className={`w-full p-4 rounded-xl border-2 mb-4 transition-all ${
                    breakfastOffer
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className={`font-semibold ${breakfastOffer ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t('services.breakfast.specialOffer')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('services.breakfast.specialOfferDesc')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">€7</p>
                      <p className="text-xs text-gray-400 line-through">€10</p>
                    </div>
                  </div>
                </button>

                {!breakfastOffer && (
                  <>
                    {/* Coffee Pods */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">☕</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('services.breakfast.coffeePods')}</p>
                          <p className="text-xs text-gray-500">{t('services.breakfast.perPodPrice')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCoffeePods(Math.max(0, coffeePods - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Minus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">{coffeePods}</span>
                        <button
                          onClick={() => setCoffeePods(coffeePods + 1)}
                          className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center hover:bg-amber-600"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Croissants */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥐</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('services.breakfast.croissants')}</p>
                          <p className="text-xs text-gray-500">{t('services.breakfast.perCroissantPrice')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCroissants(Math.max(0, croissants - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Minus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">{croissants}</span>
                        <button
                          onClick={() => setCroissants(croissants + 1)}
                          className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center hover:bg-amber-600"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Total */}
                {(coffeePods > 0 || croissants > 0 || breakfastOffer) && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{t('services.breakfast.total')}</span>
                      <span className="text-xl font-bold text-amber-600">€{calculateBreakfastTotal()}</span>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {(coffeePods > 0 || croissants > 0 || breakfastOffer) && (
                  <div className="space-y-3 mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.breakfast.paymentMethod')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setBreakfastPayment('cash')}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                          breakfastPayment === 'cash'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Banknote className={`h-5 w-5 ${breakfastPayment === 'cash' ? 'text-amber-600' : 'text-gray-500'}`} />
                        <span className={`font-medium ${breakfastPayment === 'cash' ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.breakfast.cash')}</span>
                      </button>
                      <button
                        onClick={() => setBreakfastPayment('transfer')}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                          breakfastPayment === 'transfer'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <CreditCard className={`h-5 w-5 ${breakfastPayment === 'transfer' ? 'text-amber-600' : 'text-gray-500'}`} />
                        <span className={`font-medium ${breakfastPayment === 'transfer' ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('services.breakfast.transfer')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview & Send */}
                {(coffeePods > 0 || croissants > 0 || breakfastOffer) && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('services.breakfast.messagePreview')}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: `"${t('services.breakfast.messageLogged', {
                        apartment: booking?.apartmentName,
                        items: breakfastOffer
                          ? t('services.breakfast.specialOfferItems')
                          : t('services.breakfast.regularItems', {
                              pods: coffeePods,
                              podsPlural: coffeePods !== 1 ? 'e' : 'a',
                              croissants: croissants,
                              croissantsPlural: croissants !== 1 ? 'i' : 'o',
                              total: calculateBreakfastTotal()
                            }),
                        payment: breakfastPayment === 'cash' ? t('services.breakfast.cash') : t('services.clean.instantBankTransfer')
                      })}"` }} />
                    </div>

                    <button
                      onClick={() => {
                        const orderDetails = breakfastOffer
                          ? '5 coffee pods and 5 croissants (Special offer €7)'
                          : `${coffeePods} coffee pod${coffeePods !== 1 ? 's' : ''} and ${croissants} croissant${croissants !== 1 ? 's' : ''} (€${calculateBreakfastTotal()})`;
                        const message = `I would like to order breakfast for ${booking?.apartmentName}: ${orderDetails}. Payment method: ${breakfastPayment === 'cash' ? 'Cash' : 'Instant Bank Transfer'}.`;
                        handleSendChatMessage(message, () => setOpenBreakfastModal(false));
                      }}
                      disabled={sendingMessage}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                    >
                      {sendingMessage ? (
                        <span>{t('services.common.sending')}</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t('services.breakfast.sendOrder')}
                        </>
                      )}
                    </button>
                  </>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 text-center">{t('services.breakfast.preferOutside')}</p>
                  <button
                    onClick={() => {
                      const address = encodeURIComponent("Café L'Incontro, Piazza Risorgimento, 70042 Mola di Bari BA, Italia");
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Caffè l'Incontro
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {t('services.breakfast.descriptionNotLogged')}
                </p>

                <button
                  onClick={() => {
                    const message = encodeURIComponent("I would like to order coffee pods and croissants.");
                    window.location.href = `https://wa.me/393458381107?text=${message}`;
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg mb-4"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('services.breakfast.orderWhatsApp')}
                </button>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">If you prefer to have breakfast outside, we recommend:</p>
                  <button
                    onClick={() => {
                      const address = encodeURIComponent("Café L'Incontro, Piazza Risorgimento, 70042 Mola di Bari BA, Italia");
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all"
                  >
                    <MapPin className="h-4 w-4" />
                    Caffè l'Incontro
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Massage Modal */}
      <Dialog open={openMassageModal} onOpenChange={setOpenMassageModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-500 to-violet-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.massage.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {t('services.massage.description')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.open("https://nonnavittoriaapartments.it/massage.pdf", "_blank")}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <FileText className="h-4 w-4" />
                {t('services.massage.viewPriceList')}
              </button>
              <button
                onClick={() => window.location.href = "https://wa.me/491794265253"}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                {t('services.massage.contactWhatsApp')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rent a Bike Modal */}
      <Dialog open={openRentBikeModal} onOpenChange={setOpenRentBikeModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Bike className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.bike.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('services.bike.requestSent')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('services.bike.wellConfirmAvailability')}</p>
              </div>
            ) : isLoggedIn ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {t('services.bike.descriptionLogged')}
                </p>

                {/* Number of Bikes */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.bike.numberOfBicycles')}</label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setBikeCount(Math.max(1, bikeCount - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Minus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-3xl font-bold text-emerald-600 w-12 text-center">{bikeCount}</span>
                    <button
                      onClick={() => setBikeCount(Math.min(4, bikeCount + 1))}
                      className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center hover:bg-emerald-600"
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.bike.startingDate')}</label>
                  <div className="relative overflow-hidden date-input-container">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <input
                      type="date"
                      value={bikeDate}
                      onChange={(e) => setBikeDate(e.target.value)}
                      min={getBikeDateRange().min}
                      max={getBikeDateRange().max}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 box-border"
                    />
                  </div>
                  {bikeDate && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{formatDateDisplay(bikeDate)}</p>
                  )}
                </div>

                {/* Info Note */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                    {t('services.bike.availabilityWarning')}
                  </p>
                </div>

                {/* Preview Message */}
                {bikeDate && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('services.bike.messagePreview')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: `"${t('services.bike.messageLogged', { count: bikeCount, plural: bikeCount > 1 ? 'e' : 'a', apartment: booking?.apartmentName, date: formatDateDisplay(bikeDate) })}"` }} />
                  </div>
                )}

                <button
                  onClick={() => {
                    const message = `I would like to rent ${bikeCount} bicycle${bikeCount > 1 ? 's' : ''} for ${booking?.apartmentName} starting from ${formatDateDisplay(bikeDate)}. Please confirm availability.`;
                    handleSendChatMessage(message, () => setOpenRentBikeModal(false));
                  }}
                  disabled={sendingMessage || !bikeDate}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <span>{t('services.common.sending')}</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('services.bike.sendRequest')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {t('services.bike.descriptionNotLogged')}
                </p>
                <button
                  onClick={() => window.location.href = "https://wa.me/393458381107"}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('services.bike.checkAvailabilityWhatsApp')}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Laundry Modal */}
      <Dialog open={openLaundryModal} onOpenChange={setOpenLaundryModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <WashingMachine className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.laundry.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('services.laundry.description')}
            </p>
            <button
              onClick={() => openInMaps("Via G. Salvemini, 5/B, 70042 Mola di Bari")}
              className="w-full flex items-center gap-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-xl transition-colors text-left mb-3"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-gray-900 dark:text-white font-medium text-sm">Via G. Salvemini, 5/B, 70042 Mola di Bari</span>
            </button>
            <button
              onClick={() => window.location.href = "tel:+390804733856"}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-700 hover:from-teal-600 hover:to-cyan-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <Phone className="h-4 w-4" />
              {t('services.laundry.callNow')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Modal */}
      <Dialog open={openEmergencyModal} onOpenChange={setOpenEmergencyModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.emergency.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('services.emergency.description')}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = "tel:112"}
                className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 p-3 rounded-xl transition-colors border border-red-200 dark:border-red-800"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{t('services.emergency.police')}</p>
                  <p className="text-red-600 dark:text-red-400 font-bold">112</p>
                </div>
              </button>
              <button
                onClick={() => window.location.href = "tel:118"}
                className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 p-3 rounded-xl transition-colors border border-red-200 dark:border-red-800"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{t('services.emergency.ambulance')}</p>
                  <p className="text-red-600 dark:text-red-400 font-bold">118</p>
                </div>
              </button>
              <button
                onClick={() => window.location.href = "tel:115"}
                className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 p-3 rounded-xl transition-colors border border-red-200 dark:border-red-800"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{t('services.emergency.fireDepartment')}</p>
                  <p className="text-red-600 dark:text-red-400 font-bold">115</p>
                </div>
              </button>
              <button
                onClick={() => window.location.href = "tel:+393928431675"}
                className="w-full flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-3 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Nonna Vittoria Apartments</p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">+39 392 843 1675</p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pharmacy Modal */}
      <Dialog open={openPharmacyModal} onOpenChange={setOpenPharmacyModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-emerald-500 to-green-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Pill className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.pharmacy.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {t('services.pharmacy.description')}
            </p>
            <button
              onClick={() => window.open("https://www.farmaciediturno.org/comune.asp?cod=72028", "_blank")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-700 hover:from-emerald-600 hover:to-green-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <ExternalLink className="h-4 w-4" />
              {t('services.pharmacy.viewOnDuty')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recycle Modal */}
      <Dialog open={openRecycleModal} onOpenChange={setOpenRecycleModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-lime-500 to-green-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Recycle className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.recycle.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('services.recycle.requestSent')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('services.recycle.wellCollect')}</p>
              </div>
            ) : isLoggedIn ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4 text-sm">
                  {t('services.recycle.descriptionLogged')}
                </p>

                {/* Number of Bags */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.recycle.numberOfBags')}</label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setRecycleBags(Math.max(1, recycleBags - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Minus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-3xl font-bold text-lime-600 w-12 text-center">{recycleBags}</span>
                    <button
                      onClick={() => setRecycleBags(Math.min(10, recycleBags + 1))}
                      className="w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center hover:bg-lime-600"
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Waste Types */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.recycle.wasteTypes')}</label>
                  <div className="space-y-2">
                    {[
                      { id: 'organic', emoji: '🍌', labelKey: 'services.recycle.organic', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                      { id: 'plastic', emoji: '🥫', labelKey: 'services.recycle.plasticCans', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                      { id: 'paper', emoji: '🧻', labelKey: 'services.recycle.paper', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          if (recycleTypes.includes(type.id)) {
                            setRecycleTypes(recycleTypes.filter(t => t !== type.id));
                          } else {
                            setRecycleTypes([...recycleTypes, type.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          recycleTypes.includes(type.id)
                            ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-lime-300'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center text-lg`}>
                          {type.emoji}
                        </span>
                        <span className={`font-medium ${recycleTypes.includes(type.id) ? 'text-lime-600' : 'text-gray-700 dark:text-gray-300'}`}>
                          {t(type.labelKey)}
                        </span>
                        {recycleTypes.includes(type.id) && (
                          <Check className="h-5 w-5 text-lime-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Message */}
                {recycleTypes.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('services.recycle.messagePreview')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: `"${t('services.recycle.messageLogged', {
                      count: recycleBags,
                      plural: recycleBags > 1 ? 'i' : 'o',
                      types: recycleTypes.map(type =>
                        t(`services.recycle.${type === 'plastic' ? 'plasticCans' : type}`)
                      ).join(', '),
                      apartment: booking?.apartmentName
                    })}"` }} />
                  </div>
                )}

                <button
                  onClick={() => {
                    const wasteTypeNames = recycleTypes.map(t =>
                      t === 'organic' ? 'Organic' : t === 'plastic' ? 'Plastic & Cans' : 'Paper'
                    ).join(', ');
                    const message = `I would like to request a collection of ${recycleBags} bag${recycleBags > 1 ? 's' : ''} of ${wasteTypeNames} waste from ${booking?.apartmentName}.`;
                    handleSendChatMessage(message, () => setOpenRecycleModal(false));
                  }}
                  disabled={sendingMessage || recycleTypes.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <span>{t('services.common.sending')}</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('services.recycle.requestCollection')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {t('services.recycle.descriptionNotLogged')}
                </p>
                <div className="bg-lime-50 dark:bg-lime-900/20 rounded-xl p-4 mb-4 border border-lime-200 dark:border-lime-800">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">{t('services.recycle.separateAsFollows')}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg">🍌</span>
                      <span className="text-gray-700 dark:text-gray-300">{t('services.recycle.organic')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-lg">🥫</span>
                      <span className="text-gray-700 dark:text-gray-300">{t('services.recycle.plasticCans')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">🧻</span>
                      <span className="text-gray-700 dark:text-gray-300">{t('services.recycle.paper')}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = "https://wa.me/393458381107"}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('services.recycle.scheduleCollection')}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Modal */}
      <Dialog open={openGameModal} onOpenChange={setOpenGameModal}>
        <DialogContent className="p-0 max-h-[85vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-violet-500 to-purple-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Gamepad2 className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">{t('services.game.title')}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('services.game.description')}
            </p>
            <MemoryGame />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ServicesSection;
