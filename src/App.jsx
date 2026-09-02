import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ARProvider } from './context/ARContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ARLabPage from './pages/ARLabPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import './styles/globals.css';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <ARProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main className="app__main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ar-lab" element={<ARLabPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ARProvider>
    </ThemeProvider>
  );
}
