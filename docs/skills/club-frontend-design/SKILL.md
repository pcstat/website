# Club Frontend Design System

**Name**: club-frontend-design
**Description**: Comprehensive design system for the Statistics Programming Club website. Use this skill whenever you need to create new pages, components, or standalone sites that match the club's visual identity. This guide covers the unified Next.js architecture, theme system, responsive design, animations, and component patterns to ensure consistency across all digital properties.

---

## 🎨 Design Foundations

### Theme Contrast Fixes (Updated June 2026)

**Issue**: The original theme colors had insufficient luminance separation, making cards and surfaces difficult to distinguish from backgrounds, especially in dark mode. Borders were also invisible in light mode due to using white opacity on white backgrounds.

**Solution**: Updated color values to ensure proper contrast ratios:

- **Dark Theme**: Increased separation between background, surface, and secondary surface layers
- **Light Theme**: Adjusted background and surface colors for better visibility. Replaced simple black opacity borders with a refined cool-grey palette and introduced subtle box-shadows for depth.
- **Borders**: Fixed light theme borders to use a cohesive cool-grey palette instead of pure black opacity.

These changes maintain the club's visual identity while improving accessibility and usability.

### Design Polish Layer (October 2026)

A refinement layer at the end of `src/app/globals.css` ("DESIGN POLISH") sharpens depth, rhythm and detail **without changing the palette or the fonts**:

- One card recipe for every surface (`.ec`, `.ac2`, `.ach`, `.ev`, `.abc`, `.mtc`, `.proj-card`, `.c-card`): soft top-lit gradient, 14px radius, accent glow on hover.
- Page headers get an eyebrow rule and a short accent underline; headings use balanced wrapping.
- Home hero: headline sized from its column (`cqi` units) so each statement stays on one line; terminal is a lit window; stats are a ledger strip under the hero.
- Sidebar nav icons are quiet outlined chips (accent fill only when active).
- New: site footer (`.sf`), empty state (`.empty-state`), styled 404 (`src/app/not-found.tsx`), visible keyboard focus, reduced-motion support.

To roll the look back, delete that section (and the `.sf` footer / `.empty-state` markup).

### Second Polish Pass (October 2026)

- **Home terminal** (`src/components/Terminal.tsx`) is a club shell, not a code demo: it types `pcstat about / stats / projects / events / join` and prints live numbers, the three latest projects and the next event from the database (`terminalView` in `src/lib/views.ts`). Visitors can re-run any command with the chips under the window. Reduced-motion users get the finished output instantly.
- **Home sections** under the hero (latest projects, the committee, a join call-to-action) read the same data (`homeExtras`).
- **Profile & CV pages** share a slim fixed `PageBar` (`src/components/PageBar.tsx`): back button, section links with the active one highlighted, reading progress, theme toggle, and the person's name once the big heading scrolls away.
- **Long names:** `FitName` (`src/components/FitName.tsx`) sizes a heading to its text — full size for short names, scaled down for many words or one very long word, and as a last resort it breaks the word (hyphenated if the browser can) — so a name never overflows or stretches the layout. Use it for any new place that shows a person's name large. Cards and chips elsewhere wrap names with `overflow-wrap: anywhere`.
- **CV:** the CV prints as a clean one-colour page (Print / PDF button, `@media print` in `cv.module.css`); empty database values such as `null /4.0` are not shown.

### Default Profile & Equal Boxes (October 2026)

- **Default profile** (`DefaultProfile.tsx`) is the page every executive without a `profile.json` gets. It is built to look finished with almost nothing: a monogram portrait when there is no photo, an intro sentence generated from role and committee when there is no bio, sections that appear only when they have content, a count strip ("At a glance") only when there is something to count, and a friendly empty state when there is no work yet. Never render a heading or box for data that is missing.
- **Equal boxes, never a split word:** `StatGrid` (`src/components/StatGrid.tsx`) lays out boxes of a number/word plus a caption. All boxes stay the same size and all values share ONE font size, chosen as the largest that fits. When values are long it first uses fewer, wider columns (down to a single stack), then shrinks everything together, and only as a last resort splits a word. Use it for any new row of stat-like boxes instead of per-box sizing.
- Do not put `overflow-wrap: anywhere` on text inside shrink-to-fit boxes: it lowers the element's minimum width and makes ordinary words ("Llama") break early. Use `overflow-wrap: break-word` there.
- The admin panel keeps verbatim copies of `FitName.tsx`, `StatGrid.tsx` and the profile / CV CSS modules (its `src/mirror/`). Re-copy them whenever these change.

### Color System

The club uses a dual-theme color system with CSS variables for easy theming:

#### Dark Theme (Default)
```css
--bg: #080c14;           /* Background */
--surface: #111827;     /* Card surfaces */
--s2: #1a2235;          /* Secondary surfaces */
--txt: #e6edf3;         /* Primary text */
--mut: rgba(230, 237, 243, 0.8);  /* Muted text */
--ac: #00d97e;          /* Accent (primary brand color) */
--acd: rgba(0, 217, 126, .08);   /* Accent dark */
--acg: rgba(0, 217, 126, .22);   /* Accent glow */
--bl: #58a6ff;          /* Blue accent */
--bld: rgba(88, 166, 255, .1);  /* Blue dark */
--or: #f0883e;          /* Orange */
--pu: #a78bfa;          /* Purple */
--pud: rgba(167, 139, 250, .1);  /* Purple dark */
--py: #fbbf24;          /* Yellow */
--rp: #3b79f5;          /* Rich purple */
```

#### Light Theme
```css
--bg: #edf0f5;
--surface: #ffffff;
--s2: #f4f7fb;
--txt: #0f172a;
--mut: rgba(15, 23, 42, .85);
--ac: #00b366;
--acd: rgba(0, 179, 102, .08);
--acg: rgba(0, 179, 102, .22);
--bl: #1d4ed8;
--bld: rgba(29, 78, 216, .1);
--or: #c2410c;
--pu: #7c3aed;
--pud: rgba(124, 58, 237, .1);
--py: #b45309;
--rp: #1e40af;
--shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
```

### Typography

**Primary Fonts:**
- `--fh`: 'Syne', monospace (headings, large display text)
- `--fm`: 'SpaceMono', monospace (body text, UI elements)

**Font Weights:**
- Headings: 700-800 (bold)
- Body: 400 (regular)
- Labels: 600 (semi-bold)

### Spacing System

```css
--gap: 1rem;      /* Standard gap between elements */
--pad: 1.5rem;    /* Standard padding */
--rad: 4px;      /* Standard border radius */
--ease: .28s cubic-bezier(.4, 0, .2, 1);  /* Standard transition */
```

### Borders

```css
--b: rgba(255, 255, 255, .07);   /* Light border (dark theme) */
--b2: rgba(255, 255, 255, .13);  /* Medium border (dark theme) */
```

**Light Theme Borders** (automatically applied via `[data-theme="light"]`):
```css
--b: #d1d9e6;    /* Light border (light theme) */
--b2: #b8c4d6;   /* Medium border (light theme) */
```

---

## 🌓 Theme System

### Implementation Pattern

The site uses a React Context-based theme system with localStorage persistence:

#### 1. Theme Context (`src/context/ThemeContext.tsx`)

```typescript
// Core state management
export const ThemeContext = createContext<ThemeContextType>({});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### 2. Flash Prevention

Add this inline script in `layout.tsx` before React hydration:

```javascript
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    })();
  `
}} />
```

#### 3. Theme Toggle Component

```typescript
'use client';

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={toggleTheme} className="theme-switch">
      <div className="switch-thumb">
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
```

### CSS Implementation

```css
/* Base theme application */
:root {
  /* Dark theme variables */
}

[data-theme="light"] {
  /* Light theme overrides */
}

/* Theme switch styles */
.theme-switch {
  width: 44px;
  height: 24px;
  background: var(--b2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background var(--ease);
}

.switch-thumb {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform var(--ease);
}

[data-theme="light"] .switch-thumb {
  transform: translateX(20px);
}
```

---

## ✨ Signature Animations & Effects

### 1. Hover Effect (Standard Card)

All interactive cards use this signature hover pattern:

```css
.card {
  transition: border-color .2s, transform .2s, background .2s;
  position: relative;
  overflow: hidden;
}

.card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--ac);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .28s ease;
}

.card:hover {
  border-color: var(--b2);
  background: var(--s2);
  transform: translateY(-3px);
}

.card:hover::after {
  transform: scaleX(1);
}
```

### 2. Fade-Up Animation

Used for staggered entry animations:

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Usage */
.element {
  opacity: 0;
  animation: fadeUp .8s ease .3s both;
}
```

### 3. Pulse Animation

For attention-grabbing elements:

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: .4;
    transform: scale(.75);
  }
}

.pulse {
  animation: pulse 2s ease infinite;
}
```

### 4. Blink Cursor

For terminal-like interfaces:

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cursor {
  animation: blink 1s step-end infinite;
}
```

---

## 📱 Responsive Design System

### General Layout Handling

To prevent content clipping on small screens while maintaining fixed elements:

- Use `overflow-x: auto` on the `body` or main container to allow users to scroll horizontally if content exceeds the viewport.
- Ensure fixed navigation bars have `overflow: visible` to prevent clipping of dropdowns or interactive elements.

### Breakpoint Values

```css
/* Mobile - Small devices */
@media (max-width: 650px) {
  /* Mobile-specific adjustments */
}

/* Tablet - Medium devices */
@media (max-width: 1000px) {
  /* Tablet-specific adjustments */
}

/* Low height or portrait orientation */
@media (max-height: 500px), (max-aspect-ratio: 1) {
  /* Compact layout adjustments */
}
```

### Mobile Layout Patterns

#### 1. Sidebar Collapse

```css
@media (max-width: 1000px) {
  .sb {
    display: none;
  }
  
  .tn {
    display: flex; /* Show mobile top nav */
    overflow: visible;
  }
  
  .ct {
    margin-left: 0 !important;
    padding-top: var(--nh); /* Account for mobile header */
  }
}
```

#### 2. Grid Simplification

```css
@media (max-width: 650px) {
  .egrid {
    grid-template-columns: 1fr;
  }
  
  .proj-grid {
    grid-template-columns: 1fr;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

#### 3. Card Stacking

```css
@media (max-width: 650px) {
  .ec.pres {
    grid-column: span 1;
    flex-direction: column;
  }
  
  .proj-card.featured {
    grid-column: span 1;
    flex-direction: column;
  }
}
```

#### 4. Event Layout Adjustment

```css
@media (max-width: 480px) {
  .ev {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
    align-items: flex-start !important;
  }
}
```

---

## 🧩 Component Library

### 1. Navigation System

#### Desktop Sidebar

```html
<div className="sb">
  <div className="sbh">
    <div className="sbb">
      <div className="lm">Statistics<span>.</span></div>
      <div className="ls">// Programming Club</div>
    </div>
  </div>
  <div className="nis">
    <!-- Navigation items -->
  </div>
</div>
```

#### Mobile Top Navigation

```html
<div className="tn">
  <div className="lm">Statistics<span>.</span></div>
  <div className="tn-right">
    <button className="tn-theme-toggle">
      <div className="theme-switch"><div className="switch-thumb"></div></div>
    </button>
    <div className="hbg">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</div>
```

### 2. Card Components

#### Executive Card

```html
<div className="ec">
  <div className="eav">{initial}</div>
  <div className="erl">// {role}</div>
  <div className="enm">{name}</div>
  <div className="edp">{session}</div>
  <div className="ebi">{bio}</div>
</div>
```

#### Project Card

```html
<div className="proj-card">
  <div className="proj-status active">
    <div className="proj-status-dot"></div>
    Active
  </div>
  <h3 className="proj-title">{title}</h3>
  <p className="proj-desc">{description}</p>
  <div className="proj-tags">
    {tags.map(tag => <span className="proj-tag">{tag}</span>)}
  </div>
  <div className="proj-footer">
    <div className="proj-members">{members.join(', ')}</div>
    <div className="proj-links">
      <a className="proj-link repo" href={link}>Repo ↗</a>
      <a className="proj-link demo" href={demo_link}>Demo ↗</a>
    </div>
  </div>
</div>
```

### 3. Button System

```html
<button className="portfolio-btn portfolio-btn-primary">
  Primary Action
</button>

<button className="portfolio-btn portfolio-btn-secondary">
  Secondary Action
</button>
```

### 4. Achievement Card

```html
<div className="ach gold">
  <div className="ai">🏆</div>
  <div className="ayr">Gold Medal</div>
  <h3 className="atl">{title}</h3>
  <div className="aev">{event}</div>
  <div className="amm">
    <strong>Team:</strong> {members.join(', ')}
  </div>
</div>
```

---

## 🎨 Page Layout Patterns

### 1. Standard Page Structure

```html
<div className="pg active">
  <div className="ph">
    <div className="pe">// PAGE CATEGORY</div>
    <h1 className="pt">Page <span>Title</span></h1>
    <p className="pd">Page description goes here</p>
  </div>
  
  <!-- Page content -->
  <div className="content-grid">
    <!-- Cards/items go here -->
  </div>
</div>
```

### 2. Grid Layouts

```css
/* Executive grid */
.egrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
  gap: 1.1rem;
}

/* Project grid */
.proj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.1rem;
}

/* Achievement grid */
.agrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.1rem;
}
```

### 3. Hero Section (Homepage)

```html
<div className="hero">
  <div className="hero-left">
    <div className="htag">// WELCOME</div>
    <h1 className="htitle">
      We <span className="ac">build</span><br>
      with <span className="ac">data</span>
    </h1>
    <p className="hdesc">
      The Statistics Programming Club creates intelligent systems
    </p>
    <div className="focus-pills">
      <div className="pill pill-py">Python</div>
      <div className="pill pill-ml">ML/AI</div>
      <div className="pill pill-st">Statistics</div>
    </div>
  </div>
  <div className="hero-right">
    <div className="term">
      <!-- Terminal component -->
    </div>
    <div className="stats">
      <!-- Stats grid -->
    </div>
  </div>
</div>
```

---

## 🎭 Dynamic Profile System

For creating standalone profile pages that match the club's design:

### Layout Structure

```html
<!-- Global Mobile Top Navigation (provided automatically by LayoutWrapper for /profile routes) -->

<div className="dynamic-profile">
  <!-- Hero section -->
  <div className="profile-hero">
    <div className="profile-avatar">
      <img src={photo} alt={name} />
    </div>
    <div className="profile-info">
      <h1>{name}</h1>
      <div className="profile-tagline">{tagline}</div>
      <div className="profile-role">{role}</div>
      <div className="profile-subtitle">{subtitle}</div>
      <div className="profile-location">{location}</div>
      <div className="profile-session">{session}</div>
      
      <div className="profile-socials">
        {socials.map(social => (
          <a href={social.url} className={`social-link ${social.type}`}>
            {social.label}
          </a>
        ))}
      </div>
    </div>
    
    <div className="profile-stats">
      {stats.map(stat => (
        <div className="stat-item">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
  
  <!-- Biography -->
  <div className="profile-bio">
    <pre>{bio}</pre>
    
    <div className="focus-areas">
      {focus_areas.map(area => (
        <span className="focus-pill">{area}</span>
      ))}
    </div>
    
    <div className="timeline">
      {timeline.map(item => (
        <div className="timeline-item">
          <div className="timeline-year">{item.year}</div>
          <div className="timeline-role">{item.role}</div>
        </div>
      ))}
    </div>
  </div>
  
  <!-- Skills -->
  <div className="profile-skills">
    {skills.map(skill => (
      <div className="skill-category">
        <h3>{skill.category}</h3>
        <div className="skill-items">
          {skill.items.map(item => (
            <span className="skill-pill">{item}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
  
  <!-- Projects -->
  <div className="profile-projects">
    <h2>// Featured Work</h2>
    <div className="projects-grid">
      {projects.filter(p => p.featured).map(project => (
        <ProjectCard {...project} />
      ))}
    </div>
    
    <h2>// All Projects</h2>
    <div className="projects-grid">
      {projects.filter(p => !p.featured).map(project => (
        <ProjectCard {...project} />
      ))}
    </div>
  </div>
  
  <!-- Achievements -->
  <div className="profile-achievements">
    <h2>// Achievements</h2>
    <div className="achievements-grid">
      {achievements.map(achievement => (
        <AchievementCard {...achievement} />
      ))}
    </div>
  </div>
  
  <!-- CV Link -->
  <div className="profile-cv">
    <a href={cv_link} className="portfolio-btn portfolio-btn-primary portfolio-btn-lg">
      View CV ↗
    </a>
  </div>
</div>
```

### Styling Guidelines

```css
/* Full viewport canvas */
.dynamic-profile {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}


/* Hero section */
.profile-hero {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-top: 4rem;
  align-items: center;
}

/* Avatar */
.profile-avatar img {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid var(--b2);
}

/* Stats grid */
.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

/* Section headers */
.profile-section-header {
  font-family: var(--fm);
  font-size: 0.7rem;
  color: var(--ac);
  letter-spacing: 0.1em;
  margin-bottom: 0.7rem;
  font-weight: 800;
}

/* Skill pills */
.skill-pill {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--b2);
  border-radius: 20px;
  font-size: 0.65rem;
  margin: 0.2rem;
  transition: all 0.2s;
}

.skill-pill:hover {
  border-color: var(--ac);
  color: var(--ac);
}
```

---

## 📄 CV System

For creating standalone CV pages:

### Layout Structure

```html
<!-- Global Mobile Top Navigation (provided automatically by LayoutWrapper for /cv routes) -->

<div className="cv-container">
  <!-- Header -->
  <div className="cv-header">
    <div className="cv-avatar">
      <div className="cv-initials">{initials}</div>
    </div>
    <div className="cv-info">
      <h1>{name}</h1>
      <div className="cv-role">{role}</div>
      <div className="cv-location">{location}</div>
      <div className="cv-contact">
        <a href={`mailto:${email}`}>{email}</a>
        <span>•</span>
        <a href={github} target="_blank">GitHub</a>
      </div>
    </div>
  </div>
  
  <!-- Main content -->
  <div className="cv-main">
    <!-- Sidebar -->
    <div className="cv-sidebar">
      <div className="cv-section">
        <h2>// Education</h2>
        {education.map(edu => (
          <div className="cv-education-item">
            <div className="cv-degree">{edu.degree}</div>
            <div className="cv-institution">{edu.institution}</div>
            <div className="cv-year">{edu.year}</div>
            {edu.cgpa && <div className="cv-cgpa">CGPA: {edu.cgpa}</div>}
            {edu.rank && <div className="cv-rank">Rank: {edu.rank}</div>}
          </div>
        ))}
      </div>
      
      <div className="cv-section">
        <h2>// Certifications</h2>
        {certifications.map(cert => (
          <div className="cv-cert-item">
            <a href={cert.link} target="_blank">{cert.title}</a>
          </div>
        ))}
      </div>
      
      <div className="cv-section">
        <h2>// Languages</h2>
        <div className="cv-languages">
          {languages.join(', ')}
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div className="cv-content">
      <div className="cv-section">
        <h2>// Experience</h2>
        {experience.map(exp => (
          <div className="cv-experience-item">
            <div className="cv-exp-header">
              <div className="cv-exp-title">{exp.title}</div>
              <div className="cv-exp-dates">{exp.dates}</div>
            </div>
            <div className="cv-exp-subtitle">{exp.subtitle}</div>
            <div className="cv-exp-bullets">
              {exp.bullets.map(bullet => (
                <div className="cv-bullet">
                  <div className="cv-bullet-text">{bullet.text}</div>
                  {bullet.children && (
                    <div className="cv-bullet-children">
                      {bullet.children.map(child => (
                        <div className="cv-bullet-child">• {child}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Dynamic sections */}
      {Object.entries(customSections).map(([key, items]) => (
        <div className="cv-section">
          <h2>// {key.replace(/_/g, ' ')}</h2>
          {items.map(item => (
            <div className="cv-custom-item">
              {item.title && <div className="cv-custom-title">{item.title}</div>}
              {item.dates && <div className="cv-custom-dates">{item.dates}</div>}
              {item.subtitle && <div className="cv-custom-subtitle">{item.subtitle}</div>}
              {item.bullets && (
                <ul className="cv-custom-bullets">
                  {item.bullets.map(bullet => (
                    <li>{bullet}</li>
                  ))}
                </ul>
              )}
              {item.commas && (
                <div className="cv-custom-commas">
                  {item.commas.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
  
  <!-- Profile link -->
  <div className="cv-footer">
    <a href={`/profile?id=${student_id}`} className="portfolio-btn portfolio-btn-primary">
      View Profile ↗
    </a>
  </div>
</div>
```

### Styling Guidelines

```css
.cv-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: var(--fm);
}

.cv-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: center;
}

.cv-avatar {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: var(--s2);
  border: 1px solid var(--b2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  color: var(--ac);
}

.cv-info h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.cv-main {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
}

.cv-section {
  margin-bottom: 2.5rem;
}

.cv-section h2 {
  font-family: var(--fm);
  font-size: 0.7rem;
  color: var(--ac);
  letter-spacing: 0.1em;
  margin-bottom: 0.7rem;
  font-weight: 800;
}

.cv-experience-item {
  margin-bottom: 2rem;
}

.cv-exp-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.cv-exp-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.cv-exp-dates {
  color: var(--mut);
  font-size: 0.8rem;
}

.cv-exp-subtitle {
  color: var(--ac);
  font-size: 0.85rem;
  margin-bottom: 0.7rem;
}

.cv-bullet {
  margin-bottom: 0.5rem;
  padding-left: 1.2rem;
  position: relative;
}

.cv-bullet::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--ac);
}

.cv-bullet-children {
  margin-top: 0.3rem;
  padding-left: 1rem;
}

.cv-bullet-child {
  margin-bottom: 0.3rem;
}

@media (max-width: 768px) {
  .cv-main {
    grid-template-columns: 1fr;
  }
  
  .cv-sidebar {
    order: -1;
  }
}
```

---

## 🛠 Implementation Guide

### For New Pages in This Website

1. **Create a new route**: Add folder in `src/app/` (e.g., `src/app/new-page/`)
2. **Add page.tsx**: Create the page component
3. **Use existing components**: Import from `src/components/`
4. **Follow layout pattern**: Use `LayoutWrapper` for consistent structure
5. **Apply theme**: Use `ThemeContext` for theme-aware components
6. **Add to navigation**: Update sidebar in `LayoutWrapper.tsx`

### For Standalone Websites

1. **Copy CSS variables**: Use the exact values from `globals.css`
2. **Implement theme system**: Use the React Context pattern shown above
3. **Use component patterns**: Follow the card and layout structures
4. **Apply animations**: Use the signature hover and transition effects
5. **Ensure responsive**: Implement the same breakpoint logic
6. **Test theme switching**: Verify both light/dark modes work

---

## 📏 Design Tokens Reference

### Colors
- Primary: `--ac` (#00d97e / #00b366)
- Background: `--bg` (#080c14 / #edf0f5)
- Surface: `--surface` (#111827 / #ffffff)
- Text: `--txt` (#e6edf3 / #0f172a)
- Muted: `--mut` (rgba with 0.8 opacity)
- Secondary Surface: `--s2` (#1a2235 / #f4f7fb)

### Typography
- Headings: `--fh` (Syne, 700-800)
- Body: `--fm` (SpaceMono, 400)
- Labels: 600 weight

### Spacing
- Standard gap: `1rem`
- Standard padding: `1.5rem`
- Border radius: `4px` (small), `10px` (cards), `12px` (large cards)

### Transitions
- Standard: `.28s cubic-bezier(.4, 0, .2, 1)`
- Fast: `.18s ease`
- Slow: `.8s ease`

### Shadows
- Card hover: `0 8px 24px var(--acg)`
- Button: `0 0 15px var(--acg)`
- Toggle: `var(--toggle-shadow)`
- Light Mode Surface: `var(--shadow)`

---

## ✅ Best Practices

### Do's
- ✅ Use exact CSS variable names from this guide (including updated theme colors)
- ✅ Implement the full theme system with localStorage persistence
- ✅ Apply signature hover effects to all interactive elements
- ✅ Use the grid layout patterns for consistency
- ✅ Test both light and dark themes for proper contrast
- ✅ Verify that borders are visible in both themes
- ✅ Follow responsive breakpoint values exactly
- ✅ Use Syne for headings and SpaceMono for body text

### Don'ts
- ❌ Modify core color values
- ❌ Change the spacing system
- ❌ Use different font families
- ❌ Create custom navigation structures
- ❌ Ignore mobile responsiveness
- ❌ Skip theme validation
- ❌ Omit the flash prevention script

---

## 🔍 Troubleshooting

### Theme Not Applying
1. Check `data-theme` attribute on HTML element
2. Verify CSS variables are defined in `:root`
3. Ensure no conflicting styles override variables
4. Check localStorage for theme value

### Poor Contrast / Invisible Elements
1. Verify you're using the updated theme colors from this guide
2. Check contrast ratios using browser dev tools
3. Ensure borders use correct opacity values for each theme
4. Test in both light and dark modes
5. Verify CSS variables are properly scoped to `[data-theme="light"]` for light theme overrides

### Inconsistent Colors
1. Use browser dev tools to inspect computed values
2. Check for CSS specificity issues
3. Verify all required variables are set
4. Ensure theme context is properly initialized

### Hover Effects Not Working
1. Verify `overflow: hidden` on parent
2. Check `position: relative` on card
3. Ensure `::after` pseudo-element is properly styled
4. Verify transition properties

### Mobile Layout Issues
1. Check breakpoint values match exactly
2. Verify grid template changes for mobile
3. Ensure sidebar collapse logic is correct
4. Test on multiple device sizes

---

## 📚 Resources

- **Main Repository**: Current codebase
- **Figma Design**: Visual design reference
- **Component Library**: Reusable React components
- **Documentation**: Full project documentation

---

**Note**: This design system ensures all Statistics Programming Club digital properties maintain visual consistency while allowing flexible implementation. Whether creating new pages within this website or building standalone sites, follow these guidelines to preserve the club's brand identity.