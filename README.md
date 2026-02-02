# 🥑 ScanWise - Barcode Food Analyzer

A React web application that analyzes food products by scanning barcodes and fetching real nutrition data from OpenFoodFacts API.

## Features

- 📊 **Barcode Scanning**: Real-time EAN/UPC barcode detection using device camera
- 🌐 **Real Product Data**: Fetches authentic product information from OpenFoodFacts
- 📱 **Mobile Responsive**: Optimized for mobile devices with camera access
- 🎨 **Dark/Light Theme**: Toggle between themes with floating controls
- 💾 **Recent Scans**: Local caching of recently scanned products
- ⚡ **Fast & Reliable**: No backend required, fully client-side operation

## Tech Stack

- **Frontend**: React 19 + Vite
- **Barcode Scanner**: QuaggaJS
- **API**: OpenFoodFacts REST API
- **Styling**: Pure CSS with CSS Variables
- **Storage**: localStorage for recent scans

## Getting Started

### Prerequisites
- Node.js 18+
- Modern browser with camera support

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd food-label-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Build for Production
```bash
npm run build
```

## Usage

1. **Scan Barcode**: Point your camera at a product barcode
2. **Auto Detection**: App automatically detects and processes the barcode
3. **View Results**: Get comprehensive nutrition analysis and health insights
4. **Recent Scans**: Access previously scanned products from the home screen

## Project Structure

```
src/
├── components/
│   └── BarcodeScanner.jsx     # QuaggaJS barcode scanner
├── hooks/
│   ├── useBarcode.js          # Barcode scanning logic
│   └── useTheme.js            # Theme management
├── pages/
│   ├── HomePage.jsx           # Main scanning interface
│   ├── LoadingPage.jsx        # Loading states
│   └── ResultsPage.jsx        # Analysis results
├── services/
│   └── productApiService.js   # OpenFoodFacts API integration
└── data/
    ├── constants.js           # App constants
    └── mockData.js            # Fun facts and fallback data
```

## API Integration

Uses OpenFoodFacts API for real product data:
- **Endpoint**: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- **Coverage**: Global product database
- **No API Key Required**: Free and open API

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera support

## Deployment

Can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## License

MIT License