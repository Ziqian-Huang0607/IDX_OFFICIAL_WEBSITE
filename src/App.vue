<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { guideData } from './data/guides'
import './assets/style.css'

// 1. Mouse Spotlight Interaction
const spotlightPos = ref({ x: 0, y: 0 })
const updateSpotlight = (e: MouseEvent) => {
  spotlightPos.value = { x: e.clientX, y: e.clientY }
}

onMounted(() => window.addEventListener('mousemove', updateSpotlight))
onUnmounted(() => window.removeEventListener('mousemove', updateSpotlight))

// 2. Filter & Search Logic
const activeSub = ref('All')
const query = ref('')
const subjects = ['All', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'English', 'Chinese', 'Economics', 'History', 'Computer Science']

const filtered = computed(() => {
  return guideData.filter(g => {
    const sMatch = activeSub.value === 'All' || g.subject === activeSub.value
    const qMatch = g.name.toLowerCase().includes(query.value.toLowerCase()) || 
                   g.subject.toLowerCase().includes(query.value.toLowerCase())
    return sMatch && qMatch
  })
})

const getByGrade = (grade: number) => {
  const inGrade = filtered.value.filter(g => g.grade === grade)
  const unique = [...new Set(inGrade.map(i => i.subject))].sort()
  return unique.map(s => ({
    name: s,
    files: inGrade.filter(i => i.subject === s)
  }))
}
</script>

<template>
  <!-- Background spotlight effect -->
  <div class="bg-scene">
    <div class="spotlight" :style="{ transform: `translate(${spotlightPos.x - 300}px, ${spotlightPos.y - 300}px)` }"></div>
  </div>

  <header>
    <div class="logo-text">IDX HUB</div>
    <a href="https://indexademics-arcana.streamlit.app" target="_blank" class="download-link">AI Consultant</a>
  </header>

  <nav class="filter-nav">
    <button 
      v-for="s in subjects" :key="s" 
      @click="activeSub = s"
      :class="['filter-chip', { active: activeSub === s }]"
    >
      {{ s }}
    </button>
  </nav>

  <section class="hero">
    <h1 class="title-gradient">Academic Support Hub</h1>
    <div class="search-wrapper">
      <input v-model="query" type="text" class="search-input" placeholder="Search resources...">
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

    <!-- No Results State -->
    <div v-if="filtered.length === 0" style="text-align: center; margin-top: 100px; color: #64748b;">
      No guides found matching your search.
    </div>
  </main>

  <footer style="text-align: center; padding: 100px 20px; opacity: 0.4; font-size: 12px;">
    &copy; IDX ACADEMIC SUPPORT HUB. BUILT WITH VUE 3 & TYPESCRIPT.
  </footer>
</template>