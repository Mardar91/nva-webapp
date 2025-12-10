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
    {
      name: "Taxi",
      icon: Car,
      gradient: "from-yellow-400 to-amber-500",
      bgLight: "bg-amber-50",
      onClick: () => (window.location.href = "/taxi"),
    },
    {
      name: "Wine",
      icon: Wine,
      gradient: "from-red-400 to-rose-600",
      bgLight: "bg-rose-50",
      onClick: () => setOpenWineModal(true),
    },
    {
      name: "Clean",
      icon: Sparkles,
      gradient: "from-cyan-400 to-blue-500",
      bgLight: "bg-cyan-50",
      onClick: () => setOpenCleanModal(true),
    },
    {
      name: "Shop",
      icon: ShoppingBag,
      gradient: "from-pink-400 to-fuchsia-500",
      bgLight: "bg-pink-50",
      onClick: () => window.open("https://store.nonnavittoriaapartments.it", "_blank"),
    },
    {
      name: "Delivery",
      icon: UtensilsCrossed,
      gradient: "from-orange-400 to-red-500",
      bgLight: "bg-orange-50",
      onClick: () => setOpenDeliveryModal(true),
    },
    {
      name: "Rent Car",
      icon: Car,
      gradient: "from-slate-500 to-slate-700",
      bgLight: "bg-slate-50",
      onClick: () => setOpenRentCarModal(true),
    },
    {
      name: "Excursions",
      icon: Sailboat,
      gradient: "from-sky-400 to-blue-600",
      bgLight: "bg-sky-50",
      onClick: () => setOpenExcursionsModal(true),
    },
    {
      name: "Parking",
      icon: ParkingCircle,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      onClick: () => setOpenParkingModal(true),
    },
    {
      name: "Breakfast",
      icon: Croissant,
      gradient: "from-amber-400 to-yellow-500",
      bgLight: "bg-amber-50",
      onClick: () => setOpenBreakfastModal(true),
    },
    {
      name: "Massage",
      icon: Heart,
      gradient: "from-purple-400 to-violet-600",
      bgLight: "bg-purple-50",
      onClick: () => setOpenMassageModal(true),
    },
    {
      name: "Rent Bike",
      icon: Bike,
      gradient: "from-green-400 to-emerald-600",
      bgLight: "bg-green-50",
      onClick: () => setOpenRentBikeModal(true),
    },
    {
      name: "Laundry",
      icon: WashingMachine,
      gradient: "from-teal-400 to-cyan-600",
      bgLight: "bg-teal-50",
      onClick: () => setOpenLaundryModal(true),
    },
  ];

  const utilities = [
    {
      name: "Emergency",
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-700",
      bgLight: "bg-red-50",
      onClick: () => setOpenEmergencyModal(true),
    },
    {
      name: "Pharmacy",
      icon: Pill,
      gradient: "from-emerald-400 to-green-600",
      bgLight: "bg-emerald-50",
      onClick: () => setOpenPharmacyModal(true),
    },
    {
      name: "Recycle",
      icon: Recycle,
      gradient: "from-lime-400 to-green-500",
      bgLight: "bg-lime-50",
      onClick: () => setOpenRecycleModal(true),
    },
    {
      name: "Game",
      icon: Gamepad2,
      gradient: "from-violet-400 to-purple-600",
      bgLight: "bg-violet-50",
      onClick: () => setOpenGameModal(true),
    },
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
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Our Services</h2>
        </div>

        {/* Services Grid - Modern Cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.name}
                onClick={service.onClick}
                className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                  {service.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Utilities Section Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
            <Info className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Useful Information</h2>
        </div>

        {/* Utilities Grid */}
        <div className="grid grid-cols-4 gap-3">
          {utilities.map((utility) => {
            const IconComponent = utility.icon;
            return (
              <button
                key={utility.name}
                onClick={utility.onClick}
                className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${utility.gradient} flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                  {utility.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Modal */}
<Dialog open={openDeliveryModal} onOpenChange={setOpenDeliveryModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delivery Service</DialogTitle>
      <DialogDescription className="text-center">
        Order your food online and have it delivered directly to your apartment every day except Wednesday.
        <div className="mt-4 mb-4">
          <div className="font-semibold">MONDAY - SATURDAY:</div>
          <div>10:00 AM - 2:30 PM & 6:30 PM - 12:00 AM</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold">SUNDAY:</div>
          <div>9:00 AM - 3:00 PM & 7:00 PM - 12:00 AM</div>
        </div>
      </DialogDescription>
    </DialogHeader>
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="grid grid-cols-2 gap-2 w-full mb-4">
        <button
          onClick={() => {
            window.open("https://www.pugliainbocca.it/wp-content/uploads/2023/03/pugliainbocca-menu-2023.pdf", "_blank");
          }}
          className="delivery-button"
        >
          View Menu
        </button>
        <button
          onClick={() => {
            window.location.href = "tel:+390804741063";
          }}
          className="delivery-button"
        >
          Call Now
        </button>
      </div>
      
      <div className="text-center w-full mb-4">
        <p className="text-gray-600 mb-2">or order online with the code:</p>
        <p className="font-bold text-gray-800 text-lg mb-2">NONNAVITTORIA</p>
        <p className="text-gray-600 mb-4">and get 5% OFF</p>
      </div>
      
      <button
        onClick={() => {
          window.open("https://2ly.link/1yEMK", "_blank");
        }}
        className="delivery-button w-full"
      >
        Download the App
      </button>
    </div>
  </DialogContent>
</Dialog>

      {/* Altri Modal con la stessa struttura */}
      <Dialog open={openRentCarModal} onOpenChange={setOpenRentCarModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Rent a Car</DialogTitle>
            <DialogDescription>
              Rent a car at exclusive rates through our trusted partner. Enjoy the convenience of having the vehicle delivered directly to your location..
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="DialogFooter">
            <Button
              onClick={() => {
                window.location.href = "tel:+393493425023";
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wine Modal */}
      <Dialog open={openWineModal} onOpenChange={setOpenWineModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Room Service</DialogTitle>
            <DialogDescription>
              Request a bottle of wine or prosecco to be available upon arrival at a special price (subject to availability). To place an order, contact us on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="DialogFooter">
            <Button
              onClick={() => {
                const phoneNumber = "+393458381107";
                window.location.href = `https://wa.me/${phoneNumber}`;
                setOpenWineModal(false);
              }}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full"
            >
              Contact us on WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clean Modal */}
      <Dialog open={openCleanModal} onOpenChange={setOpenCleanModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Cleaning Service</DialogTitle>
            <DialogDescription>Request a cleaning service during your stay for €20.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="DialogFooter">
            <Button
              onClick={() => {
                const message = encodeURIComponent(
                  "Hello, I would like to request a cleaning service for my apartment. Please let me know the available time slots."
                );
                const phoneNumber = "+393458381107";
                window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
                setOpenCleanModal(false);
              }}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full"
            >
              Request on WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excursions Modal */}
      <Dialog open={openExcursionsModal} onOpenChange={setOpenExcursionsModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Discover Amazing Excursions</DialogTitle>
            <DialogDescription>
              Experience incredible adventures and unforgettable moments in our beautiful region.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="DialogFooter">
            <Button
              onClick={() => {
                window.open("https://www.getyourguide.com/monopoli-l98256/polignano-a-mare-tour-privato-in-barca-con-aperitivo-t787847", "_blank");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              🚤 Boat Tours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parking Modal */}
      <Dialog open={openParkingModal} onOpenChange={setOpenParkingModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Parking Information</DialogTitle>
            <DialogDescription>
              Nonna Vittoria Apartments does not currently provide private parking. However, there are several secure, free parking options on the surrounding streets:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            {parkingStreets.map((street) => (
              <Button
                key={street.name}
                variant="outline"
                onClick={() => openInMaps(street.address)}
                className="w-full text-left justify-start"
              >
                {street.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Breakfast Modal */}
<Dialog open={openBreakfastModal} onOpenChange={setOpenBreakfastModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Breakfast Service</DialogTitle>
      <DialogDescription className="text-center">
        In our apartments, we offer complimentary coffee pods and croissants upon arrival. If you would like to order more, use the button below to place an order, price varies based on quantity (subject to availability).
        
        <div className="mt-6 flex flex-col gap-4">
          <Button
            onClick={() => {
              const message = encodeURIComponent("I would like to order coffee pods and croissants.");
              window.location.href = `https://wa.me/393458381107?text=${message}`;
            }}
            className="delivery-button bg-[#25D366] hover:bg-[#128C7E]"
          >
            Order on WhatsApp
          </Button>

          <div className="mt-4 text-left">
            <p className="mb-4">If you prefer to have breakfast outside, we recommend the following place:</p>
            
            <Button
              onClick={() => {
                const address = encodeURIComponent("Café L'Incontro, Piazza Risorgimento, 70042 Mola di Bari BA, Italia");
                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
              }}
              className="delivery-button bg-blue-600 hover:bg-blue-700"
            >
              Caffè l'Incontro
            </Button>
          </div>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

      {/* Massage Modal */}
      <Dialog open={openMassageModal} onOpenChange={setOpenMassageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Massage Service</DialogTitle>
            <DialogDescription>
              Enjoy the convenience of booking a massage directly in your apartment, subject to availability.
              <div className="mt-4 flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    window.open("https://nonnavittoriaapartments.it/massage.pdf", "_blank");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Price List
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "https://wa.me/491794265253";
                  }}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  Contact on WhatsApp
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Rent a Bike Modal */}
      <Dialog open={openRentBikeModal} onOpenChange={setOpenRentBikeModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Rent a Bike</DialogTitle>
            <DialogDescription>
              Rent a bicycle for convenient and efficient transportation. Availability upon request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="DialogFooter">
            <Button
              onClick={() => {
                window.location.href = "https://wa.me/393458381107";
              }}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full"
            >
              Check Availability on WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Laundry Modal */}
      <Dialog open={openLaundryModal} onOpenChange={setOpenLaundryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Laundry Services</DialogTitle>
            <DialogDescription>
              For professional laundry services, visit:
              <div className="mt-4 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => openInMaps("Via G. Salvemini, 5/B, 70042 Mola di Bari")}
                  className="justify-start text-left"
                >
                  Via G. Salvemini, 5/B, 70042 Mola di Bari
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "tel:+390804733856";
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Call Now
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Emergency Modal */}
      <Dialog open={openEmergencyModal} onOpenChange={setOpenEmergencyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emergency Numbers</DialogTitle>
            <DialogDescription>
              If you need help, here are all the useful numbers:
              <div className="mt-4 flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    window.location.href = "tel:112";
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  🚔 Police - 112
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "tel:118";
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  🚑 Ambulance - 118
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "tel:115";
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  🚒 Fire Department - 115
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "tel:+393928431675";
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🏠 Nonna Vittoria Apartments - +39 392 843 1675
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Pharmacy Modal */}
      <Dialog open={openPharmacyModal} onOpenChange={setOpenPharmacyModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Pharmacy Information</DialogTitle>
            <DialogDescription>
              Here you can view the pharmacies on duty:
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="DialogFooter">
            <Button
              onClick={() => {
                window.open("https://www.farmaciediturno.org/comune.asp?cod=72028", "_blank");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              View On-Duty Pharmacies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recycle Modal */}
<Dialog open={openRecycleModal} onOpenChange={setOpenRecycleModal}>
  <DialogContent className="DialogContent">
    <DialogHeader>
      <DialogTitle>Recycling Information</DialogTitle>
      <DialogDescription>
        Here you can find all the information about waste collection. Please separate your waste and put it in bags. We will take care of collecting them.
        
        <div className="mt-4 mb-4 text-left">
          <p className="font-semibold mb-2">Separate the waste as follows:</p>
          <p className="mb-2">🍌 Organic waste</p>
          <p className="mb-2">🥫 Plastic and cans</p>
          <p className="mb-2">🧻 Paper</p>
        </div>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="DialogFooter">
      <Button
        onClick={() => {
          window.location.href = "https://wa.me/393458381107";
        }}
        className="delivery-button bg-[#25D366] hover:bg-[#128C7E]"
      >
        Schedule a Collection
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Game Modal */}
      <Dialog open={openGameModal} onOpenChange={setOpenGameModal}>
        <DialogContent className="DialogContent">
          <DialogHeader>
            <DialogTitle>Memory Game</DialogTitle>
            <DialogDescription>
              Find all the matching pairs! Click on the cards to flip them and try to match them with as few moves as possible.
            </DialogDescription>
          </DialogHeader>
          <MemoryGame />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ServicesSection;
