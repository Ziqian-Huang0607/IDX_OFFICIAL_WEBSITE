<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { externalLinks } from './data/links' 
import './assets/style.css'

/** 
 * 1. THE AUTO-LOADER
 * Scans the guides directory for all files
 */
const modules = import.meta.glob('./guides/**/*.*', { eager: true, as: 'url' })

const allGuides = Object.keys(modules).map((path) => {
  const parts = path.split('/')
  const guidesIndex = parts.indexOf('guides')
  
  const year = parts[guidesIndex + 1]
  const subject = parts[guidesIndex + 2]
  const level = parts[guidesIndex + 3]
  const fileName = parts[parts.length - 1]
  const cleanName = fileName.split('.')[0].replace(/_/g, ' ')

  return {
    year,
    subject,
    level,
    name: cleanName,
    url: (modules[path] as any).default || modules[path]
  }
})

// Automatically detect all years found in folders
const availableYears = [...new Set(allGuides.map(g => g.year))].sort()

// 2. Navigation & Filter State
const currentView = ref('hub')
const activeSub = ref('All')
const activeYear = ref('All') 
const query = ref('')

const subjects = [
  'All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 
  'English', 'Chinese', 'Economics', 'History', 'Computer Science'
]

// 3. Filtering Logic
const filteredGuides = computed(() => {
  return allGuides.filter(g => {
    const sMatch = activeSub.value === 'All' || g.subject === activeSub.value
    const yMatch = activeYear.value === 'All' || g.year === activeYear.value
    const qMatch = g.name.toLowerCase().includes(query.value.toLowerCase())
    return sMatch && yMatch && qMatch
  })
})

const getByYear = (year: string) => {
  const inYear = filteredGuides.value.filter(g => g.year === year)
  const uniqueSubs = [...new Set(inYear.map(i => i.subject))].sort()
  return uniqueSubs.map(s => ({ 
    name: s, 
    files: inYear.filter(f => f.subject === s) 
  }))
}

// 4. Mouse Interactions
const spotlightPos = ref({ x: 0, y: 0 })
const updateSpotlight = (e: MouseEvent) => {
  spotlightPos.value = { x: e.clientX, y: e.clientY }
}

onMounted(() => window.addEventListener('mousemove', updateSpotlight))
onUnmounted(() => window.removeEventListener('mousemove', updateSpotlight))

const quickTools = [
  { name: 'GPA Calculator', url: 'https://gpa.indexademics.com', icon: '✨' },
  { name: 'AI Consultant', url: 'https://indexademics-arcana.streamlit.app', icon: '🤖' },
  { name: 'Desmos', url: 'https://www.desmos.com/calculator', icon: '📉' }
]
</script>

<template>
  <div class="bg-scene">
    <div class="spotlight" :style="{ transform: `translate(${spotlightPos.x - 300}px, ${spotlightPos.y - 300}px)` }"></div>
  </div>

  <header>
    <div class="header-left" @click="currentView = 'hub'" style="cursor:pointer">
      <img src="/idx-logo.png" alt="IDX" class="header-logo" />
      <div class="logo-text">IDX HUB</div>
    </div>
    <div class="header-nav">
      <button @click="currentView = 'hub'" :class="['nav-btn', { active: currentView === 'hub' }]">Study Hub</button>
      <button @click="currentView = 'toolbox'" :class="['nav-btn', { active: currentView === 'toolbox' }]">Toolbox</button>
    </div>
  </header>

  <div v-if="currentView === 'hub'">
    <!-- SUBJECT FILTERS -->
    <nav class="filter-nav">
      <button v-for="s in subjects" :key="s" @click="activeSub = s" :class="['filter-chip', { active: activeSub === s }]">
        {{ s }}
      </button>
    </nav>

    <!-- CLASS FILTERS -->
    <nav class="filter-nav secondary-nav">
      <span class="nav-label">Class Year:</span>
      <button @click="activeYear = 'All'" :class="['filter-chip small', { active: activeYear === 'All' }]">All</button>
      <button v-for="year in availableYears" :key="year" @click="activeYear = year" :class="['filter-chip small', { active: activeYear === year }]">
        '{{ year }}
      </button>
    </nav>

    <section class="hero">
      <h1 class="title-gradient">Academic Resources</h1>
      <div class="search-wrapper">
        <input v-model="query" type="text" class="search-input" placeholder="Search resources...">
      </div>
      <div class="quick-tools-bar">
        <a v-for="tool in quickTools" :key="tool.name" :href="tool.url" target="_blank" class="tool-tag">
          {{ tool.icon }} {{ tool.name }}
        </a>
      </div>
    </section>

    <main class="content-container">
      <!-- GPA PROMO -->
      <section class="featured-promotion">
        <div class="glass-card promo-card">
          <div class="promo-content">
            <div class="promo-tag">Featured Tool</div>
            <h2>SHSID GPA Calculator</h2>
            <p>Built specifically for SHSID's weighting system. Calculate your GPA instantly and securely.</p>
            <a href="https://gpa.indexademics.com" target="_blank" class="promo-button">Launch Tool →</a>
          </div>
          <div class="promo-visual">📈</div>
        </div>
      </section>

      <!-- SECTIONS BY YEAR -->
      <div v-for="year in (activeYear === 'All' ? availableYears : [activeYear])" :key="year">
        <div v-if="getByYear(year).length > 0" class="grade-label">Class of 20{{ year }}</div>
        
        <div class="card-grid">
          <div v-for="sub in getByYear(year)" :key="sub.name" class="glass-card">
            <div class="subject-title">{{ sub.name }}</div>
            <div v-for="file in sub.files" :key="file.name" class="file-row">
              <div>
                <span class="badge">{{ file.level }}</span>
                <span class="file-name">{{ file.name }}</span>
              </div>
              <a :href="file.url" class="download-link" target="_blank">GET</a>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredGuides.length === 0" class="empty-state">
         No resources found for the selected filters.
      </div>
    </main>
  </div>

  <div v-else>
    <section class="hero">
      <h1 class="title-gradient">Digital Toolbox</h1>
      <p style="color: #94a3b8; margin-top: 10px;">Essential apps for indexademics.</p>
    </section>
    <main class="content-container">
      <div class="card-grid">
        <div v-for="link in externalLinks" :key="link.name" class="glass-card toolbox-card">
          <div>
            <span class="badge" :style="{ color: link.color, borderColor: link.color }">{{ link.category }}</span>
            <h3 style="margin: 15px 0 10px 0;">{{ link.name }}</h3>
            <p style="color: #94a3b8; font-size: 0.9rem;">{{ link.description }}</p>
          </div>
          <a :href="link.url" target="_blank" class="download-link toolbox-btn">Launch Website ↗</a>
        </div>
      </div>
    </main>
  </div>

  <footer class="main-footer">
    &copy; IDX ACADEMIC SUPPORT HUB
  </footer>
</template>

<style scoped>
.nav-btn.active {
  background: white !important;
  color: black !important;
  box-shadow: 0 0 15px rgba(255,255,255,0.3);
}

.toolbox-card {
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
}

.toolbox-btn {
  text-align: center; 
  margin-top: 20px; 
  border: 1px solid rgba(255,255,255,0.1);
  display: block;
}

.header-logo {
  height: 32px;
  width: auto;
}

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
  margin-right: 10px;
  letter-spacing: 1px;
}

.filter-chip.small {
  padding: 4px 12px;
  font-size: 11px;
}

.empty-state {
  text-align: center;
  color: #64748b;
  padding: 80px 20px;
}

.file-name {
  margin-left: 12px;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>