
import { WalletNode, Edge } from '../types/wallet';

/**
 * Arranges nodes in a tree-like layout to avoid overlaps
 * Enhanced to better match the reference visualization
 * @param nodes The nodes to arrange
 * @param edges The edges connecting the nodes
 * @returns Nodes with updated positions
 */
export const arrangeNodesInTreeLayout = (nodes: WalletNode[], edges: Edge[]): WalletNode[] => {
  if (nodes.length === 0) return [];
  
  // Create a deep copy of nodes to avoid mutating the original
  const updatedNodes = JSON.parse(JSON.stringify(nodes)) as WalletNode[];
  
  // Create a map of node relationships
  const nodeMap = new Map<string, { incomingNodes: string[], outgoingNodes: string[] }>();
  
  // Initialize the map with empty arrays
  updatedNodes.forEach(node => {
    nodeMap.set(node.id, { incomingNodes: [], outgoingNodes: [] });
  });
  
  // Populate the relationships
  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (sourceNode) {
      sourceNode.outgoingNodes.push(edge.target);
    }
    
    if (targetNode) {
      targetNode.incomingNodes.push(edge.source);
    }
  });
  
  // Find root nodes (nodes with only outgoing connections)
  const rootNodes = updatedNodes.filter(node => {
    const relationships = nodeMap.get(node.id);
    return relationships && relationships.incomingNodes.length === 0;
  });
  
  // If no root nodes are found, use the first node as root
  const startNodes = rootNodes.length > 0 ? rootNodes : [updatedNodes[0]];
  
  // Position the root nodes at the far left
  let currentY = 150;
  const horizontalSpacing = 300; // Increased spacing
  const verticalSpacing = 200; // Increased spacing
  
  startNodes.forEach(node => {
    node.x = 150;
    node.y = currentY;
    currentY += verticalSpacing;
  });
  
  // Helper function to recursively position nodes
  const positionChildNodes = (nodeId: string, level: number, parentY: number, processedNodes: Set<string>) => {
    if (processedNodes.has(nodeId)) return;
    processedNodes.add(nodeId);
    
    const nodeRelationships = nodeMap.get(nodeId);
    if (!nodeRelationships) return;
    
    const outgoingNodes = nodeRelationships.outgoingNodes;
    if (outgoingNodes.length === 0) return;
    
    // Find the actual node objects for the outgoing node IDs
    const childNodes = outgoingNodes
      .map(id => updatedNodes.find(n => n.id === id))
      .filter(Boolean) as WalletNode[];
    
    // More space for larger layouts
    const baseY = parentY - ((childNodes.length - 1) * verticalSpacing) / 2;
    
    childNodes.forEach((node, index) => {
      if (!processedNodes.has(node.id)) {
        node.x = 150 + level * horizontalSpacing;
        node.y = baseY + index * verticalSpacing;
        positionChildNodes(node.id, level + 1, node.y, processedNodes);
      }
    });
  };
  
  // Position all descendants of root nodes
  const processedNodes = new Set<string>();
  startNodes.forEach(node => {
    positionChildNodes(node.id, 1, node.y, processedNodes);
  });
  
  // Handle any remaining nodes that aren't connected to root nodes
  let remainingY = currentY;
  updatedNodes.forEach(node => {
    if (!processedNodes.has(node.id)) {
      node.x = 150;
      node.y = remainingY;
      remainingY += verticalSpacing;
      positionChildNodes(node.id, 1, node.y, processedNodes);
    }
  });
  
  // Apply the overlap resolution after initial positioning
  return resolveNodeOverlaps(updatedNodes);
};

/**
 * Finds nodes that have a lot of overlaps and adjusts their positions
 * Enhanced with improved overlap detection and resolution
 * @param nodes The nodes to check for overlaps
 * @returns Nodes with adjusted positions
 */
export const resolveNodeOverlaps = (nodes: WalletNode[]): WalletNode[] => {
  if (nodes.length <= 1) return nodes;
  
  const updatedNodes = [...nodes];
  const nodeRadius = 100; // Approximate node width/2 - increased for larger nodes
  const minDistance = nodeRadius * 2.2; // Minimum distance between node centers
  
  // Multiple iterations to gradually resolve overlaps
  const iterations = 5;
  
  for (let iter = 0; iter < iterations; iter++) {
    // Check each pair of nodes for overlaps
    for (let i = 0; i < updatedNodes.length; i++) {
      for (let j = i + 1; j < updatedNodes.length; j++) {
        const nodeA = updatedNodes[i];
        const nodeB = updatedNodes[j];
        
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If the distance is less than the minimum, push nodes apart
        if (distance < minDistance) {
          // Calculate the repulsion force (stronger when closer)
          const pushDistance = (minDistance - distance) / (iter + 1);
          const angle = Math.atan2(dy, dx);
          
          // Move nodes in opposite directions with decreasing force in later iterations
          nodeA.x -= Math.cos(angle) * pushDistance * 0.5;
          nodeA.y -= Math.sin(angle) * pushDistance * 0.5;
          nodeB.x += Math.cos(angle) * pushDistance * 0.5;
          nodeB.y += Math.sin(angle) * pushDistance * 0.5;
        }
      }
    }
  }
  
  return updatedNodes;
};

/**
 * Force-directed layout algorithm to better distribute nodes
 * @param nodes The nodes to arrange
 * @param edges The edges connecting the nodes
 * @returns Nodes with updated positions from force-directed layout
 */
export const applyForceDirectedLayout = (nodes: WalletNode[], edges: Edge[]): WalletNode[] => {
  if (nodes.length <= 1) return nodes;
  
  const updatedNodes = JSON.parse(JSON.stringify(nodes)) as WalletNode[];
  const iterations = 50;
  const repulsionForce = 1000;
  const attractionForce = 0.01;
  const damping = 0.95;
  
  // Initialize velocity for each node
  const velocities = new Map<string, { vx: number, vy: number }>();
  updatedNodes.forEach(node => {
    velocities.set(node.id, { vx: 0, vy: 0 });
  });
  
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate repulsion forces between all node pairs
    for (let i = 0; i < updatedNodes.length; i++) {
      for (let j = i + 1; j < updatedNodes.length; j++) {
        const nodeA = updatedNodes[i];
        const nodeB = updatedNodes[j];
        
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distanceSq = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSq);
        
        if (distance > 0) {
          // Repulsive force is inversely proportional to distance squared
          const force = repulsionForce / distanceSq;
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          // Update velocities
          const velocityA = velocities.get(nodeA.id)!;
          const velocityB = velocities.get(nodeB.id)!;
          
          velocityA.vx -= forceX;
          velocityA.vy -= forceY;
          velocityB.vx += forceX;
          velocityB.vy += forceY;
        }
      }
    }
    
    // Calculate attraction forces along edges
    edges.forEach(edge => {
      const sourceNode = updatedNodes.find(n => n.id === edge.source);
      const targetNode = updatedNodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Attractive force is proportional to distance
          const force = distance * attractionForce;
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          // Update velocities
          const velocitySource = velocities.get(sourceNode.id)!;
          const velocityTarget = velocities.get(targetNode.id)!;
          
          velocitySource.vx += forceX;
          velocitySource.vy += forceY;
          velocityTarget.vx -= forceX;
          velocityTarget.vy -= forceY;
        }
      }
    });
    
    // Apply velocities to node positions with damping
    updatedNodes.forEach(node => {
      const velocity = velocities.get(node.id)!;
      
      // Apply damping to gradually slow down movement
      velocity.vx *= damping;
      velocity.vy *= damping;
      
      // Update position
      node.x += velocity.vx;
      node.y += velocity.vy;
    });
  }
  
  return updatedNodes;
};
