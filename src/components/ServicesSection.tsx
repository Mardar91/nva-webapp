import React, { useState } from "react";
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
} from "lucide-react";

const MemoryGame = () => {
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
        <p className="text-lg font-semibold">Moves: {moves}</p>
        {isWon && (
          <div className="mt-4">
            <p className="text-xl font-bold text-green-600">Congratulations! You won!</p>
            <Button onClick={resetGame} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
              Play Again
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

  const services = [
    { name: "Taxi", icon: Car, onClick: () => (window.location.href = "/taxi") },
    { name: "Wine", icon: Wine, onClick: () => setOpenWineModal(true) },
    { name: "Clean", icon: Sparkles, onClick: () => setOpenCleanModal(true) },
    { name: "Shop", icon: ShoppingBag, onClick: () => window.open("https://store.nonnavittoriaapartments.it", "_blank") },
    { name: "Delivery", icon: UtensilsCrossed, onClick: () => setOpenDeliveryModal(true) },
    { name: "Rent Car", icon: Car, onClick: () => setOpenRentCarModal(true) },
    { name: "Excursions", icon: Sailboat, onClick: () => setOpenExcursionsModal(true) },
    { name: "Parking", icon: ParkingCircle, onClick: () => setOpenParkingModal(true) },
    { name: "Breakfast", icon: Croissant, onClick: () => setOpenBreakfastModal(true) },
    { name: "Massage", icon: Heart, onClick: () => setOpenMassageModal(true) },
    { name: "Rent Bike", icon: Bike, onClick: () => setOpenRentBikeModal(true) },
    { name: "Laundry", icon: WashingMachine, onClick: () => setOpenLaundryModal(true) },
  ];

  const utilities = [
    { name: "Emergency", icon: AlertTriangle, accent: "text-red-500", onClick: () => setOpenEmergencyModal(true) },
    { name: "Pharmacy", icon: Pill, onClick: () => setOpenPharmacyModal(true) },
    { name: "Recycle", icon: Recycle, onClick: () => setOpenRecycleModal(true) },
    { name: "Game", icon: Gamepad2, onClick: () => setOpenGameModal(true) },
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Our Services</h2>
        </div>

        {/* Services Grid - Clean Outline Style */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.name}
                onClick={service.onClick}
                className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 active:scale-95"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 flex items-center justify-center mb-2 transition-all duration-200">
                  <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white text-center leading-tight transition-colors duration-200">
                  {service.name}
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Useful Information</h2>
        </div>

        {/* Utilities Grid - Clean Outline Style */}
        <div className="grid grid-cols-4 gap-3">
          {utilities.map((utility) => {
            const IconComponent = utility.icon;
            const hasAccent = utility.accent;
            return (
              <button
                key={utility.name}
                onClick={utility.onClick}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-800 border transition-all duration-200 active:scale-95 ${
                  hasAccent
                    ? 'border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-2 transition-all duration-200 ${
                  hasAccent
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 group-hover:border-red-400 dark:group-hover:border-red-600'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
                }`}>
                  <IconComponent className={`h-5 w-5 transition-colors duration-200 ${
                    hasAccent
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`} strokeWidth={1.5} />
                </div>
                <span className={`text-[11px] font-medium text-center leading-tight transition-colors duration-200 ${
                  hasAccent
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}>
                  {utility.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Modal */}
      <Dialog open={openDeliveryModal} onOpenChange={setOpenDeliveryModal}>
        <DialogContent className="p-0 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Delivery Service</DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Order your food online and have it delivered directly to your apartment every day except Wednesday.
            </p>

            {/* Schedule */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Monday - Saturday</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">10:00 AM - 2:30 PM & 6:30 PM - 12:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Sunday</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">9:00 AM - 3:00 PM & 7:00 PM - 12:00 AM</p>
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
                View Menu
              </button>
              <button
                onClick={() => window.location.href = "tel:+390804741063"}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </button>
            </div>

            {/* Discount Code */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 mb-4 text-center border border-orange-200 dark:border-orange-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Order online with the code:</p>
              <p className="font-bold text-orange-600 dark:text-orange-400 text-xl mb-1">NONNAVITTORIA</p>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">and get 5% OFF</p>
            </div>

            <button
              onClick={() => window.open("https://2ly.link/1yEMK", "_blank")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <ExternalLink className="h-4 w-4" />
              Download the App
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rent Car Modal */}
      <Dialog open={openRentCarModal} onOpenChange={setOpenRentCarModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-600 to-slate-800 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Rent a Car</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Rent a car at exclusive rates through our trusted partner. Enjoy the convenience of having the vehicle delivered directly to your location.
            </p>
            <button
              onClick={() => window.location.href = "tel:+393493425023"}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wine Modal */}
      <Dialog open={openWineModal} onOpenChange={setOpenWineModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-red-500 to-rose-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Wine className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Room Service</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Request a bottle of wine or prosecco to be available upon arrival at a special price (subject to availability). To place an order, contact us on WhatsApp.
            </p>
            <button
              onClick={() => {
                window.location.href = "https://wa.me/+393458381107";
                setOpenWineModal(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <MessageCircle className="h-4 w-4" />
              Contact us on WhatsApp
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clean Modal */}
      <Dialog open={openCleanModal} onOpenChange={setOpenCleanModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Cleaning Service</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 mb-6 text-center border border-cyan-200 dark:border-cyan-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Service price</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">€20</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Request a cleaning service during your stay.
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
              Request on WhatsApp
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Excursions Modal */}
      <Dialog open={openExcursionsModal} onOpenChange={setOpenExcursionsModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-sky-500 to-blue-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Sailboat className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Discover Amazing Excursions</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Experience incredible adventures and unforgettable moments in our beautiful region.
            </p>
            <button
              onClick={() => window.open("https://www.getyourguide.com/monopoli-l98256/polignano-a-mare-tour-privato-in-barca-con-aperitivo-t787847", "_blank")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-700 hover:from-sky-600 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <Sailboat className="h-4 w-4" />
              Boat Tours
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parking Modal */}
      <Dialog open={openParkingModal} onOpenChange={setOpenParkingModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <ParkingCircle className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Parking Information</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Nonna Vittoria Apartments does not currently provide private parking. However, there are several secure, free parking options on the surrounding streets:
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
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500 to-yellow-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Croissant className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Breakfast Service</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              In our apartments, we offer complimentary coffee pods and croissants upon arrival. If you would like to order more, use the button below to place an order, price varies based on quantity (subject to availability).
            </p>

            <button
              onClick={() => {
                const message = encodeURIComponent("I would like to order coffee pods and croissants.");
                window.location.href = `https://wa.me/393458381107?text=${message}`;
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg mb-4"
            >
              <MessageCircle className="h-4 w-4" />
              Order on WhatsApp
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Massage Modal */}
      <Dialog open={openMassageModal} onOpenChange={setOpenMassageModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-500 to-violet-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Massage Service</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Enjoy the convenience of booking a massage directly in your apartment, subject to availability.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.open("https://nonnavittoriaapartments.it/massage.pdf", "_blank")}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <FileText className="h-4 w-4" />
                View Price List
              </button>
              <button
                onClick={() => window.location.href = "https://wa.me/491794265253"}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                Contact on WhatsApp
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rent a Bike Modal */}
      <Dialog open={openRentBikeModal} onOpenChange={setOpenRentBikeModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Bike className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Rent a Bike</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Rent a bicycle for convenient and efficient transportation. Availability upon request.
            </p>
            <button
              onClick={() => window.location.href = "https://wa.me/393458381107"}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <MessageCircle className="h-4 w-4" />
              Check Availability on WhatsApp
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Laundry Modal */}
      <Dialog open={openLaundryModal} onOpenChange={setOpenLaundryModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <WashingMachine className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Laundry Services</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              For professional laundry services, visit:
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
              Call Now
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Modal */}
      <Dialog open={openEmergencyModal} onOpenChange={setOpenEmergencyModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Emergency Numbers</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              If you need help, here are all the useful numbers:
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
                  <p className="font-semibold text-gray-900 dark:text-white">Police</p>
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
                  <p className="font-semibold text-gray-900 dark:text-white">Ambulance</p>
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
                  <p className="font-semibold text-gray-900 dark:text-white">Fire Department</p>
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
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-green-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Pill className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Pharmacy Information</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Here you can view the pharmacies on duty:
            </p>
            <button
              onClick={() => window.open("https://www.farmaciediturno.org/comune.asp?cod=72028", "_blank")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-700 hover:from-emerald-600 hover:to-green-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <ExternalLink className="h-4 w-4" />
              View On-Duty Pharmacies
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recycle Modal */}
      <Dialog open={openRecycleModal} onOpenChange={setOpenRecycleModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-lime-500 to-green-600 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Recycle className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Recycling Information</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Here you can find all the information about waste collection. Please separate your waste and put it in bags. We will take care of collecting them.
            </p>
            <div className="bg-lime-50 dark:bg-lime-900/20 rounded-xl p-4 mb-4 border border-lime-200 dark:border-lime-800">
              <p className="font-semibold text-gray-900 dark:text-white mb-3">Separate the waste as follows:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg">🍌</span>
                  <span className="text-gray-700 dark:text-gray-300">Organic waste</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-lg">🥫</span>
                  <span className="text-gray-700 dark:text-gray-300">Plastic and cans</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">🧻</span>
                  <span className="text-gray-700 dark:text-gray-300">Paper</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "https://wa.me/393458381107"}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
            >
              <MessageCircle className="h-4 w-4" />
              Schedule a Collection
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Modal */}
      <Dialog open={openGameModal} onOpenChange={setOpenGameModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-violet-500 to-purple-700 px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Gamepad2 className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Memory Game</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Find all the matching pairs! Click on the cards to flip them and try to match them with as few moves as possible.
            </p>
            <MemoryGame />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ServicesSection;
