import { useEffect, useRef } from 'react'
import Quagga from 'quagga'

const BarcodeScanner = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef(null)

  useEffect(() => {
    if (isActive && scannerRef.current) {
      startScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isActive])

  const startScanner = () => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment"
        }
      },
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader", 
          "code_128_reader",
          "code_39_reader"
        ]
      },
      locate: true
    }, (err) => {
      if (err) {
        console.error('Scanner initialization failed:', err)
        onScanError?.(err.message || 'Camera access failed')
        return
      }
      Quagga.start()
    })

    Quagga.onDetected((result) => {
      const code = result.codeResult.code
      const format = result.codeResult.format
      
      console.log('Barcode detected:', code, format)
      
      stopScanner()
      onScanSuccess?.({ code, format })
    })
  }

  const stopScanner = () => {
    if (Quagga.CameraAccess.getActiveStreamLabel()) {
      Quagga.stop()
    }
  }

  return (
    <div className="barcode-scanner">
      <div 
        ref={scannerRef} 
        className="scanner-viewport"
      />
      <div className="scanner-overlay">
        <div className="scan-line"></div>
        <p>Position barcode within the frame</p>
      </div>
    </div>
  )
}

export default BarcodeScanner