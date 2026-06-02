import './App.css';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

/* Cycles words with a typewriter effect for the homepage tagline. */
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

/* Animated gradient-descent path over a quadratic bowl's contours. */
function HeroViz() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 340, H = 190;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const cx = W / 2, cy = H / 2;
    const a = 0.016, b = 0.045, step = 6;
    const ratio = Math.sqrt(a / b);
    // momentum-descent params: lr drives the pull to center, beta the inertia
    const lr = 0.9, beta = 0.86;
    const starts = [
      { x: 34, y: 26 },
      { x: W - 34, y: 32 },
      { x: 48, y: H - 24 },
      { x: W - 44, y: H - 28 },
    ];

    let si = 0;
    let pt = { ...starts[si] };
    let vel = { x: 0, y: 0 };
    let path = [{ ...pt }];
    let holding = 0;
    let acc = 0;
    let raf = 0;
    const rootStyle = getComputedStyle(document.documentElement);

    const launchFrom = (x: number, y: number) => {
      pt = { x, y };
      vel = { x: 0, y: 0 };
      path = [{ ...pt }];
      holding = 0;
      acc = 0;
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      launchFrom(e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener('mousemove', onMove);

    const draw = () => {
      const accent = rootStyle.getPropertyValue('--accent').trim() || '#e8b85a';
      const contour = rootStyle.getPropertyValue('--text-secondary').trim() || '#6b6250';

      ctx.clearRect(0, 0, W, H);

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
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      const last = path[path.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = () => {
      acc++;
      if (acc % 4 === 0) {
        const dx = pt.x - cx, dy = pt.y - cy;
        const settled = Math.hypot(dx, dy) < 2 && Math.hypot(vel.x, vel.y) < 0.4;
        if (settled) {
          holding++;
          if (holding > 50) {
            si = (si + 1) % starts.length;
            launchFrom(starts[si].x, starts[si].y);
          }
        } else {
          // momentum update: velocity accumulates the gradient pull, then overshoots
          vel.x = beta * vel.x - lr * step * 2 * a * dx;
          vel.y = beta * vel.y - lr * step * 2 * b * dy;
          pt = { x: pt.x + vel.x, y: pt.y + vel.y };
          path.push({ ...pt });
          if (path.length > 220) path.shift();
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="hero-viz" aria-hidden="true" />;
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
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme-pref') || 'light');

  const tagline = useTypewriter([
    'robust optimization.',
    'uncertainty-aware decision-making.',
    'reliable machine learning systems.',
  ]);

  useEffect(() => {
    const currentPath = location.pathname.slice(1) || "home";
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

  const openCV = () => {
    window.open('CV.pdf', '_blank');
  };

  const handleNavigation = (newPage : string) => {
    navigate(`/${newPage}`);
  };

  const handleNavigationHome = () => {
    navigate(`/`);
  };

  const isTopLayout = page !== "home";

  return (
    <div className={`App ${isTopLayout ? "top" : ""}`}>
      <div className="corner-ornaments" aria-hidden="true">
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </div>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className='app-container'>
        <div className={`transition-container ${isTopLayout ? "top" : ""}`}>
          <div className={`me-container ${isTopLayout ? "shrink" : ""}`}>
            <img className={`me ${isTopLayout ? "shrink" : ""}`} src="me.png" alt="Profile" />
          </div>
          <div className={`nav-bar ${isTopLayout ? "top" : ""}`}>
            <div
              className={`nav-item ${page === "home" ? "active" : ""}`}
              onClick={() => handleNavigationHome()}
            >
              Home
            </div>
            <div
              className={`nav-item ${page === "about" ? "active" : ""}`}
              onClick={() => handleNavigation("about")}
            >
              About
            </div>
            <div
              className={`nav-item ${page === "research-experience" ? "active" : ""}`}
              onClick={() => handleNavigation("research-experience")}
            >
              Research
            </div>
            <div
              className={`nav-item ${page === "teaching-experience" ? "active" : ""}`}
              onClick={() => handleNavigation("teaching-experience")}
            >
              Teaching
            </div>
            <div
              className={`nav-item ${page === "publications" ? "active" : ""}`}
              onClick={() => handleNavigation("publications")}
            >
              Publications
            </div>
          </div>
        </div>

        {page === "home" && (
          <div className="home-hero">
            <h1 className="home-name">Hamza Rafi</h1>
            <p className="home-title">Ph.D. Student · Electrical & Computer Engineering · Rutgers University</p>
            <p className="home-tagline">
              On <span className="kw">{tagline}</span><span className="caret">|</span>
            </p>
            <a className="home-email" href="mailto:h.rafi@rutgers.edu">h.rafi@rutgers.edu</a>
            <HeroViz />
          </div>
        )}

        <div className={`social-media-icons${isTopLayout ? ' compact' : ''}`}>
          <button onClick={openCV} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src="cv.png" alt='CV' />
          </button>
          <a href="https://github.com/hamzaa-rafii" target="_blank" rel="noreferrer"><img src="github.png" alt='GitHub' /></a>
          <a href="https://www.linkedin.com/in/hamzarafi/" target="_blank" rel="noreferrer"><img src="linkedin.png" alt='LinkedIn' /></a>
        </div>

        {page === "home" && (
          <div className="home-tags">
            <span className="home-tag">Robust Optimization</span>
            <span className="home-tag">Uncertainty Quantification</span>
            <span className="home-tag">Statistical Decision Theory</span>
            <span className="home-tag">Machine Learning</span>
          </div>
        )}

        {page === "home" && (
          <div className="home-news">
            <p className="news-title">Recent</p>
            <ul>
              <li><span className="news-date">2025</span> Developing robust, momentum-based optimization methods (manuscript in preparation).</li>
              <li><span className="news-date">2024</span> Teaching Assistant for Machine Learning &amp; Programming Methodology at Rutgers.</li>
              <li><span className="news-date">2024</span> Joined the INSPIRE Lab to work on uncertainty-aware, reliable ML systems.</li>
            </ul>
          </div>
        )}

        {page === "about" && (
          <div className="about-page">
            <p>I am a PhD student in Electrical & Computer Engineering at <a className='inplace' href="https://www.rutgers.edu" target="_blank" rel="noreferrer">Rutgers University</a>, working under <a className='inplace' href="https://www.inspirelab.us/people/" target="_blank" rel="noreferrer">Prof. Waheed Bajwa</a> in the INSPIRE Lab. My research lies at the intersection of machine learning, optimization, and statistical decision theory.</p>

            <p>I completed my Bachelor of Science in Electrical Engineering at <a className='inplace' href="https://www.lums.edu.pk/" target="_blank" rel="noreferrer">Lahore University of Management Sciences</a> (LUMS), where I worked as a Research Assistant at the <a className='inplace' href="https://city.lums.edu.pk/" target="_blank" rel="noreferrer">Center for Intelligent Systems & Networks Research</a> (CITY) under <a className='inplace' href="https://city.lums.edu.pk/tahir/" target="_blank" rel="noreferrer">Dr. Muhammad Tahir</a> & <a className='inplace' href="https://city.lums.edu.pk/momin-ayub/" target="_blank" rel="noreferrer">Dr. Momin Uppal</a>. During this time, I gained experience in deep learning, data analytics, and AI technologies, which laid the foundation for my current research. My academic journey has been driven by a strong interest in combining mathematical rigor and real-world impact, preparing me to pursue advanced studies and research in machine learning and optimization.</p>

            <p>Outside of research, I enjoy playing cricket and volleyball, as well as watching TV shows and anime. I am also an avid video game enthusiast, with a particular interest in story-driven and immersive titles. These hobbies allow me to unwind, stay active, and bring a sense of creativity and balance to my academic life.</p>
          </div>
        )}

        {page === "research-experience" && (
          <div className="about-page">
            <p className="section-heading">Rutgers University</p>
            <div className="timeline">
              <div className="card">
                <p className="role-title">Graduate Researcher (INSPIRE Lab)</p>
                <p className="role-desc">Performed primary data collection for large-scale technology adoption projects (TOD). Experimented with GANs and first-order models for the ethical use of DeepFake technologies. Assisted in AI-related projects at the intersection of signal processing, computer vision, and applied machine learning.</p>
              </div>
            </div>

            <p className="section-heading">Lahore University of Management Sciences</p>
            <div className="timeline">
              <div className="card">
                <p className="role-title">Student Research Assistant (CITY Lab)</p>
                <p className="role-desc">Conducted research on machine learning, optimization, and statistical decision-making, with a focus on uncertainty-aware early-exit systems. Designed and implemented architectures that integrate lightweight device models, uncertainty modules, and expert models to enable efficient and reliable decision-making under resource constraints. Explored themes of fairness, reliability, and scalability in selective classification and uncertainty quantification.</p>
              </div>
            </div>
          </div>
        )}

        {page === "teaching-experience" && (
          <div className="about-page">
            <p className="section-heading">Rutgers University</p>
            <div className="timeline">
              <div className="card">
                <p className="role-title">Machine Learning (Fall 2024)</p>
                <p className="role-desc">Assisted in course delivery by holding office hours, guiding students through theoretical concepts and practical assignments, and supporting exam preparation.</p>
              </div>
              <div className="card">
                <p className="role-title">Programming Methodology (Fall 2024)</p>
                <p className="role-desc">Facilitated lab sessions, graded assignments, and mentored students in fundamental programming skills, problem-solving techniques, and structured software development practices.</p>
              </div>
            </div>

            <p className="section-heading">Lahore University of Management Sciences</p>
            <div className="timeline">
              <div className="card">
                <p className="role-title">Engineering Model (Fall 2021)</p>
                <p className="role-desc">Assisted students in applied mathematical modeling and simulations.</p>
              </div>
              <div className="card">
                <p className="role-title">Electromagnetic Field and Waves (Fall 2022)</p>
                <p className="role-desc">Supported course instruction, graded assignments, and provided tutorial sessions.</p>
              </div>
            </div>
          </div>
        )}

        {page === "publications" && (
          <div className="about-page">
            <p className="section-heading">Research areas</p>
            <hr />
            <p className="role-desc">
              Papers currently in preparation. My research spans machine learning, optimization, uncertainty quantification, and statistical decision theory — with a focus on robust optimization methods and uncertainty-aware decision-making under resource constraints.
            </p>
            <p className="section-heading" style={{marginTop: '28px'}}>Coming soon</p>
            <hr />
            <p className="role-desc">Check back for preprints and publications.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<App />} />
        <Route path="/research-experience" element={<App />} />
        <Route path="/teaching-experience" element={<App />} />
        <Route path="/publications" element={<App />} />
        <Route path="/grants" element={<App />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
