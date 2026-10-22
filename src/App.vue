<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type CSSProperties } from 'vue'
import { externalLinks, ecosystemTools } from './data/links' 
import './assets/style.css'

// 1. THE AUTO-LOADER (THE ENGINE)
// Scans the guides directory and extracts Year, Subject, and Level
const modules = import.meta.glob('./guides/**/*.*', { eager: true, as: 'url' })

const allGuides = Object.keys(modules).map((path) => {
  try {
    const parts = path.split('/')
    const guidesIndex = parts.indexOf('guides')
    
    // Using .trim() to prevent hidden spaces in folder names from breaking filters
    const year = (parts[guidesIndex + 1] || 'Misc').trim()
    const subject = (parts[guidesIndex + 2] || 'General').trim()
    const level = (parts[guidesIndex + 3] || 'S').trim()
    const fileName = parts[parts.length - 1] || 'Untitled'
    const cleanName = fileName.split('.')[0]?.replace(/_/g, ' ') || fileName

    return {
      year,
      subject,
      level,
      name: cleanName,
      url: (modules[path] as any).default || (modules[path] as string) || '#'
    }
  } catch (err) {
    console.error("Path parsing error for:", path)
    return null
  }
}).filter(g => g !== null)

// Automatically detect every unique class folder found
const availableYears = [...new Set(allGuides.map(g => g!.year))].sort()

// 2. STATE MANAGEMENT
const currentView = ref('hub') // 'hub' | 'archive' | 'upcoming' | 'toolbox'
const activeSub = ref('All')
const activeYear = ref('All') 
const query = ref('')
const showBanner = ref(true) // advertise banner
// Constants for UI
const subjects = [
  'All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 
  'English', 'Chinese', 'Economics', 'History', 'Computer Science'
]

const quickTools = [
  { name: 'AI Consultant', url: 'https://indexademics-arcana.streamlit.app', icon: '🤖' },
  { name: 'Desmos', url: 'https://www.desmos.com/calculator', icon: '📉' },
  { name: 'GeoGebra', url: 'https://www.geogebra.org/graphing', icon: '📐' },
  { name: 'CC Advisor', url: 'https://cc.indexademics.com/', icon: '📝' }
]

// Ecosystem cards with precomputed glow styles (accent color per tool)
// and normalized action buttons (a tool may expose multiple links)
const ecoCards = ecosystemTools.map(tool => ({
  ...tool,
  glowStyle: { '--eco-accent': tool.accent } as CSSProperties,
  actions: tool.links ?? [{ label: 'Open Site ↗', url: tool.url }]
}))

// 3. VIEW NAVIGATION
const goView = (view: string) => {
  currentView.value = view
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 4. FILTERING & SORTING LOGIC (CASE-INSENSITIVE)
const filteredGuides = computed(() => {
  return allGuides.filter(g => {
    if (!g) return false

    // Normalize everything to lowercase for robust matching
    const targetSubject = activeSub.value.toLowerCase();
    const currentSubject = g.subject.toLowerCase();
    const targetYear = activeYear.value.toLowerCase();
    const currentYear = g.year.toLowerCase();
    const searchStr = query.value.toLowerCase();

    // Subject Match
    const sMatch = activeSub.value === 'All' || currentSubject === targetSubject
    
    // Year Match
    const yMatch = activeYear.value === 'All' || currentYear === targetYear
    
    // Search Match
    const qMatch = g.name.toLowerCase().includes(searchStr) ||
                   currentSubject.includes(searchStr)

    return sMatch && yMatch && qMatch
  })
})

const getByYear = (year: string) => {
  // Use trim and lowerCase to find data for specific Class Header
  const inYear = filteredGuides.value.filter(g => g!.year.toLowerCase().trim() === year.toLowerCase().trim())
  
  // Group by subject case-insensitively so "biology" and "Biology" merge
  const subjectMap = new Map();
  
  inYear.forEach(file => {
    // Standardize display name (e.g. biology -> Biology)
    const displayName = file!.subject.charAt(0).toUpperCase() + file!.subject.slice(1).toLowerCase();
    
    if (!subjectMap.has(displayName)) {
      subjectMap.set(displayName, []);
    }
    subjectMap.get(displayName).push(file);
  });

  return Array.from(subjectMap.keys()).sort().map(name => ({ 
    name, 
    files: subjectMap.get(name) 
  }))
}

// 5. INTERACTIVE FX (Spotlight & Animations)
const spotlightPos = ref({ x: 0, y: 0 })
const handleMouseMove = (e: MouseEvent) => {
  spotlightPos.value = { x: e.clientX, y: e.clientY }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  console.log("✅ IDX Hub Engine Started. Files Loaded:", allGuides.length)
})
onUnmounted(() => window.removeEventListener('mousemove', handleMouseMove))
</script>

<template>
  <!-- ANIMATED BACKGROUND LAYER -->
  <div class="bg-scene">
    <div 
      class="spotlight" 
      :style="{ transform: `translate(${spotlightPos.x - 300}px, ${spotlightPos.y - 300}px)` }"
    ></div>
    <div class="mesh-blob blob-1"></div>
    <div class="mesh-blob blob-2"></div>
  </div>

  <header class="glass-header">
    <div class="header-left" @click="goView('hub')" style="cursor:pointer">
      <img src="/idx-logo.png" alt="IDX Logo" class="header-logo" />
      <div class="logo-text gradient-text">IDX HUB</div>
    </div>
    
    <div class="header-nav">
      <button 
        @click="goView('hub')" 
        :class="['nav-btn', { active: currentView === 'hub' }]"
      >
        Study Hub
      </button>
      <button 
        @click="goView('archive')" 
        :class="['nav-btn', { active: currentView === 'archive' }]"
      >
        Archive
      </button>
      <button 
        @click="goView('upcoming')" 
        :class="['nav-btn', { active: currentView === 'upcoming' }]"
      >
        What's Coming Up
      </button>
      <button 
        @click="goView('toolbox')" 
        :class="['nav-btn', { active: currentView === 'toolbox' }]"
      >
        Toolbox
      </button>
    </div>
  </header>
  <!-- ANNOUNCEMENT BANNER -->
  <div v-if="showBanner" class="announcement-banner">
    <div class="banner-content">
      <span class="banner-badge">NEW</span>
      <span class="banner-text">
        Meet your ultimate College Selection tool: <strong>CC Advisor</strong> is now live!
      </span>
      <a href="https://cc.indexademics.com/" target="_blank" class="banner-link">Try it now &rarr;</a>
    </div>
    <button @click="showBanner = false" class="banner-close" aria-label="Close">&times;</button>
  </div>

  <!-- MAIN APP VIEW -->
  <main class="content-container">
    
    <!-- VIEW: STUDY HUB (HOME) -->
    <div v-if="currentView === 'hub'" class="view-animate">
      <section class="hero">
        <!-- New Logo Icon added next to Academic Resources -->
        <div class="hero-title-container">
          <img src="/idx-logo1.png" class="hero-title-icon" alt="Title Icon" />
          <h1 class="title-gradient">Academic Resources</h1>
        </div>
        <p class="hero-subtitle">
          Study guides and the GPA Calculator have moved to the
          <a class="inline-link" @click="goView('archive')">Archive</a>.
          Check out the latest tools from IDX &amp; PA Tech below.
        </p>
        
        <!-- QUICK TOOLS BAR -->
        <div class="quick-tools-bar">
          <a 
            v-for="tool in quickTools" 
            :key="tool.name" 
            :href="tool.url" 
            target="_blank" 
            class="tool-tag"
          >
            <span class="tool-icon">{{ tool.icon }}</span> {{ tool.name }}
          </a>
        </div>
      </section>

      <!-- LATEST TOOLS (IDX & PA TECH ECOSYSTEM) -->
      <div class="grade-label">Latest Tools</div>
      <div class="card-grid">
        <div 
          v-for="tool in ecoCards" 
          :key="tool.name" 
          class="glass-card eco-card"
          :style="tool.glowStyle"
        >
          <div class="eco-head">
            <div class="eco-icon">{{ tool.icon }}</div>
            <div class="eco-head-right">
              <span class="eco-new">New</span>
              <img 
                v-if="tool.makerLogo" 
                :src="tool.makerLogo" 
                :alt="tool.maker" 
                :title="tool.maker" 
                class="eco-maker-logo" 
              />
              <span v-else class="eco-maker">{{ tool.maker }}</span>
            </div>
          </div>
          <div class="eco-tagline">{{ tool.tagline }}</div>
          <h3 class="eco-name">{{ tool.name }}</h3>
          <p class="eco-desc">{{ tool.description }}</p>
          <div class="eco-actions">
            <a 
              v-for="action in tool.actions" 
              :key="action.label" 
              :href="action.url" 
              target="_blank" 
              :class="['eco-btn', { primary: action.primary }]"
            >
              {{ action.label }}
            </a>
          </div>
        </div>
      </div>

      <!-- CC ADVISOR PROMOTION -->
      <section class="promo-grid single">
        <div class="glass-card promo-mini ai-bg">
          <div class="promo-content-mini">
            <div class="promo-badge blue">IDX Tool</div>
            <h3>CC Advisor</h3>
            <p>Your ultimate college selection tool.</p>
            <a href="https://cc.indexademics.com/" target="_blank" class="promo-btn-mini">Launch →</a>
          </div>
          <div class="promo-icon-mini">📝</div>
        </div>
      </section>
    </div>

    <!-- VIEW: ARCHIVE (STUDY GUIDES + GPA CALCULATOR) -->
    <div v-else-if="currentView === 'archive'" class="view-animate">
      
      <!-- NAVIGATION: Subject Filters -->
      <nav class="filter-nav">
        <button 
          v-for="s in subjects" 
          :key="s" 
          @click="activeSub = s" 
          :class="['filter-chip', { active: activeSub === s }]"
        >
          {{ s }}
        </button>
      </nav>

      <!-- NAVIGATION: Class Year Sort -->
      <nav class="filter-nav secondary-nav">
        <span class="nav-label">Sort by Class:</span>
        <button 
          @click="activeYear = 'All'" 
          :class="['filter-chip small', { active: activeYear === 'All' }]"
        >
          All
        </button>
        <button 
          v-for="year in availableYears" 
          :key="year" 
          @click="activeYear = year" 
          :class="['filter-chip small', { active: activeYear === year }]"
        >
          '{{ year }}
        </button>
      </nav>

      <section class="hero">
        <h1 class="title-gradient">The Archive</h1>
        <p class="hero-subtitle">Every IDX study guide, sorted by class and subject.</p>
        
        <div class="search-wrapper">
          <input 
            v-model="query" 
            type="text" 
            class="search-input" 
            placeholder="Search topics, subjects, or levels..."
          >
        </div>
      </section>

      <!-- ARCHIVE TOOLS PROMOTION -->
      <section class="promo-grid">
        <div class="glass-card promo-mini gpa-bg">
          <div class="promo-content-mini">
            <div class="promo-badge gold">SHSID Tool</div>
            <h3>GPA Calculator</h3>
            <p>Fast, secure SHSID weighting.</p>
            <a href="https://gpa.indexademics.com" target="_blank" class="promo-btn-mini">Launch →</a>
          </div>
          <div class="promo-icon-mini">📈</div>
        </div>

        <div class="glass-card promo-mini ai-bg">
          <div class="promo-content-mini">
            <div class="promo-badge blue">IDX Classic</div>
            <h3>AI Consultant</h3>
            <p>Your SHSID academic advisor — the predecessor of Synonance.</p>
            <a href="https://indexademics-arcana.streamlit.app" target="_blank" class="promo-btn-mini">Start Chat →</a>
          </div>
          <div class="promo-icon-mini">🤖</div>
        </div>
      </section>

      <!-- DYNAMIC YEAR SECTIONS -->
      <div v-for="year in (activeYear === 'All' ? availableYears : [activeYear])" :key="year">
        <div v-if="getByYear(year).length > 0" class="grade-label">
          Class of 20{{ year }}
        </div>
        
        <div class="card-grid">
          <div v-for="sub in getByYear(year)" :key="sub.name" class="glass-card subject-card">
            <div class="subject-title">{{ sub.name }}</div>
            <div v-for="file in sub.files" :key="file.name" class="file-row">
              <div class="file-info">
                <span class="badge">{{ file.level }}</span>
                <span class="file-name-text">{{ file.name }}</span>
              </div>
              <a :href="file.url" class="download-link" target="_blank">GET</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- EMPTY STATE -->
      <div v-if="filteredGuides.length === 0" class="empty-state">
         <div class="empty-icon">🔍</div>
         <p>No resources found for your current selection.</p>
      </div>
    </div>

    <!-- VIEW: WHAT'S COMING UP -->
    <div v-else-if="currentView === 'upcoming'" class="view-animate">
      <section class="hero">
        <h1 class="title-gradient">What's Coming Up</h1>
        <p class="hero-subtitle">A look at what IDX is planning next.</p>
      </section>

      <div class="roadmap">
        <div class="glass-card roadmap-card">
          <div class="roadmap-top">
            <span class="roadmap-icon">🧭</span>
            <span class="roadmap-badge">In Planning</span>
          </div>
          <h3 class="roadmap-title">High School Planning Consultation</h3>
          <p class="roadmap-tagline">What should I do in high school?</p>
          <p class="roadmap-desc">
            The new school year has just begun — but do you have a plan for high school and beyond?
            Contact us, and we'll figure it out together. This is a service offered by Indexademics (IDX):
            we don't expect any work from you, and there are no regular meetings.
            Just reach out if you'd like a hand mapping out your path.
          </p>
        </div>

        <div class="glass-card roadmap-card muted">
          <div class="roadmap-top">
            <span class="roadmap-icon">💡</span>
            <span class="roadmap-badge soon">More Soon</span>
          </div>
          <h3 class="roadmap-title">More on the Roadmap</h3>
          <p class="roadmap-desc">
            We're always sketching out new tools and services for SHSID students.
            Have an idea for what we should build next? Get in touch with the IDX team.
          </p>
        </div>
      </div>
    </div>

    <!-- VIEW: DIGITAL TOOLBOX -->
    <div v-else class="view-animate">
      <section class="hero">
        <h1 class="title-gradient">Digital Toolbox</h1>
        <p style="color: #94a3b8; margin-top: 10px;">High-performance web apps built for SHSID.</p>
      </section>

      <div class="card-grid">
        <div 
          v-for="link in externalLinks" 
          :key="link.name" 
          class="glass-card toolbox-card"
        >
          <div class="toolbox-header">
            <span 
              class="badge" 
              :style="{ borderColor: link.color, color: link.color }"
            >
              {{ link.category }}
            </span>
            <h3 class="toolbox-title">{{ link.name }}</h3>
            <p class="toolbox-desc">{{ link.description }}</p>
          </div>
          <a :href="link.url" target="_blank" class="download-link toolbox-btn">
            Launch Website ↗
          </a>
        </div>
      </div>
    </div>

  </main>

  <footer class="main-footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/idx-logo.png" alt="IDX Logo" class="footer-logo" />
          <p class="footer-tagline">
            Indexademics (IDX) — academic support and tools, built by students for SHSID.
          </p>
        </div>
        <div class="footer-col">
          <h4>IDX Hub</h4>
          <a @click="goView('hub')">Study Hub</a>
          <a @click="goView('archive')">Archive</a>
          <a @click="goView('upcoming')">What's Coming Up</a>
          <a @click="goView('toolbox')">Toolbox</a>
        </div>
        <div class="footer-col">
          <h4>IDX Tools</h4>
          <a href="https://gpa.indexademics.com" target="_blank">GPA Calculator</a>
          <a href="https://indexademics-arcana.streamlit.app" target="_blank">AI Consultant</a>
          <a href="https://cc.indexademics.com/" target="_blank">CC Advisor</a>
        </div>
        <div class="footer-col">
          <h4>PA Tech Ecosystem</h4>
          <a href="https://syno.standardcas.org/" target="_blank">Synonance</a>
          <a href="https://academy.standardcas.org" target="_blank">Academy</a>
          <a href="https://launchpad.standardcas.org/overview" target="_blank">Launchpad</a>
          <a href="https://study.standardcas.org/login" target="_blank">SHSID Study</a>
          <a href="https://ss.standardcas.org/" target="_blank">SharedSpace</a>
          <a href="https://patech.standardcas.org/access" target="_blank">PA Tech</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>Copyright &copy; 2026 Indexademics (IDX). All rights reserved.</span>
        <span>Ecosystem built in collaboration with the PA Tech Department.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* HERO TITLE ALIGNMENT */
.hero-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 5px;
}

.hero-title-icon {
  height: 48px;
  width: auto;
  filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4));
  animation: float 3s ease-in-out infinite;
  position: relative;
  top: 3px; /* Moved exactly 3px down */
}

.hero-subtitle {
  color: #94a3b8;
  margin-top: 10px;
  font-size: 0.95rem;
}

.inline-link {
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: 0.2s;
}

.inline-link:hover {
  border-bottom-color: var(--primary);
}

/* LATEST TOOLS (ECOSYSTEM CARDS) */
.eco-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: inherit;
}

.eco-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, var(--eco-accent), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.eco-card:hover {
  border-color: var(--eco-accent);
  box-shadow: 0 10px 40px -15px var(--eco-accent);
}

.eco-card:hover::before {
  opacity: 0.12;
}

.eco-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.eco-icon {
  font-size: 2rem;
}

.eco-maker {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
}

.eco-maker-logo {
  height: 18px;
  width: auto;
  opacity: 0.85;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.15));
}

.eco-head-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.eco-new {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--eco-accent);
  color: #fff;
  box-shadow: 0 0 12px var(--eco-accent);
}

.eco-tagline {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--eco-accent);
  margin-bottom: 6px;
}

.eco-name {
  margin: 0 0 10px 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #fff;
}

.eco-desc {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.55;
  flex-grow: 1;
}

.eco-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.eco-btn {
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 7px 16px;
  border-radius: 8px;
  transition: 0.2s;
}

.eco-btn:hover {
  background: #fff;
  color: #000;
}

.eco-btn.primary {
  background: var(--eco-accent);
  border-color: transparent;
}

.eco-btn.primary:hover {
  background: var(--eco-accent);
  color: #fff;
  filter: brightness(1.2);
}

/* PROMO GRID (Dual Propaganda) */
.promo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
  margin-top: 40px;
}

.promo-grid.single {
  grid-template-columns: 1fr;
}

.promo-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px !important;
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.promo-mini:hover { transform: translateY(-5px); }

.gpa-bg { border-color: rgba(251, 191, 36, 0.3); background: linear-gradient(135deg, rgba(251,191,36,0.05), transparent); }
.ai-bg { border-color: rgba(59, 130, 246, 0.3); background: linear-gradient(135deg, rgba(59,130,246,0.05), transparent); }

.promo-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
.gold { background: #fbbf24; color: #000; }
.blue { background: #3b82f6; color: #fff; }

.promo-content-mini h3 { margin: 0 0 5px 0; font-size: 1.2rem; }
.promo-content-mini p { margin: 0 0 15px 0; font-size: 0.85rem; color: #94a3b8; }

.promo-btn-mini { font-size: 11px; font-weight: 800; text-decoration: none; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 6px 15px; border-radius: 8px; transition: 0.2s; }
.promo-btn-mini:hover { background: #fff; color: #000; }
.promo-icon-mini { font-size: 40px; opacity: 0.8; }

/* ROADMAP (WHAT'S COMING UP) */
.roadmap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 25px;
}

.roadmap-card {
  padding: 35px !important;
}

.roadmap-card.muted {
  opacity: 0.75;
}

.roadmap-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.roadmap-icon {
  font-size: 2.2rem;
}

.roadmap-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 100px;
  background: rgba(59, 130, 246, 0.15);
  color: var(--primary);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.roadmap-badge.soon {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.3);
}

.roadmap-title {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.roadmap-tagline {
  margin: 0 0 15px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
}

.roadmap-desc {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* VIEW ANIMATIONS */
.view-animate {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* NAVIGATION ACTIVE STATES */
.nav-btn.active {
  background: #fff !important;
  color: #000 !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.filter-chip.active {
  background: #fff;
  color: #000;
  border-color: #fff;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

/* BRANDING & LOGO */
.header-left { display: flex; align-items: center; gap: 12px; }
.header-logo { 
  height: 32px; 
  width: auto; 
  transition: transform 0.3s ease; 
  position: relative;
  top: -2px; /* Kept your old code position */
}
.header-left:hover .header-logo { transform: rotate(-5deg) scale(1.1); }

/* TEXT EFFECTS */
.gradient-text {
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* GRID LAYOUTS */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 25px;
}

/* CARD ENHANCEMENTS */
.subject-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.subject-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
}

/* FILE ROWS */
.file-name-text {
  margin-left: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e2e8f0;
}

/* TOOLBOX SPECIFIC */
.toolbox-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
}

.toolbox-title {
  margin: 15px 0 10px 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.toolbox-desc {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.toolbox-btn {
  text-align: center;
  margin-top: 20px;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* SECONDARY NAV */
.secondary-nav {
  padding-top: 0 !important;
  padding-bottom: 20px !important;
  justify-content: center;
  align-items: center;
}

.nav-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-right: 12px;
  letter-spacing: 1px;
}

.filter-chip.small {
  padding: 4px 14px;
  font-size: 11px;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

/* FOOTER */
.main-footer {
  border-top: 1px solid var(--glass-border);
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(12px);
  padding: 55px 20px 30px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.2fr;
  gap: 40px;
  margin-bottom: 45px;
}

.footer-logo {
  height: 30px;
  width: auto;
  margin-bottom: 15px;
}

.footer-tagline {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
  max-width: 260px;
}

.footer-col h4 {
  margin: 0 0 14px 0;
  font-size: 12px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.3px;
}

.footer-col a {
  display: block;
  color: #94a3b8;
  font-size: 12px;
  text-decoration: none;
  margin-bottom: 9px;
  cursor: pointer;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: #fff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  color: #64748b;
  font-size: 11px;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

@media (max-width: 800px) {
  .promo-grid { grid-template-columns: 1fr; }
  .hero-title-container { flex-direction: column; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }

}
/* =========================================
   ANNOUNCEMENT BANNER
   ========================================= */
.announcement-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  /* Smooth purple to blue gradient matching the Arcana/Toolbox vibe */
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  padding: 12px 40px;
  position: relative;
  z-index: 40;
  animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.9rem;
}

.banner-badge {
  background: #3b82f6;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.banner-text {
  color: #e2e8f0;
  letter-spacing: 0.3px;
}

.banner-text strong {
  color: #fff;
}

.banner-link {
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid #3b82f6;
  padding-bottom: 1px;
  transition: all 0.2s ease;
}

.banner-link:hover {
  color: #3b82f6;
  border-bottom-color: transparent;
}

.banner-close {
  position: absolute;
  right: 20px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0 5px;
}

.banner-close:hover {
  color: #fff;
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Make it stack nicely on mobile screens */
@media (max-width: 600px) {
  .banner-content {
    gap: 8px;
    padding-right: 20px; /* Room for the X button */
  }
  .banner-text {
    text-align: center;
    font-size: 0.85rem;
  }
}
</style>
