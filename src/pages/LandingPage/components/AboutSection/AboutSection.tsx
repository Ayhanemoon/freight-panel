import React from 'react';
import { motion } from 'framer-motion';

import styles from './AboutSection.module.scss';

const features = [
    {
        title: 'امنیت بالا',
        description: 'پیگیری دقیق بار در تمام مراحل ارسال',
        icon: 'shield',
    },
    {
        title: 'شبکه گسترده',
        description: 'ارتباط با مراکز و شرکت‌های حمل و نقل',
        icon: 'network',
    },
    {
        title: 'سرعت در ارسال',
        description: 'مدیریت سریع فرآیند جمع‌آوری و ارسال',
        icon: 'clock',
    },
    {
        title: 'پشتیبانی حرفه‌ای',
        description: 'همراهی شما در تمام مراحل ارسال بار',
        icon: 'support',
    },
];

const FeatureIcon: React.FC<{ type: string }> = ({ type }) => {
    if (type === 'shield') {
        return (
            <svg viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 3L20 6V11C20 16.2 16.8 20.1 12 21C7.2 20.1 4 16.2 4 11V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M8.5 12L11 14.5L15.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (type === 'network') {
        return (
            <svg viewBox="0 0 24 24" fill="none">
                <circle
                    cx="6"
                    cy="12"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <circle
                    cx="18"
                    cy="6"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <circle
                    cx="18"
                    cy="18"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M8.3 10.8L15.7 7.2M8.3 13.2L15.7 16.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    if (type === 'clock') {
        return (
            <svg viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12"
                    cy="13"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M12 9V13L15 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M9 3H15M12 3V5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none">
            <path
                d="M20 15.5C20 17.4 18.4 19 16.5 19H15L12 21L9 19H7.5C5.6 19 4 17.4 4 15.5V8.5C4 6.6 5.6 5 7.5 5H16.5C18.4 5 20 6.6 20 8.5V15.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M8 12H16M8 9H13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
};

const AboutSection: React.FC = () => {
    return (
        <section id="about" className={styles.about}>
            <div className={styles.container}>
                <motion.div
                    className={styles.visual}
                    initial={{
                        opacity: 0,
                        x: -60,
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.25,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                >
                    <div className={styles.blob} />

                    <div className={styles.mapCard}>
                        <div className={styles.mapGrid} />

                        <div className={styles.route}>
                            <svg
                                viewBox="0 0 420 260"
                                preserveAspectRatio="none"
                            >
                                <motion.path
                                    d="M40 205 C 130 130, 120 45, 215 90 S 300 200, 380 50"
                                    fill="none"
                                    stroke="#2878e8"
                                    strokeWidth="3"
                                    strokeDasharray="8 8"
                                    initial={{
                                        pathLength: 0,
                                    }}
                                    whileInView={{
                                        pathLength: 1,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    transition={{
                                        duration: 1.5,
                                    }}
                                />
                            </svg>
                        </div>

                        <div className={styles.pinStart}>
                            <span />
                        </div>

                        <div className={styles.pinEnd}>
                            <span />
                        </div>

                        <motion.div
                            className={styles.aboutTruck}
                            animate={{
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <div className={styles.truckBox} />
                            <div className={styles.truckFront}>
                                <span />
                            </div>
                            <i />
                            <i />
                        </motion.div>

                        <div className={styles.boxes}>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>

                    <div className={styles.person}>
                        <div className={styles.personHead} />
                        <div className={styles.personBody}>
                            <div className={styles.tablet} />
                        </div>
                    </div>

                    <motion.div
                        className={styles.floatingCard}
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <div className={styles.check}>
                            ✓
                        </div>

                        <div>
                            <strong>مرسوله شما</strong>
                            <span>در حال ارسال</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className={styles.content}
                    initial={{
                        opacity: 0,
                        x: 60,
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.25,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                >
                    <span className={styles.eyebrow}>
                        درباره فریت
                    </span>

                    <h2>
                        ما که هستیم؟
                    </h2>

                    <h3>
                        راهکاری هوشمند برای مدیریت حمل و نقل بار
                    </h3>

                    <p>
                        فریت با هدف ساده‌سازی و بهینه‌سازی فرآیندهای
                        حمل و نقل بار فعالیت می‌کند. ما با استفاده از
                        فناوری‌های نوین، فرآیند ثبت سفارش، جمع‌آوری،
                        دریافت، ارسال و پیگیری مرسولات را یکپارچه
                        می‌کنیم.
                    </p>

                    <p>
                        هدف ما ایجاد تجربه‌ای شفاف، سریع و مطمئن برای
                        مشتریان و مجموعه‌های فعال در صنعت حمل و نقل
                        است.
                    </p>

                    <div id="services" className={styles.features}>
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className={styles.feature}
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                            >
                                <div className={styles.featureIcon}>
                                    <FeatureIcon
                                        type={feature.icon}
                                    />
                                </div>

                                <div>
                                    <h4>{feature.title}</h4>
                                    <span>
                                        {feature.description}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;