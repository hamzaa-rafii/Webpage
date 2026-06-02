import './App.css';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

function useTypewriter(words: string[], typeSpeed = 65, deleteSpeed = 35, pause = 1500) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      setDeleting(false);
      setIndex((p) => (p + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(word.substring(0, deleting ? text.length - 1 : text.length + 1));
      }, deleting ? deleteSpeed : typeSpeed);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause]);

  return text;
}

/* Golden dots that follow the cursor and fade out. Desktop-only (no touch events). */
function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const pts: { x: number; y: number; age: number }[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => pts.push({ x: e.clientX, y: e.clientY, age: 0 });
    window.addEventListener('mousemove', onMove);

    const rootStyle = getComputedStyle(document.documentElement);
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = rootStyle.getPropertyValue('--accent').trim() || '#e8b85a';
      for (let i = pts.length - 1; i >= 0; i--) {
        pts[i].age++;
        if (pts[i].age > 24) { pts.splice(i, 1); continue; }
        const life = 1 - pts[i].age / 24;
        ctx.globalAlpha = life * 0.5;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, life * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 998 }}
      aria-hidden="true"
    />
  );
}

/* Gradient-descent bowl (default) or noisy loss curve (click to toggle). */
function HeroViz() {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<'descent' | 'loss'>('descent');

  const toggle = () => {
    modeRef.current = modeRef.current === 'descent' ? 'loss' : 'descent';
  };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 340, H = 190;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    // ── Descent mode ─────────────────────────────────────────────────
    const cx = W / 2, cy = H / 2;
    const a = 0.016, b = 0.045, step = 6;
    const ratio = Math.sqrt(a / b);
    const lr = 0.9, beta = 0.86;
    const starts = [
      { x: 34, y: 26 }, { x: W - 34, y: 32 },
      { x: 48, y: H - 24 }, { x: W - 44, y: H - 28 },
    ];
    let si = 0, pt = { ...starts[si] }, vel = { x: 0, y: 0 };
    let path: { x: number; y: number }[] = [{ ...pt }];
    let holding = 0;

    const launchFrom = (x: number, y: number) => {
      pt = { x, y }; vel = { x: 0, y: 0 };
      path = [{ ...pt }]; holding = 0;
    };
    const onMove = (e: MouseEvent) => {
      if (modeRef.current !== 'descent') return;
      const rect = canvas.getBoundingClientRect();
      launchFrom(e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener('mousemove', onMove);

    // ── Loss-curve mode ───────────────────────────────────────────────
    const N = 80;
    const lossY = (i: number) => {
      const t = i / N;
      const base = 0.88 * Math.exp(-4 * t) + 0.06;
      return Math.max(0.04, base + Math.sin(i * 13.7) * 0.025 + Math.sin(i * 7.3) * 0.015);
    };
    let lossPts = 0, lossHold = 0;

    // ── Shared ────────────────────────────────────────────────────────
    let prevMode = modeRef.current;
    let acc = 0, raf = 0;
    const rootStyle = getComputedStyle(document.documentElement);

    const drawDescent = (accent: string, contour: string) => {
      ctx.strokeStyle = contour;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      for (let k = 1; k <= 8; k++) {
        const rx = k * 19;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, rx * ratio, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      ctx.fillStyle = accent;
      path.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      const last = path[path.length - 1];
      ctx.beginPath(); ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2); ctx.fill();
    };

    const drawLoss = (accent: string, contour: string) => {
      const PL = 36, PB = 22, PR = 14, PT = 18;
      const cW = W - PL - PR, cH = H - PT - PB;

      ctx.strokeStyle = contour;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PL, PT); ctx.lineTo(PL, H - PB); ctx.lineTo(W - PR, H - PB);
      ctx.stroke();

      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 0.5;
      for (let i = 1; i <= 4; i++) {
        const x = PL + (i / 4) * cW;
        ctx.beginPath(); ctx.moveTo(x, H - PB); ctx.lineTo(x, H - PB + 4); ctx.stroke();
      }

      ctx.fillStyle = contour;
      ctx.globalAlpha = 0.5;
      ctx.font = '10px Roboto, sans-serif';
      ctx.fillText('loss', PL + 4, PT + 10);
      ctx.fillText('epoch →', W - PR - 54, H - PB + 14);

      if (lossPts < 2) return;

      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < lossPts; i++) {
        const x = PL + (i / N) * cW;
        const y = (H - PB) - lossY(i) * cH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      const li = lossPts - 1;
      const lx = PL + (li / N) * cW;
      const ly = (H - PB) - lossY(li) * cH;
      ctx.fillStyle = accent;
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2); ctx.fill();

      if (lossPts >= N) {
        ctx.globalAlpha = Math.min(1, lossHold / 20);
        ctx.font = '11px Roboto, sans-serif';
        ctx.fillStyle = accent;
        ctx.fillText('converged ✓', lx - 48, ly - 14);
      }
    };

    const tick = () => {
      const accent  = rootStyle.getPropertyValue('--accent').trim()         || '#e8b85a';
      const contour = rootStyle.getPropertyValue('--text-secondary').trim() || '#6b6250';

      if (modeRef.current !== prevMode) {
        if (modeRef.current === 'loss') { lossPts = 0; lossHold = 0; }
        prevMode = modeRef.current;
      }

      ctx.clearRect(0, 0, W, H);
      acc++;

      if (modeRef.current === 'descent') {
        if (acc % 4 === 0) {
          const dx = pt.x - cx, dy = pt.y - cy;
          const settled = Math.hypot(dx, dy) < 2 && Math.hypot(vel.x, vel.y) < 0.4;
          if (settled) {
            holding++;
            if (holding > 50) { si = (si + 1) % starts.length; launchFrom(starts[si].x, starts[si].y); }
          } else {
            vel.x = beta * vel.x - lr * step * 2 * a * dx;
            vel.y = beta * vel.y - lr * step * 2 * b * dy;
            pt = { x: pt.x + vel.x, y: pt.y + vel.y };
            path.push({ ...pt });
            if (path.length > 220) path.shift();
          }
        }
        drawDescent(accent, contour);
      } else {
        if (acc % 3 === 0) {
          if (lossPts < N) {
            lossPts++;
          } else {
            lossHold++;
            if (lossHold > 120) { lossPts = 0; lossHold = 0; }
          }
        }
        drawLoss(accent, contour);
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className="hero-viz-wrap">
      <canvas ref={ref} className="hero-viz" onClick={toggle} aria-label="Interactive optimization visualization" />
      <p className="viz-hint">hover to redirect · click to toggle view</p>
    </div>
  );
}

/* Timeline card with ripple-on-click. */
function Card({ children }: { children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.left = `${e.clientX - rect.left}px`;
    span.style.top  = `${e.clientY - rect.top}px`;
    el.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  };
  return <div className="card" onClick={handleClick}>{children}</div>;
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme-pref') || 'light');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const tagline = useTypewriter([
    'robust optimization.',
    'uncertainty-aware decision-making.',
    'reliable machine learning systems.',
  ]);

  useEffect(() => {
    const currentPath = location.pathname.slice(1) || 'home';
    setPage(currentPath);
  }, [location]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme-pref', next);
      return next;
    });

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
    const ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
    setTilt({ x: -ny * 12, y: nx * 12 });
  };
  const handleTiltLeave = () => setTilt({ x: 0, y: 0 });

  const openCV = () => window.open('CV.pdf', '_blank');

  const handleNavigation = (newPage: string) => navigate(`/${newPage}`);
  const handleNavigationHome = () => navigate('/');

  const isTopLayout = page !== 'home';

  return (
    <div className={`App ${isTopLayout ? 'top' : ''}`}>
      {/* Fixed decorative / overlay layers */}
      <div className="ambient-glow" aria-hidden="true" />
      <CursorTrail />
      <div className="corner-ornaments" aria-hidden="true">
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </div>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="app-container">
        {/* Nav header — no key, stays stable across routes */}
        <div className={`transition-container ${isTopLayout ? 'top' : ''}`}>
          <div
            className={`me-container ${isTopLayout ? 'shrink' : ''}`}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
          >
            <img
              className={`me ${isTopLayout ? 'shrink' : ''}`}
              src="me.png"
              alt="Profile"
              style={{ transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            />
          </div>
          <div className={`nav-bar ${isTopLayout ? 'top' : ''}`}>
            <div className={`nav-item ${page === 'home'                  ? 'active' : ''}`} onClick={handleNavigationHome}>Home</div>
            <div className={`nav-item ${page === 'about'                 ? 'active' : ''}`} onClick={() => handleNavigation('about')}>About</div>
            <div className={`nav-item ${page === 'research-experience'   ? 'active' : ''}`} onClick={() => handleNavigation('research-experience')}>Research</div>
            <div className={`nav-item ${page === 'teaching-experience'   ? 'active' : ''}`} onClick={() => handleNavigation('teaching-experience')}>Teaching</div>
            <div className={`nav-item ${page === 'publications'          ? 'active' : ''}`} onClick={() => handleNavigation('publications')}>Publications</div>
          </div>
        </div>

        {/* Keyed wrapper — remounts on every route change, triggering page-content fade */}
        <div key={page} className="page-content">
          {page === 'home' && (
            <div className="home-hero">
              <h1 className="home-name">Hamza Rafi</h1>
              <p className="home-title">Ph.D. Student · Electrical &amp; Computer Engineering · Rutgers University</p>
              <p className="home-tagline">
                On <span className="kw">{tagline}</span><span className="caret">|</span>
              </p>
              <a className="home-email" href="mailto:hamza.rafi@rutgers.edu">hamza.rafi@rutgers.edu</a>
              <HeroViz />
            </div>
          )}

          <div className={`social-media-icons${isTopLayout ? ' compact' : ''}`}>
            <button onClick={openCV} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <img src="cv.png" alt="CV" />
            </button>
            <a href="https://github.com/hamzaa-rafii" target="_blank" rel="noreferrer"><img src="github.png" alt="GitHub" /></a>
            <a href="https://www.linkedin.com/in/hamzarafi/" target="_blank" rel="noreferrer"><img src="linkedin.png" alt="LinkedIn" /></a>
          </div>

          {page === 'home' && (
            <div className="home-tags">
              <span className="home-tag">Robust Optimization</span>
              <span className="home-tag">Uncertainty Quantification</span>
              <span className="home-tag">Statistical Decision Theory</span>
              <span className="home-tag">Machine Learning</span>
            </div>
          )}

          {page === 'home' && (
            <div className="home-news">
              <p className="news-title">Recent</p>
              <ul>
                <li><span className="news-date">2025</span> Developing robust, momentum-based optimization methods (manuscript in preparation).</li>
                <li><span className="news-date">2024</span> Teaching Assistant for Machine Learning &amp; Programming Methodology at Rutgers.</li>
                <li><span className="news-date">2024</span> Joined the INSPIRE Lab to work on uncertainty-aware, reliable ML systems.</li>
              </ul>
            </div>
          )}

          {page === 'about' && (
            <div className="about-page">
              <p>I am a PhD student in Electrical &amp; Computer Engineering at <a className="inplace" href="https://www.rutgers.edu" target="_blank" rel="noreferrer">Rutgers University</a>, working under <a className="inplace" href="https://www.inspirelab.us/people/" target="_blank" rel="noreferrer">Prof. Waheed Bajwa</a> in the INSPIRE Lab. My research lies at the intersection of machine learning, optimization, and statistical decision theory.</p>
              <p>I completed my Bachelor of Science in Electrical Engineering at <a className="inplace" href="https://www.lums.edu.pk/" target="_blank" rel="noreferrer">Lahore University of Management Sciences</a> (LUMS), where I worked as a Research Assistant at the <a className="inplace" href="https://city.lums.edu.pk/" target="_blank" rel="noreferrer">Center for Intelligent Systems &amp; Networks Research</a> (CITY) under <a className="inplace" href="https://city.lums.edu.pk/tahir/" target="_blank" rel="noreferrer">Dr. Muhammad Tahir</a> &amp; <a className="inplace" href="https://city.lums.edu.pk/momin-ayub/" target="_blank" rel="noreferrer">Dr. Momin Uppal</a>. During this time, I gained experience in deep learning, data analytics, and AI technologies, which laid the foundation for my current research.</p>
              <p>Outside of research, I enjoy playing cricket and volleyball, as well as watching TV shows and anime. I am also an avid video game enthusiast, with a particular interest in story-driven and immersive titles.</p>
            </div>
          )}

          {page === 'research-experience' && (
            <div className="about-page">
              <p className="section-heading">Rutgers University</p>
              <div className="timeline">
                <Card>
                  <p className="role-title">Graduate Researcher (INSPIRE Lab)</p>
                  <p className="role-desc">Performed primary data collection for large-scale technology adoption projects (TOD). Experimented with GANs and first-order models for the ethical use of DeepFake technologies. Assisted in AI-related projects at the intersection of signal processing, computer vision, and applied machine learning.</p>
                </Card>
              </div>

              <p className="section-heading">Lahore University of Management Sciences</p>
              <div className="timeline">
                <Card>
                  <p className="role-title">Student Research Assistant (CITY Lab)</p>
                  <p className="role-desc">Conducted research on machine learning, optimization, and statistical decision-making, with a focus on uncertainty-aware early-exit systems. Designed and implemented architectures that integrate lightweight device models, uncertainty modules, and expert models to enable efficient and reliable decision-making under resource constraints.</p>
                </Card>
              </div>
            </div>
          )}

          {page === 'teaching-experience' && (
            <div className="about-page">
              <p className="section-heading">Rutgers University</p>
              <div className="timeline">
                <Card>
                  <p className="role-title">Machine Learning (Fall 2024)</p>
                  <p className="role-desc">Assisted in course delivery by holding office hours, guiding students through theoretical concepts and practical assignments, and supporting exam preparation.</p>
                </Card>
                <Card>
                  <p className="role-title">Programming Methodology (Fall 2024)</p>
                  <p className="role-desc">Facilitated lab sessions, graded assignments, and mentored students in fundamental programming skills, problem-solving techniques, and structured software development practices.</p>
                </Card>
              </div>

              <p className="section-heading">Lahore University of Management Sciences</p>
              <div className="timeline">
                <Card>
                  <p className="role-title">Engineering Model (Fall 2021)</p>
                  <p className="role-desc">Assisted students in applied mathematical modeling and simulations.</p>
                </Card>
                <Card>
                  <p className="role-title">Electromagnetic Field and Waves (Fall 2022)</p>
                  <p className="role-desc">Supported course instruction, graded assignments, and provided tutorial sessions.</p>
                </Card>
              </div>
            </div>
          )}

          {page === 'publications' && (
            <div className="about-page">
              <p className="section-heading">Research areas</p>
              <hr />
              <p className="role-desc">
                Papers currently in preparation. My research spans machine learning, optimization, uncertainty quantification, and statistical decision theory — with a focus on robust optimization methods and uncertainty-aware decision-making under resource constraints.
              </p>
              <p className="section-heading" style={{ marginTop: '28px' }}>Coming soon</p>
              <hr />
              <p className="role-desc">Check back for preprints and publications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/"                       element={<App />} />
        <Route path="/about"                  element={<App />} />
        <Route path="/research-experience"    element={<App />} />
        <Route path="/teaching-experience"    element={<App />} />
        <Route path="/publications"           element={<App />} />
        <Route path="/grants"                 element={<App />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
