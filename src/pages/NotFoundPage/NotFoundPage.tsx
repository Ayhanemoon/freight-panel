import React from 'react';
import { Link } from 'react-router-dom';
import { convertToPersianDigits } from 'utils/numbers';

import './NotFoundPage.scss';

const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-page">
            <h1>404 - صفحه پیدا نشد</h1>
            <p>صفحه‌ای که به دنبال آن هستید وجود ندارد.</p>
            <Link to="/" className="not-found-page__link">
                به صفحه اصلی بروید
            </Link>
            <p>برای کمک بیشتر با پشتیبانی تماس بگیرید.</p>
            <p>تلفن: {convertToPersianDigits('123-456-7890')}</p>
        </div>
    );
};

export default NotFoundPage;