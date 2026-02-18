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

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <LoaderOverlay />
      <ProgressBar />
      <div className="page-wrapper">
        <Navbar theme={theme} toggleTheme={toggle} />
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
      </div>
    </>
  );
}
