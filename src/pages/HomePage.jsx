import { useState, useEffect, useRef } from 'react'
import { foodFacts } from '../data/mockData'
import BarcodeScanner from '../components/BarcodeScanner'
import { useBarcode } from '../hooks/useBarcode'
import ProductApiService from '../services/productApiService'
import { EnhancementService } from '../services/enhancementService'

function HomePage({ onBarcodeAnalyze, onCompare }) {
  const [typedText, setTypedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [showNotFound, setShowNotFound] = useState(false)
  const [notFoundBarcode, setNotFoundBarcode] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [selectedForComparison, setSelectedForComparison] = useState([])
  const productApi = useRef(new ProductApiService())
  
  const {
    isScanning,
    barcodeData,
    error: barcodeError,
    startScan,
    stopScan,
    handleScanSuccess,
    handleScanError,
    reset: resetBarcode
  } = useBarcode()

  // Load scan history from localStorage
  useEffect(() => {
    setScanHistory(EnhancementService.getScanHistory())
  }, [])

  // Typing effect for fun facts
  useEffect(() => {
    const currentFact = foodFacts[Math.floor(Math.random() * foodFacts.length)]
    let index = 0
    setTypedText('')
    
    const typeInterval = setInterval(() => {
      if (index < currentFact.length) {
        setTypedText(currentFact.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
      }
    }, 50)
    
    return () => clearInterval(typeInterval)
  }, [])

  // Handle barcode scan success
  useEffect(() => {
    if (barcodeData) {
      handleBarcodeAnalysis(barcodeData.code)
    }
  }, [barcodeData])

  const handleBarcodeAnalysis = async (barcode) => {
    setIsProcessing(true)
    setShowNotFound(false)
    try {
      const productData = await productApi.current.fetchProductByBarcode(barcode)
      setScanHistory(EnhancementService.getScanHistory())
      onBarcodeAnalyze(productData)
    } catch (error) {
      console.error('Barcode analysis failed:', error)
      if (error.message === 'PRODUCT_NOT_FOUND') {
        setNotFoundBarcode(barcode)
        setShowNotFound(true)
      } else {
        alert(`Error: ${error.message}`)
      }
    } finally {
      setIsProcessing(false)
      resetBarcode()
    }
  }

  const handleManualBarcodeSubmit = () => {
    if (manualBarcode.trim()) {
      handleBarcodeAnalysis(manualBarcode.trim())
      setManualBarcode('')
    }
  }

  const handleRescanProduct = (item) => {
    onBarcodeAnalyze(item.data)
  }

  const handleSelectForComparison = (item) => {
    if (selectedForComparison.find(p => p.barcode === item.barcode)) {
      setSelectedForComparison(selectedForComparison.filter(p => p.barcode !== item.barcode))
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, item.data])
    }
  }

  const handleCompareSelected = () => {
    if (selectedForComparison.length === 2) {
      onCompare(selectedForComparison[0], selectedForComparison[1])
    }
  }

  const handleStartBarcodeScan = () => {
    resetBarcode()
    setShowNotFound(false)
    startScan()
  }

  return (
    <>
      <div className="hero">
        <h1 className="title">
          <span className="app-logo">🥑</span>
          ScanWise
        </h1>
        <p className="tagline">
          Scan product barcodes to discover what's really in your food
        </p>
      </div>

      <div className="barcode-section">
        {showNotFound ? (
          <div className="not-found-section">
            <div className="not-found-message">
              <h3>❌ Product Not Found</h3>
              <p>Barcode <strong>{notFoundBarcode}</strong> was not found in our database.</p>
            </div>
            <div className="not-found-options">
              <button className="option-btn" onClick={() => handleBarcodeAnalysis(notFoundBarcode)}>
                🔄 Try Again
              </button>
              <button className="option-btn" onClick={handleStartBarcodeScan}>
                📷 Scan Different Barcode
              </button>
            </div>
            <div className="manual-entry">
              <h4>Or enter barcode manually:</h4>
              <div className="manual-input">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Enter barcode number"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualBarcodeSubmit()}
                />
                <button onClick={handleManualBarcodeSubmit}>Search</button>
              </div>
            </div>
          </div>
        ) : isScanning ? (
          <div className="scanner-container">
            <BarcodeScanner 
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isActive={isScanning}
            />
            <button className="stop-scan-btn" onClick={stopScan}>
              ❌ Stop Scanning
            </button>
          </div>
        ) : (
          <div className="barcode-placeholder" onClick={handleStartBarcodeScan}>
            <div className="barcode-icon">📊</div>
            <h3>Scan Product Barcode</h3>
            <p>Point camera at barcode for instant product information</p>
            {barcodeError && (
              <div className="error-message">
                ⚠️ {barcodeError}
              </div>
            )}
          </div>
        )}
        
        {isProcessing && (
          <div className="processing-message">
            🔍 Fetching product information...
          </div>
        )}

        {scanHistory.length > 0 && !isScanning && !showNotFound && (
          <div className="scan-history">
            <div className="history-header">
              <h4>Scan History</h4>
              {selectedForComparison.length === 2 && (
                <button className="compare-btn" onClick={handleCompareSelected}>
                  ⚖️ Compare Selected
                </button>
              )}
            </div>
            <div className="history-list">
              {scanHistory.slice(0, 8).map((item) => (
                <div key={item.id} className="history-item">
                  <div className="item-info" onClick={() => handleRescanProduct(item)}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-brand">{item.brand}</span>
                    <div className="item-meta">
                      <span className="item-rating">⭐ {item.rating.toFixed(1)}</span>
                      <span className="item-time">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    className={`compare-select ${selectedForComparison.find(p => p.barcode === item.barcode) ? 'selected' : ''}`}
                    onClick={() => handleSelectForComparison(item)}
                    disabled={selectedForComparison.length >= 2 && !selectedForComparison.find(p => p.barcode === item.barcode)}
                  >
                    {selectedForComparison.find(p => p.barcode === item.barcode) ? '✓' : '+'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="fun-fact">
          <span className="fun-fact-label">Fun Fact: </span>
          <span className="fun-fact-text">{typedText}</span>
          <span className="cursor">|</span>
        </div>
      </div>
    </>
  )
}

export default HomePage