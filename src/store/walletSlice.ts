
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, WalletNode, Edge, WalletData } from '../types/wallet';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a new node position that avoids overlaps
const generateNodePosition = (existingNodes: WalletNode[]): { x: number, y: number } => {
  // Base position in the center with some randomness
  const baseX = 500 + Math.random() * 200 - 100;
  const baseY = 300 + Math.random() * 200 - 100;
  
  // Ensure there's no overlap with existing nodes
  const nodeRadius = 50; // Approx node radius
  const minDistance = nodeRadius * 2.5; // Minimum distance between nodes
  
  let x = baseX;
  let y = baseY;
  let attempts = 0;
  
  while (attempts < 50) {
    // Check if this position overlaps with any existing node
    const overlaps = existingNodes.some(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance < minDistance;
    });
    
    if (!overlaps) {
      return { x, y };
    }
    
    // Try a new position
    x = baseX + Math.random() * 400 - 200;
    y = baseY + Math.random() * 400 - 200;
    attempts++;
  }
  
  // If we can't find a non-overlapping position, place it further out
  return {
    x: baseX + Math.random() * 600 - 300,
    y: baseY + Math.random() * 600 - 300
  };
};

const initialState: AppState = {
  graph: {
    nodes: [],
    edges: []
  },
  viewport: {
    scale: 1,
    translateX: 0,
    translateY: 0
  },
  selectedNode: null,
  theme: 'light'
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    addWallet: (state, action: PayloadAction<WalletData>) => {
      const { beneficiary_address, amount, transactions, entity_name, token_type, transaction_type } = action.payload;
      
      // Check if the node already exists
      const existingNode = state.graph.nodes.find(node => node.address === beneficiary_address);
      
      if (!existingNode) {
        const position = generateNodePosition(state.graph.nodes);
        const newNode: WalletNode = {
          id: uuidv4(),
          address: beneficiary_address,
          amount,
          entityName: entity_name,
          tokenType: token_type,
          transactionType: transaction_type,
          x: position.x,
          y: position.y,
          transactions
        };
        
        state.graph.nodes.push(newNode);
      }
    },
    
    addEdge: (state, action: PayloadAction<{ source: string, target: string, type: 'inflow' | 'outflow', amount: number, transaction_id: string }>) => {
      const { source, target, type, amount, transaction_id } = action.payload;
      
      // Check if both source and target nodes exist
      const sourceNode = state.graph.nodes.find(node => node.id === source || node.address === source);
      const targetNode = state.graph.nodes.find(node => node.id === target || node.address === target);
      
      if (sourceNode && targetNode) {
        // Check if this edge already exists
        const edgeExists = state.graph.edges.some(
          edge => (edge.source === sourceNode.id && edge.target === targetNode.id) ||
                 (edge.target === sourceNode.id && edge.source === targetNode.id)
        );
        
        if (!edgeExists) {
          const newEdge: Edge = {
            id: uuidv4(),
            source: sourceNode.id,
            target: targetNode.id,
            type,
            amount,
            transaction_id
          };
          
          state.graph.edges.push(newEdge);
        }
      }
    },
    
    updateViewport: (state, action: PayloadAction<{ scale?: number, translateX?: number, translateY?: number }>) => {
      const { scale, translateX, translateY } = action.payload;
      if (scale !== undefined) state.viewport.scale = scale;
      if (translateX !== undefined) state.viewport.translateX = translateX;
      if (translateY !== undefined) state.viewport.translateY = translateY;
    },
    
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNode = action.payload;
    },
    
    clearGraph: (state) => {
      state.graph = { nodes: [], edges: [] };
      state.selectedNode = null;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    updateNodePosition: (state, action: PayloadAction<{ id: string, x: number, y: number }>) => {
      const { id, x, y } = action.payload;
      const node = state.graph.nodes.find(n => n.id === id);
      if (node) {
        node.x = x;
        node.y = y;
      }
    }
  }
});

export const { addWallet, addEdge, updateViewport, selectNode, clearGraph, toggleTheme, updateNodePosition } = walletSlice.actions;

export default walletSlice.reducer;
