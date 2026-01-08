This documentation is designed for developers who want to perform deep modifications, extend functionality, or transform the architecture of the **IDX Academic Support Hub**.

---

# 🛠 IDX Technical Manual & Extension Guide

## 1. Core Architecture Overview
The application follows a **Data-View Separation** pattern.
*   **Data Layer (`src/data/guides.ts`):** A static "database" exported as a TypeScript array.
*   **Logic Layer (`src/App.vue` <script>):** Handles state management (search, filtering, navigation).
*   **Presentation Layer (`src/App.vue` <template> & `src/assets/style.css`):** Handles the Glassmorphism UI and animations.

---

## 2. Modifying Existing Logic

### A. Changing the Filtering Logic
The filtering engine is located in the `filteredGuides` computed property in `App.vue`.
*   **To add a new filter (e.g., filtering by "Level"):**
    1.  Create a new `ref`: `const activeLevel = ref('All')`.
    2.  Update the `filteredGuides` computed function to include:
        ```typescript
        const levelMatch = activeLevel.value === 'All' || g.level === activeLevel.value;
        return matchSub && matchSearch && levelMatch;
        ```

### B. Modifying the Search Engine
The search currently checks guide names. To make it "Deep Search" (checking subjects and levels too):
*   Locate `matchSearch` in `App.vue` and change to:
    ```typescript
    const searchStr = query.value.toLowerCase();
    const qMatch = g.name.toLowerCase().includes(searchStr) || 
                   g.subject.toLowerCase().includes(searchStr) ||
                   g.level.toLowerCase().includes(searchStr);
    ```

---

## 3. Adding New Pages (Dynamic Routing)
Since this is a Single Page Application (SPA), you can add "pages" without a complex router by using a **Navigation State**.

### Example: Adding a "Seterra Games" Page
To insert a new section that loads an iframe game:

**1. Define the View State:**
In `App.vue` `<script setup>`:
```typescript
const currentView = ref('hub'); // 'hub' or 'games'
```

**2. Update the Template:**
Wrap your existing Hub code in a conditional, and add the new "Page":
```html
<!-- App.vue Template -->
<main v-if="currentView === 'hub'" class="content-container">
   <!-- Existing Grade Sections -->
</main>

<section v-if="currentView === 'games'" class="content-container">
   <h1 class="title-gradient">Seterra Geography Challenges</h1>
   <div class="glass-card" style="height: 80vh;">
      <iframe 
        src="https://www.seterra.com/online-game-embed-link" 
        width="100%" height="100%" frameborder="0">
      </iframe>
   </div>
</section>
```

**3. Add a Navigation Link:**
In the `<header>`, add a button to switch the view:
```html
<button @click="currentView = 'games'" class="filter-chip">Play Seterra</button>
<button @click="currentView = 'hub'" class="filter-chip">Study Guides</button>
```

---

## 4. Where to Insert New Functions
Depending on the function type, use these locations:

### A. UI Helper Functions
If you need a function to format text (e.g., making subjects uppercase), put it inside the `<script setup>` of `App.vue`:
```typescript
const formatSubject = (text: string) => text.toUpperCase();
```

### B. External API Calls
If you want to load data from a live Google Sheet or an API instead of `guides.ts`, insert an `onMounted` hook:
```typescript
import { onMounted } from 'vue';

onMounted(async () => {
  const response = await fetch('YOUR_API_ENDPOINT');
  const data = await response.json();
  guideData.value = data; // Note: you must change guideData to a ref()
});
```

---

## 5. Styling & Visual Customization (`src/assets/style.css`)

### A. Customizing the "Glass" Effect
The Glassmorphism is controlled by three variables. Modify these to change the "vibe":
*   `backdrop-filter: blur(12px);` → Increase for more "frost," decrease for more transparency.
*   `background: rgba(255, 255, 255, 0.03);` → Change the `0.03` to a higher number to make cards more visible.

### B. Changing the Color Theme
Find `:root` and change the HSL/Hex values:
*   `--primary`: Currently blue. Change to `#ff4757` for a red theme or `#2ed573` for green.
*   `--bg-dark`: Change the radial gradient to `linear-gradient` for a flat look.

---

## 6. TypeScript Enforcement (`src/types.ts`)
If you add new properties to your guides (like `author`, `dateAdded`, or `tags`), you **must** update the Interface:

```typescript
export interface Guide {
  grade: number;
  subject: string;
  level: string;
  name: string;
  url: string;
  author?: string; // The '?' means it is optional
  tags: string[];  // An array of strings
}
```

---

## 7. Build and Deployment Pipeline
1.  **Code Check:** Run `npm run type-check` to ensure no TypeScript errors exist.
2.  **Minification:** Run `npm run build`. Vite will perform "Tree Shaking"—it removes any code you aren't using to make the `dist` folder as tiny as possible.
3.  **Environment Variables:** If you have secret keys, create a `.env` file in the root and use `import.meta.env.VITE_KEY_NAME` to access them.

---

## 8. Troubleshooting for New Devs
*   **Problem:** Images/PDFs not loading.
    *   *Solution:* Ensure they are in `/public`. Paths in the code should **not** include the word `public`. Use `/guides/file.pdf`, not `./public/guides/file.pdf`.
*   **Problem:** The Spotlight (Mouse follow) is laggy.
    *   *Solution:* Check `style.css` for `will-change: transform;`. This tells the GPU to pre-render the movement.
*   **Problem:** Search doesn't find anything.
    *   *Solution:* Ensure `v-model="query"` is correctly linked to the `<input>` and that the `computed` property is actually using `query.value`.

---
*This hub is built to be modular. When in doubt, follow the pattern of creating a Reactive State (`ref`) and letting the Template (`v-if` / `v-for`) respond to it.*
