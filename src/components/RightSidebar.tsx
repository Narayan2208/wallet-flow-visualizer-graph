
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  DollarSign,
  ExternalLink,
  Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';

const RightSidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const { graph, selectedNode } = useAppSelector(state => state.wallet);
  
  // Get the selected node data
  const nodeData = selectedNode 
    ? graph.nodes.find(node => node.id === selectedNode)
    : null;
  
  // Get inflow and outflow connections for the selected node
  const inflows = selectedNode
    ? graph.edges.filter(edge => edge.target === selectedNode && edge.type === 'inflow')
    : [];
    
  const outflows = selectedNode
    ? graph.edges.filter(edge => edge.source === selectedNode && edge.type === 'outflow')
    : [];
    
  // Map edge ids to node data
  const getNodeFromEdge = (id: string, isSource: boolean) => {
    return graph.nodes.find(node => node.id === (isSource ? id : id));
  };

  // Format date string to relative time (e.g. "2 days ago")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown date';
    try {
      const date = new Date(dateStr);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return dateStr;
    }
  };
  
  return (
    <div 
      className={`sidebar-container z-20 right-0 w-80 ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l bg-sidebar`}
    >
      <div className="flex h-full flex-col">
        <div className="p-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Wallet Details</h2>
        </div>
        
        <Separator />
        
        {nodeData ? (
          <div className="p-4 flex-1 overflow-auto">
            <Card className="p-4 bg-card shadow-sm mb-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">{nodeData.entityName}</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground break-all mt-1">{nodeData.address}</p>
              
              <div className="mt-3 flex items-center">
                <DollarSign className="h-4 w-4 text-primary mr-1" />
                <span className="font-semibold">{nodeData.amount.toFixed(8)}</span>
                <span className="ml-1 text-muted-foreground">{nodeData.tokenType}</span>
              </div>
              
              <div className="mt-1 text-sm text-muted-foreground flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {nodeData.transactionType}
              </div>
              
              {nodeData.transactions[0]?.date_time && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(nodeData.transactions[0].date_time)}
                </div>
              )}
            </Card>
            
            {inflows.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ArrowLeft className="h-4 w-4 text-inflow mr-1" /> Inflows ({inflows.length})
                </h4>
                <div className="space-y-2">
                  {inflows.map(edge => {
                    const sourceNode = graph.nodes.find(node => node.id === edge.source);
                    return sourceNode ? (
                      <Card key={edge.id} className="p-3 border-l-4 border-l-inflow">
                        <div className="text-sm font-medium">{sourceNode.entityName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {sourceNode.address.substring(0, 16)}...
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                          <span>{edge.amount.toFixed(8)} {sourceNode.tokenType}</span>
                          <span className="text-xs text-muted-foreground">
                            {edge.transaction_id.substring(0, 8)}...
                          </span>
                        </div>
                      </Card>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {outflows.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ArrowRight className="h-4 w-4 text-outflow mr-1" /> Outflows ({outflows.length})
                </h4>
                <div className="space-y-2">
                  {outflows.map(edge => {
                    const targetNode = graph.nodes.find(node => node.id === edge.target);
                    return targetNode ? (
                      <Card key={edge.id} className="p-3 border-r-4 border-r-outflow">
                        <div className="text-sm font-medium">{targetNode.entityName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {targetNode.address.substring(0, 16)}...
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                          <span>{edge.amount.toFixed(8)} {targetNode.tokenType}</span>
                          <span className="text-xs text-muted-foreground">
                            {edge.transaction_id.substring(0, 8)}...
                          </span>
                        </div>
                      </Card>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {nodeData.transactions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Transactions</h4>
                <Card className="p-3">
                  <div className="max-h-60 overflow-y-auto">
                    {nodeData.transactions.map((tx, idx) => (
                      <div key={idx} className={idx > 0 ? "mt-2 pt-2 border-t" : ""}>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">{tx.transaction_id.substring(0, 12)}...</span>
                          <span className="text-xs text-muted-foreground">
                            {tx.date_time ? formatDate(tx.date_time) : 'Unknown date'}
                          </span>
                        </div>
                        <div className="text-sm mt-1">
                          {tx.tx_amount.toFixed(8)} {nodeData.tokenType}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
            
            {inflows.length === 0 && outflows.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No connections found for this wallet
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
            Select a wallet node to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
