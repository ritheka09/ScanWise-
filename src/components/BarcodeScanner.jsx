import { useEffect, useRef } from 'react'
import Quagga from 'quagga'

const BarcodeScanner = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef(null)
  const isInitializedRef = useRef(false)
  const detectionRef = useRef(null)

  useEffect(() => {
    if (!isActive) {
      stopScanner()
      return
    }

    if (isActive && scannerRef.current && !isInitializedRef.current) {
      startScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isActive])

  const startScanner = () => {
    isInitializedRef.current = true
    
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
          "upc_reader",
          "upc_e_reader",
          "code_128_reader"
        ]
      },
      locate: true
    }, (err) => {
      if (err) {
        console.error('Scanner initialization failed:', err)
        isInitializedRef.current = false
        onScanError?.(err.message || 'Camera access denied')
        return
      }
      console.log('Scanner initialized')
      Quagga.start()
    })

    detectionRef.current = (result) => {
      if (!result || !result.codeResult) return
      
      const code = result.codeResult.code
      console.log('Barcode detected:', code)
      
      stopScanner()
      onScanSuccess?.({ code, format: result.codeResult.format })
    }

    Quagga.onDetected(detectionRef.current)
  }

  const stopScanner = () => {
    try {
      if (detectionRef.current) {
        Quagga.offDetected(detectionRef.current)
        detectionRef.current = null
      }
      if (isInitializedRef.current) {
        Quagga.stop()
        isInitializedRef.current = false
        console.log('Scanner stopped')
      }
    } catch (err) {
      console.error('Error stopping scanner:', err)
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