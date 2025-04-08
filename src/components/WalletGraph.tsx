
import React, { useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { updateViewport, selectNode, updateNodePosition } from '../store/walletSlice';
import { WalletNode as WalletNodeType } from '../types/wallet';
import { MoreVertical } from 'lucide-react';

const WalletNode: React.FC<{
  node: WalletNodeType;
  isSelected: boolean;
  onClick: () => void;
}> = ({ node, isSelected, onClick }) => {
  // Determine node color based on entity name or transaction type
  const getNodeColor = () => {
    if (node.entityName.toLowerCase().includes('changenow')) {
      return 'bg-orange-400 hover:bg-orange-500';
    } else if (node.entityName.toLowerCase().includes('whitebit')) {
      return 'bg-purple-300 hover:bg-purple-400';
    } else if (node.address.startsWith('bc1qp')) {
      return 'bg-pink-300 hover:bg-pink-400';
    } else if (node.address.startsWith('bc1q7l')) {
      return 'bg-pink-300 hover:bg-pink-400';
    } else {
      return 'bg-green-400 hover:bg-green-500';
    }
  };

  // Format address to show only a portion if it's too long
  const formatAddress = (address: string) => {
    if (address.length > 16) {
      return address.substring(0, 8) + '...' + address.substring(address.length - 8);
    }
    return address;
  };

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className={`wallet-node ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Node main body */}
      <rect
        width="180"
        height="40"
        rx="20"
        ry="20"
        className={`${getNodeColor()} stroke-none shadow-xl ${
          isSelected ? 'ring-2 ring-white' : ''
        }`}
        x="-90"
        y="-20"
      />
      
      {/* Entity name text */}
      <text
        textAnchor="middle"
        className="fill-gray-900 text-sm font-medium"
        y="5"
      >
        {node.entityName || formatAddress(node.address)}
      </text>
      
      {/* Options button */}
      <g transform="translate(70, 0)" className="cursor-pointer">
        <circle r="10" fill="rgba(255,255,255,0.2)" />
        <foreignObject width="20" height="20" x="-10" y="-10">
          <div className="flex items-center justify-center h-full">
            <MoreVertical size={14} className="text-gray-900" />
          </div>
        </foreignObject>
      </g>
    </g>
  );
};

const TransactionEdge: React.FC<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: 'inflow' | 'outflow';
  amount: number;
  tokenType: string;
}> = ({ sourceX, sourceY, targetX, targetY, type, amount, tokenType }) => {
  const edgeClass = type === 'inflow' ? 'stroke-cyan-400' : 'stroke-red-500';
  const strokeClass = type === 'inflow' ? 'stroke-dashed' : 'stroke-dotted';
  
  // Calculate the midpoint for the label
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate angle for proper label orientation
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;

  // Add a slight curve to the path
  const curveOffset = 30;
  const controlX = (sourceX + targetX) / 2;
  const controlY = (sourceY + targetY) / 2 - curveOffset;

  // Create path for curved line
  const path = `M${sourceX},${sourceY} Q${controlX},${controlY} ${targetX},${targetY}`;
  
  return (
    <>
      <path
        d={path}
        className={`${edgeClass} stroke-2 ${strokeClass} fill-none`}
        strokeDasharray={type === 'inflow' ? "5,5" : "3,3"}
        markerEnd={`url(#arrowhead-${type})`}
      />

      {/* Transaction label */}
      <foreignObject
        x={midX - 100}
        y={midY - 15}
        width="200"
        height="30"
        className="overflow-visible pointer-events-none"
      >
        <div 
          className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                     ${type === 'inflow' ? 'bg-white text-black' : 'bg-pink-300 text-black'}`}
          style={{
            transform: `rotate(${angle}deg)`,
            whiteSpace: 'nowrap',
            display: 'inline-block',
            maxWidth: 'fit-content'
          }}
        >
          {amount.toFixed(8)} {tokenType} {type === 'inflow' ? '→' : '→'}
        </div>
      </foreignObject>
    </>
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
          <marker
            id="arrowhead-inflow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              className="fill-cyan-400" 
            />
          </marker>
          <marker
            id="arrowhead-outflow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              className="fill-red-500" 
            />
          </marker>
        </defs>
        
        <g transform={`translate(${viewport.translateX}, ${viewport.translateY}) scale(${viewport.scale})`}>
          {/* Background image or pattern - faint grid lines */}
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
              return (
                <TransactionEdge
                  key={edge.id}
                  sourceX={sourceNode.x}
                  sourceY={sourceNode.y}
                  targetX={targetNode.x}
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
      </svg>
      
      {/* Minimap (bottom right corner) */}
      <div className="absolute bottom-4 right-4 w-32 h-32 bg-black/30 border border-gray-700 rounded-md overflow-hidden">
        <svg className="w-full h-full" viewBox="-500 -300 1000 600">
          {graph.nodes.map(node => {
            // Determine node color for minimap
            let color = "#10B981"; // green by default
            if (node.entityName.toLowerCase().includes('changenow')) {
              color = "#FB923C"; // orange
            } else if (node.entityName.toLowerCase().includes('whitebit')) {
              color = "#C084FC"; // purple
            } else if (node.address.startsWith('bc1qp') || node.address.startsWith('bc1q7l')) {
              color = "#F9A8D4"; // pink
            }
            
            return (
              <circle
                key={`mini-${node.id}`}
                cx={node.x / 10}
                cy={node.y / 10}
                r={3}
                fill={color}
              />
            );
          })}
        </svg>
      </div>
      
      {/* Zoom controls (left side) */}
      <div className="absolute left-4 bottom-1/3 flex flex-col gap-2">
        <button className="w-8 h-8 bg-black/50 border border-gray-700 text-white flex items-center justify-center rounded-md">
          +
        </button>
        <button className="w-8 h-8 bg-black/50 border border-gray-700 text-white flex items-center justify-center rounded-md">
          −
        </button>
        <button className="w-8 h-8 bg-black/50 border border-gray-700 text-white flex items-center justify-center rounded-md">
          ⤢
        </button>
        <button className="w-8 h-8 bg-black/50 border border-gray-700 text-white flex items-center justify-center rounded-md">
          🔒
        </button>
      </div>
    </div>
  );
};

export default WalletGraph;
