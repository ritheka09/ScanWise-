# 🥑 ScanWise - Smart Food Analyzer

A personalized React web application that analyzes food products by scanning barcodes and provides tailored health recommendations based on your dietary profile.

## Features

- 📊 **Barcode Scanning**: Real-time EAN/UPC barcode detection using device camera
- 👤 **User Authentication**: Secure Firebase authentication with email/password
- 🎯 **Health Profile Quiz**: Personalized dietary assessment for tailored recommendations
- 🌐 **Real Product Data**: Fetches authentic product information from OpenFoodFacts API
- 💡 **Smart Recommendations**: AI-powered product suitability analysis based on your health profile
- 📱 **Mobile Responsive**: Optimized for mobile devices with camera access
- 🎨 **Dark/Light Theme**: Toggle between themes with floating controls
- 📚 **Scan History**: Cloud-based history tracking with Firebase Firestore
- ⚡ **Fast & Reliable**: Real-time analysis with instant results

## Tech Stack

- **Frontend**: React 19 + Vite
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Barcode Scanner**: QuaggaJS
- **API**: OpenFoodFacts REST API
- **Styling**: Pure CSS with CSS Variables
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 18+
- Modern browser with camera support
- Firebase account (for authentication and database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/ritheka09/ScanWise-.git
cd food-label-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your Firebase config to `src/config/firebase.js`

4. Start development server
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Build for Production
```bash
npm run build
```

## Usage

1. **Sign Up/Login**: Create an account or login
2. **Complete Health Quiz**: Answer questions about your dietary preferences and health concerns
3. **Scan Barcode**: Point your camera at a product barcode
4. **Get Personalized Results**: View product analysis tailored to your health profile
5. **View History**: Access your scan history from the profile page

## Project Structure

```
src/
├── components/
│   └── BarcodeScanner.jsx          # QuaggaJS barcode scanner
├── contexts/
│   ├── AuthContext.jsx             # Firebase authentication context
│   └── UserProfileContext.jsx      # User profile management
├── hooks/
│   ├── useBarcode.js               # Barcode scanning logic
│   └── useTheme.js                 # Theme management
├── pages/
│   ├── HomePage.jsx                # Main scanning interface
│   ├── LoginPage.jsx               # User login
│   ├── SignupPage.jsx              # User registration
│   ├── QuizPage.jsx                # Health profile quiz
│   ├── ProfilePage.jsx             # User profile and settings
│   ├── LoadingPage.jsx             # Loading states
│   └── ResultsPage.jsx             # Personalized analysis results
├── services/
│   ├── productApiService.js        # OpenFoodFacts API integration
│   └── scanHistoryService.js       # Firestore scan history
├── utils/
│   ├── productSuitability.js       # Product evaluation engine
│   ├── recommendationsEngine.js    # Smart recommendations
│   └── healthProfileGenerator.js   # Quiz to profile conversion
└── config/
    └── firebase.js                 # Firebase configuration
```

## Key Features Explained

### Personalized Analysis
- Evaluates products based on your sugar sensitivity, salt intake, allergies, and diet type
- Provides verdict: Good, Moderate, or Avoid
- Generates specific reasons why a product suits or doesn't suit you

### Smart Recommendations
- Suggests better alternatives when a product isn't suitable
- Considers your health profile for tailored suggestions

### Scan History
- Stores all your scans in the cloud
- Track your dietary choices over time
- Quick access to previously scanned products

## API Integration

Uses OpenFoodFacts API for real product data:
- **Endpoint**: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- **Coverage**: Global product database with 2M+ products
- **No API Key Required**: Free and open API

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera support

## Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add Firebase environment variables
5. Deploy!

### Other Options
- Vercel
- GitHub Pages
- AWS Amplify

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Developed by [Ritheka](https://github.com/ritheka09)