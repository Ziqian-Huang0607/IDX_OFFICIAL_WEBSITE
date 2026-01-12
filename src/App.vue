<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { externalLinks } from './data/links' 
import './assets/style.css'

// 1. THE AUTO-LOADER (THE ENGINE)
// Scans the guides directory and extracts Year, Subject, and Level
const modules = import.meta.glob('./guides/**/*.*', { eager: true, as: 'url' })

const allGuides = Object.keys(modules).map((path) => {
  try {
    const parts = path.split('/')
    const guidesIndex = parts.indexOf('guides')
    
    // Fallback logic to ensure TypeScript doesn't crash on Vercel
    const year = parts[guidesIndex + 1] || 'Misc'
    const subject = parts[guidesIndex + 2] || 'General'
    const level = parts[guidesIndex + 3] || 'S'
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
const currentView = ref('hub') // 'hub' or 'toolbox'
const activeSub = ref('All')
const activeYear = ref('All') 
const query = ref('')

// Constants for UI
const subjects = [
  'All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 
  'English', 'Chinese', 'Economics', 'History', 'Computer Science'
]

const quickTools = [
  { name: 'GPA Calculator', url: 'https://gpa.indexademics.com', icon: '✨' },
  { name: 'AI Consultant', url: 'https://indexademics-arcana.streamlit.app', icon: '🤖' },
  { name: 'Desmos', url: 'https://www.desmos.com/calculator', icon: '📉' },
  { name: 'GeoGebra', url: 'https://www.geogebra.org/graphing', icon: '📐' }
]

// 3. FILTERING & SORTING LOGIC
const filteredGuides = computed(() => {
  return allGuides.filter(g => {
    if (!g) return false
    const sMatch = activeSub.value === 'All' || g.subject === activeSub.value
    const yMatch = activeYear.value === 'All' || g.year === activeYear.value
    const qMatch = g.name.toLowerCase().includes(query.value.toLowerCase()) ||
                   g.subject.toLowerCase().includes(query.value.toLowerCase())
    return sMatch && yMatch && qMatch
  })
})

const getByYear = (year: string) => {
  const inYear = filteredGuides.value.filter(g => g!.year === year)
  const uniqueSubs = [...new Set(inYear.map(i => i!.subject))].sort()
  return uniqueSubs.map(s => ({ 
    name: s, 
    files: inYear.filter(f => f!.subject === s) 
  }))
}

// 4. INTERACTIVE FX (Spotlight & Animations)
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
    <div class="header-left" @click="currentView = 'hub'" style="cursor:pointer">
      <img src="/idx-logo.png" alt="IDX Logo" class="header-logo" />
      <div class="logo-text gradient-text">IDX HUB</div>
    </div>
    
    <div class="header-nav">
      <button 
        @click="currentView = 'hub'" 
        :class="['nav-btn', { active: currentView === 'hub' }]"
      >
        Study Hub
      </button>
      <button 
        @click="currentView = 'toolbox'" 
        :class="['nav-btn', { active: currentView === 'toolbox' }]"
      >
        Toolbox
      </button>
    </div>
  </header>

  <!-- MAIN APP VIEW -->
  <main class="content-container">
    
    <!-- VIEW: STUDY HUB -->
    <div v-if="currentView === 'hub'" class="view-animate">
      
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
        <h1 class="title-gradient">Academic Resources</h1>
        <div class="search-wrapper">
          <input 
            v-model="query" 
            type="text" 
            class="search-input" 
            placeholder="Search topics, subjects, or levels..."
          >
        </div>
        
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

      <!-- FEATURED: GPA PROPAGANDA -->
      <section class="featured-promotion">
        <div class="glass-card promo-card">
          <div class="promo-content">
            <div class="promo-tag">Recommended Tool</div>
            <h2>GPA Calculator</h2>
            <p>Calculate your GPA using the fast and secure SHSID weighting logic. Privacy-first design.</p>
            <a href="https://gpa.indexademics.com" target="_blank" class="promo-button">Launch Calculator →</a>
          </div>
          <div class="promo-visual">📈</div>
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
    <div class="footer-content">
      <p>&copy; 2024 IDX ACADEMIC SUPPORT HUB</p>
      <div class="footer-links">
        <a href="https://gpa.indexademics.com">GPA CALCULATOR</a>
        <span class="footer-dot">•</span>
        <a href="https://indexademics-arcana.streamlit.app">AI CONSULTANT</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
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
.header-logo { height: 32px; width: auto; transition: transform 0.3s ease; }
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
.footer-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.footer-links a {
  text-decoration: none;
  color: #fff;
  font-size: 10px;
}

.footer-dot { color: #475569; font-size: 10px; }
</style>