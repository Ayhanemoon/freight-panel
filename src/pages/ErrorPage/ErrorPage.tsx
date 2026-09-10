import React from 'react';
import { Link } from 'react-router-dom';

import './ErrorPage.scss';

const ErrorPage: React.FC = () => {
    return (
        <div className="error-page">
            <h1>Something Went Wrong</h1>
            <p>We encountered an unexpected error. Please try again later.</p>
            <Link to="/dashboard" className="error-page__link">
                Go Back to Dashboard
            </Link>
        </div>
    );
};

export default ErrorPage;