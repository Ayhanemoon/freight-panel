import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './LandingNavbar.module.scss';

const LandingNavbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <a href="/" className={styles.logo} onClick={closeMenu}>
                    <span className={styles.logoMark}>
                        <svg
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M24 4L41 13.5V34.5L24 44L7 34.5V13.5L24 4Z"
                                fill="currentColor"
                                opacity="0.18"
                            />
                            <path
                                d="M24 4L41 13.5L24 23L7 13.5L24 4Z"
                                fill="currentColor"
                            />
                            <path
                                d="M24 23V44L41 34.5V13.5L24 23Z"
                                fill="currentColor"
                                opacity="0.72"
                            />
                            <path
                                d="M24 23L7 13.5V34.5L24 44V23Z"
                                fill="currentColor"
                                opacity="0.48"
                            />
                        </svg>
                    </span>

                    <span className={styles.logoText}>فریت</span>
                </a>

                <nav className={styles.desktopNav}>
                    <a href="#home" className={styles.active}>
                        صفحه اصلی
                    </a>

                    <a href="#services">
                        خدمات ما
                    </a>

                    <a href="#about">
                        درباره ما
                    </a>

                    <a href="#contact">
                        تماس با ما
                    </a>
                </nav>

                <a href="/auth" className={styles.loginButton}>
                    ورود به سامانه

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M15 21V19C15 16.79 13.21 15 11 15H6C3.79 15 2 16.79 2 19V21"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="8.5"
                            cy="7"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M18 8V14M21 11H15"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </a>

                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={() => setIsOpen((value) => !value)}
                    aria-label="منو"
                    aria-expanded={isOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <a href="#home" onClick={closeMenu}>
                            صفحه اصلی
                        </a>

                        <a href="#services" onClick={closeMenu}>
                            خدمات ما
                        </a>

                        <a href="#about" onClick={closeMenu}>
                            درباره ما
                        </a>

                        <a href="#contact" onClick={closeMenu}>
                            تماس با ما
                        </a>

                        <a
                            href="/auth"
                            className={styles.mobileLogin}
                            onClick={closeMenu}
                        >
                            ورود به سامانه
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default LandingNavbar;