
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Save,
  PanelLeftClose,
  PanelRightClose,
  Sun,
  Moon,
  Download,
  RefreshCw,
  Layout
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { updateViewport, toggleTheme, clearGraph } from '../store/walletSlice';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface ToolbarProps {
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  onExportSvg: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  onExportSvg
}) => {
  const dispatch = useAppDispatch();
  const { viewport, theme } = useAppSelector(state => state.wallet);
  
  const handleZoomIn = () => {
    const newScale = Math.min(viewport.scale * 1.2, 5);
    dispatch(updateViewport({ scale: newScale }));
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(viewport.scale / 1.2, 0.1);
    dispatch(updateViewport({ scale: newScale }));
  };
  
  const handleResetView = () => {
    dispatch(updateViewport({ scale: 1, translateX: 0, translateY: 0 }));
    toast({
      title: "View Reset",
      description: "The graph view has been reset to default",
    });
  };
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };
  
  const handleClearGraph = () => {
    if (window.confirm('Are you sure you want to clear the graph?')) {
      dispatch(clearGraph());
      toast({
        title: "Graph Cleared",
        description: "All nodes and connections have been removed",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="bg-card border-b shadow-sm p-2 flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={onToggleLeftSidebar} title="Toggle Wallet Panel">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleResetView} title="Reset View">
          <Move className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" title="Auto-Layout Graph">
          <Layout className="h-4 w-4" />
        </Button>
      </div>
      
      <h1 className="font-bold text-lg">Wallet Flow Visualizer</h1>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={onExportSvg} title="Export SVG">
          <Download className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleToggleTheme} title="Toggle Light/Dark Mode">
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button variant="outline" size="sm" onClick={handleClearGraph} title="Clear Graph">
          <RefreshCw className="h-4 w-4 mr-1" /> Clear
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onToggleRightSidebar} title="Toggle Details Panel">
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
