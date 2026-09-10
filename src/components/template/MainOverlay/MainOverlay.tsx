import React from 'react';

const Overlay = ({ onClick }: { onClick: () => void }) => (
  <div className="layout__overlay" onClick={onClick}></div>
);

export default Overlay;
