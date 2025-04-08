
import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateViewport, selectNode, updateNodePosition } from '../store/walletSlice';
import { WalletNode as WalletNodeType } from '../types/wallet';
import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { arrangeNodesInTreeLayout } from '../utils/graphLayout';
import { toast } from '@/components/ui/use-toast';

const WalletNode: React.FC<{
  node: WalletNodeType;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}> = ({ node, isSelected, onClick, onDragStart }) => {
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart(e, node.id);
  };

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className={`wallet-node ${isSelected ? 'selected' : ''}`}
      onClick={handleNodeClick}
      onMouseDown={handleDragStart}
    >
      {/* Node Body - Rectangular with rounded corners */}
      <rect
        width="200"
        height="110"
        rx="8"
        ry="8"
        className={`fill-card/90 stroke-border stroke-2 shadow-lg ${
          isSelected ? 'stroke-primary stroke-[3px]' : ''
        }`}
        x="-100"
        y="-55"
      />
      
      {/* Entity Name - More prominent */}
      <text
        textAnchor="middle"
        className="fill-foreground font-bold text-sm"
        y="-35"
      >
        {node.entityName || "Unknown"}
      </text>
      
      {/* Wallet Address */}
      <text
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
        y="-15"
      >
        {node.address.substring(0, 8)}...{node.address.substring(node.address.length - 8)}
      </text>
      
      {/* Amount and Token - More prominent */}
      <text
        textAnchor="middle"
        className="fill-primary font-bold text-base"
        y="10"
      >
        {node.amount.toFixed(5)} {node.tokenType}
      </text>
      
      {/* Transaction Type */}
      <text
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
        y="30"
      >
        {node.transactionType}
      </text>
      
      {/* Transaction Count */}
      <text
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
        y="45"
      >
        {node.transactions.length} transaction{node.transactions.length !== 1 ? 's' : ''}
      </text>
      
      {/* Menu Button */}
      <g className="cursor-pointer hover:opacity-80" transform="translate(85, -45)">
        <circle r="12" className="fill-muted/50" />
        <MoreHorizontal className="w-4 h-4 stroke-muted-foreground" x="-8" y="-8" />
      </g>
      
      {/* Inflow and Outflow Indicators - More visible */}
      <g transform="translate(-100, 0)" className="wallet-node-connector">
        <circle r="8" className="fill-inflow stroke-card stroke-1" />
        <ChevronLeft className="w-5 h-5 stroke-card" x="-10" y="-10" />
      </g>
      
      <g transform="translate(100, 0)" className="wallet-node-connector">
        <circle r="8" className="fill-outflow stroke-card stroke-1" />
        <ChevronRight className="w-5 h-5 stroke-card" x="-10" y="-10" />
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
  // Calculate control points for more pronounced curved edges
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 150);
  
  // Different control points based on edge type for better visualization
  let path;
  if (type === 'outflow') {
    path = `M${sourceX},${sourceY} C${sourceX + controlOffset},${sourceY} ${targetX - controlOffset},${targetY} ${targetX},${targetY}`;
  } else {
    path = `M${sourceX},${sourceY} C${sourceX - controlOffset},${sourceY} ${targetX + controlOffset},${targetY} ${targetX},${targetY}`;
  }
  
  // Color based on edge type with enhanced styling
  const edgeClass = type === 'inflow' ? 'inflow-edge' : 'outflow-edge';
  
  // Calculate position for edge label
  const midPointX = (sourceX + targetX) / 2;
  const midPointY = (sourceY + targetY) / 2 - 15;
  
  return (
    <g className="edge-group">
      <path
        d={path}
        className={`edge ${edgeClass} stroke-2`}
        fill="none"
        markerEnd={`url(#${type === 'inflow' ? 'inflow-arrowhead' : 'outflow-arrowhead'})`}
      />
      
      {/* Enhanced edge label */}
      <g transform={`translate(${midPointX}, ${midPointY})`}>
        <rect
          x="-45"
          y="-12"
          width="90"
          height="24"
          rx="6"
          className={`${type === 'inflow' ? 'fill-inflow/20' : 'fill-outflow/20'} backdrop-blur-sm`}
        />
        <text
          textAnchor="middle"
          className={`text-xs font-medium ${type === 'inflow' ? 'fill-inflow' : 'fill-outflow'}`}
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
  
  // Auto-arrange nodes button handler
  const handleAutoArrange = () => {
    if (graph.nodes.length > 0) {
      const arrangedNodes = arrangeNodesInTreeLayout(graph.nodes, graph.edges);
      arrangedNodes.forEach(node => {
        dispatch(updateNodePosition({ id: node.id, x: node.x, y: node.y }));
      });
      toast({
        title: "Graph Arranged",
        description: "Nodes have been automatically arranged for better visibility",
      });
    }
  };
  
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
    <div className="graph-container w-full h-full bg-[#0D1117]">
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
          {/* Inflow marker (blue) - Enhanced */}
          <marker
            id="inflow-arrowhead"
            markerWidth="12"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
          >
            <polygon 
              points="0 0, 12 5, 0 10" 
              className="fill-inflow" 
            />
          </marker>
          
          {/* Outflow marker (red) - Enhanced */}
          <marker
            id="outflow-arrowhead"
            markerWidth="12"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
          >
            <polygon 
              points="0 0, 12 5, 0 10" 
              className="fill-outflow" 
            />
          </marker>

          {/* Add filter for glow effect */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <g transform={`translate(${viewport.translateX}, ${viewport.translateY}) scale(${viewport.scale})`}>
          {/* Grid lines with enhanced styling */}
          <g className="grid-lines opacity-10">
            {[...Array(40)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="-2000"
                y1={-1000 + i * 100}
                x2="2000"
                y2={-1000 + i * 100}
                stroke="#4A5568"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
            {[...Array(40)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={-1000 + i * 100}
                y1="-2000"
                x2={-1000 + i * 100}
                y2="2000"
                stroke="#4A5568"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
          </g>
          
          {/* Render edges with enhanced styling */}
          {graph.edges.map(edge => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            if (sourceNode && targetNode) {
              // For outflow, connect from right side of source to left side of target
              const sourceX = edge.type === 'outflow' ? sourceNode.x + 100 : sourceNode.x - 100;
              const targetX = edge.type === 'outflow' ? targetNode.x - 100 : targetNode.x + 100;

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
          
          {/* Render nodes with enhanced styling */}
          {graph.nodes.map(node => (
            <WalletNode
              key={node.id}
              node={node}
              isSelected={node.id === selectedNode}
              onClick={() => dispatch(selectNode(node.id))}
              onDragStart={handleNodeDragStart}
            />
          ))}
        </g>
        
        {/* Enhanced MiniMap */}
        <g className="minimap" transform="translate(20, 20)">
          <rect 
            x="0" 
            y="0" 
            width="180" 
            height="120" 
            className="fill-card/50 stroke-border rounded-md backdrop-blur-sm" 
            rx="6"
            ry="6"
          />
          {graph.nodes.map(node => {
            // Scale down node position for minimap
            const x = 20 + ((node.x + 1000) / 3000) * 140;
            const y = 20 + ((node.y + 1000) / 2000) * 80;
            return (
              <circle 
                key={`mini-${node.id}`}
                cx={x} 
                cy={y} 
                r={5}
                className={node.id === selectedNode ? "fill-primary stroke-white stroke-1" : "fill-muted-foreground"} 
              />
            );
          })}
          {/* Viewport indicator */}
          <rect 
            x={20 + (-viewport.translateX / (3000 * viewport.scale)) * 140}
            y={20 + (-viewport.translateY / (2000 * viewport.scale)) * 80}
            width={140 / viewport.scale}
            height={80 / viewport.scale}
            className="stroke-primary/80 fill-primary/20 stroke-[1.5px] rounded-sm"
          />
          <text x="90" y="110" textAnchor="middle" className="fill-foreground text-xs">Minimap</text>
        </g>
        
        {/* Enhanced Controls */}
        <g className="controls" transform="translate(20, 160)">
          <rect 
            x="0" 
            y="0" 
            width="50" 
            height="150" 
            rx="6"
            className="fill-card/50 stroke-border rounded-md backdrop-blur-sm" 
          />
          <g 
            transform="translate(25, 30)" 
            className="cursor-pointer"
            onClick={() => {
              const newScale = Math.min(viewport.scale * 1.2, 5);
              dispatch(updateViewport({ scale: newScale }));
            }}
          >
            <circle r="15" className="fill-muted/50 hover:fill-muted/80 transition-colors" />
            <text textAnchor="middle" className="fill-foreground text-lg font-bold" y="5">+</text>
          </g>
          <g 
            transform="translate(25, 75)" 
            className="cursor-pointer"
            onClick={() => {
              const newScale = Math.max(viewport.scale / 1.2, 0.1);
              dispatch(updateViewport({ scale: newScale }));
            }}
          >
            <circle r="15" className="fill-muted/50 hover:fill-muted/80 transition-colors" />
            <text textAnchor="middle" className="fill-foreground text-lg font-bold" y="5">−</text>
          </g>
          <g 
            transform="translate(25, 120)" 
            className="cursor-pointer"
            onClick={handleAutoArrange}
          >
            <circle r="15" className="fill-primary/50 hover:fill-primary/80 transition-colors" />
            <text textAnchor="middle" className="fill-foreground text-xs font-bold" y="4">Auto</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default WalletGraph;
