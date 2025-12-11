import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            <span className="text-lg font-medium">{t('cities.swipeToNavigate')}</span>
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

const NextCityToast: React.FC<NextCityToastProps> = ({ show }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 right-16 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
        >
          <span className="text-sm font-medium whitespace-nowrap">{t('cities.goToNextCity')}</span>
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
};

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
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all group"
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
    const { t } = useTranslation();
    let color = "bg-green-500";
    let text = t('common.today');

    if (type === 'tomorrow') {
        color = "bg-orange-500";
        text = t('common.tomorrow');
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
  const { t, i18n } = useTranslation();
  const formattedDate = event.startDate ? new Intl.DateTimeFormat(i18n.language === 'it' ? 'it-IT' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate) : t('common.notAvailable');

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-all duration-200">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold">{formattedDate}</span>
            </div>
            {currentEventType && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentEventType === 'today' ? 'bg-green-500' : 'bg-orange-500'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-white text-xs font-bold">
                  {currentEventType === 'today' ? t('common.today') : t('common.tomorrow')}
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
            <div className="w-6 h-6 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            </div>
            <span className="text-sm">{event.city}</span>
          </div>
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-600 font-medium"
            >
              {t('common.moreInfo')}
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
}> = ({ attraction, attractions, onOpen, index }) => {
  const { t } = useTranslation();
  return (
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
            className="group w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-lg">{attraction.icon}</span>
                </div>
                <span className="text-white font-semibold text-sm truncate">{attraction.name}</span>
              </div>
            </div>
            {/* Card Body */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 text-xs">{t('cities.tapToExplore')}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
            </div>
          </button>
        </motion.div>
      </DialogTrigger>
    </Dialog>
  );
};

const AttractionModal: React.FC<{
  attraction: Attraction;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ attraction, isOpen, onClose, onPrevious, onNext }) => {
  const { t } = useTranslation();
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
                {attraction.description || t('cities.comingSoon')}
              </DialogDescription>
              {attraction.mapUrl && (
                <div className="mt-4">
                  <Button
                    asChild
                    className="bg-[#3662e1] hover:bg-[#3662e1]/90 text-white"
                  >
                    <a href={attraction.mapUrl} target="_blank" rel="noopener noreferrer">
                      {t('cities.viewOnMap')}
                    </a>
                  </Button>
                </div>
              )}
                {attraction.bookingNumber && (
                  <div className="mt-2">
                      <Button asChild variant="outline">
                          <a href={`tel:${attraction.bookingNumber}`}>
                            {t('cities.callToBook')}: {attraction.bookingNumber}
                          </a>
                      </Button>
                  </div>
              )}
                {attraction.eventsUrl && (
                    <div className="mt-2">
                        <Button asChild variant="secondary">
                            <a href={attraction.eventsUrl} target="_blank" rel="noopener noreferrer">
                                {t('cities.viewEvents')}
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

const PoliganoAMare: React.FC = () => {
  const { t } = useTranslation();
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
          name: 'Centro Storico',
          icon: '🏛️',
          description: "The historic center of Polignano a Mare is a charming medieval area characterized by whitewashed houses perched on cliffs overlooking the Adriatic Sea. Visitors can enter through the Arco Marchesale, also known as Porta Grande, which once served as the fortified town’s main entrance. Within the old town, narrow streets lead to picturesque squares such as Piazza Vittorio Emanuele II, home to the historic Palazzo dell’Orologio. The Chiesa Matrice, dedicated to Santa Maria Assunta, is also located here. The historic center offers stunning views of the sea from its terraces and balconies, providing a unique blend of history and natural beauty. Exploring the historic center of Polignano a Mare allows visitors to immerse themselves in the town’s rich history and enjoy its breathtaking coastal scenery.",
          imageUrl: 'https://static2-viaggi.corriereobjects.it/wp-content/uploads/2023/03/Poesie-sui-muri-Polignano-Dario-Raffaele.jpg.webp?v=1679989076',
          mapUrl: 'https://maps.app.goo.gl/TgfLH9qZBXUZePGB8'
      },
    {
      name: 'Lama Monachile',
      icon: '🏖️',
      description: "Lama Monachile, also known as Cala Porto, is a picturesque beach in Polignano a Mare, renowned for its stunning location between high cliffs and crystal-clear waters. The beach is situated within a natural inlet formed by an ancient riverbed, characteristic of Puglia’s karst landscape. Access to the beach is via the historic Roman bridge, which offers panoramic views of the cove and the surrounding cliffs. The pebble beach is a popular spot for both locals and tourists, providing a unique setting for swimming and sunbathing. The transparent waters and dramatic cliffs make it one of the most photographed locations along the Bari coast. Lama Monachile is not only a natural attraction but also a cultural landmark, hosting events such as the Red Bull Cliff Diving World Series, where divers plunge from the cliffs into the Adriatic Sea. Visitors to Polignano a Mare often consider Lama Monachile a must-see destination, offering a blend of natural beauty and historical significance that captures the essence of this coastal town.",
        imageUrl: 'https://www.photohound.co/images/1031855m.jpg',
      mapUrl: 'https://maps.app.goo.gl/5QJvHwJzqXJ4mhEC8'
    },
    {
      name: 'Statua di Domenico Modugno',
      icon: '🎭',
      description: "The Statue of Domenico Modugno in Polignano a Mare honors the renowned Italian singer-songwriter, famous for “Nel blu dipinto di blu” (“Volare”). Born in Polignano a Mare in 1928, Modugno’s legacy is immortalized through this bronze statue, unveiled on May 31, 2009. Standing approximately 3 meters tall, the sculpture was crafted by Argentine artist Hermann Mejer. It depicts Modugno with outstretched arms, symbolizing an embrace of his hometown.",
        imageUrl: 'https://www.adb.puglia.it/wp-content/uploads/2022/08/106180_statua_di_domenico_modugno_polignano_a_mare.jpeg',
      mapUrl: 'https://maps.app.goo.gl/C2bCiC5T93B2rYra7'
    },
      {
          name: 'Ponte Borbonico',
          icon: '🌉',
          description: "The Ponte Borbonico di Lama Monachile, also known as the Bourbon Bridge, is a historic landmark in Polignano a Mare, Italy. Constructed in the early 19th century during the reign of King Ferdinand II of Bourbon, the bridge was part of a new route connecting Bari to Lecce. Spanning a deep ravine, the bridge stands approximately 15 meters high and offers panoramic views of the Adriatic Sea and the town’s whitewashed buildings. Below the bridge lies Lama Monachile, one of Puglia’s most beautiful beaches, accessible via a staircase that leads down to the cove. Today, the Ponte Borbonico is a popular spot for visitors, especially at sunset, providing a picturesque setting for photographs and a glimpse into the region’s rich history.",
          imageUrl: 'https://www.polignanoamare.eu/files/foto-due-ponti.webp',
          mapUrl: 'https://maps.app.goo.gl/P77TokjpLxgxeGR49'
      },
    {
      name: 'Cala Paura',
      icon: '⛱️',
      description: "Cala Paura is a charming pebble beach located in Polignano a Mare, Italy. Nestled between rocky cliffs, it offers clear, calm waters ideal for swimming and snorkeling. The beach is surrounded by picturesque white and beige sands, stretching approximately 150 meters. Visitors can enjoy amenities such as sun loungers and umbrellas, with lifeguards on duty during peak season. The area is also known for its submerged grottoes, providing opportunities for exploration. Cala Paura’s proximity to the town center makes it a convenient spot for both locals and tourists seeking relaxation by the sea. The beach’s natural beauty and tranquil atmosphere contribute to its popularity as a must-visit destination in Puglia.",
        imageUrl: 'https://www.secretsand.com/wp-content/uploads/2020/05/cala-paura.jpg',
      mapUrl: 'https://maps.app.goo.gl/vm2ZHjvkVnCgUoRw6'
    },
    {
      name: 'Abbazia San Vito',
      icon: '⛪',
      description: "The Abbey of San Vito, located approximately two kilometers from Polignano a Mare, Italy, is a historic Benedictine monastery established in the 10th century. Situated along the Adriatic coast, the abbey is renowned for its picturesque setting adjacent to a small fishing village. Architecturally, the abbey showcases a blend of Baroque and Romanesque styles. The main façade features a portico leading to a 17th-century staircase and panoramic loggia, while the church itself, built on the remnants of an ancient Roman tower, presents a Romanesque design with three naves. The transept is crowned by a small circular dome, and the interior houses a triptych depicting Saints Vito, Modesto, and Crescenza. Although the abbey remains privately owned and is not regularly open to the public, visitors can admire its exterior and the surrounding landscape. The adjacent beach, Cala San Vito, is accessible via a walkway and offers a serene spot for relaxation. The Abbey of San Vito stands as a testament to the region’s rich history and architectural heritage, making it a noteworthy site for those exploring the Apulian coastline.",
        imageUrl: 'https://www.associazionedongiacomotantardini.it/wp-content/uploads/2018/06/san-vito-polignano-1.jpg',
      mapUrl: 'https://maps.app.goo.gl/DmpFqRAUxAGUY1XD6'
    },
    {
        name: "Piazza dell'Orologio",
        icon: '🕰️',
        description: "Piazza dell’Orologio, officially known as Piazza Vittorio Emanuele II, is a central square in Polignano a Mare, Italy. Dominated by the historic Palazzo dell’Orologio, the square is a hub of local life, featuring various bars and artisan shops. Its strategic location makes it an ideal starting point for exploring the town’s picturesque alleys and experiencing its authentic atmosphere.",
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/27/12_Piazza_Vittorio_Emanuele_II%2C_o_Piazza_dell’Orologio_%28Polignano_a_Mare%29.jpg',
        mapUrl: 'https://maps.app.goo.gl/Cpi7BtbnWktNW5eRA'
    },
      {
          name: 'Chiesa Madre',
          icon: '🏺',
          description: "The Chiesa Matrice di Santa Maria Assunta, located in Piazza Vittorio Emanuele II in Polignano a Mare, Italy, is a historic church consecrated in 1295. It is believed to have been built on the remains of a pagan temple. The church features a blend of architectural styles, with the base of its bell tower dating back to the 1500s, completed in later periods. Inside, the church houses significant artworks, including a nativity scene by Stefano da Putignano. Serving as a central place of worship, the Chiesa Matrice di Santa Maria Assunta stands as a testament to Polignano a Mare’s rich religious and cultural heritage.",
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Polignano_a_Mare_-_Chiesa_matrice_di_Santa_Maria_Assunta_-_2023-09-29_17-14-45_001.JPG',
          mapUrl: 'https://maps.app.goo.gl/41Vgf8S7FvH4qeYn8'
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
      // Prima impostiamo il filtro per 0km
      await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/index.php?md=Gateway&az=setDintorni&val=0')}`);
      
      // Aspettiamo un momento per assicurarci che il filtro sia applicato
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Poi prendiamo i risultati filtrati
      const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/polignano-a-mare/')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Mappa dei mesi italiani
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
        const location = $(element).find('.evento-data a').text().trim() || 'Polignano a Mare';
        const description = $(element).find('.evento-corpo').text().trim();

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
                    city: 'Polignano a Mare',
                    description,
                    link
                });
            }
        }
      });

      // Converti la Map in array e filtra gli eventi
      const extractedEvents = Array.from(uniqueEvents.values());
      extractedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      // Filtra solo gli eventi futuri o in corso
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const futureEvents = extractedEvents.filter(event => {
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
        themeColor.setAttribute('content', isDarkMode ? '#3662e1' : '#3662e1');
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
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
      ref={mainRef}
    >
      <style>{`
        .shimmer-button {
          position: relative;
          overflow: hidden;
        }
        .shimmer-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
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

      <button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
      >
        <ArrowLeft className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
      </button>

      <NextCityButton nextCityPath="/cities/monopoli" />

      {/* Modern Hero Section */}
      <div
        className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-hidden"
        style={{ marginBottom: '1.5rem' }}
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://www.photohound.co/images/1031855m.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/80 via-blue-800/70 to-blue-900/80" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center max-w-3xl mx-auto px-5 py-12 pt-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Compass className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Pearl of the Adriatic</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Polignano a Mare
          </h1>
          <p className="text-white/80 text-base mb-6">
            Famous for its dramatic cliffs, crystal-clear waters, and charming historic center.
          </p>
          <button
            onClick={handleExploreClick}
            className="shimmer-button inline-flex items-center gap-2 bg-white text-cyan-700 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
          >
            <Landmark className="h-5 w-5" />
            {t('cities.exploreAttractions')}
          </button>
        </motion.div>
      </div>

      <div className="px-5 pb-8">
        {/* Events Section */}
        <section className="mb-8">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('cities.upcomingEvents')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('cities.eventsInCity', { count: events.length, city: 'Polignano' })}</p>
            </div>
          </div>

          {loading && <p className="text-gray-600 dark:text-gray-400 mb-4">{t('explore.loadingEvents')}</p>}
          {error && <p className="text-red-600 mb-4">{t('common.error')}: {error}</p>}
          {!loading && !error && events.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('cities.noEvents')}</p>
          )}
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Attractions Section */}
        <section ref={scrollToRef} className="mb-8">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('cities.exploreTheCity')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('cities.discoverAttractions')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {attractions.map((attraction, index) => (
              <AttractionButton
                key={attraction.name}
                attraction={attraction}
                attractions={attractions}
                onOpen={(idx) => setSelectedAttractionIndex(idx)}
                index={index}
              />
            ))}
          </div>
        </section>
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

export default PoliganoAMare;
