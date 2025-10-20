import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
    ChevronLeft,
    ChevronRight
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
  <>
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 right-16 z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
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
  </>
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
        className="fixed top-4 right-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all group"
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
        if(!event.startDate) return null;

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
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-400">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 mt-1 block">
                  More info
                </a>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-indigo-700 dark:text-indigo-400" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              {currentEventType && <CurrentEventBadge type={currentEventType} />}
            </div>
          </div>
        </CardContent>
      </Card>
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
        <DialogTrigger>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full aspect-square"
            >
                <button
                    onClick={() => onOpen(index)}
                    className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                    <span className="text-[#60A5FA]">{attraction.icon}</span>
                    <span className="text-indigo-700 dark:text-indigo-400 font-medium text-sm">{attraction.name}</span>
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
                                className="bg-[#4f46e5] hover:bg-[#4f46e5]/90 text-white"
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

const Monopoli: React.FC = () => {
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
          description: "The historic center of Monopoli, a coastal town in Puglia, Italy, is a captivating blend of history, culture, and architecture. Characterized by narrow alleys, whitewashed buildings, and charming squares, it reflects the town’s rich past and vibrant present. Central to the old town is Piazza Vittorio Emanuele II, one of the largest squares in Puglia, serving as a focal point for local life and events. The area is renowned for its numerous restaurants and taverns, offering a wide range of fish dishes, reflecting Monopoli’s deep connection to the sea. Visitors can also find artisan workshops and small grocers’ shops, maintaining the traditional charm of the town. The historic center is still inhabited by the local population, preserving its authentic atmosphere and providing visitors with a genuine experience of local life. Exploring the historic center of Monopoli offers a journey through time, showcasing the town’s evolution while preserving its authentic charm.",
          imageUrl: 'https://apulianstay.it/wp-content/uploads/2020/02/TOUR-CENTRO-STORICO-MONOPOLI.jpg',
          mapUrl: 'https://maps.app.goo.gl/Ny5NfEtoYCBPVCx88'
      },
      {
        name: 'Basilica Maria SS della Madia',
          icon: '⛪',
          description: "The Basilica Cattedrale Maria Santissima della Madia, located in Monopoli, Italy, is a significant example of Baroque architecture. Construction of the current structure began in 1742 and was completed in 1772, replacing an earlier Romanesque church. The cathedral is dedicated to the Madonna della Madia, a revered icon with a storied past. According to local legend, in 1117, a raft carrying the icon miraculously arrived at Monopoli’s harbor, providing the beams necessary to complete the cathedral’s roof. This event is commemorated annually with a procession reenacting the icon’s arrival. Inside, the basilica houses several notable artworks, including two large canvases by Pietro Bardellino and six smaller 18th-century paintings depicting the Life of the Virgin by Michele del Pezzo. The Chapel of Our Lady of Madia features elaborate polychrome decoration on the altar. In 1921, the cathedral was granted the status of a minor basilica, and in 1986, it became a co-cathedral in the Diocese of Conversano-Monopoli. The Basilica Cattedrale Maria Santissima della Madia stands as a testament to Monopoli’s rich religious heritage and architectural splendor, attracting visitors and pilgrims alike.",
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/InternoCattedrale.JPG/244px-InternoCattedrale.JPG',
          mapUrl: 'https://maps.app.goo.gl/7fsVsLdNYLSCfmo56'
      },
      {
          name: 'Castello di Carlo V',
          icon: '🏰',
          description: "The Castello di Carlo V, or Castle of Charles V, is a 16th-century fortress located in Monopoli, Italy. Constructed during the Spanish domination of the city, it was part of a coastal fortification system ordered by Charles V to defend against Ottoman incursions and pirate attacks. Built on a promontory overlooking the Old Port of Monopoli, the castle features a pentagonal design typical of 15th-century Spanish fortresses. It includes two main floors—the quay level and the parade ground level—along with additional mid-levels used for storage. The parade ground offers views of the sentry’s walkway connecting the lookout towers at the northeast and southeast corners. Over the centuries, the castle has undergone several reconstructions. In the early 1900s, it was used as a prison, and it was restored in 1976. Today, it houses the Municipal Archaeological Museum and serves as a venue for exhibitions and events. Visitors can explore the castle’s historical architecture and enjoy panoramic views of the city and the Adriatic Sea. Its strategic location and rich history make it a significant landmark in Monopoli.",
          imageUrl: 'https://www.comune.monopoli.ba.it/var/opencitymonopoli/storage/images/media/images/castello-carlo-v2/1894053-2-ita-IT/Castello-Carlo-V_reference.jpg',
          mapUrl: 'https://maps.app.goo.gl/9GLLaejC1D2DJn8S7'
      },
      {
          name: 'Cala Porta Vecchia',
          icon: '⛱️',
          description: "Cala Porta Vecchia is a charming beach nestled at the base of Monopoli’s ancient defensive sea walls. This small, sandy area stretches along the foot of the walls and continues around the rocks beneath the Bastione di Babula. The beach is renowned for its crystal-clear waters, offering a serene spot for swimming and relaxation. Despite its appeal, Cala Porta Vecchia is not equipped with facilities such as changing rooms or showers. Visitors should be prepared to bring their own amenities and be aware that the beach can become crowded, especially during peak times. The beach’s proximity to Monopoli’s historic center allows visitors to easily explore the town’s rich history and vibrant culture. After a day at the beach, one can enjoy the town’s charming streets, local eateries, and historical sites. For those planning a visit, it’s advisable to arrive early to secure a spot, as the beach tends to fill up quickly. Additionally, bringing an umbrella is recommended, as shade is limited until late afternoon. In summary, Cala Porta Vecchia offers a picturesque and tranquil beach experience, complemented by the opportunity to immerse oneself in the historical and cultural ambiance of Monopoli.",
          imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/41/35/e8/cala-porta-vecchia-31.jpg?w=900&h=-1&s=1',
          mapUrl: 'https://maps.app.goo.gl/phpMuHjQhKwvRHh47'
      },
      {
          name: 'Porto Antico',
          icon: '⚓',
          description: "Porto Antico, or the Old Port, is a picturesque and historic harbour located in the heart of Monopoli, Italy. This charming area is renowned for its traditional “gozzo” fishing boats, which are a symbol of Puglia. The port is framed by the ancient city walls, providing a scenic backdrop for visitors. It’s a popular spot to observe local fishermen unloading their daily catch, offering a glimpse into the town’s maritime traditions. For those interested in photography, Porto Antico offers numerous opportunities to capture the essence of coastal life. The vibrant boats, historic architecture, and serene waters make it a photographer’s paradise. After exploring the port, visitors can relax on nearby benches, enjoy the coastal atmosphere, and perhaps indulge in local seafood at one of the nearby eateries. In summary, Porto Antico is a must-visit destination for those seeking to experience the authentic charm and maritime heritage of Monopoli.",
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Il_porto_antico_di_Monopoli.jpg/1600px-Il_porto_antico_di_Monopoli.jpg',
          mapUrl: 'https://maps.app.goo.gl/zaVgs5k8diVWH6k66'
      },
      {
          name: 'Porto Marzano Beach',
          icon: '🏖️',
          description: "Porto Marzano Beach is a serene and picturesque sandy cove located near Monopoli, Italy. Accessible via a short path through native Mediterranean scrub, this beach offers a tranquil retreat away from the more crowded spots in the area. The beach is approximately 400 meters long and is known for its crystal-clear waters and fine white sand. Visitors can enjoy activities such as swimming, sunbathing, and snorkeling. Amenities include bathrooms, showers, and beach umbrellas and chairs. A lifeguard is on duty during the summer months, ensuring safety for all guests. Dogs are not allowed on the beach. For those interested in dining, the nearby Porto Marzano Beach Bar offers a variety of food and beverages. The establishment is known for its friendly atmosphere and is a popular spot for both locals and tourists. Parking is available near the beach, and it is free for visitors. However, the parking lot can fill up quickly during peak hours, so it is advisable to arrive early or consider alternative transportation.",
          imageUrl: 'https://media-cdn.tripadvisor.com/media/photo-s/10/3c/9f/3d/la-spiaggia.jpg',
          mapUrl: 'https://maps.app.goo.gl/6kE3yoncKKtHTzC88'
      },
      {
          name: 'Piazza Garibaldi',
          icon: '🏟️',
          description: "Piazza Giuseppe Garibaldi is a central square in Monopoli, Italy, serving as a vibrant hub for both locals and visitors. The square is surrounded by a variety of cafes, restaurants, and shops, making it an ideal spot to relax and observe the lively atmosphere. At the heart of the square stands a distinctive drinking fountain, adding to its charm. The surrounding architecture reflects the town’s rich history, with buildings that showcase traditional and contemporary styles. Piazza Garibaldi is also home to the “Sala dei Pescatori” (Fishermen’s Hall), an information point where visitors can learn more about Monopoli’s maritime heritage. Whether you’re looking to enjoy a meal, sip a coffee, or simply people-watch, Piazza Garibaldi offers a welcoming environment that captures the essence of Monopoli.",
          imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/61/09/42/20190913-172122-largejpg.jpg?w=900&h=500&s=1',
          mapUrl: 'https://maps.app.goo.gl/Y4UswnWWre9iQdAs8'
      },
      {
          name: 'Museo Cripta Romanica',
          icon: '🗿',
          description: "The Museo e Sito Archeologico Cripta Romanica in Monopoli, Italy, offers a captivating journey through 4,500 years of history. Visitors can explore Romanesque sculptures, Gothic artworks, and archaeological remains, providing a deep insight into the region’s rich cultural heritage. Located in the heart of Monopoli, the museum is easily accessible and serves as a testament to the town’s historical significance. The site features a well-preserved Romanesque crypt, showcasing intricate carvings and architectural details that reflect the artistic styles of the era. For those interested in visiting, the museum is open on Saturdays from 16:00 to 19:00.",
          imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/03/db/a8/80/scavi-archeologici-della.jpg?w=900&h=500&s=1',
           mapUrl: 'https://maps.app.goo.gl/xzXgWHXULHayKsgw5',
          eventsUrl: 'https://www.tripadvisor.it/Attraction_Review-g652003-d2312060-Reviews-Museo_e_Sito_Archeologico_Cripta_Romanica-Monopoli_Province_of_Bari_Puglia.html'
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
        const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/monopoli/')}`);
        
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
            const location = $(element).find('.evento-data a').text().trim() || 'Monopoli';
            const description = $(element).find('.evento-corpo').text().trim();

            console.log('Event Data Before Filter:', {
                title, link, dateText, location, description
            });

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
                        city: 'Monopoli',
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

    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000); //ogni 10 minuti
    
    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeColor.setAttribute('content', isDarkMode ? '#4f46e5' : '#4f46e5');
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
        <ArrowLeft className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </button>

      {/* Next City Button */}
      <NextCityButton nextCityPath="/cities/bari" />

      {/* Hero Section */}
      <div
        className="bg-indigo-600 dark:bg-indigo-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
        style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          marginBottom: '2rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto px-4 pt-8"
        >
          <h1 className="text-3xl font-bold mb-4">
            Monopoli
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            A picturesque coastal town in southern Italy, renowned for its stunning beaches, vibrant harbor, and charming old town. With its historic architecture and welcoming atmosphere, it's the ideal spot for an authentic and relaxing getaway.
          </p>
          <Button
            onClick={handleExploreClick}
            variant="outline"
            className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-indigo-600 transition-colors"
          >
            Explore the City
          </Button>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
{/* Upcoming Events Section */}
<section className="mb-12">
    <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6"
    >
        Upcoming Events ({events.length})
    </motion.h2>
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
        <section ref={scrollToRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6 text-center"
          >
            Explore the City
          </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {attractions.map((attraction, index) => (
                    <AttractionButton
                        key={attraction.name}
                        attraction={attraction}
                        attractions={attractions}
                        onOpen={(index) => setSelectedAttractionIndex(index)}
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

export default Monopoli;
