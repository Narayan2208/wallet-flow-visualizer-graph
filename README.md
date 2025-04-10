
# Wallet Flow Visualizer

## Project Description

Wallet Flow Visualizer is an interactive graph visualization tool that allows users to explore connections between wallet addresses. The application provides a comprehensive view of cryptocurrency transactions, displaying inflow and outflow connections between different wallet addresses.

## Key Features

- Interactive graph visualization of wallet addresses
- Automatic linking of wallet addresses 
- Infinite zoom and smooth panning
- Dark and light mode toggle
- Export graph as SVG
- Detailed transaction information display

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm (v9 or later)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/wallet-flow-visualizer.git
cd wallet-flow-visualizer
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Building for Production

To create a production build:
```bash
npm run build
```

## Usage Guide

### Adding Wallet Addresses

1. Use the left sidebar to input a wallet address
2. The graph will automatically update with connections
3. Nodes represent wallet addresses
4. Edges show transaction relationships

### Navigating the Graph

- Zoom: Use mouse scroll or zoom controls
- Pan: Click and drag the graph
- Reset View: Use the reset button in the toolbar

### Additional Features

- Toggle between dark and light modes
- Export the current graph view as an SVG
- View detailed transaction information in the right sidebar

## Technologies Used

- React
- Redux
- Tailwind CSS
- shadcn/ui
- Recharts
- React Query

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the MIT License.
