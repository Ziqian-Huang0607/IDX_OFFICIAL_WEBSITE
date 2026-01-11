<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { guideData } from './data/guides'
import { externalLinks } from './data/links' 
import './assets/style.css'

// 1. Navigation State
const currentView = ref('hub') // 'hub' or 'toolbox'

// 2. Mouse Spotlight Interaction
const spotlightPos = ref({ x: 0, y: 0 })
const updateSpotlight = (e: MouseEvent) => {
  spotlightPos.value = { x: e.clientX, y: e.clientY }
}

onMounted(() => window.addEventListener('mousemove', updateSpotlight))
onUnmounted(() => window.removeEventListener('mousemove', updateSpotlight))

// 3. Hub Search & Quick Links Logic
const activeSub = ref('All')
const query = ref('')
const subjects = ['All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'English', 'Chinese', 'Economics', 'History', 'Computer Science']

// Quick access links for the Hub View
const quickTools = [
  { name: 'GPA Calculator', url: 'https://gpa.indexademics.com', icon: '✨' },
  { name: 'AI Consultant', url: 'https://indexademics-arcana.streamlit.app', icon: '🤖' },
  { name: 'Desmos', url: 'https://www.desmos.com/calculator', icon: '📉' }
]

const filteredGuides = computed(() => {
  return guideData.filter(g => {
    const sMatch = activeSub.value === 'All' || g.subject === activeSub.value
    const qMatch = g.name.toLowerCase().includes(query.value.toLowerCase())
    return sMatch && qMatch
  })
})

const getByGrade = (grade: number) => {
  const inGrade = filteredGuides.value.filter(g => g.grade === grade)
  const unique = [...new Set(inGrade.map(i => i.subject))].sort()
  return unique.map(s => ({ name: s, files: inGrade.filter(i => i.subject === s) }))
}
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

  <!-- VIEW 1: STUDY HUB -->
  <div v-if="currentView === 'hub'">
    <nav class="filter-nav">
      <button v-for="s in subjects" :key="s" @click="activeSub = s" :class="['filter-chip', { active: activeSub === s }]">
        {{ s }}
      </button>
    </nav>

    <section class="hero">
      <h1 class="title-gradient">Academic Resources</h1>
      <div class="search-wrapper">
        <input v-model="query" type="text" class="search-input" placeholder="Search guides...">
      </div>
      
      <!-- Quick Tools Bar -->
      <div class="quick-tools-bar">
        <a v-for="tool in quickTools" :key="tool.name" :href="tool.url" target="_blank" class="tool-tag">
          {{ tool.icon }} {{ tool.name }}
        </a>
      </div>
    </section>

    <main class="content-container">
      <!-- GPA PROPAGANDA BANNER -->
      <section class="featured-promotion">
        <div class="glass-card promo-card">
          <div class="promo-content">
            <div class="promo-tag">Fast & Secure</div>
            <h2>SHSID GPA Calculator</h2>
            <p>Built specifically for SHSID's weighting system. Calculate your GPA instantly and securely.</p>
            <a href="https://gpa.indexademics.com" target="_blank" class="promo-button">Open Calculator →</a>
          </div>
          <div class="promo-visual">📈</div>
        </div>
      </section>

      <div v-for="grade in [9, 10]" :key="grade">
        <div v-if="getByGrade(grade).length > 0" class="grade-label">Grade {{ grade }}</div>
        <div class="card-grid">
          <div v-for="sub in getByGrade(grade)" :key="sub.name" class="glass-card">
            <div class="subject-title">{{ sub.name }}</div>
            <div v-for="file in sub.files" :key="file.name" class="file-row">
              <div>
                <span class="badge">{{ file.level }}</span>
                <span style="margin-left: 12px; font-size: 0.9rem;">{{ file.name }}</span>
              </div>
              <a :href="file.url" class="download-link" download>GET</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- VIEW 2: TOOLBOX -->
  <div v-if="currentView === 'toolbox'">
    <section class="hero">
      <h1 class="title-gradient">Digital Toolbox</h1>
      <p style="color: #94a3b8; margin-top: 10px;">Essential apps designed for SHSID students.</p>
    </section>

    <main class="content-container">
      <div class="card-grid">
        <!-- GPA Calculator is usually also first in the Toolbox -->
        <div v-for="link in externalLinks" :key="link.name" class="glass-card toolbox-card">
          <div>
            <span class="badge" :style="{ color: link.color, borderColor: link.color }">{{ link.category }}</span>
            <h3 style="margin: 15px 0 10px 0; font-size: 1.4rem;">{{ link.name }}</h3>
            <p style="color: #94a3b8; font-size: 0.9rem;">{{ link.description }}</p>
          </div>
          <a :href="link.url" target="_blank" class="download-link toolbox-btn">Launch Website ↗</a>
        </div>
      </div>
    </main>
  </div>

  <footer class="main-footer">
    &copy; IDX ACADEMIC SUPPORT HUB • <a href="https://gpa.indexademics.com" target="_blank">GPA CALCULATOR</a>
  </footer>
</template>

<style scoped>
/* Navigation Active State */
.nav-btn.active {
  background: white !important;
  color: black !important;
  box-shadow: 0 0 15px rgba(255,255,255,0.3);
}

.toolbox-card {
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
  min-height: 220px;
}

.toolbox-btn {
  text-align: center; 
  margin-top: 20px; 
  border: 1px solid rgba(255,255,255,0.1);
  display: block;
}
</style>