import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
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
  Trash2
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
  description: string;
}

interface Attraction {
  name: string;
  icon: React.ReactNode;
  description?: string;
}

const CurrentEventBadge = () => (
  <div className="flex items-center gap-1.5 mt-2">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
    </span>
    <span className="text-xs font-medium text-green-600">Today</span>
  </div>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate);

  const isCurrentEvent = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const end = event.endDate ? new Date(event.endDate) : new Date(start);
    end.setHours(23, 59, 59, 999);
    
    return now >= start && now <= end;
  };

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
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-[#1e3a8a] dark:text-[#60A5FA]" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              {isCurrentEvent() && <CurrentEventBadge />}
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
// Note Card component con nuovo sistema di swipe-to-delete
const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void }> = ({ note, onDelete }) => {
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
            Delete
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

// Weather Widget Component corretto per occupare l'intero popup
const WeatherWidget: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <Cloud size={24} className="text-[#60A5FA] mb-1" />
          <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">Weather</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-full h-[90vh]">
        <iframe 
          src="https://www.meteoblue.com/it/tempo/widget/three?geoloc=detect&nocurrent=0&noforecast=0&days=4&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&layout=image"
          className="w-full h-full"
          style={{ border: 0 }}
          scrolling="no"
          allowTransparency={true}
          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
        />
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

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const scrollToRef = useRef<HTMLDivElement>(null);
  const [showMap, setShowMap] = useState(false);
  
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

  const events: Event[] = [
    {
      id: '1',
      title: 'La Sagra del Polpo',
      startDate: new Date(),
      city: 'Mola di Bari',
      description: 'Traditional octopus festival'
    },
    {
      id: '2',
      title: 'San Michele',
      startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      city: 'Polignano a Mare',
      description: 'Religious celebration'
    },
    {
      id: '3',
      title: 'La Festa del Mare',
      startDate: new Date(new Date().setDate(new Date().getDate() + 12)),
      city: 'Monopoli',
      description: 'Sea festival'
    },
    {
      id: '4',
      title: 'Giro in Ruota',
      startDate: new Date(new Date().setDate(new Date().getDate() + 31)),
      city: 'Bari',
      description: 'Ferris wheel event'
    }
  ];

  const cities = [
    { name: 'Mola di Bari', path: '/cities/mola-di-bari', icon: <Building2 size={32} /> },
    { name: 'Polignano a Mare', path: '/cities/polignano-a-mare', icon: <TreePalm size={32} /> },
    { name: 'Monopoli', path: '/cities/monopoli', icon: <Ship size={32} /> },
    { name: 'Bari', path: '/cities/bari', icon: <Church size={32} /> }
  ];

  if (showMap) {
    return (
      <div className="relative w-full h-[calc(100vh-88px)]">
        <button
          onClick={() => setShowMap(false)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
        >
          <ArrowLeft className="h-6 w-6 text-[#1e3a8a] dark:text-[#60A5FA]" />
        </button>
        <iframe 
          src="https://www.google.com/maps/d/u/0/embed?mid=1aayihxUbcOPi0X1t52-PFKrWfhRfyAs&ehbc=2E312F&noprof=1"
          className="w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
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

      <div 
        className="bg-[#1e3a8a] dark:bg-gray-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
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
          className="text-center max-w-3xl mx-auto px-4"
        >
          <h1 className="text-3xl font-bold mb-4">
            Explore Puglia
          </h1>
          <p className="text-gray-200 text-lg mb-8">
            Discover magnificent cultural cities and unforgettable events in the surroundings.
          </p>
          <Button 
            onClick={() => scrollToRef.current?.scrollIntoView({ behavior: 'smooth' })}
            variant="outline" 
            className="shimmer-button bg-transparent border-white text-white hover:bg-white hover:text-[#1e3a8a] transition-colors"
          >
            Go to Cities
          </Button>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <section className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] mb-6"
          >
            Upcoming Events
          </motion.h2>
          <div className="grid gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section ref={scrollToRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] mb-6 text-center"
          >
            Cities
          </motion.h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
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

        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] mb-6 text-center"
          >
            Utilities
          </motion.h2>
          <div className="flex justify-between items-center w-full max-w-md mx-auto px-4 gap-4">
            <NotesDialog />
            <button
              onClick={() => setShowMap(true)}
              className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Map size={24} className="text-[#60A5FA] mb-1" />
              <span className="text-[#1e3a8a] dark:text-[#60A5FA] text-xs">Maps</span>
            </button>
            <CurrencyConverter />
            <WeatherWidget />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;
