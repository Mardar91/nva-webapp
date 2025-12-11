import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  MapPin,
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
  Compass,
  Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import * as cheerio from 'cheerio';
import WeatherWidgetFullscreen from '../components/WeatherWidgetFullscreen';

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
          className="fixed top-4 right-16 z-50 bg-rose-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
        >
          <span className="text-sm font-medium whitespace-nowrap">{t('explore.goToNextCity')}</span>
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

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (now >= start && now <= end) return 'today';
    if (start.getTime() === tomorrow.getTime()) return 'tomorrow';
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
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3">
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
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentEventType === 'today' ? 'bg-white' : 'bg-white'}`}></span>
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
              {t('common.moreInfo')}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// City config for gradients and colors
const cityConfig: Record<string, { gradient: string; border: string; iconBg: string }> = {
  "Mola di Bari": {
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-300 dark:border-blue-700",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  "Polignano a Mare": {
    gradient: "from-cyan-500 to-teal-600",
    border: "border-cyan-300 dark:border-cyan-700",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  "Monopoli": {
    gradient: "from-amber-500 to-orange-600",
    border: "border-amber-300 dark:border-amber-700",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
  },
  "Bari": {
    gradient: "from-rose-500 to-rose-700",
    border: "border-rose-300 dark:border-rose-700",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
  },
};

const CityButton: React.FC<{
  city: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
}> = ({ city, icon, onClick, delay }) => {
  const { t } = useTranslation();
  const config = cityConfig[city] || cityConfig["Mola di Bari"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="w-full"
    >
      <button
        onClick={onClick}
        className={`w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 ${config.border} hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
      >
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white">{icon}</span>
            </div>
            <span className="text-white font-bold">{city}</span>
          </div>
        </div>
        {/* Card Body */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400 text-sm">{t('explore.discoverCity')}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
      </button>
    </motion.div>
  );
};
// Note Card component con nuovo sistema di swipe-to-delete
const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void }> = ({ note, onDelete }) => {
  const { t } = useTranslation();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [dragX, setDragX] = useState(0);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.7}
      onDrag={(event, info) => {
        setDragX(info.point.x);
        if (info.offset.x < -50) {
          setShowDeleteButton(true);
        } else {
          setShowDeleteButton(false);
        }
      }}
      onDragEnd={(event, info) => {
        setDragX(0);
        if (info.offset.x > -50) {
          setShowDeleteButton(false);
        }
      }}
      className="relative"
      style={{ touchAction: 'pan-y' }}
    >
      <AnimatePresence>
        {showDeleteButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 text-white rounded-r-lg flex items-center justify-center gap-2"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-5 w-5" />
            {t('common.delete')}
          </motion.button>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ x: showDeleteButton ? -96 : 0 }}
        transition={{ type: "spring", damping: 20 }}
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
    </motion.div>
  );
};

// Notes Dialog Content Component (extracted for reuse)
const NotesDialogContent: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="space-y-4">
      <div>
        <Input
          placeholder={t('explore.noteTitle')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder={t('explore.writeNoteHere')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={saveNote}
          className="mt-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
        >
          {t('explore.saveNote')}
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
  );
};

// Notes Dialog Component (kept for backward compatibility)
const NotesDialog: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <PenLine size={24} className="text-[#60A5FA] mb-1" />
          <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">{t('explore.notes')}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('explore.travelNotes')}</DialogTitle>
          <DialogDescription>{t('explore.addManageNotes')}</DialogDescription>
        </DialogHeader>
        <NotesDialogContent />
      </DialogContent>
    </Dialog>
  );
};

// Currency data
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

// Currency Dialog Content Component (extracted for reuse)
const CurrencyDialogContent: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<string>('');

  const convert = useCallback(() => {
    const rate = rates[fromCurrency][toCurrency];
    const calculated = (parseFloat(amount) * rate).toFixed(2);
    setResult(calculated);
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    convert();
  }, [convert]);

  return (
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
          className="w-full p-2 rounded-md border dark:bg-gray-800 dark:border-gray-700"
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
          className="w-full p-2 rounded-md border dark:bg-gray-800 dark:border-gray-700"
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
  );
};

// Currency Converter Component (kept for backward compatibility)
const CurrencyConverter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <DollarSign size={24} className="text-[#60A5FA] mb-1" />
          <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">{t('explore.currency')}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('explore.currencyConverter')}</DialogTitle>
          <DialogDescription>{t('explore.convertCurrencies')}</DialogDescription>
        </DialogHeader>
        <CurrencyDialogContent />
      </DialogContent>
    </Dialog>
  );
};


const WeatherWidget: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <Cloud size={24} className="text-[#60A5FA] mb-1" />
      <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">{t('explore.weather')}</span>
    </Button>
  );
};


const Explore: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollToRef = useRef<HTMLDivElement>(null);
  const [showMap, setShowMap] = useState(false);
    const [showWeather, setShowWeather] = useState(false); // Aggiungi questa riga
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/index.php?md=Gateway&az=setDintorni&val=20')}`);
        
        // Aspetta che il filtro sia applicato
        await new Promise(resolve => setTimeout(resolve, 500));
      
            const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/mola-di-bari/')}`);
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
    let location = 'Sconosciuta';
    for (const city of knownCities) {
        if (locationElement.includes(city)) {
            location = city;
            break;
        }
    }

                let startDate: Date | undefined;

                const singleDateMatch = dateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
                const rangeDateMatch = dateText.match(/dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);

                if (singleDateMatch) {
                    const day = parseInt(singleDateMatch[1]);
                    const monthStr = singleDateMatch[2].toLowerCase();
                    const year = parseInt(singleDateMatch[3]);
                    
                    if (monthsIT.hasOwnProperty(monthStr)) {
                        startDate = new Date(year, monthsIT[monthStr], day);
                    }
                } else if (rangeDateMatch) {
                    const day = parseInt(rangeDateMatch[1]);
                    const monthStr = rangeDateMatch[3].toLowerCase();
                    const year = parseInt(rangeDateMatch[4]);
                    
                    if (monthsIT.hasOwnProperty(monthStr)) {
                        startDate = new Date(year, monthsIT[monthStr], day);
                    }
                }
                
                   if (title && startDate && !isNaN(startDate.getTime())) {
                    extractedEvents.push({
                        id: Date.now().toString() + Math.random().toString(),
                        title,
                        startDate,
                        city: location,
                        description,
                        link
                    });
                }
            });
            extractedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const futureEvents = extractedEvents.filter(event => {
                const eventDate = new Date(event.startDate);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= now;
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
    return () => clearInterval(intervalId);
    }, [fetchEvents]);
  
  const cities = [
    { name: 'Mola di Bari', path: '/cities/mola-di-bari', icon: <Building2 size={32} /> },
    { name: 'Polignano a Mare', path: '/cities/polignano-a-mare', icon: <TreePalm size={32} /> },
    { name: 'Monopoli', path: '/cities/monopoli', icon: <Ship size={32} /> },
    { name: 'Bari', path: '/cities/bari', icon: <Church size={32} /> }
  ];

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
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
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

      {/* Modern Hero Section */}
      <div
        className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-hidden"
        style={{
          marginBottom: '1.5rem'
        }}
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1932&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-indigo-900/70 to-purple-900/80" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center max-w-3xl mx-auto px-5 py-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Compass className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">{t('explore.adventureStarts')}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {t('explore.title')}
          </h1>
          <p className="text-white/80 text-base mb-6">
            {t('explore.subtitle')}
          </p>
          <button
            onClick={() => scrollToRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="shimmer-button inline-flex items-center gap-2 bg-white text-blue-900 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
          >
            <Building2 className="h-5 w-5" />
            {t('explore.goToCities')}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('explore.upcomingEvents')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('explore.whatsHappening')}</p>
            </div>
          </div>

          {loading && <p className="text-gray-600 dark:text-gray-400 mb-4">{t('explore.loadingEvents')}</p>}
          {error && <p className="text-red-600 mb-4">{t('common.error')}: {error}</p>}
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Cities Section */}
        <section ref={scrollToRef} className="mb-8">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('explore.citiesToExplore')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('explore.discoverPuglia')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {cities.map((city, index) => (
              <CityButton
                key={city.name}
                city={city.name}
                icon={city.icon}
                onClick={() => navigate(city.path)}
                delay={0.1 * index}
              />
            ))}
          </div>
        </section>

{/* Utilities Section */}
<section className="mb-8">
  {/* Section Header */}
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
      <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('explore.utilities')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('explore.usefulTools')}</p>
    </div>
  </div>

  <div className="grid grid-cols-4 gap-3">
    {/* Notes */}
    <div className="group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-300 dark:border-purple-700 p-3 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-500 dark:group-hover:bg-purple-500 flex items-center justify-center mb-1 transition-colors">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full h-full flex items-center justify-center">
                <PenLine className="h-5 w-5 text-purple-500 dark:text-purple-400 group-hover:text-white transition-colors" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('explore.travelNotes')}</DialogTitle>
                <DialogDescription>{t('explore.addManageNotes')}</DialogDescription>
              </DialogHeader>
              <NotesDialogContent />
            </DialogContent>
          </Dialog>
        </div>
        <span className="text-purple-700 dark:text-purple-400 text-xs font-medium">{t('explore.notes')}</span>
      </div>
    </div>

    {/* Maps */}
    <button
      onClick={() => setShowMap(true)}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-blue-300 dark:border-blue-700 p-3 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-500 dark:group-hover:bg-blue-500 flex items-center justify-center mb-1 transition-colors">
        <Map className="h-5 w-5 text-blue-500 dark:text-blue-400 group-hover:text-white transition-colors" />
      </div>
      <span className="text-blue-700 dark:text-blue-400 text-xs font-medium">{t('explore.maps')}</span>
    </button>

    {/* Currency */}
    <div className="group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-green-300 dark:border-green-700 p-3 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95">
        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 group-hover:bg-green-500 dark:group-hover:bg-green-500 flex items-center justify-center mb-1 transition-colors">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full h-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500 dark:text-green-400 group-hover:text-white transition-colors" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('explore.currencyConverter')}</DialogTitle>
                <DialogDescription>{t('explore.convertCurrencies')}</DialogDescription>
              </DialogHeader>
              <CurrencyDialogContent />
            </DialogContent>
          </Dialog>
        </div>
        <span className="text-green-700 dark:text-green-400 text-xs font-medium">{t('explore.currency')}</span>
      </div>
    </div>

    {/* Weather */}
    <button
      onClick={() => setShowWeather(true)}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-cyan-300 dark:border-cyan-700 p-3 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-500 flex items-center justify-center mb-1 transition-colors">
        <Cloud className="h-5 w-5 text-cyan-500 dark:text-cyan-400 group-hover:text-white transition-colors" />
      </div>
      <span className="text-cyan-700 dark:text-cyan-400 text-xs font-medium">{t('explore.weather')}</span>
    </button>
  </div>
</section>
      </div>
    </div>
  );
};

export default Explore;
