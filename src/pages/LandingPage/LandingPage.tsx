import React from 'react';

import LandingNavbar from './components/LandingNavbar/LandingNavbar';
import HeroSection from './components/HeroSection/HeroSection';
import AboutSection from './components/AboutSection/AboutSection';
import LandingFooter from './components/LandingFooter/LandingFooter';

import styles from './LandingPage.module.scss';

const LandingPage: React.FC = () => {
    return (
        <div className={styles.page} dir="rtl">
            <LandingNavbar />

            <main>
                <HeroSection />
                <AboutSection />
            </main>

            <LandingFooter />
        </div>
    );
};

export default LandingPage;