import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Landmark
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import * as cheerio from 'cheerio';

// Tutorial component for swipe gestures
const SwipeTutorial: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center"
      style={{ margin: '-24px' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-center px-4"
      >
        <motion.div
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ 
            duration: 2,
            times: [0, 0.2, 0.8, 1],
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <ChevronLeft size={24} />
            <span className="text-lg font-medium">Swipe to navigate</span>
            <ChevronRight size={24} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Next City Components
interface NextCityToastProps {
  show: boolean;
}

const NextCityToast: React.FC<NextCityToastProps> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 right-16 z-50 bg-rose-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
      >
        <span className="text-sm font-medium whitespace-nowrap">Go to the next city</span>
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="ml-2"
        >
          →
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface NextCityButtonProps {
  nextCityPath: string;
}

const NextCityButton: React.FC<NextCityButtonProps> = ({ nextCityPath }) => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <NextCityToast show={showToast} />
      <button
        onClick={() => navigate(nextCityPath)}
        onMouseEnter={() => setShowToast(true)}
        onMouseLeave={() => setShowToast(false)}
        className="fixed top-4 right-4 z-50 bg-rose-800 text-white p-3 rounded-full shadow-lg hover:bg-rose-700 transition-all group"
      >
        <div className="relative flex items-center justify-center">
          <ArrowRight className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </button>
    </>
  );
};
interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  city: string;
  description?: string;
  link?: string;
}

interface Attraction {
  name: string;
  icon: string;
  description?: string;
  imageUrl?: string;
  mapUrl?: string;
  bookingNumber?: string;
  eventsUrl?: string;
}

const CurrentEventBadge: React.FC<{ type: 'today' | 'tomorrow' }> = ({ type }) => {
    let color = "bg-green-500";
    let text = "Today";

    if (type === 'tomorrow') {
        color = "bg-orange-500";
        text = "Tomorrow";
    }

    return (
        <div className="flex items-center gap-1.5 mt-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`}></span>
            </span>
            <span className="text-xs font-medium" style={{ color: type === 'today' ? '#22c55e' : '#f97316' }}>{text}</span>
        </div>
    );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = event.startDate ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate) : 'Data non disponibile';

  const isCurrentEvent = () => {
    if (!event.startDate) return null;

    const now = new Date();
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const end = event.endDate ? new Date(event.endDate) : new Date(start);
    end.setHours(23, 59, 59, 999);

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const isToday = now >= start && now <= end;
    const isTomorrow =
      start.getDate() === tomorrow.getDate() &&
      start.getMonth() === tomorrow.getMonth() &&
      start.getFullYear() === tomorrow.getFullYear();

    if (isToday) return 'today';
    if (isTomorrow) return 'tomorrow';
    return null;
  };

  const currentEventType = isCurrentEvent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 border-rose-200 dark:border-rose-800 hover:shadow-lg transition-all duration-200">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold">{formattedDate}</span>
            </div>
            {currentEventType && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentEventType === 'today' ? 'bg-green-500' : 'bg-orange-500'}`}>
                {/* Live ping effect */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-white text-xs font-bold">
                  {currentEventType === 'today' ? 'Today' : 'Tomorrow'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            </div>
            <span className="text-sm">{event.city}</span>
          </div>
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              More info
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AttractionButton: React.FC<{
  attraction: Attraction;
  attractions: Attraction[];
  onOpen: (index: number) => void;
  index: number;
}> = ({ attraction, attractions, onOpen, index }) => (
  <Dialog>
    <DialogTrigger asChild>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="w-full"
      >
        <button
          onClick={() => onOpen(index)}
          className="group w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-rose-200 dark:border-rose-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-rose-600 to-rose-800 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">{attraction.icon}</span>
              </div>
              <span className="text-white font-semibold text-sm truncate">{attraction.name}</span>
            </div>
          </div>
          {/* Card Body */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-xs">Tap to explore</span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </div>
        </button>
      </motion.div>
    </DialogTrigger>
  </Dialog>
);

const AttractionModal: React.FC<{
  attraction: Attraction;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ attraction, isOpen, onClose, onPrevious, onNext }) => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [dragStart, setDragStart] = useState<number>(0);
  const dragThreshold = 50;

  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if ('touches' in event) {
      setDragStart(event.touches[0].clientX);
    } else {
      setDragStart(event.clientX);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.x;
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        onPrevious();
      } else {
        onNext();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <div className="relative">
          {showTutorial && <SwipeTutorial />}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <DialogHeader>
              <DialogTitle>{attraction.name}</DialogTitle>
              {attraction.imageUrl && (
                <img
                  src={attraction.imageUrl}
                  alt={attraction.name}
                  className="w-full h-auto rounded-md mb-4"
                />
              )}
              <DialogDescription>
                {attraction.description || "Coming soon..."}
              </DialogDescription>
              {attraction.mapUrl && (
                <div className="mt-4">
                  <Button 
                    asChild
                    className="bg-[#9f1239] hover:bg-[#9f1239]/90 text-white"
                  >
                    <a href={attraction.mapUrl} target="_blank" rel="noopener noreferrer">
                      View on Map
                    </a>
                  </Button>
                </div>
              )}
              {attraction.bookingNumber && (
                <div className="mt-2">
                  <Button asChild variant="outline">
                    <a href={`tel:${attraction.bookingNumber}`}>
                      Call to Book: {attraction.bookingNumber}
                    </a>
                  </Button>
                </div>
              )}
              {attraction.eventsUrl && (
                <div className="mt-2">
                  <Button asChild variant="secondary">
                    <a href={attraction.eventsUrl} target="_blank" rel="noopener noreferrer">
                      View Events
                    </a>
                  </Button>
                </div>
              )}
            </DialogHeader>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Bari: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttractionIndex, setSelectedAttractionIndex] = useState<number | null>(null);
  const scrollToRef = useRef<HTMLDivElement>(null);

  const attractions: Attraction[] = [
    { 
      name: 'Basilica San Nicola', 
      icon: '⛪', 
      description: "The Basilica of Saint Nicholas, located in Bari's historic center, is a prime example of Apulian Romanesque architecture. Built between 1087 and 1197 to house the relics of Saint Nicholas, brought from Myra (now in Turkey) by 62 sailors in 1087, the basilica features a simple yet majestic façade with three portals and two distinct bell towers. Inside, it follows a Latin cross plan with three naves separated by twelve columns. The crypt, supported by 26 columns, contains the saint's tomb, making the basilica a significant pilgrimage site for both Roman Catholic and Eastern Orthodox Christians.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Bari_BW_2016-10-19_13-35-11_stitch.jpg/520px-Bari_BW_2016-10-19_13-35-11_stitch.jpg",
      mapUrl: "https://maps.app.goo.gl/3vvpTTKecMrBzjieA"
    },
    { 
      name: 'Città Vecchia', 
      icon: '🏛️',
      description: "Bari Vecchia, or Old Bari, is the historic heart of Bari, Italy, situated on a peninsula between the city's two harbors. This medieval quarter is a maze of narrow, winding streets reminiscent of an Arab kasbah, reflecting its ancient urban layout. Key landmarks include the Basilica of San Nicola, built in 1087 to house the relics of Saint Nicholas; the Cathedral of San Sabino, an exemplar of Apulian Romanesque architecture; and the Norman-Hohenstaufen Castle, constructed around 1131 by Roger II of Sicily. Today, Bari Vecchia seamlessly blends history with vibrant local life, featuring bustling squares like Piazza Mercantile and Piazza Ferrarese, where visitors can experience authentic Apulian culture.",
      imageUrl: "https://img1.oastatic.com/img2/81615547/834x417r/variant.jpg",
      mapUrl: "https://maps.app.goo.gl/kMdQNKmhUiByUEWh7"
    },
    { 
      name: 'Lungomare', 
      icon: '🌊',
      description: "The Lungomare di Bari is a picturesque waterfront promenade along the Adriatic Sea, renowned as one of Italy's longest and most beautiful seafronts. Stretching approximately three kilometers, it offers breathtaking views of the azure sea and the city's coastline. Lined with historic buildings showcasing late Liberty style architecture, the promenade provides a unique opportunity to experience Bari's charm, especially during sunset. Visitors can enjoy leisurely strolls, relax at various cafes, and immerse themselves in the vibrant local atmosphere that defines this captivating stretch of Bari.",
      imageUrl: "https://www.giovannicarrieri.com/photography/italy/bari/1140/bari-grande-albergo-delle-nazioni.webp",
      mapUrl: "https://maps.app.goo.gl/929WnCoAwJzCDeM19"
    },
    { 
      name: 'Cattedrale San Sabino', 
      icon: '🕍',
      description: "The Cattedrale di San Sabino, also known as Bari Cathedral, is a prominent example of Apulian Romanesque architecture located in Bari, Italy. Constructed between the late 12th and late 13th centuries, it stands on the site of a previous Byzantine cathedral destroyed in 1156. The cathedral is dedicated to Saint Sabinus, a bishop of Canosa whose relics were brought to Bari in the 9th century. The façade features three portals beneath a large rose window adorned with intricate carvings of monsters and fantastic beasts. The interior comprises three aisles separated by sixteen columns, leading to a transept and a raised presbytery. The crypt houses the relics of Saint Sabinus and an icon of the Madonna Odegitria, venerated as a significant religious artifact. Adjacent to the cathedral, the Diocesan Museum preserves the Exultet, a precious illuminated manuscript of Byzantine origin, showcasing the rich liturgical traditions associated with the cathedral.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Bari_BW_2016-10-19_13-57-32.jpg/520px-Bari_BW_2016-10-19_13-57-32.jpg",
      mapUrl: "https://maps.app.goo.gl/wFY88PmDDj62VxyA7"
    },
    { 
      name: 'Teatro Petruzzelli', 
      icon: '🎭',
      description: "Teatro Petruzzelli, located in the heart of Bari, is the city's largest theater and the fourth largest in Italy. Established in 1903, it has hosted numerous prestigious performances, including operas, ballets, and concerts featuring renowned artists such as Luciano Pavarotti and Frank Sinatra. In 1991, the theater tragically burned down but was rebuilt and reopened in 2009. Today, Teatro Petruzzelli continues to be a cultural hub, offering a diverse program of classical and contemporary performances.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Petruzzellibarioggi.jpg/520px-Petruzzellibarioggi.jpg",
      mapUrl: "https://maps.app.goo.gl/C83Xty1sXHEmFX9p6",
      eventsUrl: "https://www.fondazionepetruzzelli.it/category/eventi/"
    },
    { 
      name: 'Piazza Ferrarese', 
      icon: '🏛️',
      description: "Piazza del Ferrarese is a historic square in the heart of Bari's old town, offering views of the seafront and serving as a gateway to the charming neighborhood. Named after a merchant from Ferrara, the square is surrounded by bars and restaurants, making it a popular spot for both day and night visits. An archaeological site beneath the square reveals traces of the ancient Roman Appian Way. It also houses the Teatro Margherita, a cultural landmark. The square comes alive during the San Nicola festival with concerts and vibrant lights.",
      imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/a9/06/82/photo0jpg.jpg?w=700&h=400&s=1",
      mapUrl: "https://maps.app.goo.gl/M4BxuGPenEMFxqV69"
    },
    { 
      name: 'Strada delle Orecchiette', 
      icon: '🍝',
      description: "Strada delle Orecchiette, located in Bari Vecchia, is a narrow street famous for its traditional pasta-making. Locals craft and dry orecchiette, a type of pasta, right outside their homes, offering visitors an authentic glimpse into Bari's culinary culture. The street is lively with women shaping the pasta, filling the air with the scent of fresh pasta. Despite some controversies over the authenticity of some products sold, it remains a unique and cultural experience for travelers.",
      imageUrl: "https://soloviaggiumili.it/wp-content/uploads/2020/11/IMG_9758-2-FILEminimizer.jpg",
      mapUrl: "https://maps.app.goo.gl/qNXGj1LQYMJuPNPF8"
    },
    { 
      name: 'Castello Svevo', 
      icon: '🏰',
      description: "The Castello Svevo, or Swabian Castle, is a fortress in Bari, Italy, built by the Norman King Roger II around 1132. The castle underwent significant reconstruction in the 1230s under Emperor Frederick II, adopting its current name 'Svevo' (Swabian) during this period. Overlooking the Adriatic Sea, the castle features a trapezoidal plan with a central courtyard and two imposing polygonal towers. Throughout its history, it served various functions, including a prison and barracks. Since the early 20th century, it has been open to the public as a venue for cultural events and exhibitions. The castle's strategic location and architectural elements reflect the historical and cultural influences that have shaped Bari over the centuries, making it a significant landmark in the city.",
      imageUrl: "https://media.cultura.gov.it/mibac/files/boards/d2f2d611e6572de78b5b601afbef9203/Castello%20svevo%20-%20Bari/Castello%20di%20Bari%201.JPG",
      mapUrl: "https://maps.app.goo.gl/x9sxgvXpuNuAaykV8"
    },
    { 
      name: 'Succorpo della Cattedrale', 
      icon: '⛪',
      description: "The Succorpo della Cattedrale di Bari, also known as the Cathedral Crypt, is an underground space located in the Cattedrale di San Sabino. This sacred area houses various religious artifacts, including the relics of Saint Sabinus. The crypt's architectural design reflects different historical periods, featuring columns and capitals that date back to various eras. One of its most significant treasures is the icon of the Madonna Odegitria, a revered image in the local religious tradition. The Succorpo provides visitors with a glimpse into Bari's religious heritage and architectural history, serving as a place of devotion and historical significance within the cathedral complex.",
      imageUrl: "https://www.bari-e.it/wp-content/uploads/2023/05/Succorpo-10.jpg",
      mapUrl: "https://maps.app.goo.gl/qBmHHBHBESvexRkk8"
    },
    { 
      name: 'Porto Vecchio', 
      icon: '⚓',
      description: "Porto Vecchio, the old port of Bari, is a historic harbor characterized by its traditional fishing boats and vessels. This working port offers an authentic glimpse into the maritime life of the city, with fishermen mending nets, unloading catches, and selling fresh seafood directly from their boats. The sea wall surrounding the port provides a picturesque walkway with views of both the harbor and the cityscape. Visitors can observe the daily activities of the fishing community and experience the port's vibrant atmosphere. The area also features several seafood restaurants where visitors can enjoy the freshest catches, experiencing Bari's culinary traditions firsthand. While not a typical tourist attraction, Porto Vecchio offers an authentic and unfiltered experience of Bari's maritime heritage and local life.",
      imageUrl: "https://www.bariexperience.com/wp-content/uploads/2019/10/porto-vecchio-molo-san-nicola-nderr-la-lanz-mare-sea-foto-images-bari-puglia-apulia.jpg",
      mapUrl: "https://maps.app.goo.gl/XAsvpRLTLL2zoVZS7"
    },
    { 
      name: 'Palazzo Mincuzzi', 
      icon: '🏛️',
      description: "Palazzo Mincuzzi, located in the heart of Bari, is a notable example of Liberty style architecture. Built in 1928, the palace was originally designed as a luxury department store, reflecting the city's growing commercial development in the early 20th century. With its ornate façade, featuring intricate decorations, impressive columns, and elegant balconies, the building stands as a testament to the architectural trends of its time. The interior, with its large central staircase and luminous interiors, maintains its historic charm. While the building's function has changed over the years, it remains a symbol of Bari's architectural heritage and modern development, serving as a landmark in the city's murattiano district.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Palazzo_Mincuzzi_al_tramonto.jpg/450px-Palazzo_Mincuzzi_al_tramonto.jpg",
      mapUrl: "https://maps.app.goo.gl/trRLAAHmD77wPJ3s9"
    },
    { 
      name: 'Pinacoteca C. Giaquinto', 
      icon: '🎨',
      description: "The Pinacoteca Corrado Giaquinto, housed in the historic Palazzo della Provincia, is one of Bari's most distinguished art museums. Named after the 18th-century painter Corrado Giaquinto, the gallery boasts a remarkable collection spanning from the 11th to the 19th century. The collection includes sacred art, such as wooden polychrome sculptures, ancient paintings from various churches, and works from the medieval and Byzantine periods. Notable works include pieces by Tintoretto, Paolo Veronese, and Giovanni Bellini. The museum's collection also features modern art from Apulian, Neapolitan, and Venetian schools. Spread across four floors, the Pinacoteca offers a comprehensive overview of the region's artistic heritage and beyond. The museum's setting in the historic palace adds to its charm, making it a significant cultural institution in Bari.",
      imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/9a/b0/88/caption.jpg",
      mapUrl: "https://maps.app.goo.gl/vvh3R3wSSq4xM27w5"
    }
  ];

  const handlePreviousAttraction = () => {
    if (selectedAttractionIndex === null) return;
    setSelectedAttractionIndex((prev) => 
      prev !== null ? (prev === 0 ? attractions.length - 1 : prev - 1) : 0
    );
  };

  const handleNextAttraction = () => {
    if (selectedAttractionIndex === null) return;
    setSelectedAttractionIndex((prev) => 
      prev !== null ? (prev === attractions.length - 1 ? 0 : prev + 1) : 0
    );
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        // Imposta esplicitamente il raggio a 20km per Explore
        await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/index.php?md=Gateway&az=setDintorni&val=0')}`);
        
        // Aspetta che il filtro sia applicato
        await new Promise(resolve => setTimeout(resolve, 500));
      
        const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/bari/')}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const extractedEvents: Event[] = [];
        const monthsIT: { [key: string]: number } = {
            'gennaio': 0, 'febbraio': 1, 'marzo': 2, 'aprile': 3,
            'maggio': 4, 'giugno': 5, 'luglio': 6, 'agosto': 7,
            'settembre': 8, 'ottobre': 9, 'novembre': 10, 'dicembre': 11
        };

        const uniqueEvents = new Map();
        
        $('.evento-featured').each((_, element) => {
            const titleElement = $(element).find('.titolo.blocco-locali h2 a');
            const title = titleElement.text().trim();
            const link = titleElement.attr('href');
            const dateText = $(element).find('.testa').text().trim();
            const locationElement = $(element).find('.evento-data').text().trim();
            const description = $(element).find('.evento-corpo').text().trim();

            // Lista delle città nella provincia di Bari e dintorni
            const knownCities = [
                'Bari',
                'Mola di Bari',
                'Polignano a Mare',
                'Monopoli',
                'Gioia del Colle',
                'Conversano',
                'Alberobello',
                'Castellana Grotte',
                'Putignano',
                'Rutigliano',
                'Acquaviva delle Fonti',
                'Casamassima',
                'Sammichele di Bari',
                'Turi',
                'Noicattaro',
                'Triggiano',
                'Capurso',
                'Valenzano',
                'Adelfia',
                'Bitritto',
                'Modugno',
                'Bitonto',
                'Palo del Colle',
                'Bitetto',
                'Grumo Appula',
                'Sannicandro di Bari',
                'Giovinazzo',
                'Terlizzi',
                'Ruvo di Puglia',
                'Corato',
                'Altamura',
                'Gravina in Puglia',
                'Santeramo in Colle',
                'Locorotondo',
                'Noci',
                'Fasano'
            ];

            // Trova la città nel testo della location
            let location = 'Bari';
            for (const city of knownCities) {
                if (locationElement.includes(city)) {
                    location = city;
                    break;
                }
            }

            let startDate: Date | undefined;
            let endDate: Date | undefined;

            // Gestione formato "dal 13 al 20 dicembre 2024"
            const rangeDateMatch = dateText.match(/dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
            // Gestione formato "Domenica 15 dicembre 2024"
            const singleDateMatch = dateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);

            if (rangeDateMatch) {
                const startDay = parseInt(rangeDateMatch[1]);
                const endDay = parseInt(rangeDateMatch[2]);
                const monthStr = rangeDateMatch[3].toLowerCase();
                const year = parseInt(rangeDateMatch[4]);
                
                if (monthsIT.hasOwnProperty(monthStr)) {
                    startDate = new Date(year, monthsIT[monthStr], startDay);
                    endDate = new Date(year, monthsIT[monthStr], endDay);
                }
            } else if (singleDateMatch) {
                const day = parseInt(singleDateMatch[1]);
                const monthStr = singleDateMatch[2].toLowerCase();
                const year = parseInt(singleDateMatch[3]);
                
                if (monthsIT.hasOwnProperty(monthStr)) {
                    startDate = new Date(year, monthsIT[monthStr], day);
                }
            }

            if (title && startDate && !isNaN(startDate.getTime())) {
                const eventKey = `${title}-${startDate.getTime()}`;
                if (!uniqueEvents.has(eventKey)) {
                    uniqueEvents.set(eventKey, {
                        id: Date.now().toString() + Math.random().toString(),
                        title,
                        startDate,
                        endDate,
                        city: location,
                        description,
                        link
                    });
                }
            }
        });

        // Converti la Map in array e filtra gli eventi
        const allEvents = Array.from(uniqueEvents.values());
        allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        // Filtra solo gli eventi futuri o in corso
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const futureEvents = allEvents.filter(event => {
            const eventEndDate = event.endDate || event.startDate;
            return eventEndDate >= now;
        }).slice(0, 4);

        setEvents(futureEvents);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000);
    
    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeColor.setAttribute('content', isDarkMode ? '#9f1239' : '#9f1239');
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
      clearInterval(intervalId);
    };
  }, [location, fetchEvents]);

  const handleBackClick = () => {
    navigate('/explore');
  };

  const handleExploreClick = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden pb-24"
      style={{
        bottom: '88px',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
      ref={mainRef}
    >
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            transparent 40%,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { left: -100% }
          100% { left: 200% }
        }
      `}</style>

      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
      >
        <ArrowLeft className="h-6 w-6 text-rose-800 dark:text-rose-400" />
      </button>

      {/* Next City Button */}
      <NextCityButton nextCityPath="/cities/mola-di-bari" />

      {/* Hero Section */}
      <div
        className="relative text-white w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-hidden"
        style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          marginBottom: '0'
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://www.giovannicarrieri.com/photography/italy/bari/1140/bari-grande-albergo-delle-nazioni.webp)',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/85 via-rose-800/80 to-rose-900/90" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center max-w-3xl mx-auto px-4 pt-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Landmark className="w-4 h-4" />
            <span className="text-sm font-medium">Capital of Puglia</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
            Bari
          </h1>
          <p className="text-gray-100 text-lg mb-8 drop-shadow-md">
            A vibrant city in southern Italy, blending historic charm with modern energy. Known for its stunning old town, beautiful seafront, and delicious cuisine, it offers an unforgettable mix of culture, history, and coastal beauty.
          </p>
          <Button
            onClick={handleExploreClick}
            variant="outline"
            className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-rose-800 transition-colors"
          >
            Explore the City
          </Button>
        </motion.div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Upcoming Events Section */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Upcoming Events ({events.length})
              </h2>
            </motion.div>
            {loading && <p className="text-gray-600 mb-4">Loading events...</p>}
            {error && <p className="text-red-600 mb-4">Error: {error}</p>}
            {!loading && !error && events.length === 0 && (
                <p className="text-gray-600 mb-4">No upcoming events found</p>
            )}
            <div className="grid gap-4">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
          </section>

          {/* Attractions Section */}
          <section ref={scrollToRef} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Compass className="w-5 h-5 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Explore the City
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {attractions.map((attraction, index) => (
                <AttractionButton
                  key={attraction.name}
                  attraction={attraction}
                  attractions={attractions}
                  onOpen={setSelectedAttractionIndex}
                  index={index}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {selectedAttractionIndex !== null && (
        <AttractionModal
          attraction={attractions[selectedAttractionIndex]}
          isOpen={selectedAttractionIndex !== null}
          onClose={() => setSelectedAttractionIndex(null)}
          onPrevious={handlePreviousAttraction}
          onNext={handleNextAttraction}
        />
      )}
    </div>
  );
};

export default Bari;
