// src/components/SEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
    title = "Expert Computer Academy | Patna's Premier IT Institute", 
    description = "Empowering students in Patna with IT excellence since 1987. 100% practical labs, ISO 9001:2015 certified, offering ADCA, Python, Java, and Full Stack Development.", 
    name = "Expert Computer Academy", 
    type = "website", 
    image = "https://expertcomputeracademy.in/og-image.jpg", // Replace with your actual hosted Open Graph image URL
    url = "https://expertcomputeracademy.in" 
}) {
    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={name} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}