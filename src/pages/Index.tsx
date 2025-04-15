
import React from 'react';
import { DesignProvider } from '../context/DesignContext';
import Sidebar from '../components/Sidebar';
import Canvas from '../components/Canvas';
import Header from '../components/Header';

const Index: React.FC = () => {
  return (
    <DesignProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>
        </div>
      </div>
    </DesignProvider>
  );
};

export default Index;
