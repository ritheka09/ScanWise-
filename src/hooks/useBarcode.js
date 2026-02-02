import { useState } from 'react'

export const useBarcode = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [barcodeData, setBarcodeData] = useState(null)
  const [error, setError] = useState(null)

  const startScan = () => {
    setIsScanning(true)
    setBarcodeData(null)
    setError(null)
  }

  const stopScan = () => {
    setIsScanning(false)
  }

  const handleScanSuccess = (data) => {
    setBarcodeData(data)
    setIsScanning(false)
    setError(null)
  }

  const handleScanError = (errorMessage) => {
    setError(errorMessage)
    setIsScanning(false)
  }

  const reset = () => {
    setIsScanning(false)
    setBarcodeData(null)
    setError(null)
  }

  return {
    isScanning,
    barcodeData,
    error,
    startScan,
    stopScan,
    handleScanSuccess,
    handleScanError,
    reset
  }
}