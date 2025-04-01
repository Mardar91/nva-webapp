import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import {
  Calendar, 
  MapPin, 
  ArrowLeft, 
  ArrowRight,
  Building2,
  TreePalm,
  Ship,
  Church,
  PenLine,
  Map,
  DollarSign,
  Cloud,
  Trash2,
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
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import * as cheerio from 'cheerio';
import WeatherWidgetFullscreen from '../../components/WeatherWidgetFullscreen';

// Interfaces
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

// Next City Components
interface NextCityToastProps {
  show: boolean;
}

// Componente riscritto senza AnimatePresence
const NextCityToast: React.FC<NextCityToastProps> = ({ show }) => {
  if (!show) return null;
  
  return (
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
  icon: React.ReactNode;
  description?: string;
  imageUrl?: string;
  mapUrl?: string;
  bookingNumber?: string;
  eventsUrl?: string;
}

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

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        if(now >= start && now <= end) return 'today';
        // Fix per il badge tomorrow - controlla solo per eventi che iniziano esattamente domani
        if(start.getTime() === tomorrow.getTime()) return 'tomorrow';
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
              <h3 className="font-semibold text-lg text-[#1e3a8a] dark:text-[#60A5FA]">
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
                <Calendar className="w-4 h-4 mr-1 text-[#1e3a8a] dark:text-[#60A5FA]" />
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

const CityButton: React.FC<{ 
  city: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
}> = ({ city, icon, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="w-full aspect-square"
  >
    <button 
      onClick={onClick}
      className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="text-[#60A5FA]">{icon}</span>
      <span className="text-[#1e3a8a] dark:text-[#60A5FA] font-medium text-sm">{city}</span>
    </button>
  </motion.div>
);

// Note Card component con sistema semplificato
const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void }> = ({ note, onDelete }) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  return (
    <div className="relative">
      {showDeleteButton && (
        <button
          className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 text-white rounded-r-lg flex items-center justify-center gap-2"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-5 w-5" />
          Delete
        </button>
      )}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.7}
        onDrag={(event, info) => {
          if (info.offset.x < -50) {
            setShowDeleteButton(true);
          } else {
            setShowDeleteButton(false);
          }
        }}
        animate={{ x: showDeleteButton ? -96 : 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="touch-pan-y"
      >
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <h4 className="font-semibold text-[#1e3a8a] dark:text-[#60A5FA]">{note.title}</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{note.content}</p>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(note.date).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Notes Dialog Component
const NotesDialog: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('travel-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const saveNote = () => {
    if (!title.trim() || !content.trim()) return;
    
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString()
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('travel-notes', JSON.stringify(updatedNotes));
    
    setTitle('');
    setContent('');
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('travel-notes', JSON.stringify(updatedNotes));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <PenLine size={24} className="text-[#60A5FA] mb-1" />
          <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">Notes</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Travel Notes</DialogTitle>
          <DialogDescription>Add and manage your travel notes</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2"
            />
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={saveNote}
              className="mt-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
            >
              Save Note
            </Button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {notes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onDelete={deleteNote}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Currency Converter Component
const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<string>('');

  const currencies: CurrencyOption[] = [
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' }
  ];

  const rates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.09, GBP: 0.86, JPY: 158.27, EUR: 1 },
    USD: { EUR: 0.92, GBP: 0.79, JPY: 145.20, USD: 1 },
    GBP: { EUR: 1.16, USD: 1.27, JPY: 183.92, GBP: 1 },
    JPY: { EUR: 0.0063, USD: 0.0069, GBP: 0.0054, JPY: 1 }
  };

  const convert = () => {
    const rate = rates[fromCurrency][toCurrency];
    const calculated = (parseFloat(amount) * rate).toFixed(2);
    setResult(calculated);
  };

  useEffect(() => {
    convert();
  }, [amount, fromCurrency, toCurrency]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <DollarSign size={24} className="text-[#60A5FA] mb-1" />
          <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">Currency</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Currency Converter</DialogTitle>
          <DialogDescription>Convert between different currencies</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-2 rounded-md border"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code}
                </option>
              ))}
            </select>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-2 rounded-md border"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA]">
              {result} {currencies.find(c => c.code === toCurrency)?.symbol}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const WeatherWidget: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <Cloud size={24} className="text-[#60A5FA] mb-1" />
      <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">Weather</span>
    </Button>
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
          <span className="text-rose-800 dark:text-rose-400 font-medium text-sm">{attraction.name}</span>
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

  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  // Funzione semplificata per gestire lo swipe manualmente
  const handleDrag = (e: React.MouseEvent | React.TouchEvent, direction: 'left' | 'right') => {
    if (direction === 'left') {
      onNext();
    } else {
      onPrevious();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <div className="relative">
          {showTutorial && <SwipeTutorial />}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => handleDrag({} as React.MouseEvent, 'right')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={() => handleDrag({} as React.MouseEvent, 'left')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Bari: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMap, setShowMap] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const [selectedAttractionIndex, setSelectedAttractionIndex] = useState<number | null>(null);

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#1e3a8a');
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
    };
  }, []);
 
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

  const attractions: Attraction[] = [
    { 
      name: 'Basilica San Nicola', 
      icon: '⛪', 
      description: "The Basilica of Saint Nicholas, located in Bari's historic center, is a prime example of Apulian Romanesque architecture. Built between 1087 and 1197 to house the relics of Saint Nicholas, brought from Myra (now in Turkey) by 62 sailors in 1087, the basilica features a simple yet majestic façade with three portals and two distinct bell towers. Inside, it follows a Latin cross plan with three naves separated by twelve columns. The crypt, supported by 26 columns, contains the saint's tomb, making the basilica a significant pilgrimage site for both Roman Catholic and Eastern Orthodox Christians.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Bari_BW_2016-10-19_13-35-11_stitch.jpg/520px-Bari_BW_2016-10-19_13-35-11_stitch.jpg",
      mapUrl: "https://maps.app.goo.gl/LeBqSDhpVg1w8VZj8"
    },
    { 
      name: 'Città Vecchia', 
      icon: '🏛️',
      description: "Bari Vecchia, or Old Bari, is the historic heart of Bari, Italy, situated on a peninsula between the city's two harbors. This medieval quarter is a maze of narrow, winding streets reminiscent of an Arab kasbah, reflecting its ancient urban layout. Key landmarks include the Basilica of San Nicola, built in 1087 to house the relics of Saint Nicholas; the Cathedral of San Sabino, an exemplar of Apulian Romanesque architecture; and the Norman-Hohenstaufen Castle, constructed around 1131 by Roger II of Sicily. Today, Bari Vecchia seamlessly blends history with vibrant local life, featuring bustling squares like Piazza Mercantile and Piazza Ferrarese, where visitors can experience authentic Apulian culture.",
      imageUrl: "https://img1.oastatic.com/img2/81615547/834x417r/variant.jpg",
      mapUrl: "https://maps.app.goo.gl/b9pKpkLy4sCvuPGc8"
    },
    { 
      name: 'Lungomare', 
      icon: '🌊',
      description: "The Lungomare di Bari is a picturesque waterfront promenade along the Adriatic Sea, renowned as one of Italy's longest and most beautiful seafronts. Stretching approximately three kilometers, it offers breathtaking views of the azure sea and the city's coastline. Lined with historic buildings showcasing late Liberty style architecture, the promenade provides a unique opportunity to experience Bari's charm, especially during sunset. Visitors can enjoy leisurely strolls, relax at various cafes, and immerse themselves in the vibrant local atmosphere that defines this captivating stretch of Bari.",
      imageUrl: "https://www.giovannicarrieri.com/photography/italy/bari/1140/bari-grande-albergo-delle-nazioni.webp",
      mapUrl: "https://maps.app.goo.gl/tGLmMEKqm8oDnqBo8"
    },
    { 
      name: 'Cattedrale San Sabino', 
      icon: '🕍',
      description: "The Cattedrale di San Sabino, also known as Bari Cathedral, is a prominent example of Apulian Romanesque architecture located in Bari, Italy. Constructed between the late 12th and late 13th centuries, it stands on the site of a previous Byzantine cathedral destroyed in 1156. The cathedral is dedicated to Saint Sabinus, a bishop of Canosa whose relics were brought to Bari in the 9th century. The façade features three portals beneath a large rose window adorned with intricate carvings of monsters and fantastic beasts. The interior comprises three aisles separated by sixteen columns, leading to a transept and a raised presbytery. The crypt houses the relics of Saint Sabinus and an icon of the Madonna Odegitria, venerated as a significant religious artifact. Adjacent to the cathedral, the Diocesan Museum preserves the Exultet, a precious illuminated manuscript of Byzantine origin, showcasing the rich liturgical traditions associated with the cathedral.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Bari_BW_2016-10-19_13-57-32.jpg/520px-Bari_BW_2016-10-19_13-57-32.jpg",
      mapUrl: "https://maps.app.goo.gl/LkbwJNcPBHn7GYrA6"
    },
    { 
      name: 'Teatro Petruzzelli', 
      icon: '🎭',
      description: "Teatro Petruzzelli, located in the heart of Bari, is the city's largest theater and the fourth largest in Italy. Established in 1903, it has hosted numerous prestigious performances, including operas, ballets, and concerts featuring renowned artists such as Luciano Pavarotti and Frank Sinatra. In 1991, the theater tragically burned down but was rebuilt and reopened in 2009. Today, Teatro Petruzzelli continues to be a cultural hub, offering a diverse program of classical and contemporary performances.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Petruzzellibarioggi.jpg/520px-Petruzzellibarioggi.jpg",
      mapUrl: "https://maps.app.goo.gl/8DznN7aJGKL9BJLP6",
      eventsUrl: "https://www.fondazionepetruzzelli.it/en/stagione/"
    },
    { 
      name: 'Piazza Ferrarese', 
      icon: '🏛️',
      description: "Piazza del Ferrarese is a historic square in the heart of Bari's old town, offering views of the seafront and serving as a gateway to the charming neighborhood. Named after a merchant from Ferrara, the square is surrounded by bars and restaurants, making it a popular spot for both day and night visits. An archaeological site beneath the square reveals traces of the ancient Roman Appian Way. It also houses the Teatro Margherita, a cultural landmark. The square comes alive during the San Nicola festival with concerts and vibrant lights.",
      imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/a9/06/82/photo0jpg.jpg?w=700&h=400&s=1",
      mapUrl: "https://maps.app.goo.gl/qrK7wqQXqgxbEDAL8"
    },
    { 
      name: 'Strada delle Orecchiette', 
      icon: '🍝',
      description: "Strada delle Orecchiette, located in Bari Vecchia, is a narrow street famous for its traditional pasta-making. Locals craft and dry orecchiette, a type of pasta, right outside their homes, offering visitors an authentic glimpse into Bari's culinary culture. The street is lively with women shaping the pasta, filling the air with the scent of fresh pasta. Despite some controversies over the authenticity of some products sold, it remains a unique and cultural experience for travelers.",
      imageUrl: "https://soloviaggiumili.it/wp-content/uploads/2020/11/IMG_9758-2-FILEminimizer.jpg",
      mapUrl: "https://maps.app.goo.gl/hJpXMWHMxHB4tHyE7"
    },
    { 
      name: 'Castello Svevo', 
      icon: '🏰',
      description: "The Castello Svevo, or Swabian Castle, is a fortress in Bari, Italy, built by the Norman King Roger II around 1132. The castle underwent significant reconstruction in the 1230s under Emperor Frederick II, adopting its current name 'Svevo' (Swabian) during this period. Overlooking the Adriatic Sea, the castle features a trapezoidal plan with a central courtyard and two imposing polygonal towers. Throughout its history, it served various functions, including a prison and barracks. Since the early 20th century, it has been open to the public as a venue for cultural events and exhibitions. The castle's strategic location and architectural elements reflect the historical and cultural influences that have shaped Bari over the centuries, making it a significant landmark in the city.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Castello_Svevo_di_Bari.JPG/520px-Castello_Svevo_di_Bari.JPG",
      mapUrl: "https://maps.app.goo.gl/4DfrFKnJTPo57MXDA"
    },
    { 
      name: 'Succorpo della Cattedrale', 
      icon: '⛪',
      description: "The Succorpo della Cattedrale di Bari, also known as the Cathedral Crypt, is an underground space located in the Cattedrale di San Sabino. This sacred area houses various religious artifacts, including the relics of Saint Sabinus. The crypt's architectural design reflects different historical periods, featuring columns and capitals that date back to various eras. One of its most significant treasures is the icon of the Madonna Odegitria, a revered image in the local religious tradition. The Succorpo provides visitors with a glimpse into Bari's religious heritage and architectural history, serving as a place of devotion and historical significance within the cathedral complex.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Madonna_Odegitria.jpg",
      mapUrl: "https://maps.app.goo.gl/LkbwJNcPBHn7GYrA6"
    },
    { 
      name: 'Porto Vecchio', 
      icon: '⚓',
      description: "Porto Vecchio, the old port of Bari, is a historic harbor characterized by its traditional fishing boats and vessels. This working port offers an authentic glimpse into the maritime life of the city, with fishermen mending nets, unloading catches, and selling fresh seafood directly from their boats. The sea wall surrounding the port provides a picturesque walkway with views of both the harbor and the cityscape. Visitors can observe the daily activities of the fishing community and experience the port's vibrant atmosphere. The area also features several seafood restaurants where visitors can enjoy the freshest catches, experiencing Bari's culinary traditions firsthand. While not a typical tourist attraction, Porto Vecchio offers an authentic and unfiltered experience of Bari's maritime heritage and local life.",
      imageUrl: "https://www.apuliatouristguide.com/wp-content/uploads/2021/10/Porto-San-Nicola-Bari.jpg",
      mapUrl: "https://maps.app.goo.gl/WS9X3d4GKJNCH97u9"
    },
    { 
      name: 'Palazzo Mincuzzi', 
      icon: '🏛️',
      description: "Palazzo Mincuzzi, located in the heart of Bari, is a notable example of Liberty style architecture. Built in 1928, the palace was originally designed as a luxury department store, reflecting the city's growing commercial development in the early 20th century. With its ornate façade, featuring intricate decorations, impressive columns, and elegant balconies, the building stands as a testament to the architectural trends of its time. The interior, with its large central staircase and luminous interiors, maintains its historic charm. While the building's function has changed over the years, it remains a symbol of Bari's architectural heritage and modern development, serving as a landmark in the city's murattiano district.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Palazzo_Mincuzzi_%28Bari%29.jpg",
      mapUrl: "https://maps.app.goo.gl/GKnmJZxXXm5fShrt8"
    },
    { 
      name: 'Pinacoteca C. Giaquinto', 
      icon: '🎨',
      description: "The Pinacoteca Corrado Giaquinto, housed in the historic Palazzo della Provincia, is one of Bari's most distinguished art museums. Named after the 18th-century painter Corrado Giaquinto, the gallery boasts a remarkable collection spanning from the 11th to the 19th century. The collection includes sacred art, such as wooden polychrome sculptures, ancient paintings from various churches, and works from the medieval and Byzantine periods. Notable works include pieces by Tintoretto, Paolo Veronese, and Giovanni Bellini. The museum's collection also features modern art from Apulian, Neapolitan, and Venetian schools. Spread across four floors, the Pinacoteca offers a comprehensive overview of the region's artistic heritage and beyond. The museum's setting in the historic palace adds to its charm, making it a significant cultural institution in Bari.",
      imageUrl: "https://beniculturali.it/mibac/export/MiBAC/sito-MiBAC/Luogo/MibacUnif/Enti/visualizza_asset.html_865723014.html",
      mapUrl: "https://maps.app.goo.gl/x57UaM8hFSbYGH5K9"
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
  }, [fetchEvents, location]);

  const handleBackClick = () => {
    navigate('/explore');
  };

  const handleExploreClick = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (showMap) {
    return (
      <div className="fixed inset-0 bg-white">
        <iframe 
          src="https://www.google.com/maps/d/u/0/embed?mid=1aayihxUbcOPi0X1t52-PFKrWfhRfyAs&ehbc=2E312F&noprof=1"
          className="w-full h-[calc(100vh-88px)]"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
        <div className="fixed bottom-24 right-4 z-[9999]">
          <button
            onClick={() => setShowMap(false)}
            className="p-3 bg-white shadow-lg rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRight 
              className="h-6 w-6 text-[#1e3a8a] dark:text-[#60A5FA] rotate-180"
            />
          </button>
        </div>
      </div>
    );
  }

  if (showWeather) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900">
        <div className="h-[calc(100vh-88px)] overflow-y-auto">
          <WeatherWidgetFullscreen />
        </div>
        <div className="fixed bottom-24 right-4 z-[9999]">
          <button
            onClick={() => setShowWeather(false)}
            className="p-3 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRight 
              className="h-6 w-6 text-[#1e3a8a] dark:text-[#60A5FA] rotate-180"
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="giftCardSection overflow-y-auto pb-24" 
      style={{
        height: 'calc(100vh - 88px)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none'
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
        className="bg-rose-800 dark:bg-rose-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
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
            Bari
          </h1>
          <p className="text-gray-100 text-lg mb-8">
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

      <div className="container mx-auto px-4 py-8">
        {/* Upcoming Events Section */}
        <section className="mb-12">
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl font-bold text-rose-800 dark:text-rose-400 mb-6"
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
            className="text-2xl font-bold text-rose-800 dark:text-rose-400 mb-6 text-center"
          >
            Explore the City
          </motion.h2>
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
