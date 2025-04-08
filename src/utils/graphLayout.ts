
import { WalletNode, Edge } from '../types/wallet';

/**
 * Arranges nodes in a tree-like layout to avoid overlaps
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
  let currentY = 100;
  const horizontalSpacing = 250;
  const verticalSpacing = 150;
  
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
  
  return updatedNodes;
};

/**
 * Finds nodes that have a lot of overlaps and adjusts their positions
 * @param nodes The nodes to check for overlaps
 * @returns Nodes with adjusted positions
 */
export const resolveNodeOverlaps = (nodes: WalletNode[]): WalletNode[] => {
  if (nodes.length <= 1) return nodes;
  
  const updatedNodes = [...nodes];
  const nodeRadius = 60; // Approximate node radius
  const minDistance = nodeRadius * 2; // Minimum distance between node centers
  
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
        const pushDistance = (minDistance - distance) / 2;
        const angle = Math.atan2(dy, dx);
        
        // Move nodes in opposite directions
        nodeA.x -= Math.cos(angle) * pushDistance;
        nodeA.y -= Math.sin(angle) * pushDistance;
        nodeB.x += Math.cos(angle) * pushDistance;
        nodeB.y += Math.sin(angle) * pushDistance;
      }
    }
  }
  
  return updatedNodes;
};
