
import { WalletData } from "../types/wallet";

export const sampleWallets: WalletData[] = [
  {
    beneficiary_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    amount: 1.25436782,
    transactions: [
      {
        tx_amount: 0.75436782,
        transaction_id: "7e9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20856"
      },
      {
        tx_amount: 0.5,
        transaction_id: "8f9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20857"
      }
    ],
    entity_name: "Binance",
    token_type: "BTC",
    transaction_type: "Exchange Tx"
  },
  {
    beneficiary_address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h",
    amount: 0.75436782,
    transactions: [
      {
        tx_amount: 0.75436782,
        transaction_id: "7e9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20856"
      }
    ],
    entity_name: "Personal Wallet",
    token_type: "BTC",
    transaction_type: "Normal Tx"
  },
  {
    beneficiary_address: "bc1qr583w2swedy2qhz7u5xr0xw3u6frhflcc98ktl",
    amount: 2.50128765,
    transactions: [
      {
        tx_amount: 1.50128765,
        transaction_id: "9e9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20858"
      },
      {
        tx_amount: 1.0,
        transaction_id: "ae9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20859"
      }
    ],
    entity_name: "Mining Pool",
    token_type: "BTC",
    transaction_type: "Mining Reward"
  },
  {
    beneficiary_address: "bc1qyzxdu4p3xz9pf36q2ew2ltawmqxrqzvm7zfxll",
    amount: 0.50128765,
    transactions: [
      {
        tx_amount: 0.50128765,
        transaction_id: "9e9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20858"
      }
    ],
    entity_name: "Merchant",
    token_type: "BTC",
    transaction_type: "Payment"
  },
  {
    beneficiary_address: "bc1qc5e18dv4zdz9mzfpv6nrjzj7wudf5swncqnx5w",
    amount: 1.00000000,
    transactions: [
      {
        tx_amount: 1.00000000,
        transaction_id: "ae9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20859"
      }
    ],
    entity_name: "Cold Storage",
    token_type: "BTC",
    transaction_type: "Storage Tx"
  }
];

export const sampleEdges = [
  {
    source: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Binance
    target: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", // Personal Wallet
    type: "outflow" as const,
    amount: 0.75436782,
    transaction_id: "7e9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20856"
  },
  {
    source: "bc1qr583w2swedy2qhz7u5xr0xw3u6frhflcc98ktl", // Mining Pool
    target: "bc1qyzxdu4p3xz9pf36q2ew2ltawmqxrqzvm7zfxll", // Merchant
    type: "outflow" as const,
    amount: 0.50128765,
    transaction_id: "9e9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20858"
  },
  {
    source: "bc1qr583w2swedy2qhz7u5xr0xw3u6frhflcc98ktl", // Mining Pool
    target: "bc1qc5e18dv4zdz9mzfpv6nrjzj7wudf5swncqnx5w", // Cold Storage
    type: "outflow" as const,
    amount: 1.00000000,
    transaction_id: "ae9885a3d700a6f1a5ffc954bd2a0c13e90e2742f75b2ec0d2fb3d4a0cb20859"
  }
];
