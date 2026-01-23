import { useState, useEffect, useRef } from 'react'
import { foodFacts } from '../data/mockData'

function HomePage({ onAnalyze }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [typedText, setTypedText] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Typing effect for fun facts
  useEffect(() => {
    const currentFact = foodFacts[0]
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

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setShowCamera(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      alert('Camera access denied or not available. Please use file upload instead.')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas) return
    
    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
      handleFileSelect(file)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  const handleAnalyze = () => {
    if (selectedFile) {
      onAnalyze(selectedFile)
    } else {
      alert('Please take a photo or upload an image first')
    }
  }

  return (
    <>
      <div className="hero">
        <h1 className="title">
          <span className="app-logo">🥑</span>
          ScanWise
        </h1>
        <p className="tagline">
          Scan ingredient labels instantly and discover what's really in your food
        </p>
      </div>

      <div className="upload-section">
        {showCamera ? (
          <div className="camera-section">
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="camera-controls">
              <button className="camera-btn capture" onClick={capturePhoto}>
                📷 Capture
              </button>
              <button className="camera-btn cancel" onClick={stopCamera}>
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {selectedFile ? (
              <div className="photo-preview">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Selected food label" 
                  className="preview-image"
                />
                <p className="file-name">{selectedFile.name}</p>
              </div>
            ) : (
              <div className="camera-placeholder" onClick={startCamera}>
                <div className="camera-icon">📷</div>
                <h3>Take Photo of Food Label</h3>
                <p>Capture ingredient labels to analyze nutrition facts</p>
              </div>
            )}
            
            <div className="action-buttons">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <button 
                className="camera-trigger-btn" 
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Upload Image
              </button>
            </div>
          </>
        )}

        <button className="analyze-btn" onClick={handleAnalyze}>
          🔍 Analyze Ingredients
        </button>
        
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