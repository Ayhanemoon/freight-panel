import React from 'react';
import { motion } from 'framer-motion';

import styles from './HeroSection.module.scss';

const HeroSection: React.FC = () => {
    return (
        <section id="home" className={styles.hero}>
            <div className={styles.backgroundGlow} />
            <div className={styles.grid} />

            <div className={styles.container}>
                <div className={styles.content}>
                    <motion.div
                        className={styles.badge}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={styles.badgeDot} />
                        مدیریت هوشمند حمل و نقل
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.1,
                        }}
                    >
                        همراه مطمئن شما
                        <br />
                        <span>در مسیر ارسال بار</span>
                    </motion.h1>

                    <motion.p
                        className={styles.description}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.2,
                        }}
                    >
                        با فریت، فرآیند حمل و نقل بار خود را
                        <strong> ساده، سریع و مطمئن </strong>
                        مدیریت کنید و با اطمینان، بار خود را به مقصد
                        برسانید.
                    </motion.p>

                    <motion.div
                        className={styles.actions}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.3,
                        }}
                    >
                        <a href="/auth" className={styles.primaryButton}>
                            ثبت سفارش

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M5 12H19M19 12L13 6M19 12L13 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>

                        <a
                            href="#about"
                            className={styles.secondaryButton}
                        >
                            بیشتر بدانید
                        </a>
                    </motion.div>
                </div>

                <div className={styles.visual}>
                    <motion.div
                        className={styles.orbit}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 35,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        <span className={styles.orbitDot} />
                    </motion.div>

                    <div className={styles.routeLine}>
                        <svg
                            viewBox="0 0 600 300"
                            preserveAspectRatio="none"
                        >
                            <motion.path
                                d="M40 230 C 140 80, 220 250, 330 130 S 470 50, 570 100"
                                fill="none"
                                stroke="rgba(255,255,255,0.65)"
                                strokeWidth="2"
                                strokeDasharray="8 10"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                    duration: 2,
                                    delay: 0.5,
                                }}
                            />
                        </svg>

                        <motion.div
                            className={`${styles.locationPin} ${styles.pinOne}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                delay: 1.1,
                                type: 'spring',
                            }}
                        >
                            <span>●</span>
                        </motion.div>

                        <motion.div
                            className={`${styles.locationPin} ${styles.pinTwo}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                delay: 1.5,
                                type: 'spring',
                            }}
                        >
                            <span>●</span>
                        </motion.div>
                    </div>

                    <motion.div
                        className={styles.airplane}
                        animate={{
                            y: [-8, 8, -8],
                            x: [0, 8, 0],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <svg
                            viewBox="0 0 120 70"
                            fill="none"
                        >
                            <path
                                d="M7 35L112 7L82 35L112 63L7 35Z"
                                fill="rgba(255,255,255,0.95)"
                            />
                            <path
                                d="M47 28L62 4L72 24L47 28Z"
                                fill="#73A9FF"
                            />
                            <path
                                d="M47 42L62 66L72 46L47 42Z"
                                fill="#73A9FF"
                            />
                        </svg>
                    </motion.div>

                    <motion.div
                        className={styles.phone}
                        initial={{ opacity: 0, y: 40, rotate: 5 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            rotate: 3,
                        }}
                        transition={{
                            duration: 0.8,
                            delay: 0.5,
                        }}
                    >
                        <div className={styles.phoneHeader}>
                            <span>فریت</span>
                            <span className={styles.signal} />
                        </div>

                        <div className={styles.map}>
                            <span className={styles.mapRoad} />
                            <span className={styles.mapRoadTwo} />

                            <div className={styles.mapPin}>
                                <span />
                            </div>

                            <div className={styles.mapDestination}>
                                <span />
                            </div>
                        </div>

                        <div className={styles.tracking}>
                            <span>وضعیت مرسوله</span>
                            <strong>در مسیر ارسال</strong>

                            <div className={styles.progress}>
                                <span />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.truck}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.9,
                            delay: 0.4,
                        }}
                    >
                        <div className={styles.truckCargo}>
                            <div className={styles.cargoLine} />
                            <div className={styles.cargoLine} />
                            <div className={styles.cargoLine} />
                        </div>

                        <div className={styles.truckCab}>
                            <div className={styles.window} />
                            <div className={styles.headlight} />
                        </div>

                        <div className={styles.wheel} />
                        <div className={`${styles.wheel} ${styles.wheelBack}`} />
                    </motion.div>

                    <motion.div
                        className={`${styles.package} ${styles.packageOne}`}
                        animate={{
                            y: [0, -12, 0],
                            rotate: [-2, 1, -2],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <span>FR</span>
                    </motion.div>

                    <motion.div
                        className={`${styles.package} ${styles.packageTwo}`}
                        animate={{
                            y: [0, -8, 0],
                            rotate: [2, -1, 2],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.4,
                        }}
                    >
                        <span>FR</span>
                    </motion.div>

                    <motion.div
                        className={`${styles.package} ${styles.packageThree}`}
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.8,
                        }}
                    >
                        <span>FR</span>
                    </motion.div>
                </div>
            </div>

            <motion.a
                href="#about"
                className={styles.scrollIndicator}
                animate={{ y: [0, 8, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                }}
            >
                <span />
                <span />
            </motion.a>
        </section>
    );
};

export default HeroSection;