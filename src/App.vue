<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { guideData } from './data/guides'
import { externalLinks } from './data/links' // Import new links
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

// 3. Hub Search Logic
const activeSub = ref('All')
const query = ref('')
const subjects = ['All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'English', 'Chinese', 'Economics', 'History', 'Computer Science']

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
    <div class="logo-text" @click="currentView = 'hub'" style="cursor:pointer">IDX HUB</div>
    <div style="display: flex; gap: 10px;">
      <button @click="currentView = 'hub'" :class="['download-link', { active: currentView === 'hub' }]">Study Hub</button>
      <button @click="currentView = 'toolbox'" :class="['download-link', { active: currentView === 'toolbox' }]">Toolbox</button>
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
    </section>

    <main class="content-container">
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

  <!-- VIEW 2: TOOLBOX (THE NEW PAGE) -->
  <div v-if="currentView === 'toolbox'">
    <section class="hero">
      <h1 class="title-gradient">Digital Toolbox</h1>
      <p style="color: #94a3b8; margin-top: 10px;">External apps and resources for SHSID students.</p>
    </section>

    <main class="content-container">
      <div class="card-grid">
        <div v-for="link in externalLinks" :key="link.name" class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
              <span class="badge" :style="{ color: link.color, borderColor: link.color }">{{ link.category }}</span>
            </div>
            <h3 style="margin: 0 0 10px 0; font-size: 1.4rem;">{{ link.name }}</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.4;">{{ link.description }}</p>
          </div>
          <a :href="link.url" target="_blank" class="download-link" 
             style="text-align: center; margin-top: 20px; border: 1px solid var(--glass-border);">
            Launch Website ↗
          </a>
        </div>
      </div>
    </main>
  </div>

  <footer style="text-align: center; padding: 60px; opacity: 0.4; font-size: 12px;">
    &copy; IDX ACADEMIC SUPPORT HUB
  </footer>
</template>

<style scoped>
/* Added a tiny bit of local style for the navigation active state */
.download-link.active {
  background: white;
  color: black;
}
</style>