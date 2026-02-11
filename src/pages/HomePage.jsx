import { useState, useEffect, useRef } from 'react'
import { foodFacts } from '../data/mockData'
import BarcodeScanner from '../components/BarcodeScanner'
import { useBarcode } from '../hooks/useBarcode'
import ProductApiService from '../services/productApiService'
import { scanHistoryService } from '../services/scanHistoryService'
import { useAuth } from '../contexts/AuthContext'

function HomePage({ onBarcodeAnalyze, onCompare }) {
  const { user } = useAuth()
  const [typedText, setTypedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
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

  // Listen for history product view events
  useEffect(() => {
    const handleViewProduct = (event) => {
      if (event.detail) {
        onBarcodeAnalyze(event.detail)
      }
    }
    window.addEventListener('viewHistoryProduct', handleViewProduct)
    return () => window.removeEventListener('viewHistoryProduct', handleViewProduct)
  }, [onBarcodeAnalyze])

  // Load user-specific scan history from Firestore
  useEffect(() => {
    if (user) {
      loadScanHistory()
    }
    
    // Listen for history updates
    const handleUpdate = () => loadScanHistory()
    window.addEventListener('scanHistoryUpdate', handleUpdate)
    return () => window.removeEventListener('scanHistoryUpdate', handleUpdate)
  }, [user])

  const loadScanHistory = async () => {
    if (!user) return
    setHistoryLoading(true)
    const history = await scanHistoryService.getUserScanHistory(user.uid, 3)
    setScanHistory(history)
    setHistoryLoading(false)
  }

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
      
      // Save to Firestore scan history
      if (user) {
        await scanHistoryService.saveScan(user.uid, {
          productName: productData.product.name,
          verdict: productData.verdict,
          flags: productData.flags || []
        })
        await loadScanHistory()
      }
      
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
    if (item.productData) {
      console.log('Viewing product from history:', item.productData)
      onBarcodeAnalyze(item.productData)
    } else {
      alert('Product details not available for older scans. Please scan again.')
    }
  }

  const handleSelectForComparison = (item) => {
    // Comparison requires full product data - not available in history
    alert('Please scan products again to compare them')
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

        {historyLoading && !isScanning && !showNotFound && (
          <div className="history-loading">
            <p>🔄 Loading history...</p>
          </div>
        )}

        {!historyLoading && scanHistory.length === 0 && !isScanning && !showNotFound && (
          <div className="history-empty">
            <p>💭 No scans yet. Start scanning to build your history.</p>
          </div>
        )}

        {!historyLoading && scanHistory.length > 0 && !isScanning && !showNotFound && (
          <div className="scan-history">
            <div className="history-header">
              <h4>Recent Scans</h4>
            </div>
            <div className="history-list">
              {scanHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="item-info" onClick={() => handleRescanProduct(item)}>
                    <span className="item-name">{item.productName}</span>
                    <span className="item-brand">{item.brand || 'Unknown Brand'}</span>
                    <div className="item-meta">
                      <span className={`item-verdict ${item.verdict?.toLowerCase()}`}>
                        {item.verdict === 'good' ? '✅' : item.verdict === 'avoid' ? '❌' : '⚠️'} {item.verdict || 'N/A'}
                      </span>
                      <span 
                        className="item-score"
                        style={{ color: getScoreColor(item.score || 0) }}
                      >
                        🎯 {item.score || 0}/100
                      </span>
                      <span className="item-time">
                        {item.scannedAt?.toDate ? item.scannedAt.toDate().toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
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

// Helper function for score color
function getScoreColor(score) {
  if (score >= 75) return 'green'
  if (score >= 50) return 'orange'
  return 'red'
}

export default HomePage