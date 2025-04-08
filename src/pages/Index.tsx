
import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import WalletGraph from '../components/WalletGraph';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Toolbar from '../components/Toolbar';
import { toast } from '@/components/ui/use-toast';

const WalletFlowVisualizer = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const { theme } = useAppSelector(state => state.wallet);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Update the document theme based on the state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };
  
  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };
  
  const handleExportSvg = () => {
    const svgElement = document.querySelector('.graph-container svg') as SVGSVGElement;
    
    if (svgElement) {
      // Create a copy of the SVG to modify
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Add proper namespaces
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      
      // Add current styles
      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = style.textContent;
        svgClone.insertBefore(styleElement, svgClone.firstChild);
      });
      
      // Convert to SVG string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgClone);
      
      // Create a Blob from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wallet-flow-visualization.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "SVG Exported",
        description: "Your visualization has been exported as SVG",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        onToggleLeftSidebar={toggleLeftSidebar}
        onToggleRightSidebar={toggleRightSidebar}
        onExportSvg={handleExportSvg}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar isOpen={leftSidebarOpen} onToggle={toggleLeftSidebar} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out ${leftSidebarOpen ? 'ml-80' : 'ml-0'} ${rightSidebarOpen ? 'mr-80' : 'mr-0'}`}>
          <WalletGraph />
        </main>
        
        <RightSidebar isOpen={rightSidebarOpen} onToggle={toggleRightSidebar} />
      </div>
    </div>
  );
};

const Index = () => (
  <Provider store={store}>
    <WalletFlowVisualizer />
  </Provider>
);

export default Index;
