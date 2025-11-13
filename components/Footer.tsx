
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p>Data Source: YouTube API via Google Apps Script</p>
        <p>Dashboard created with React, Tailwind CSS, and Framer Motion.</p>
      </div>
    </footer>
  );
};

export default Footer;
