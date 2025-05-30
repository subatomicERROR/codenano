"use client"

export type LanguageMode = "html" | "react" | "vue" | "nextjs" | "astro" | "python" | "markdown"

export const languageConfigs: Record<LanguageMode, { name: string; description: string; icon: string }> = {
  html: {
    name: "HTML/CSS/JS",
    description: "Classic web development with HTML, CSS, and JavaScript",
    icon: "🌐",
  },
  react: {
    name: "React",
    description: "React application with JSX and modern hooks",
    icon: "⚛️",
  },
  vue: {
    name: "Vue.js",
    description: "Vue 3 application with Composition API",
    icon: "💚",
  },
  nextjs: {
    name: "Next.js",
    description: "Full-stack React framework with SSR",
    icon: "▲",
  },
  astro: {
    name: "Astro",
    description: "Modern static site generator",
    icon: "🚀",
  },
  python: {
    name: "Python",
    description: "Python scripts running in the browser via Pyodide",
    icon: "🐍",
  },
  markdown: {
    name: "Markdown",
    description: "Markdown documents with live preview",
    icon: "📝",
  },
}

export const projectTemplates = [
  {
    id: "html-starter",
    name: "HTML Playground",
    description: "CodePen-style HTML, CSS, and JavaScript playground",
    mode: "html" as LanguageMode,
    icon: "🌐",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNANO Playground</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to CodeNANO</h1>
        <p>Start building something amazing!</p>
        <button id="clickBtn" class="btn">Click me!</button>
        <div id="output"></div>
    </div>
</body>
</html>`,
        language: "html",
      },
      {
        name: "style.css",
        content: `/* CodeNANO Playground Styles */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    text-align: center;
    max-width: 500px;
    width: 100%;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

#output {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    min-height: 50px;
}`,
        language: "css",
      },
      {
        name: "script.js",
        content: `// CodeNANO Playground JavaScript
console.log('🚀 CodeNANO Playground loaded!');

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('clickBtn');
    const output = document.getElementById('output');
    let clickCount = 0;

    btn.addEventListener('click', function() {
        clickCount++;
        output.innerHTML = \`
            <h3>Button clicked \${clickCount} time\${clickCount !== 1 ? 's' : ''}!</h3>
            <p>Keep clicking to see the magic ✨</p>
        \`;
        
        // Add some fun effects
        if (clickCount % 5 === 0) {
            output.style.background = '#e3f2fd';
            output.innerHTML += '<p><strong>🎉 Milestone reached!</strong></p>';
        }
        
        console.log(\`Button clicked \${clickCount} times\`);
    });
    
    // Add some interactive features
    document.body.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            btn.click();
        }
    });
});`,
        language: "javascript",
      },
    ],
  },
  {
    id: "react-starter",
    name: "React App",
    description: "Modern React application with hooks",
    mode: "react" as LanguageMode,
    icon: "⚛️",
    files: [
      {
        name: "App.jsx",
        content: `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to React!');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    if (count + 1 === 10) {
      setMessage('🎉 You reached 10 clicks!');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚛️ React Playground</h1>
        <p>{message}</p>
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={handleIncrement}>+</button>
        </div>
        <p className="hint">
          Edit <code>App.jsx</code> and save to see changes!
        </p>
      </header>
    </div>
  );
}

export default App;`,
        language: "jsx",
      },
      {
        name: "App.css",
        content: `.app {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #61dafb 0%, #21232a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  color: white;
  max-width: 500px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.counter button {
  background: #61dafb;
  color: #21232a;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.counter button:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(97, 218, 251, 0.4);
}

.count {
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.hint {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 1rem;
}

code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}`,
        language: "css",
      },
      {
        name: "index.js",
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
        language: "javascript",
      },
    ],
  },
  {
    id: "vue-starter",
    name: "Vue.js App",
    description: "Vue 3 application with Composition API",
    mode: "vue" as LanguageMode,
    icon: "💚",
    files: [
      {
        name: "App.vue",
        content: `<template>
  <div class="app">
    <div class="container">
      <h1>💚 Vue.js Playground</h1>
      <p>{{ message }}</p>
      
      <div class="counter">
        <button @click="decrement">-</button>
        <span class="count">{{ count }}</span>
        <button @click="increment">+</button>
      </div>
      
      <div class="todo-section">
        <h3>Quick Todo</h3>
        <div class="todo-input">
          <input 
            v-model="newTodo" 
            @keyup.enter="addTodo"
            placeholder="Add a todo..."
          />
          <button @click="addTodo">Add</button>
        </div>
        <ul class="todo-list">
          <li v-for="todo in todos" :key="todo.id" class="todo-item">
            <span :class="{ completed: todo.completed }" @click="toggleTodo(todo.id)">
              {{ todo.text }}
            </span>
            <button @click="removeTodo(todo.id)" class="remove-btn">×</button>
          </li>
        </ul>
      </div>
      
      <p class="hint">
        Edit <code>App.vue</code> and save to see changes!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const newTodo = ref('')
const todos = ref([])

const message = computed(() => {
  if (count.value >= 10) return '🎉 Great job clicking!'
  return 'Welcome to Vue.js!'
})

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value,
      completed: false
    })
    newTodo.value = ''
  }
}

const toggleTodo = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.completed = !todo.completed
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

onMounted(() => {
  console.log('💚 Vue.js app mounted!')
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

h1 {
  color: #35495e;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.counter button {
  background: #42b883;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.counter button:hover {
  background: #369870;
  transform: scale(1.1);
}

.count {
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 10px;
}

.todo-section {
  margin: 2rem 0;
  text-align: left;
}

.todo-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #42b883;
  border-radius: 5px;
  outline: none;
}

.todo-input button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.todo-item span {
  cursor: pointer;
  flex: 1;
}

.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}

.hint {
  font-size: 0.9rem;
  color: #666;
  margin-top: 1rem;
}

code {
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style>`,
        language: "vue",
      },
    ],
  },
  {
    id: "nextjs-starter",
    name: "Next.js App",
    description: "Full-stack Next.js application",
    mode: "nextjs" as LanguageMode,
    icon: "▲",
    files: [
      {
        name: "page.js",
        content: `'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState(0)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    setMounted(true)
    // Simulate API call
    setTimeout(() => {
      setPosts([
        { id: 1, title: 'Welcome to Next.js!', content: 'This is your first post.' },
        { id: 2, title: 'Server-Side Rendering', content: 'Next.js provides SSR out of the box.' },
        { id: 3, title: 'API Routes', content: 'Build full-stack apps with API routes.' }
      ])
    }, 1000)
  }, [])

  if (!mounted) return null

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          ▲ Welcome to Next.js!
        </h1>

        <p className={styles.description}>
          Get started by editing <code className={styles.code}>page.js</code>
        </p>

        <div className={styles.counter}>
          <button onClick={() => setCount(count - 1)}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>

        <div className={styles.grid}>
          {posts.map(post => (
            <div key={post.id} className={styles.card}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}`,
        language: "javascript",
      },
      {
        name: "page.module.css",
        content: `.container {
  padding: 0 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: white;
}

.main {
  min-height: 100vh;
  padding: 4rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
  background: linear-gradient(45deg, #ffffff, #888888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  margin: 4rem 0;
  line-height: 1.5;
  font-size: 1.5rem;
  text-align: center;
}

.code {
  background: #333;
  border-radius: 5px;
  padding: 0.75rem;
  font-size: 1.1rem;
  font-family: Menlo, Monaco, 'Courier New', monospace;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.counter button {
  background: white;
  color: black;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.counter button:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
}

.counter span {
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.grid {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
  gap: 1rem;
}

.card {
  margin: 1rem;
  padding: 1.5rem;
  text-align: left;
  color: inherit;
  text-decoration: none;
  border: 1px solid #333;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.05);
}

.card:hover {
  border-color: #666;
  background: rgba(255, 255, 255, 0.1);
}

.card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.card p {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.5;
  opacity: 0.8;
}`,
        language: "css",
      },
      {
        name: "layout.js",
        content: `export const metadata = {
  title: 'Next.js Playground',
  description: 'A Next.js application playground',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
        language: "javascript",
      },
    ],
  },
  {
    id: "astro-starter",
    name: "Astro Site",
    description: "Modern static site with Astro",
    mode: "astro" as LanguageMode,
    icon: "🚀",
    files: [
      {
        name: "index.astro",
        content: `---
// Astro component script (runs at build time)
const title = "Welcome to Astro!";
const features = [
  "🚀 Zero JavaScript by default",
  "⚡ Lightning fast builds",
  "🎨 Component-based architecture",
  "📦 Built-in optimizations"
];
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body>
    <main>
      <div class="container">
        <h1>🚀 {title}</h1>
        <p>Build faster websites with less client-side JavaScript.</p>
        
        <div class="features">
          {features.map(feature => (
            <div class="feature-card">
              {feature}
            </div>
          ))}
        </div>
        
        <div class="interactive-section">
          <h3>Interactive Counter</h3>
          <div id="counter">
            <button id="decrement">-</button>
            <span id="count">0</span>
            <button id="increment">+</button>
          </div>
        </div>
        
        <p class="hint">
          Edit <code>index.astro</code> and save to see changes!
        </p>
      </div>
    </main>
  </body>
</html>

<style>
  body {
    font-family: system-ui, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .container {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    text-align: center;
    max-width: 600px;
    width: 100%;
  }
  
  h1 {
    color: #333;
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .feature-card {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 10px;
    border-left: 4px solid #ff6b6b;
    text-align: left;
  }
  
  .interactive-section {
    margin: 2rem 0;
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 10px;
  }
  
  #counter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  #counter button {
    background: #4ecdc4;
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  #counter button:hover {
    background: #45b7aa;
    transform: scale(1.1);
  }
  
  #count {
    font-size: 2rem;
    font-weight: bold;
    min-width: 60px;
    padding: 0.5rem;
    background: white;
    border-radius: 10px;
    border: 2px solid #4ecdc4;
  }
  
  .hint {
    font-size: 0.9rem;
    color: #888;
    margin-top: 2rem;
  }
  
  code {
    background: #e9ecef;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
</style>

<script>
  // Client-side JavaScript (runs in the browser)
  let count = 0;
  
  const countElement = document.getElementById('count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  
  function updateCount() {
    countElement.textContent = count;
  }
  
  incrementBtn.addEventListener('click', () => {
    count++;
    updateCount();
    console.log('Count incremented:', count);
  });
  
  decrementBtn.addEventListener('click', () => {
    count--;
    updateCount();
    console.log('Count decremented:', count);
  });
  
  console.log('🚀 Astro page loaded!');
</script>`,
        language: "astro",
      },
    ],
  },
]

// Get template by ID
export function getTemplate(templateId: string) {
  return projectTemplates.find((template) => template.id === templateId)
}

// Get templates by mode
export function getTemplatesByMode(mode: LanguageMode) {
  return projectTemplates.filter((template) => template.mode === mode)
}
