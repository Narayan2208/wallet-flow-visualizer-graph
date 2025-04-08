
import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateViewport, selectNode, updateNodePosition } from '../store/walletSlice';
import { WalletNode as WalletNodeType } from '../types/wallet';
import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const WalletNode: React.FC<{
  node: WalletNodeType;
  isSelected: boolean;
  onClick: () => void;
}> = ({ node, isSelected, onClick }) => {
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className={`wallet-node ${isSelected ? 'selected' : ''}`}
      onClick={handleNodeClick}
    >
      {/* Node Body */}
      <rect
        width="160"
        height="100"
        rx="8"
        ry="8"
        className={`fill-card stroke-border stroke-2 shadow-md ${
          isSelected ? 'stroke-primary stroke-[3px]' : ''
        }`}
        x="-80"
        y="-50"
      />
      
      {/* Entity Name */}
      <text
        textAnchor="middle"
        className="fill-foreground font-medium text-sm"
        y="-30"
      >
        {node.entityName || "Unknown"}
      </text>
      
      {/* Wallet Address */}
      <text
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
        y="-10"
      >
        {node.address.substring(0, 12)}...
      </text>
      
      {/* Amount and Token */}
      <text
        textAnchor="middle"
        className="fill-primary text-sm font-semibold"
        y="15"
      >
        {node.amount.toFixed(8)} {node.tokenType}
      </text>
      
      {/* Transaction Type */}
      <text
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
        y="35"
      >
        {node.transactionType}
      </text>
      
      {/* Menu Button */}
      <g className="cursor-pointer hover:opacity-80" transform="translate(65, -40)">
        <circle r="12" className="fill-muted/50" />
        <MoreHorizontal className="w-4 h-4 stroke-muted-foreground" x="-8" y="-8" />
      </g>
      
      {/* Inflow and Outflow Indicators */}
      <g transform="translate(-80, 0)" className="wallet-node-connector">
        <circle r="6" className="fill-inflow stroke-card stroke-1" />
        <ChevronLeft className="w-4 h-4 stroke-card" x="-8" y="-8" />
      </g>
      
      <g transform="translate(80, 0)" className="wallet-node-connector">
        <circle r="6" className="fill-outflow stroke-card stroke-1" />
        <ChevronRight className="w-4 h-4 stroke-card" x="-8" y="-8" />
      </g>
    </g>
  );
};

const Edge: React.FC<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: 'inflow' | 'outflow';
  amount: number;
  tokenType: string;
}> = ({ sourceX, sourceY, targetX, targetY, type, amount, tokenType }) => {
  // Calculate control points for curved edges
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const controlX = sourceX + dx / 2;
  const controlY = sourceY + dy / 2;
  
  // Create path for curved edge
  const path = `M${sourceX},${sourceY} Q${controlX},${controlY} ${targetX},${targetY}`;
  
  // Color based on edge type
  const edgeClass = type === 'inflow' ? 'inflow-edge' : 'outflow-edge';
  
  // Calculate position for edge label
  const labelX = controlX;
  const labelY = controlY - 15;
  
  return (
    <g className="edge-group">
      <path
        d={path}
        className={`edge ${edgeClass} stroke-2`}
        fill="none"
        markerEnd={`url(#${type === 'inflow' ? 'inflow-arrowhead' : 'outflow-arrowhead'})`}
      />
      
      {/* Edge label */}
      <g transform={`translate(${labelX}, ${labelY})`}>
        <rect
          x="-40"
          y="-10"
          width="80"
          height="20"
          rx="4"
          className="fill-background/80 backdrop-blur-sm"
        />
        <text
          textAnchor="middle"
          className="fill-foreground text-xs"
          y="4"
        >
          {amount.toFixed(4)} {tokenType}
        </text>
      </g>
    </g>
  );
};

const WalletGraph: React.FC = () => {
  const dispatch = useDispatch();
  const { graph, viewport, selectedNode } = useAppSelector(state => state.wallet);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [nodeDragging, setNodeDragging] = useState<string | null>(null);
  
  // Set up pan and zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(viewport.scale + delta, 0.1), 5);
      
      // Calculate the point where the mouse is before scaling
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const svgRect = svgRef.current?.getBoundingClientRect();
      
      if (svgRect) {
        const viewportX = (mouseX - svgRect.left - viewport.translateX) / viewport.scale;
        const viewportY = (mouseY - svgRect.top - viewport.translateY) / viewport.scale;
        
        // Calculate the new translate position
        const newTranslateX = viewport.translateX - (viewportX * (newScale - viewport.scale));
        const newTranslateY = viewport.translateY - (viewportY * (newScale - viewport.scale));
        
        dispatch(updateViewport({
          scale: newScale,
          translateX: newTranslateX,
          translateY: newTranslateY
        }));
      }
    };
    
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (svg) {
        svg.removeEventListener('wheel', handleWheel);
      }
    };
  }, [viewport, dispatch]);
  
  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (nodeDragging) {
      // Handle node dragging
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (svgRect) {
        const x = (e.clientX - svgRect.left - viewport.translateX) / viewport.scale;
        const y = (e.clientY - svgRect.top - viewport.translateY) / viewport.scale;
        
        dispatch(updateNodePosition({ id: nodeDragging, x, y }));
      }
    } else if (dragging) {
      // Handle canvas panning
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      
      dispatch(updateViewport({
        translateX: viewport.translateX + dx,
        translateY: viewport.translateY + dy
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    setNodeDragging(null);
  };
  
  const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNodeDragging(id);
    setDragging(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };
  
  // Handle background click to deselect node
  const handleSvgClick = () => {
    dispatch(selectNode(null));
  };
  
  return (
    <div className="graph-container w-full h-full bg-black">
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
      >
        <defs>
          {/* Inflow marker (blue) */}
          <marker
            id="inflow-arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              className="fill-inflow" 
            />
          </marker>
          
          {/* Outflow marker (red) */}
          <marker
            id="outflow-arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              className="fill-outflow" 
            />
          </marker>
        </defs>
        
        <g transform={`translate(${viewport.translateX}, ${viewport.translateY}) scale(${viewport.scale})`}>
          {/* Grid lines for reference */}
          <g className="grid-lines opacity-5">
            {[...Array(40)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="-2000"
                y1={-1000 + i * 50}
                x2="2000"
                y2={-1000 + i * 50}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
            {[...Array(40)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={-1000 + i * 50}
                y1="-2000"
                x2={-1000 + i * 50}
                y2="2000"
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
          </g>
          
          {/* Render edges */}
          {graph.edges.map(edge => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            if (sourceNode && targetNode) {
              // For outflow, connect from right side of source to left side of target
              const sourceX = edge.type === 'outflow' ? sourceNode.x + 80 : sourceNode.x - 80;
              const targetX = edge.type === 'outflow' ? targetNode.x - 80 : targetNode.x + 80;

              return (
                <Edge
                  key={edge.id}
                  sourceX={sourceX}
                  sourceY={sourceNode.y}
                  targetX={targetX}
                  targetY={targetNode.y}
                  type={edge.type}
                  amount={edge.amount}
                  tokenType={sourceNode.tokenType}
                />
              );
            }
            return null;
          })}
          
          {/* Render nodes */}
          {graph.nodes.map(node => (
            <WalletNode
              key={node.id}
              node={node}
              isSelected={node.id === selectedNode}
              onClick={() => dispatch(selectNode(node.id))}
            />
          ))}
        </g>
        
        {/* MiniMap */}
        <g className="minimap" transform="translate(20, 20)">
          <rect 
            x="0" 
            y="0" 
            width="150" 
            height="100" 
            className="fill-card/80 stroke-border" 
          />
          {graph.nodes.map(node => {
            // Scale down node position for minimap
            const x = 20 + ((node.x + 1000) / 3000) * 110;
            const y = 20 + ((node.y + 1000) / 2000) * 60;
            return (
              <circle 
                key={`mini-${node.id}`}
                cx={x} 
                cy={y} 
                r={4}
                className={node.id === selectedNode ? "fill-primary" : "fill-muted-foreground"} 
              />
            );
          })}
          {/* Viewport indicator */}
          <rect 
            x={20 + (-viewport.translateX / (3000 * viewport.scale)) * 110}
            y={20 + (-viewport.translateY / (2000 * viewport.scale)) * 60}
            width={110 / viewport.scale}
            height={60 / viewport.scale}
            className="stroke-primary fill-primary/10 stroke-[1px]"
          />
        </g>
        
        {/* Controls */}
        <g className="controls" transform="translate(20, 140)">
          <rect 
            x="0" 
            y="0" 
            width="40" 
            height="80" 
            rx="4"
            className="fill-card/80 stroke-border" 
          />
          <g 
            transform="translate(20, 20)" 
            className="cursor-pointer"
            onClick={() => {
              const newScale = Math.min(viewport.scale * 1.2, 5);
              dispatch(updateViewport({ scale: newScale }));
            }}
          >
            <circle r="15" className="fill-muted/50" />
            <text textAnchor="middle" className="fill-foreground text-lg font-bold" y="5">+</text>
          </g>
          <g 
            transform="translate(20, 60)" 
            className="cursor-pointer"
            onClick={() => {
              const newScale = Math.max(viewport.scale / 1.2, 0.1);
              dispatch(updateViewport({ scale: newScale }));
            }}
          >
            <circle r="15" className="fill-muted/50" />
            <text textAnchor="middle" className="fill-foreground text-lg font-bold" y="5">−</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default WalletGraph;
