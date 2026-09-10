import React from 'react';
import AppRoutes from 'routes/AppRoutes';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { DialogsProvider } from '@toolpad/core';


const App: React.FC = () => {

    return (
        <>
            <DialogsProvider >
                <AppRoutes />
            </DialogsProvider>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default App;