import React from 'react';
import { Outlet } from 'react-router-dom';

import './AuthLayout.scss'; // Import the SCSS file

const AuthLayout: React.FC = () => {
    return (
        <div className="auth-layout">
            <main>
                <Outlet />
            </main>
            <footer>
                <div className="footer-content">
                    <p>تمامی حقوق برای ما محفوظ است &copy; 2025</p>
                    <p>طراحی و توسعه توسط تیم ما</p>
                </div>
            </footer>
        </div>
    );
};

export default AuthLayout;