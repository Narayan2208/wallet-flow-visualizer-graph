
// Types for wallet flow visualization

export interface Transaction {
  tx_amount: number;
  transaction_id: string;
}

export interface WalletNode {
  id: string;
  address: string;
  amount: number;
  entityName: string;
  tokenType: string;
  transactionType: string;
  x: number;
  y: number;
  transactions: Transaction[];
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'inflow' | 'outflow';
  amount: number;
  transaction_id: string;
}

export interface GraphData {
  nodes: WalletNode[];
  edges: Edge[];
}

export interface GraphViewport {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface WalletData {
  beneficiary_address: string;
  amount: number;
  transactions: Transaction[];
  entity_name: string;
  token_type: string;
  transaction_type: string;
}

export interface AppState {
  graph: GraphData;
  viewport: GraphViewport;
  selectedNode: string | null;
  theme: 'light' | 'dark';
}
