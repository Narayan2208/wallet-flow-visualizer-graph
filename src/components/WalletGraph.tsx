
import React, { useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { updateViewport, selectNode, updateNodePosition } from '../store/walletSlice';
import { WalletNode as WalletNodeType } from '../types/wallet';

const WalletNode: React.FC<{
  node: WalletNodeType;
  isSelected: boolean;
  onClick: () => void;
}> = ({ node, isSelected, onClick }) => {
  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className={`wallet-node ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <rect
        width="120"
        height="80"
        rx="10"
        ry="10"
        className={`fill-card stroke-primary stroke-2 shadow-md ${
          isSelected ? 'stroke-[3px]' : ''
        }`}
        x="-60"
        y="-40"
      />
      <text
        textAnchor="middle"
        className="fill-foreground text-xs font-medium"
        y="-20"
      >
        {node.address.substring(0, 10)}...
      </text>
      <text
        textAnchor="middle"
        className="fill-foreground text-xs"
        y="0"
      >
        {node.entityName}
      </text>
      <text
        textAnchor="middle"
        className="fill-primary text-xs font-semibold"
        y="20"
      >
        {node.amount.toFixed(8)} {node.tokenType}
      </text>
      <circle
        r="3"
        className="fill-primary"
        cx="-60"
      />
      <circle
        r="3"
        className="fill-primary"
        cx="60"
      />
    </g>
  );
};

const Edge: React.FC<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: 'inflow' | 'outflow';
}> = ({ sourceX, sourceY, targetX, targetY, type }) => {
  const edgeClass = type === 'inflow' ? 'inflow-edge' : 'outflow-edge';
  
  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      className={`edge ${edgeClass} stroke-2`}
      markerEnd="url(#arrowhead)"
    />
  );
};

const WalletGraph: React.FC = () => {
  const dispatch = useAppDispatch();
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
    <div className="graph-container w-full h-full">
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
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              className="fill-primary" 
            />
          </marker>
        </defs>
        
        <g transform={`translate(${viewport.translateX}, ${viewport.translateY}) scale(${viewport.scale})`}>
          {/* Render edges */}
          {graph.edges.map(edge => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            if (sourceNode && targetNode) {
              return (
                <Edge
                  key={edge.id}
                  sourceX={sourceNode.x}
                  sourceY={sourceNode.y}
                  targetX={targetNode.x}
                  targetY={targetNode.y}
                  type={edge.type}
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
          
          {/* Grid lines for reference (optional) */}
          <g className="grid-lines opacity-10">
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
        </g>
      </svg>
    </div>
  );
};

export default WalletGraph;
