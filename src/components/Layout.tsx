import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F0F0F0] selection:bg-primary selection:text-black relative overflow-x-hidden font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#0A0A0B]/80 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Terminal size={24} />
          <span className="font-display font-black text-xl tracking-tighter text-white">VIBES<span className="text-primary">&amp;</span>HIGHS</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/60">
          <a href="/#about" className="hover:text-primary transition-colors">01. ABOUT</a>
          <a href="/#schedule" className="hover:text-primary transition-colors">02. SCHEDULE</a>
          <a href="/#location" className="hover:text-primary transition-colors">03. JOIN</a>
          <a href="/#contact" className="hover:text-primary transition-colors">04. CONTACT</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.twitch.tv/eggwens" target="_blank" rel="noreferrer" className="hidden sm:block">
            <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-colors">
              Twitch
            </Button>
          </a>
          <a href="https://discord.gg/ua5UUXZTyz" target="_blank" rel="noreferrer">
            <Button className="bg-white text-black hover:bg-primary font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-colors">
              Discord
            </Button>
          </a>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>

      <footer className="relative z-10 pt-24 pb-12 px-6 border-t border-white/10 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 mb-16">
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="flex items-center gap-2 text-primary">
              <Terminal size={24} />
              <span className="font-display font-black text-xl tracking-tighter text-white">VIBES<span className="text-primary">&amp;</span>HIGHS</span>
            </div>
            <p className="text-white/60 text-sm font-sans">
              Meet interesting people. Internet energy IRL. Build weird things with a non-transactional, community-driven approach.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-2">Platform</h4>
              <a href="/#about" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">About</a>
              <a href="/#schedule" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Schedule</a>
              <a href="/#location" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Join</a>
              <a href="/#contact" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Contact</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-2">Connect</h4>
              <a href="https://discord.gg/ua5UUXZTyz" target="_blank" rel="noreferrer" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Discord</a>
              <a href="https://www.twitch.tv/eggwens" target="_blank" rel="noreferrer" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Twitch</a>
              <a href="https://x.com/goldeneggie" target="_blank" rel="noreferrer" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">X (Twitter)</a>
              <a href="https://www.linkedin.com/in/william-cruz-018694290/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">LinkedIn</a>
              <a href="mailto:willcruzdesigner@gmail.com" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Email Us</a>
            </div>
            <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-2">Legal</h4>
              <Link to="/privacy" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Privacy Policy</Link>
              <Link to="/terms" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Terms of Service</Link>
              <Link to="/conduct" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Code of Conduct</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-12 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <div>01 / Community Driven</div>
            <div>02 / Non-Transactional</div>
            <div>03 / Pure Output</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-primary"></div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">&copy; {new Date().getFullYear()} VIBES AND HIGHS — SYSTEM_ACTIVE</span>
          </div>
        </div>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
}
