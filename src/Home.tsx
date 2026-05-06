import { useState, useEffect } from 'react';
import { Terminal, MapPin, Mail, Twitter, Linkedin, Send, Clock, Users, CalendarPlus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function App() {
  type TimeLeft = { days: number, hours: number, minutes: number, seconds: number };
  type EventState = { isHappeningNow: boolean; isNext: boolean; timeLeft: TimeLeft | null };

  const [wedState, setWedState] = useState<EventState | null>(null);
  const [friState, setFriState] = useState<EventState | null>(null);
  const [isWednesdayToday, setIsWednesdayToday] = useState(false);
  const [isFridayToday, setIsFridayToday] = useState(false);

  // RSVP State (Fallback to localStorage)
  const [rsvps, setRsvps] = useState<{wed: number, fri: number}>({ wed: 12, fri: 8 });
  const [hasRsvpd, setHasRsvpd] = useState<{wed: boolean, fri: boolean}>({ wed: false, fri: false });

  useEffect(() => {
    // Load RSVPs from local storage if available
    const savedRsvps = localStorage.getItem('vibes-rsvps');
    const savedHasRsvpd = localStorage.getItem('vibes-has-rsvpd');
    
    if (savedRsvps) {
      setRsvps(JSON.parse(savedRsvps));
    }
    if (savedHasRsvpd) {
      setHasRsvpd(JSON.parse(savedHasRsvpd));
    }
  }, []);

  const handleRsvp = (event: 'wed' | 'fri') => {
    if (hasRsvpd[event]) return; // Already RSVP'd

    const newRsvps = { ...rsvps, [event]: rsvps[event] + 1 };
    const newHasRsvpd = { ...hasRsvpd, [event]: true };
    
    setRsvps(newRsvps);
    setHasRsvpd(newHasRsvpd);
    
    localStorage.setItem('vibes-rsvps', JSON.stringify(newRsvps));
    localStorage.setItem('vibes-has-rsvpd', JSON.stringify(newHasRsvpd));

    const dayName = event === 'wed' ? 'Wednesday' : 'Friday';
    toast.success("RSVP Confirmed! ✨", {
      description: `See you on ${dayName}.`,
    });
  };

  const handleCalendar = (type: 'wed' | 'fri') => {
    const text = type === 'wed' ? "GameHaven Herriman" : "WoodBine game night";
    const dates = type === 'wed' ? "20240508T160000/20240508T200000" : "20240510T160000/20240510T180000";
    const ctz = "America/Denver";
    const recur = `RRULE:FREQ=WEEKLY;BYDAY=${type === 'wed' ? 'WE' : 'FR'}`;
    const location = type === 'wed' ? "5254 Anthem Peak Ln, Herriman, UT 84096" : "545 West 700 S, Salt Lake City, UT 84101";
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${dates}&ctz=${ctz}&recur=${encodeURIComponent(recur)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  const handleShare = async (type: 'wed' | 'fri') => {
    const text = type === 'wed' ? "Join the next Wednesday session at GameHaven Herriman! ⚡️" : "Join the next Friday session at WoodBine in SLC! ⚡️";
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VIBES & HIGHS',
          text: text,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  useEffect(() => {
    const computeEventState = (mtDate: Date, targetDayOfWeek: number, startHour: number, endHour: number) => {
      const mtYear = mtDate.getFullYear();
      const mtMonth = mtDate.getMonth();
      const mtDay = mtDate.getDate();
      const mtHour = mtDate.getHours();
      const currentDayOfWeek = mtDate.getDay();

      let targetDayOffset = 0;
      let isHappeningNow = false;

      if (currentDayOfWeek === targetDayOfWeek) {
        if (mtHour >= startHour && mtHour < endHour) {
          isHappeningNow = true;
          targetDayOffset = 0;
        } else if (mtHour < startHour) {
          targetDayOffset = 0;
        } else {
          targetDayOffset = 7;
        }
      } else {
        targetDayOffset = targetDayOfWeek - currentDayOfWeek;
        if (targetDayOffset < 0) targetDayOffset += 7;
      }

      const targetMtDate = new Date(mtYear, mtMonth, mtDay + targetDayOffset, startHour, 0, 0);
      const diffMs = targetMtDate.getTime() - mtDate.getTime();
      let timeLeft = null;
      if (diffMs > 0 && !isHappeningNow) {
        timeLeft = {
          days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diffMs / 1000 / 60) % 60),
          seconds: Math.floor((diffMs / 1000) % 60)
        };
      }
      return { isHappeningNow, diffMs: isHappeningNow ? 0 : diffMs, timeLeft };
    };

    const calculateTimeLeft = () => {
      const now = new Date();
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Denver',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hourCycle: 'h23'
      });
      
      const parts = formatter.formatToParts(now);
      const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
      
      const mtDate = new Date(getPart('year'), getPart('month') - 1, getPart('day'), getPart('hour'), getPart('minute'), getPart('second'));
      
      setIsWednesdayToday(mtDate.getDay() === 3);
      setIsFridayToday(mtDate.getDay() === 5);
      
      const wedInfo = computeEventState(mtDate, 3, 16, 20); // Wed 4-8 PM
      const friInfo = computeEventState(mtDate, 5, 16, 18); // Fri 4-6 PM
      
      const isWedNext = wedInfo.isHappeningNow || (!friInfo.isHappeningNow && wedInfo.diffMs < friInfo.diffMs);
      
      setWedState({
        isHappeningNow: wedInfo.isHappeningNow,
        isNext: isWedNext,
        timeLeft: wedInfo.timeLeft
      });
      
      setFriState({
        isHappeningNow: friInfo.isHappeningNow,
        isNext: !isWedNext,
        timeLeft: friInfo.timeLeft
      });
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderCountdown = (state: EventState | null) => {
    if (!state) return null;
    
    if (state.isHappeningNow) {
      return (
        <div className="flex items-center gap-2 mt-4 text-primary font-bold font-mono text-[10px] uppercase tracking-widest animate-pulse border border-primary/30 bg-primary/10 px-3 py-1.5 w-max" role="status">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true"></div>
          Happening Now
        </div>
      );
    }
    
    if (!state.timeLeft) return null;
    const { timeLeft } = state;
    
    return (
      <div className="mt-4 flex gap-4 font-mono items-center">
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          Starts in {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes} minutes, and {timeLeft.seconds} seconds.
        </span>
        <div className="flex items-center gap-2 text-white/70 text-[10px] uppercase tracking-widest font-bold" aria-hidden="true">
          <Clock size={12} className="text-primary" /> Starts in
        </div>
        <div className="flex gap-2 text-white" aria-hidden="true">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black tabular-nums leading-none">{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/60 mt-1">D</span>
          </div>
          <div className="text-lg opacity-40 -mt-2">:</div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black tabular-nums leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/60 mt-1">H</span>
          </div>
          <div className="text-lg opacity-40 -mt-2">:</div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black tabular-nums leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/60 mt-1">M</span>
          </div>
          <div className="text-lg opacity-40 -mt-2">:</div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black tabular-nums leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/60 mt-1">S</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      
      {/* Background Graphic Watermark */}
      <div className="fixed top-0 right-0 w-1/3 h-screen border-l border-white/10 flex items-center justify-center pointer-events-none z-0 hidden lg:flex">
        <span className="rotate-90 text-[140px] font-black text-white/5 tracking-tighter select-none whitespace-nowrap">COLLECTIVE_INPUT</span>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-20">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=3540&auto=format&fit=crop" 
            alt="Hero background"
            className="w-full h-full object-cover blur-sm"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-transparent to-[#0A0A0B]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start gap-4">
          <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">VIBES &AMP; HIGHS / ✨</div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display font-black text-[15vw] sm:text-[10vw] md:text-[9rem] leading-[0.8] tracking-tighter"
          >
            VIBES<br/>
            <span className="font-serif italic font-light pr-4 text-primary">&amp; Highs</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-white/80 text-xl md:text-2xl font-light leading-tight max-w-2xl mt-4"
          >
            A casual meetup for people who make weird things. Code. Art. Music. Games. Videos. AI experiments. Internet projects. Half-finished ideas. Side quests.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-4 flex flex-wrap gap-4"
          >
           <a href="https://discord.gg/ua5UUXZTyz" target="_blank" rel="noreferrer">
              <Button className="bg-white text-black hover:bg-primary font-bold uppercase tracking-widest text-[10px] h-12 px-8 transition-colors">
                Join the Discord
              </Button>
            </a>
            <a href="https://www.twitch.tv/eggwens" target="_blank" rel="noreferrer">
              <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] h-12 px-8 transition-colors">
                Watch Livestream
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden border-y border-white/5 bg-black/50 backdrop-blur-sm py-3 font-mono text-xs text-white/40 uppercase tracking-widest whitespace-nowrap">
          <div className="animate-[marquee_20s_linear_infinite] flex gap-12">
            <span>&gt; Cursor</span>
            <span>&gt; React</span>
            <span>&gt; AI Studio</span>
            <span>&gt; Tailwind</span>
            <span>&gt; Coffee</span>
            <span>&gt; Lofi</span>
            <span>&gt; Next.js</span>
            <span>&gt; Postgres</span>
            <span>&gt; Cursor</span>
            <span>&gt; React</span>
            <span>&gt; AI Studio</span>
            <span>&gt; Tailwind</span>
            <span>&gt; Coffee</span>
            <span>&gt; Lofi</span>
            <span>&gt; Next.js</span>
            <span>&gt; Postgres</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-32 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display font-black text-5xl sm:text-7xl tracking-tighter leading-none mb-8">
            WHAT IS<br/> <span className="font-serif italic font-light opacity-50">Vibes &amp; Highs</span>?
          </h2>
          <div className="space-y-6 text-white/70 font-sans leading-relaxed text-lg">
            <p>
              No pitch decks. No panels. No startup theater.
            </p>
            <p>
              Just people hanging out and creating together. Whether you’re an engineer, an artist, a musician, a designer, a student, a hobbyist, or just internet-pilled enough to make strange things at 2am, you’re invited.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="text-[60px] absolute -bottom-4 -right-2 font-black opacity-10">01</div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">You're invited</span>
                <span className="font-medium text-sm">Engineers, artists, musicians, designers.</span>
              </div>
              <div className="bg-white/5 p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="text-[60px] absolute -bottom-4 -right-2 font-black opacity-10">02</div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">Bring It</span>
                <span className="font-medium text-sm">Laptops, sketchbooks, cursed demos.</span>
              </div>
              <div className="bg-white/5 p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="text-[60px] absolute -bottom-4 -right-2 font-black opacity-10">03</div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">Expect</span>
                <span className="font-medium text-sm">Live vibecoding &amp; chaotic energy.</span>
              </div>
              <div className="bg-white/5 p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="text-[60px] absolute -bottom-4 -right-2 font-black opacity-10">04</div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">The Rule</span>
                <span className="font-medium text-sm text-white/50">If your project crashes: <span className="text-primary font-bold text-white">perfect. 💀</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-[4/3] overflow-hidden border border-white/10">
           <img 
            src="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=3540&auto=format&fit=crop" 
            alt="Abstract coding graphic"
            className="w-full h-full object-cover filter contrast-125 saturate-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="relative z-10 py-24 bg-[#0A0A0B] border-t border-white/10" aria-labelledby="schedule-heading">
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-t border-primary pt-4 flex flex-col md:flex-row md:items-start justify-between mb-16 gap-6">
            <div>
              <div className="text-[10px] uppercase text-white/70 tracking-[0.2em] font-bold mb-2" aria-hidden="true">Weekly</div>
              <h2 id="schedule-heading" className="font-serif italic text-4xl sm:text-5xl tracking-tight text-white focus:outline-none" tabIndex={-1}>
                Schedule
              </h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-white/70 tracking-[0.2em] font-bold mb-2" aria-hidden="true">Salt Lake Valley</div>
              <p className="font-mono text-xl text-white/90">
                Wednesdays &amp; Fridays
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Session Card 1 */}
            <Card className={`group ${wedState?.isNext ? 'bg-primary/5 border-primary shadow-[0_0_30px_rgba(0,255,102,0.15)] ring-1 ring-primary/50' : 'bg-white/5 border-white/10'} hover:border-primary/50 transition-all p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden rounded-none`} aria-labelledby="wednesday-event">
              {wedState?.isNext && (
                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 z-20" aria-hidden="true">
                  {isWednesdayToday ? "Happening Today" : "Next Up"}
                </div>
              )}
              <div className="text-[120px] absolute -bottom-8 -right-4 font-black opacity-5 pointer-events-none leading-none tracking-tighter" aria-hidden="true">WED</div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-10 w-full">
                <div className="w-full lg:w-56 h-48 lg:h-auto lg:self-stretch shrink-0 rounded border border-white/10 overflow-hidden relative group/img">
                  <img src="https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&q=80&w=800" alt="Creative coding session" className="w-full h-full object-cover absolute inset-0 opacity-60 grayscale-[0.5] group-hover/img:opacity-100 group-hover/img:grayscale-0 group-hover/img:scale-105 transition-all duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-80"></div>
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover/img:opacity-0 transition-opacity duration-700 z-10"></div>
                </div>
                <div className="text-left font-mono shrink-0 md:min-w-32">
                  <span className="block text-primary text-[10px] uppercase font-bold tracking-widest" aria-hidden="true">Every Wednesday</span>
                  <span className="block text-3xl font-serif mt-1 text-white">4 PM</span>
                  <span className="block text-white/70 text-xs mt-1">to 8 PM MDT</span>
                </div>
                <Separator orientation="vertical" className="h-16 hidden md:block bg-white/20" />
                <Separator orientation="horizontal" className="w-full md:hidden bg-white/20" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Herriman</div>
                  <h3 id="wednesday-event" className="font-display font-medium text-2xl mb-1 group-hover:text-primary transition-colors tracking-tight text-white">GameHaven Herriman</h3>
                  <p className="text-white/70 text-sm font-sans flex items-start sm:items-center gap-2 mt-2">
                    <MapPin size={14} className="shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" /> 5254 Anthem Peak Ln, Herriman, UT 84096
                  </p>
                  <div className="mt-4 mb-4 rounded border border-white/10 overflow-hidden relative max-w-[280px] w-full grayscale-[0.8] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 ring-1 ring-white/5 group-hover:ring-primary/20">
                    <iframe 
                      src="https://maps.google.com/maps?q=5254%20Anthem%20Peak%20Ln,%20Herriman,%20UT%2084096&t=m&z=13&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="120" 
                      style={{ border: 0, display: 'block' }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Map of GameHaven Herriman"
                    ></iframe>
                  </div>
                  {renderCountdown(wedState)}
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => handleRsvp('wed')}
                      disabled={hasRsvpd.wed}
                      className={`relative z-10 font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-colors w-full md:w-64 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] ${
                        hasRsvpd.wed 
                          ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/10 cursor-not-allowed' 
                          : 'bg-white border-white text-black hover:bg-primary hover:border-primary'
                      }`}
                      aria-label={hasRsvpd.wed ? "You have RSVP'd for Wednesday" : "RSVP for Wednesday at Herriman"}
                    >
                      {hasRsvpd.wed ? "✓ RSVP'd" : "RSVP"}
                    </Button>
                    <div className="grid grid-cols-3 gap-2 w-full md:w-64">
                      <Button 
                        onClick={() => handleCalendar('wed')} 
                        variant="outline" 
                        className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[9px] h-10 px-0 transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]" 
                        aria-label="Add Wednesday event to calendar"
                      >
                        <CalendarPlus size={12} className="mr-1.5" aria-hidden="true" /> Add
                      </Button>
                      <Button 
                        onClick={() => handleShare('wed')} 
                        variant="outline" 
                        className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[9px] h-10 px-0 transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]" 
                        aria-label="Share Wednesday event"
                      >
                        <Share2 size={12} className="mr-1.5" aria-hidden="true" /> Share
                      </Button>
                      <a href="https://discord.gg/ua5UUXZTyz" target="_blank" rel="noreferrer" className="w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]" aria-label="Join our Discord community for Herriman updates">
                        <Button tabIndex={-1} variant="outline" className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[9px] h-10 px-0 transition-colors w-full">
                          Discord
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest uppercase">
                    <Users size={12} className={hasRsvpd.wed ? "text-primary" : "text-white/40"} /> 
                    <span className={hasRsvpd.wed ? "text-primary font-bold" : "text-white/40"}>{rsvps.wed} Attending</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Session Card 2 */}
            <Card className={`group ${friState?.isNext ? 'bg-primary/5 border-primary shadow-[0_0_30px_rgba(0,255,102,0.15)] ring-1 ring-primary/50' : 'bg-white/5 border-white/10'} hover:border-primary/50 transition-all p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden rounded-none`} aria-labelledby="friday-event">
              {friState?.isNext && (
                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 z-20" aria-hidden="true">
                  {isFridayToday ? "Happening Today" : "Next Up"}
                </div>
              )}
              <div className="text-[120px] absolute -bottom-8 -right-4 font-black opacity-5 pointer-events-none leading-none tracking-tighter" aria-hidden="true">FRI</div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-10 w-full">
                <div className="w-full lg:w-56 h-48 lg:h-auto lg:self-stretch shrink-0 rounded border border-white/10 overflow-hidden relative group/img">
                  <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800" alt="Downtown creative jam session" className="w-full h-full object-cover absolute inset-0 opacity-60 grayscale-[0.5] group-hover/img:opacity-100 group-hover/img:grayscale-0 group-hover/img:scale-105 transition-all duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-80"></div>
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover/img:opacity-0 transition-opacity duration-700 z-10"></div>
                </div>
                <div className="text-left font-mono shrink-0 md:min-w-32">
                  <span className="block text-primary text-[10px] uppercase font-bold tracking-widest" aria-hidden="true">Every Friday</span>
                  <span className="block text-3xl font-serif mt-1 text-white">4 PM</span>
                  <span className="block text-white/70 text-xs mt-1">to 6 PM MDT</span>
                </div>
                <Separator orientation="vertical" className="h-16 hidden md:block bg-white/20" />
                <Separator orientation="horizontal" className="w-full md:hidden bg-white/20" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Salt Lake City</div>
                  <h3 id="friday-event" className="font-display font-medium text-2xl mb-1 group-hover:text-primary transition-colors tracking-tight text-white">WoodBine</h3>
                  <p className="text-white/70 text-sm font-sans flex items-start sm:items-center gap-2 mt-2">
                    <MapPin size={14} className="shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" /> 545 West 700 S, Salt Lake City, UT 84101
                  </p>
                  <div className="mt-4 mb-4 rounded border border-white/10 overflow-hidden relative max-w-[280px] w-full grayscale-[0.8] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 ring-1 ring-white/5 group-hover:ring-primary/20">
                    <iframe 
                      src="https://maps.google.com/maps?q=545%20West%20700%20S,%20Salt%20Lake%20City,%20UT%2084101&t=m&z=14&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="120" 
                      style={{ border: 0, display: 'block' }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Map of WoodBine"
                    ></iframe>
                  </div>
                  {renderCountdown(friState)}
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => handleRsvp('fri')}
                      disabled={hasRsvpd.fri}
                      className={`relative z-10 font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-colors w-full md:w-64 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] ${
                        hasRsvpd.fri 
                          ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/10 cursor-not-allowed' 
                          : 'bg-white border-white text-black hover:bg-primary hover:border-primary'
                      }`}
                      aria-label={hasRsvpd.fri ? "You have RSVP'd for Friday" : "RSVP for Friday at WoodBine"}
                    >
                      {hasRsvpd.fri ? "✓ RSVP'd" : "RSVP"}
                    </Button>
                    <div className="grid grid-cols-3 gap-2 w-full md:w-64">
                      <Button 
                        onClick={() => handleCalendar('fri')} 
                        variant="outline" 
                        className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[9px] h-10 px-0 transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]" 
                        aria-label="Add Friday event to calendar"
                      >
                        <CalendarPlus size={12} className="mr-1.5" aria-hidden="true" /> Add
                      </Button>
                      <Button 
                        onClick={() => handleShare('fri')} 
                        variant="outline" 
                        className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[9px] h-10 px-0 transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]" 
                        aria-label="Share Friday event"
                      >
                        <Share2 size={12} className="mr-1.5" aria-hidden="true" /> Share
                      </Button>
                      <a href="https://discord.gg/ua5UUXZTyz" target="_blank" rel="noreferrer" className="w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]" aria-label="Join our Discord community for Salt Lake City updates">
                        <Button tabIndex={-1} variant="outline" className="relative z-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[9px] h-10 px-0 transition-colors w-full">
                          Discord
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest uppercase">
                    <Users size={12} className={hasRsvpd.fri ? "text-primary" : "text-white/40"} /> 
                    <span className={hasRsvpd.fri ? "text-primary font-bold" : "text-white/40"}>{rsvps.fri} Attending</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Location / CTA Footer */}
      <section id="location" className="relative z-10 py-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="h-1 w-12 bg-primary mb-12"></div>
        <h2 className="font-display font-black text-6xl sm:text-8xl tracking-tighter mb-6 leading-none">
          BUILD WEIRD<br/> <span className="font-serif italic font-light text-white/50">Things.</span>
        </h2>
        <p className="text-white/80 font-light max-w-lg mb-12 text-xl">
          Meet interesting people. Internet energy IRL. ✨ Join the discord to find out when and where we're hanging out next.
        </p>
        
        <a href="https://discord.gg/ua5UUXZTyz" target="_blank" rel="noreferrer">
          <Button className="bg-white text-black hover:bg-primary font-bold uppercase tracking-widest text-[10px] h-16 px-12 transition-colors">
            Join the Discord
          </Button>
        </a>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="h-1 w-12 bg-primary mb-8"></div>
            <h2 className="font-display font-black text-5xl sm:text-7xl tracking-tighter mb-6 leading-none">
              REACH<br/> <span className="font-serif italic font-light text-white/50">Out.</span>
            </h2>
            <p className="text-white/70 font-light max-w-md mb-12 text-lg">
              Have questions, want to collaborate, or just saying hi? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <a href="mailto:willcruzdesigner@gmail.com" className="flex items-center gap-4 text-white hover:text-primary transition-colors group">
                <div className="w-12 h-12 rounded-none border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">Email</div>
                  <div className="font-mono text-sm">willcruzdesigner@gmail.com</div>
                </div>
              </a>
              
              <a href="https://x.com/goldeneggie" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-white hover:text-primary transition-colors group">
                <div className="w-12 h-12 rounded-none border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Twitter size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">X (Twitter)</div>
                  <div className="font-mono text-sm">@goldeneggie</div>
                </div>
              </a>
              
              <a href="https://www.linkedin.com/in/william-cruz-018694290/" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-white hover:text-primary transition-colors group">
                <div className="w-12 h-12 rounded-none border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Linkedin size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">LinkedIn</div>
                  <div className="font-mono text-sm">William Cruz</div>
                </div>
              </a>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 relative overflow-hidden">
            <div className="text-[120px] absolute -bottom-8 -right-4 font-black opacity-5 pointer-events-none leading-none tracking-tighter">@</div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-8">Send a Message</div>
            <form className="relative z-10 flex flex-col gap-6" onSubmit={async (e) => { 
              e.preventDefault(); 
              const form = e.currentTarget;
              const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
              const originalText = btn.innerHTML;
              
              btn.disabled = true;
              btn.innerHTML = 'Sending...';

              const formData = new FormData(form);
              const data = Object.fromEntries(formData.entries());

              try {
                const response = await fetch("https://formsubmit.co/ajax/willcruzdesigner@gmail.com", {
                  method: "POST",
                  headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                      name: data.name,
                      email: data.email,
                      message: data.message,
                      _subject: "New Message from VIBES & HIGHS",
                  })
                });
                
                const result = await response.json();
                
                if (result.success || response.ok) {
                  toast.success("Message sent successfully! ✨", {
                    description: "We'll be in touch soon.",
                  });
                  form.reset();
                } else {
                  throw new Error(result.message || "Something went wrong.");
                }
              } catch (error) {
                console.error(error);
                toast.error("Failed to send message.", {
                  description: "Please try again later or reach out on Discord.",
                });
              } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
              }
            }}>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Name</label>
                <Input id="name" name="name" required placeholder="John Doe" className="bg-[#0A0A0B] border-white/20 text-white font-mono placeholder:text-white/30 h-12 focus-visible:ring-primary rounded-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Email</label>
                <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-[#0A0A0B] border-white/20 text-white font-mono placeholder:text-white/30 h-12 focus-visible:ring-primary rounded-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Message</label>
                <Textarea id="message" name="message" required placeholder="What's going on?" className="bg-[#0A0A0B] border-white/20 text-white font-mono placeholder:text-white/30 min-h-[120px] focus-visible:ring-primary rounded-none resize-none" />
              </div>
              <Button type="submit" className="bg-white text-black hover:bg-primary font-bold uppercase tracking-widest text-[10px] h-12 transition-colors w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Send Message <Send className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

    </>
  );
}

