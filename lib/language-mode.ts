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
    description: "Modern React application with hooks and components",
    mode: "react" as LanguageMode,
    icon: "⚛️",
    files: [
      {
        name: "App.jsx",
        content: `import React, { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to React!');
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    if (count + 1 === 10) {
      setMessage('🎉 You reached 10 clicks!');
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #61dafb 0%, #21232a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ color: '#21232a', fontSize: '2.5rem', marginBottom: '1rem' }}>
          ⚛️ React Playground
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{message}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
          <button 
            onClick={() => setCount(count - 1)}
            style={{
              background: '#61dafb',
              color: '#21232a',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >-</button>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', minWidth: '60px' }}>{count}</span>
          <button 
            onClick={handleIncrement}
            style={{
              background: '#61dafb',
              color: '#21232a',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >+</button>
        </div>

        <div style={{ textAlign: 'left', margin: '2rem 0' }}>
          <h3>Quick Todo</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a todo..."
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '2px solid #61dafb',
                borderRadius: '5px',
                outline: 'none'
              }}
            />
            <button
              onClick={addTodo}
              style={{
                background: '#61dafb',
                color: '#21232a',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map(todo => (
              <li key={todo.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                borderBottom: '1px solid #eee'
              }}>
                <span
                  onClick={() => toggleTodo(todo.id)}
                  style={{
                    cursor: 'pointer',
                    flex: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1
                  }}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >×</button>
              </li>
            ))}
          </ul>
        </div>
        
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
          Edit <code style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>App.jsx</code> and save to see changes!
        </p>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`,
        language: "jsx",
      },
    ],
  },
  {
    id: "vue-starter",
    name: "Vue.js App",
    description: "Vue 3 application with Composition API and reactivity",
    mode: "vue" as LanguageMode,
    icon: "💚",
    files: [
      {
        name: "App.vue",
        content: `const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const count = ref(0);
    const newTodo = ref('');
    const todos = ref([]);

    const message = computed(() => {
      if (count.value >= 10) return '🎉 Great job clicking!';
      return 'Welcome to Vue.js!';
    });

    const increment = () => {
      count.value++;
    };

    const decrement = () => {
      count.value--;
    };

    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value.push({
          id: Date.now(),
          text: newTodo.value,
          completed: false
        });
        newTodo.value = '';
      }
    };

    const toggleTodo = (id) => {
      const todo = todos.value.find(t => t.id === id);
      if (todo) todo.completed = !todo.completed;
    };

    const removeTodo = (id) => {
      todos.value = todos.value.filter(t => t.id !== id);
    };

    onMounted(() => {
      console.log('💚 Vue.js app mounted!');
    });

    return {
      count,
      newTodo,
      todos,
      message,
      increment,
      decrement,
      addTodo,
      toggleTodo,
      removeTodo
    };
  },

  template: \`
    <div style="min-height: 100vh; background: linear-gradient(135deg, #42b883 0%, #35495e 100%); display: flex; align-items: center; justify-content: center; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="background: rgba(255, 255, 255, 0.95); padding: 2rem; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 100%;">
        <h1 style="color: #35495e; margin-bottom: 1rem; font-size: 2.5rem;">💚 Vue.js Playground</h1>
        <p style="color: #666; margin-bottom: 2rem;">{{ message }}</p>
        
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin: 2rem 0;">
          <button @click="decrement" style="background: #42b883; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer;">-</button>
          <span style="font-size: 2rem; font-weight: bold; min-width: 60px; padding: 0.5rem; background: #f0f0f0; border-radius: 10px;">{{ count }}</span>
          <button @click="increment" style="background: #42b883; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer;">+</button>
        </div>
        
        <div style="margin: 2rem 0; text-align: left;">
          <h3>Quick Todo</h3>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input 
              v-model="newTodo" 
              @keyup.enter="addTodo"
              placeholder="Add a todo..."
              style="flex: 1; padding: 0.5rem; border: 2px solid #42b883; border-radius: 5px; outline: none;"
            />
            <button @click="addTodo" style="background: #42b883; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Add</button>
          </div>
          <ul style="list-style: none; padding: 0;">
            <li v-for="todo in todos" :key="todo.id" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee;">
              <span 
                @click="toggleTodo(todo.id)" 
                :style="{ cursor: 'pointer', flex: 1, textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1 }"
              >
                {{ todo.text }}
              </span>
              <button @click="removeTodo(todo.id)" style="background: #e74c3c; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">×</button>
            </li>
          </ul>
        </div>
        
        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
          Edit <code style="background: #f0f0f0; padding: 0.2rem 0.5rem; border-radius: 4px;">App.vue</code> and save to see changes!
        </p>
      </div>
    </div>
  \`
}).mount('#app');`,
        language: "vue",
      },
    ],
  },
  {
    id: "nextjs-starter",
    name: "Next.js App",
    description: "Full-stack Next.js application with modern features",
    mode: "nextjs" as LanguageMode,
    icon: "▲",
    files: [
      {
        name: "page.js",
        content: `'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState(0)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    setMounted(true)
    // Simulate API call
    setTimeout(() => {
      setPosts([
        { id: 1, title: 'Welcome to Next.js!', content: 'This is your first post with server-side rendering.' },
        { id: 2, title: 'API Routes', content: 'Build full-stack apps with built-in API routes.' },
        { id: 3, title: 'Performance', content: 'Optimized for speed with automatic code splitting.' }
      ])
    }, 1000)
  }, [])

  const addPost = () => {
    if (newPost.trim()) {
      setPosts([...posts, {
        id: Date.now(),
        title: newPost,
        content: 'This is a new post created dynamically!'
      }])
      setNewPost('')
    }
  }

  if (!mounted) return null

  return (
    <div style={{
      padding: '0 2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <main style={{
        minHeight: '100vh',
        padding: '4rem 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{
          margin: 0,
          lineHeight: 1.15,
          fontSize: '4rem',
          textAlign: 'center',
          background: 'linear-gradient(45deg, #ffffff, #888888)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ▲ Welcome to Next.js!
        </h1>

        <p style={{
          margin: '4rem 0',
          lineHeight: 1.5,
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>
          Get started by editing <code style={{
            background: '#333',
            borderRadius: '5px',
            padding: '0.75rem',
            fontSize: '1.1rem',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace'
          }}>page.js</code>
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '2rem 0'
        }}>
          <button 
            onClick={() => setCount(count - 1)}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >-</button>
          <span style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            minWidth: '60px',
            textAlign: 'center'
          }}>{count}</span>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >+</button>
        </div>

        <div style={{ margin: '2rem 0', textAlign: 'center' }}>
          <h3>Add New Post</h3>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPost()}
              placeholder="Enter post title..."
              style={{
                padding: '0.5rem',
                border: '1px solid #333',
                borderRadius: '5px',
                background: '#1a1a1a',
                color: 'white',
                outline: 'none'
              }}
            />
            <button
              onClick={addPost}
              style={{
                background: 'white',
                color: 'black',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >Add Post</button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '800px',
          gap: '1rem'
        }}>
          {posts.map(post => (
            <div key={post.id} style={{
              margin: '1rem',
              padding: '1.5rem',
              textAlign: 'left',
              border: '1px solid #333',
              borderRadius: '10px',
              maxWidth: '300px',
              background: 'rgba(255, 255, 255, 0.05)'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem'
              }}>{post.title}</h3>
              <p style={{
                margin: 0,
                fontSize: '1.25rem',
                lineHeight: 1.5,
                opacity: 0.8
              }}>{post.content}</p>
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
        name: "layout.js",
        content: `export const metadata = {
  title: 'Next.js Playground',
  description: 'A Next.js application playground with CodeNANO',
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
