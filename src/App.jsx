import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import LoaderOverlay from './components/LoaderOverlay';
import ProgressBar from './components/ProgressBar';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PaperTear from './components/PaperTear';
import AboutSection from './components/AboutSection';
import JourneySection from './components/JourneySection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';
import GitHubSection from './components/GitHubSection';
import EducationLanguagesSection from './components/EducationLanguagesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import VersionHistory from './components/VersionHistory';

import Terminal from './components/Terminal/Terminal';

const MainLayout = ({ theme, toggleTheme }) => (
  <>
    <LoaderOverlay />
    <ProgressBar />
    <div className="page-wrapper">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <HeroSection />
        <PaperTear />
        <AboutSection />
        <JourneySection />
        <SkillsSection />
        <GitHubSection />
        <ProjectsSection />
        <EducationLanguagesSection />
        <ContactSection />
      </main>
      <Footer />
      <VersionHistory />
    </div>
  </>
);

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <Routes>
      <Route path="/" element={<MainLayout theme={theme} toggle={toggle} />} />
      <Route path="/terminal" element={<Terminal />} />
    </Routes>
  );
}