import React, { useState } from 'react';
import {
  Compass,
  Play,
  ArrowRight,
  Star,
  Leaf,
  ShieldCheck,
  Sparkles,
  Plane,
  Globe,
  Camera,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';

export function LandingPage({ onOpenApp }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 antialiased selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* SECTION 1 - NAVIGATION */}
      <nav className="fixed top-6 inset-x-0 z-50 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass-nav rounded-full px-5 sm:px-7 py-3.5 flex items-center justify-between shadow-2xl transition-all">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-neutral-950 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 text-neutral-950 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white group-hover:text-blue-300 transition-colors">
              Kigele Eco Safaris
            </span>
          </a>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-300 tracking-wide">
            <a href="#destinations" className="hover:text-white transition-colors duration-200">Destinations</a>
            <a href="#expeditions" className="hover:text-white transition-colors duration-200">Curated Safaris</a>
            <a href="#features" className="hover:text-white transition-colors duration-200">Eco-Journal</a>
            <a href="#membership" className="hover:text-white transition-colors duration-200">Membership</a>
            {/* Live AI Command Center link */}
            <button
              onClick={onOpenApp}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-all text-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Camera Trap AI
            </button>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenApp}
              className="bg-neutral-200 text-neutral-900 rounded-full px-5 py-2 text-xs font-medium hover:bg-white hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Start Planning
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 2 - HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-start gap-6">
            {/* Green Pulse Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-neutral-800 bg-neutral-900/60 text-neutral-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>New Season: Bwindi & Queen Elizabeth</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]">
              Curating the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400">
                Wilderness.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-neutral-400 text-lg font-light leading-relaxed max-w-lg">
              Carbon-negative expeditions crafted for intimate wildlife encounters. Experience Uganda’s pristine sanctuaries with primatologists and conservation wardens.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#expeditions"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-7 py-3.5 rounded-2xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                Explore Safaris
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="border border-white/20 hover:border-white/40 text-neutral-200 font-medium text-sm px-6 py-3.5 rounded-2xl hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Watch The Film
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-6 border-t border-neutral-900/80 w-full">
              <div className="flex -space-x-3 overflow-hidden">
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-neutral-950 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
                  alt="Guest Profile 1"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-neutral-950 object-cover"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64"
                  alt="Guest Profile 2"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-neutral-950 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64"
                  alt="Guest Profile 3"
                />
              </div>

              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-white stroke-none text-white" />
                  ))}
                  <span className="text-white text-xs font-semibold ml-1.5">4.9 / 5</span>
                </div>
                <p className="text-neutral-400 text-xs mt-0.5">
                  From 340+ conservation expeditions
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (col-span-7) */}
          <div className="lg:col-span-7 relative">
            {/* Grid Container with h-[600px] */}
            <div className="h-[480px] sm:h-[560px] md:h-[600px] grid grid-cols-2 grid-rows-2 gap-4 relative">
              {/* Hero Tall Image (Lion) - row-span-2 */}
              <div className="row-span-2 rounded-[2rem] overflow-hidden relative group shadow-2xl bg-neutral-900 border border-neutral-800/40">
                <img
                  src="https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1000&auto=format&fit=crop"
                  alt="Queen Elizabeth Lion Safari"
                  className="w-full h-full object-cover duration-700 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    Queen Elizabeth
                  </span>
                  <h3 className="text-white font-medium text-lg mt-1.5">Tree-Climbing Lions</h3>
                </div>
              </div>

              {/* Hero Top Right (Gorilla) */}
              <div className="rounded-[2rem] overflow-hidden relative group shadow-2xl bg-neutral-900 border border-neutral-800/40">
                <img
                  src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1000&auto=format&fit=crop"
                  alt="Bwindi Mountain Gorilla"
                  className="w-full h-full object-cover duration-700 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40">
                    Bwindi Sanctuary
                  </span>
                  <h3 className="text-white font-medium text-sm mt-1">Mountain Gorillas</h3>
                </div>
              </div>

              {/* Hero Bottom Right (Falls) */}
              <div className="rounded-[2rem] overflow-hidden relative group shadow-2xl bg-neutral-900 border border-neutral-800/40">
                <img
                  src="https://images.unsplash.com/photo-1547471080-7541e8856987?q=80&w=1000&auto=format&fit=crop"
                  alt="Murchison Falls National Park"
                  className="w-full h-full object-cover duration-700 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                    Murchison River
                  </span>
                  <h3 className="text-white font-medium text-sm mt-1">Savannah & Nile Falls</h3>
                </div>
              </div>

              {/* Floating Card: absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-20 */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-4 md:-right-10 z-20 glass-card rounded-2xl p-4 sm:p-5 shadow-2xl min-w-[210px] sm:min-w-[240px] border border-white/10">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Plane className="w-4 h-4 rotate-45" />
                    </div>
                    <span className="text-xs font-semibold text-white tracking-tight">Trip Summary</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>

                <p className="text-xs font-medium text-neutral-200">Gorilla Habituation Safari</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">8 Days · Entebbe to Bwindi</p>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">From</span>
                    <span className="text-sm font-bold text-white">$4,850</span>
                    <span className="text-[10px] text-neutral-400"> / guest</span>
                  </div>
                  <button
                    onClick={onOpenApp}
                    className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Permit
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Decorative Spinning Badge: absolute -bottom-10 -right-10 z-10 */}
              <div className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-10 z-10 w-28 h-28 pointer-events-none select-none">
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full animate-[spin_10s_linear_infinite]"
                  >
                    <path
                      id="heroTextPath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="none"
                    />
                    <text className="text-[8.5px] uppercase tracking-[2.5px] fill-neutral-400 font-medium">
                      <textPath href="#heroTextPath" startOffset="0%">
                        • KIGELE ECO SAFARIS • WILDLIFE EXPEDITIONS
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-white shadow-lg">
                    <Compass className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - BRANDS */}
      <section className="py-12 border-y border-neutral-900 bg-neutral-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[11px] uppercase tracking-[3px] text-neutral-500 font-semibold mb-8">
            Recognized by World Wildlife & Conservation Institutions
          </p>
          <div className="opacity-40 grayscale flex flex-wrap items-center justify-around gap-8 md:gap-14 text-xs font-semibold tracking-widest text-neutral-300">
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <Globe className="w-4 h-4" /> NAT GEO EXPEDITIONS
            </span>
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <Leaf className="w-4 h-4" /> WWF CONSERVATION
            </span>
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <ShieldCheck className="w-4 h-4" /> AUDUBON ALLIANCE
            </span>
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <Compass className="w-4 h-4" /> UWA PROTECTED PARKS
            </span>
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <Sparkles className="w-4 h-4" /> CONDÉ NAST TRAVELER
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 4 - FEATURES */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Conservation In Action
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
            Pioneering Regenerative Safaris
          </h2>
          <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
            Every itinerary integrates scientific monitoring, habitat security, and genuine wealth-sharing with fringe forest communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: leaf (green) */}
          <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-neutral-700 group">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2.5">
              100% Carbon Neutral Expeditions
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Every footprint is measured and offset with direct investments in indigenous forest reforestation and local solar ranger stations.
            </p>
          </div>

          {/* Card 2: shield-check (blue) */}
          <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-neutral-700 group">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2.5">
              Certified Anti-Poaching Patrolled
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Powered by our real-time EcoVision AI camera-trap network and local ranger teams, ensuring zero snares along trekking routes.
            </p>
          </div>

          {/* Card 3: sparkles (purple) */}
          <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-neutral-700 group">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2.5">
              Bespoke Gorilla & Chimpanzee Permits
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Guaranteed premium tier tracking permits with dedicated primatologist guides, maximum 4 guests per wildlife family group.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 - EXPEDITIONS */}
      <section id="expeditions" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Curated Itineraries
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Featured Expeditions
            </h2>
          </div>
          <a
            href="#destinations"
            className="text-sm font-medium text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors group"
          >
            View all destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Expedition 1 */}
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group shadow-2xl bg-neutral-900 border border-neutral-800">
            <img
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop"
              alt="Kibale Primate Sanctuary"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            
            <div className="absolute top-5 left-5">
              <span className="text-[11px] font-medium px-3 py-1 rounded-full glass-card text-white border border-white/10">
                Chimpanzee Capital
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Kibale Forest</h3>
                <p className="text-xs text-neutral-300 mt-1">Primate Habituation Experience</p>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-neutral-400">
                  <span>6 Days</span>
                  <span>•</span>
                  <span className="text-white font-semibold">From $3,200</span>
                </div>
              </div>

              {/* Arrow Button */}
              <button
                onClick={onOpenApp}
                className="glass-card w-11 h-11 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg flex-shrink-0"
                aria-label="View Kibale Safari"
              >
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Expedition 2 */}
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group shadow-2xl bg-neutral-900 border border-neutral-800">
            <img
              src="https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1000&auto=format&fit=crop"
              alt="Murchison Falls Safari"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            <div className="absolute top-5 left-5">
              <span className="text-[11px] font-medium px-3 py-1 rounded-full glass-card text-white border border-white/10">
                River Nile Giants
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Murchison Falls</h3>
                <p className="text-xs text-neutral-300 mt-1">Savannah & Boat Safari</p>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-neutral-400">
                  <span>7 Days</span>
                  <span>•</span>
                  <span className="text-white font-semibold">From $3,850</span>
                </div>
              </div>

              {/* Arrow Button */}
              <button
                onClick={onOpenApp}
                className="glass-card w-11 h-11 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg flex-shrink-0"
                aria-label="View Murchison Safari"
              >
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Expedition 3 */}
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group shadow-2xl bg-neutral-900 border border-neutral-800">
            <img
              src="https://images.unsplash.com/photo-1551009175-8a68da93d5f9?q=80&w=1000&auto=format&fit=crop"
              alt="Lake Bunyonyi Scenic Retreat"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            <div className="absolute top-5 left-5">
              <span className="text-[11px] font-medium px-3 py-1 rounded-full glass-card text-white border border-white/10">
                Crater Lakes Retreat
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Lake Bunyonyi</h3>
                <p className="text-xs text-neutral-300 mt-1">Mist Forests & Island Canoeing</p>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-neutral-400">
                  <span>5 Days</span>
                  <span>•</span>
                  <span className="text-white font-semibold">From $2,900</span>
                </div>
              </div>

              {/* Arrow Button */}
              <button
                onClick={onOpenApp}
                className="glass-card w-11 h-11 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg flex-shrink-0"
                aria-label="View Bunyonyi Safari"
              >
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI CAMERA TRAP HIGHLIGHT BANNER */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-[2rem] p-8 sm:p-12 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-neutral-900 to-neutral-950">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <Activity className="w-3.5 h-3.5" />
              Integrated EcoVision AI Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Real-Time Camera Trap & Wildlife Anti-Poaching System
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base mt-3 leading-relaxed">
              Every expedition is backed by our live YOLOv8 computer vision detection, contrast-adaptive CLAHE enhancement, and individual animal re-identification camera-trap pipeline.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={onOpenApp}
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Launch Camera Trap Command Center
              </button>
              <a
                href="#features"
                className="text-sm font-medium text-neutral-300 hover:text-white px-4 py-3.5 flex items-center gap-1.5"
              >
                Learn about Anti-Poaching
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 - FOOTER */}
      <footer id="membership" className="border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Col 1 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-neutral-950">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-white tracking-tight">Kigele Eco Safaris</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Pioneering regeneratively designed wilderness tracking across Uganda’s Albertine Rift ecosystems.
              </p>
              <div className="text-xs text-neutral-500">
                Licensed by Uganda Wildlife Authority (UWA) #EXP-2026-UG
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-semibold mb-4">
                Destinations
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
                <li><a href="#destinations" className="hover:text-white transition-colors">Bwindi Impenetrable</a></li>
                <li><a href="#destinations" className="hover:text-white transition-colors">Queen Elizabeth Park</a></li>
                <li><a href="#destinations" className="hover:text-white transition-colors">Murchison Falls Nile</a></li>
                <li><a href="#destinations" className="hover:text-white transition-colors">Kibale Primate Eden</a></li>
                <li><a href="#destinations" className="hover:text-white transition-colors">Rwenzori Mountains</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-semibold mb-4">
                Conservation & Tech
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
                <li>
                  <button onClick={onOpenApp} className="hover:text-emerald-400 text-left transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    EcoVision Live Dashboard
                  </button>
                </li>
                <li><a href="#features" className="hover:text-white transition-colors">Anti-Poaching Radar</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Community Forest Fund</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Carbon Offset Ledger</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Ethical Trekking Charter</a></li>
              </ul>
            </div>

            {/* Col 4 - Newsletter */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-semibold mb-4">
                Wilderness Dispatch
              </h4>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Receive quarterly field notes, permit releases, and ranger journal entries.
              </p>
              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Welcome to the expedition circle.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl px-4 py-2.5 text-xs font-medium transition-colors"
                  >
                    Subscribe to Journal
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} Kigele Eco Safaris Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-neutral-400 transition-colors">Permit Regulations</a>
            </div>
          </div>
        </div>
      </footer>

      {/* FILM MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-card rounded-[2rem] p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Watch The Film · Curating the Wilderness</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Kigele Eco Safaris Wilderness Film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
