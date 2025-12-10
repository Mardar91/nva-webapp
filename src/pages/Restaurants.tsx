import React from "react";
import VipTicketHero from "../components/VipTicketHero";
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Globe,
  MessageCircle,
  Facebook,
  Calendar,
  Tag,
} from "lucide-react";

interface Restaurant {
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  website?: string;
  whatsapp?: string;
  facebook?: string;
  book?: string;
  deliveryCode?: string;
}

const restaurants: Restaurant[] = [
  {
    name: "LA BARISIENNE",
    subtitle: "HAMBURGER & PIZZA",
    address: "Via Bruno Calvani 9, 70042 Mola di Bari",
    phone: "+39 080 4046085",
    website: "www.labarisienne.it",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "RUTHLESS",
    subtitle: "GRILL & BEER",
    address: "Via del Trabaccolo 14, 70042 Mola di Bari",
    phone: "+39 391 154 7728",
    whatsapp: "https://wa.me/393911547728",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "RISTORANTE VAN WESTERHOUT",
    subtitle: "FINE DINING",
    address: "Via Di Vagno 75, 70042 Mola di Bari",
    phone: "+39 366 409 6252",
    facebook: "https://www.facebook.com/ristorantevanwesterhout/",
    book: "https://www.quandoo.it/place/ristorante-van-westerhout-103289",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "PUGLIAINBOCCA",
    subtitle: "PIZZERIA & RESTAURANT",
    address: "Via Principe Amedeo 43, 70042 Mola di Bari",
    phone: "+39 080 474 1063",
    website: "www.pugliainbocca.it",
    deliveryCode: "NONNAVITTORIA",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "CAFFÈ ADRIATICO",
    subtitle: "BAR & ICE CREAM",
    address: "Via Pier Delfino Pesce 7, 70042 Mola di Bari",
    phone: "+39 080 474 1057",
    whatsapp: "https://wa.me/393475610553",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

const RestaurantScreen = () => {
  const openInMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

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
      <VipTicketHero />

      {/* Section Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Partner Restaurants</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Exclusive discounts for our guests</p>
          </div>
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="px-5 pb-6 space-y-4">
        {restaurants.map((restaurant, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 border-blue-200 dark:border-blue-800"
          >
            {/* Card Header with Gradient */}
            <div className={`bg-gradient-to-r ${restaurant.gradient} px-4 py-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">{restaurant.name}</h3>
                  <p className="text-white/80 text-sm">{restaurant.subtitle}</p>
                </div>
                <div className="relative bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full overflow-hidden">
                  <span className="relative z-10 text-white text-xs font-bold">10% OFF</span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              {/* Address */}
              <button
                onClick={() => openInMaps(restaurant.address)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg ${restaurant.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <MapPin className={`h-4.5 w-4.5 ${restaurant.iconColor}`} />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{restaurant.address}</span>
              </button>

              {/* Delivery Code Badge */}
              {restaurant.deliveryCode && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 mb-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery discount code:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{restaurant.deliveryCode}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* Phone - Always present */}
                <button
                  onClick={() => window.open(`tel:${restaurant.phone}`, '_self')}
                  className={`flex items-center justify-center gap-2 bg-gradient-to-r ${restaurant.gradient} text-white font-medium py-2.5 px-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]`}
                >
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Call</span>
                </button>

                {/* Secondary action based on available options */}
                {restaurant.website && (
                  <button
                    onClick={() => window.open(`https://${restaurant.website}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-3 rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Website</span>
                  </button>
                )}
                {restaurant.whatsapp && !restaurant.website && (
                  <button
                    onClick={() => window.open(restaurant.whatsapp, '_blank')}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">WhatsApp</span>
                  </button>
                )}
                {restaurant.book && !restaurant.website && !restaurant.whatsapp && (
                  <button
                    onClick={() => window.open(restaurant.book, '_blank')}
                    className="flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Book</span>
                  </button>
                )}
              </div>

              {/* Additional buttons row if multiple options */}
              {(restaurant.facebook || restaurant.book) && restaurant.website && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {restaurant.facebook && (
                    <button
                      onClick={() => window.open(restaurant.facebook, '_blank')}
                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm">Facebook</span>
                    </button>
                  )}
                  {restaurant.book && (
                    <button
                      onClick={() => window.open(restaurant.book, '_blank')}
                      className="flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Book Table</span>
                    </button>
                  )}
                </div>
              )}

              {/* WhatsApp if also has website */}
              {restaurant.whatsapp && restaurant.website && (
                <button
                  onClick={() => window.open(restaurant.whatsapp, '_blank')}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all mt-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Contact on WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantScreen;
