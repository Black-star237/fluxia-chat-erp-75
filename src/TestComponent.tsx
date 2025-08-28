import React from 'react';

const TestComponent = () => {
  console.log("🧪 TestComponent rendering...");
  
  return (
    <div style={{ 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '20px', 
      margin: '20px',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      TEST COMPONENT VISIBLE - Si vous voyez ceci, React fonctionne !
    </div>
  );
};

export default TestComponent;