
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { addWallet, addEdge } from '../store/walletSlice';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Plus, Save, Wallet } from 'lucide-react';

const LeftSidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const dispatch = useAppDispatch();
  const [walletAddress, setWalletAddress] = useState('');
  const [entityName, setEntityName] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState('BTC');
  const [transactionType, setTransactionType] = useState('Normal Tx');
  
  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (walletAddress.trim()) {
      dispatch(addWallet({
        beneficiary_address: walletAddress,
        amount: parseFloat(amount) || 0,
        transactions: [
          {
            tx_amount: parseFloat(amount) || 0,
            transaction_id: uuidv4()
          }
        ],
        entity_name: entityName || 'Unknown',
        token_type: tokenType,
        transaction_type: transactionType
      }));
      
      setWalletAddress('');
      setEntityName('');
      setAmount('');
    }
  };
  
  const handleSampleData = () => {
    // Add some sample nodes and connections
    const sampleWallets = [
      {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        entity: 'Exchange A',
        amount: 1.25,
      },
      {
        address: 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
        entity: 'Wallet B',
        amount: 0.75,
      },
      {
        address: 'bc1qr583w2swedy2qhz7u5xr0xw3u6frhflcc98ktl',
        entity: 'Mining Pool',
        amount: 2.5,
      },
      {
        address: 'bc1qyzxdu4p3xz9pf36q2ew2ltawmqxrqzvm7zfxll',
        entity: 'Personal Wallet',
        amount: 0.5,
      },
    ];
    
    // Add wallet nodes
    sampleWallets.forEach((wallet, index) => {
      dispatch(addWallet({
        beneficiary_address: wallet.address,
        amount: wallet.amount,
        transactions: [
          {
            tx_amount: wallet.amount,
            transaction_id: `sample-tx-${index}`
          }
        ],
        entity_name: wallet.entity,
        token_type: 'BTC',
        transaction_type: 'Normal Tx'
      }));
    });
    
    // Add some connections (after a short delay to ensure nodes are added)
    setTimeout(() => {
      // Connect first wallet to second wallet (inflow)
      dispatch(addEdge({
        source: sampleWallets[0].address,
        target: sampleWallets[1].address,
        type: 'inflow',
        amount: 0.5,
        transaction_id: 'sample-tx-edge-1'
      }));
      
      // Connect third wallet to first wallet (outflow)
      dispatch(addEdge({
        source: sampleWallets[2].address,
        target: sampleWallets[0].address,
        type: 'outflow',
        amount: 0.8,
        transaction_id: 'sample-tx-edge-2'
      }));
      
      // Connect second wallet to fourth wallet (inflow)
      dispatch(addEdge({
        source: sampleWallets[1].address,
        target: sampleWallets[3].address,
        type: 'inflow',
        amount: 0.3,
        transaction_id: 'sample-tx-edge-3'
      }));
    }, 100);
  };
  
  return (
    <div 
      className={`sidebar-container z-20 left-0 w-80 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r`}
    >
      <div className="flex h-full flex-col">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Add Wallet</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <Separator />
        
        <div className="p-4 flex-1 overflow-auto">
          <form onSubmit={handleAddWallet} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                placeholder="Enter wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entity">Entity Name</Label>
              <Input
                id="entity"
                placeholder="Enter entity name (optional)"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="token">Token Type</Label>
              <Input
                id="token"
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Wallet
            </Button>
          </form>
          
          <Separator className="my-4" />
          
          <Card className="p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <Button variant="outline" className="w-full" onClick={handleSampleData}>
              Load Sample Data
            </Button>
          </Card>
        </div>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Graph
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
