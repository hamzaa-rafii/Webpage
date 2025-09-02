import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState("home");

  useEffect(() => {
    const currentPath = location.pathname.slice(1) || "home";
    setPage(currentPath);
  }, [location]);

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
              Reasearch
            </div>
            <div 
              className={`nav-item ${page === "teaching-experience" ? "active" : ""}`} 
              onClick={() => handleNavigation("teaching-experience")}
            >
              Teaching
            </div>
            {/* <div 
              className={`nav-item ${page === "publications" ? "active" : ""}`} 
              onClick={() => handleNavigation("publications")}
            >
              Publications
            </div> */}
            {/* <div 
              className={`nav-item ${page === "grants" ? "active" : ""}`} 
              onClick={() => handleNavigation("grants")}
            >
              Grants
            </div> */}
          </div>
        </div>

        {page === "home" && (
          <div className='social-media-icons'>
          <a onClick={openCV}><img src="cv.png" alt='CV' /></a>
          <a href="https://github.com/hamzaa-rafii" target="_blank" rel="noopener noreferrer"><img src="github.png" alt='GitHub' /></a>
          <a href="https://www.linkedin.com/in/hamzarafi/" target="_blank" rel="noopener noreferrer"><img src="linkedin.png" alt='LinkedIn' /></a>
          {/* <a href="https://scholar.google.com/citations?hl=en&user=Jjf8EVoAAAAJ" target="_blank" rel="noopener noreferrer"><img src="google-scholar.png" alt='Google Scholar' /></a> */}
          {/* <a className='blog-img' href="https://huggingface.co/sameearif" target="_blank" rel="noopener noreferrer"><img src="huggingface.png" alt='Hugging Face' /></a> */}
        </div>
        )}

        {page === "about" && (
          <div className="about-page">
            <p>I am a PhD student in Electrical & Computer Engineering at <a className='inplace' href="" target="_blank">Rutgers University</a>, working under <a className='inplace' href="https://www.inspirelab.us/people/" target="_blank">Prof. Waheed Bajwa</a> in the INSPIRE Lab. My research lies at the intersection of machine learning, optimization, and statistical decision theory.</p>             

            <p>I completed my Bachelor of Science in Electrical Engineering at <a className='inplace' href="https://www.lums.edu.pk/" target="_blank">Lahore University of Management Sciences</a> (LUMS), where I worked as a Research Assistant at the <a className='inplace' href="https://city.lums.edu.pk/" target="_blank">Center for Intelligent Systems & Networks Research</a>  (CITY) under <a className='inplace' href="https://city.lums.edu.pk/tahir/" target="_blank">Dr. Muhammad Tahir</a> & <a className='inplace' href="https://city.lums.edu.pk/momin-ayub/" target="_blank">Dr. Momin Uppal</a> . During this time, I gained experience in deep learning, data analytics, and AI technologies, which laid the foundation for my current research. My academic journey has been driven by a strong interest in combining mathematical rigor and real-world impact, preparing me to pursue advanced studies and research in machine learning and optimization.</p>
        
            <p>Outside of research, I enjoy playing cricket and volleyball, as well as watching TV shows and anime. I am also an avid video game enthusiast, with a particular interest in story-driven and immersive titles. These hobbies allow me to unwind, stay active, and bring a sense of creativity and balance to my academic life.</p>
          </div>
        )}

        {page === "research-experience" && (
          <div className="about-page">
            <p style={{ fontSize: '1.25em' }}>Rutgers University</p>
            <hr style={{ marginTop: '-15px' }} ></hr>
            <p style={{ fontSize: '1.10em' }}>Graduate Researcher (INSPIRE Lab)</p>
            <p style={{ marginTop: '-15px', fontSize: '1em' }}>Performed primary data collection for large-scale technology adoption projects (TOD).
              
              Experimented with GANs and first-order models for the ethical use of DeepFake technologies.
              
              Assisted in AI-related projects at the intersection of signal processing, computer vision, and applied machine learning</p>

            <p style={{ fontSize: '1.25em' }}>Lahore University of Management Sciences</p>
            <hr style={{ marginTop: '-15px' }} ></hr>
            <p style={{ fontSize: '1.10em' }}>Student Research Assistant (CITY Lab)</p>
            <p style={{ marginTop: '-15px', fontSize: '1em' }}>Conducting research on machine learning, optimization, and statistical decision-making, with a focus on uncertainty-aware early-exit systems.
            
            Designing and implementing architectures that integrate lightweight device models, uncertainty modules, and expert models to enable efficient and reliable decision-making under resource constraints.
            
            Exploring themes of fairness, reliability, and scalability in selective classification and uncertainty quantification.</p>
        </div>
        )}

        {page === "teaching-experience" && (
          <div className="about-page">
            <p style={{ fontSize: '1.25em' }}>Rutgers University</p>
            <hr style={{ marginTop: '-15px' }} ></hr>
            <p style={{ fontSize: '1.10em' }}>Machine Learning (Fall 2024)</p>
            <p style={{ marginTop: '-15px', fontSize: '1em' }}>Assisted in course delivery by holding office hours, guiding students through theoretical concepts and practical assignments, and supporting exam preparation.</p>

            <p style={{ fontSize: '1.10em' }}>Programming Methodology (Fall 2024)</p>
            <p style={{ marginTop: '-15px', fontSize: '1em' }}>Facilitated lab sessions, graded assignments, and mentored students in fundamental programming skills, problem-solving techniques, and structured software development practices.</p>
            

            <p style={{ fontSize: '1.25em' }}>Lahore University of Management Sciences</p>
            <hr style={{ marginTop: '-15px' }} ></hr>
            <p style={{ fontSize: '1.10em' }}>Engineering Model (Fall 2021)</p>
            <p style={{ marginTop: '-15px', fontSize: '1em' }}>Assisted students in applied mathematical modeling and simulations.</p>

            <p style={{ fontSize: '1.10em' }}>Electromagnetic Field and Waves (Fall 2022)</p>
            <p style={{ marginTop: '-15px', fontSize: '1em' }}>Supported course instruction, graded assignments, and provided tutorial sessions.</p>
        </div>
        )}

        {/* {page === "publications" && (
          <div className="about-page">
            <p>Artificial Intelligence / Machine Learning / Natural Language Processing</p>
            <hr></hr>
            <ul style={{ listStyleType: 'square', padding: 0, fontSize: '1em' }}>
              <li style={{ marginLeft: '15px' }}><b>Hamza Rafi</b>*, Author 1, Author 2, "<a className='inplace' href="add url here" target="_blank">Attention is All You Need</a>" in <em>ICLR 2025</em>, July 27-August 1, Vienna, Austria. 2025.</li>
            </ul>
            <p>Preprints</p>
            <hr></hr>
            <ul style={{ listStyleType: 'square', padding: 0, fontSize: '1em' }}>
              <li style={{ marginLeft: '15px' }}><b>Hamza Rafi</b>*, Author 1, Author 2, "<a className='inplace' href="add url here" target="_blank">Attention is All You Need</a>" in <em>ICLR 2025</em>, July 27-August 1, Vienna, Austria. 2025.</li>
            </ul>
          </div>
        )} */}

        {/* {page === "grants" && (
          <div className="about-page">
            <p>Research Grants</p>
            <hr></hr>
            <ul style={{ listStyleType: 'square', padding: 0, fontSize: '1em' }}>
              <li style={{ marginLeft: '15px' }}><b>OpenAI Research Access</b>, for <em>The Fellowship of the LLMs: Multi-Agent Workflows for Synthetic Preference Optimization Dataset Generation. July 2024.</em></li>
              <li style={{ marginLeft: '15px', marginTop: '15px' }}><b>OpenAI Research Access</b>, for <em>Generalists vs Specialists: Evaluating Large Language Models for Urdu. May 2024.</em></li>
            </ul>
          </div>
      )} */}
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
