import React from "react";
import VipTicketHero from "../components/VipTicketHero";
import {
  ShoppingBag,
  Flower2,
  Gift,
  Heart,
  Dumbbell,
  Smile,
  Car,
  Waves,
  MapPin,
  Phone,
  Globe,
  MessageCircle,
  Sparkles,
} from "lucide-react";

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ElementType; gradient: string; iconBg: string; iconColor: string; border: string }> = {
  "Shopping & Souvenirs": {
    icon: ShoppingBag,
    gradient: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    border: "border-pink-300 dark:border-pink-700",
  },
  "Wellness & Fitness": {
    icon: Heart,
    gradient: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    border: "border-purple-300 dark:border-purple-700",
  },
  "Entertainment & Services": {
    icon: Sparkles,
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
  },
  "Beaches": {
    icon: Waves,
    gradient: "from-cyan-500 to-teal-600",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-300 dark:border-cyan-700",
  },
};

// Item-specific icons
const itemIcons: Record<string, React.ElementType> = {
  "FIORIROSA - FLOWERS & SOUVENIR": Flower2,
  "CORDERIA PALMI - APULIA SOUVENIRS": Gift,
  "SELF CARE - MASSAGE & BEAUTY": Heart,
  "ATHENA 2000 - GYM & FITNESS": Dumbbell,
  "GOMMOLAND - AMUSEMENT PARK": Smile,
  "CAR RENTAL WITH DELIVERY SERVICE": Car,
  "NIRVANA BEACH": Waves,
};

const attractions = [
  {
    category: "Shopping & Souvenirs",
    items: [
      {
        name: "FIORIROSA - FLOWERS & SOUVENIR",
        address: "Via Cesare Battisti 84, 70042 Mola di Bari",
        phone: "+39 340 307 5288",
      },
      {
        name: "CORDERIA PALMI - APULIA SOUVENIRS",
        address: "Via Veneto 30, 70042 Mola di Bari",
        phone: "+39 348 591 9451",
      },
    ],
  },
  {
    category: "Wellness & Fitness",
    items: [
      {
        name: "SELF CARE - MASSAGE & BEAUTY",
        address: "Via G. Salvemini, 17, 70042 Mola di Bari",
        phone: "+39 349 858 2919",
        website: "https://selfcare17.it",
      },
      {
        name: "ATHENA 2000 - GYM & FITNESS",
        address: "Via M. Colonna 97, 70042 Mola di Bari",
        phone: "+39 080 473 7070",
        website: "https://asdathena2000.it",
      },
    ],
  },
  {
    category: "Entertainment & Services",
    items: [
      {
        name: "GOMMOLAND - AMUSEMENT PARK",
        address: "Via Fiume angolo Via del Frascinaro 70042 Mola di Bari",
        phone: "+39 320 663 5921",
      },
      {
        name: "CAR RENTAL WITH DELIVERY SERVICE",
        address: "Via S. Giorgio, 9, 70019 Triggiano, BA",
        phone: "+39 349 342 5023",
        whatsapp: "https://wa.me/393493425023",
      },
    ],
  },
  {
    category: "Beaches",
    items: [
      {
        name: "NIRVANA BEACH",
        address: "Viale Pietro Delfino Pesce, 70042 Mola di Bari",
        phone: "+39 329 581 2127",
      },
    ],
  },
];

const openInMaps = (address: string) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(url, "_blank");
};

const PartnersScreen = () => {
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
            <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Our Partners</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Exclusive benefits for our guests</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 pb-6 space-y-6">
        {attractions.map((category, categoryIndex) => {
          const config = categoryConfig[category.category];
          const CategoryIcon = config?.icon || Sparkles;

          return (
            <div key={categoryIndex}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config?.gradient || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                  <CategoryIcon className="h-4 w-4 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{category.category}</h3>
              </div>

              {/* Category Items */}
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const ItemIcon = itemIcons[item.name] || Sparkles;
                  const itemConfig = config || categoryConfig["Entertainment & Services"];

                  return (
                    <div
                      key={itemIndex}
                      className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 ${itemConfig.border}`}
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${itemConfig.gradient} px-4 py-3`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                              <ItemIcon className="h-5 w-5 text-white" strokeWidth={1.5} />
                            </div>
                            <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">{item.name}</h4>
                          </div>
                          <div className="relative bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full overflow-hidden flex-shrink-0 ml-2">
                            <span className="relative z-10 text-white text-xs font-bold whitespace-nowrap">10% OFF</span>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        {/* Address */}
                        <button
                          onClick={() => openInMaps(item.address)}
                          className="w-full flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded-lg ${itemConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <MapPin className={`h-4 w-4 ${itemConfig.iconColor}`} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{item.address}</span>
                        </button>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => window.open(`tel:${item.phone}`, '_self')}
                            className={`flex items-center justify-center gap-2 bg-gradient-to-r ${itemConfig.gradient} text-white font-medium py-2.5 px-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]`}
                          >
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">Call</span>
                          </button>

                          {'website' in item && item.website && (
                            <button
                              onClick={() => window.open(item.website, '_blank')}
                              className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-3 rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <Globe className="h-4 w-4" />
                              <span className="text-sm">Website</span>
                            </button>
                          )}

                          {'whatsapp' in item && item.whatsapp && !('website' in item) && (
                            <button
                              onClick={() => window.open(item.whatsapp, '_blank')}
                              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-sm">WhatsApp</span>
                            </button>
                          )}
                        </div>

                        {/* WhatsApp if also has website */}
                        {'whatsapp' in item && item.whatsapp && 'website' in item && (
                          <button
                            onClick={() => window.open(item.whatsapp, '_blank')}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-3 rounded-xl transition-all mt-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">Contact on WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnersScreen;
