import React from 'react';
import LoginForm from 'components/auth/LoginForm/LoginForm';

import './AuthPage.scss';

const AuthPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <LoginForm />
      </div>
    </div>
  );
};

export default AuthPage;