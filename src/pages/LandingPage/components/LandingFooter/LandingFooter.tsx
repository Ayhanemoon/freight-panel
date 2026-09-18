import React from 'react';

import styles from './LandingFooter.module.scss';

const LandingFooter: React.FC = () => {
    return (
        <footer id="contact" className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.main}>
                    <div className={styles.brand}>
                        <a href="#home" className={styles.logo}>
                            <span className={styles.logoMark}>
                                <svg
                                    viewBox="0 0 48 48"
                                    fill="none"
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

                            <span>فریت</span>
                        </a>

                        <p>
                            حمل و نقل هوشمند
                            <br />
                            برای آینده‌ای بهتر
                        </p>

                        <div className={styles.socials}>
                            <a href="/" aria-label="Telegram">
                                <span>ت</span>
                            </a>

                            <a href="/" aria-label="Instagram">
                                <span>ا</span>
                            </a>

                            <a href="/" aria-label="LinkedIn">
                                <span>in</span>
                            </a>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3>لینک‌های سریع</h3>

                        <a href="#home">
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
                    </div>

                    <div className={styles.column}>
                        <h3>خدمات ما</h3>

                        <a href="#services">
                            حمل و نقل زمینی
                        </a>

                        <a href="#services">
                            حمل و نقل هوایی
                        </a>

                        <a href="#services">
                            حمل و نقل دریایی
                        </a>

                        <a href="#services">
                            پیگیری مرسولات
                        </a>
                    </div>

                    <div className={styles.contact}>
                        <h3>تماس با ما</h3>

                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 21C16.5 15.8 19 12.2 19 9A7 7 0 1 0 5 9C5 12.2 7.5 15.8 12 21Z"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <circle
                                        cx="12"
                                        cy="9"
                                        r="2.2"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                </svg>
                            </span>

                            <span>
                                تهران، خیابان آزادی
                            </span>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M5 4L9 3L11 8L8.5 9.5C9.6 12.1 11.9 14.4 14.5 15.5L16 13L21 15L20 19C19.7 20.2 18.6 21 17.4 21C10 20.5 3.5 14 3 6.6C3 5.4 3.8 4.3 5 4Z"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>

                            <span>
                                ۰۲۱-۱۲۳۴۵۶۷۸
                            </span>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <rect
                                        x="3"
                                        y="5"
                                        width="18"
                                        height="14"
                                        rx="2"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <path
                                        d="M4 7L12 13L20 7"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                </svg>
                            </span>

                            <span>
                                info@freight.ir
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <span>
                        © ۱۴۰۵ فریت. تمامی حقوق محفوظ است.
                    </span>

                    <span>
                        سامانه حمل و نقل و مدیریت بار
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;