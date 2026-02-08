import React from 'react';

const Home = ({ isInApp }) => {
  return (
    <div style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
      {/* Ovde NE stavljamo Header ni SearchBox jer su oni u App.js */}
      <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '15px' }}>
        {isInApp
          ? "Welcome back! Explore your favorite repositories."
          : "Enter a GitHub username or owner/repository to begin your exploration."
        }
      </p>
    </div>
  );
};

export default Home;