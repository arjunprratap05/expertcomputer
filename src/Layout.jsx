import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBot from './components/chatbot'; // Import your chatbot component
import WhatsAppSupport from './components/WhatsAppSupport'; // Import WhatsApp support component


function Layout() {
    return (
        <>
            <Header />
            {/* Outlet renders the current route's component (Home, About, Registration, etc.) */}
            <Outlet /> 
            <Footer />
        
            {/* Globally visible ChatBot */}
            <ChatBot /> 
            {/* <WhatsAppSupport /> */}
        </>
    );
}

export default Layout;