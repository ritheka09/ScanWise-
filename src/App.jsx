import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [userName] = useState('User')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setShowCamera(false)
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
      alert('Camera access denied or not available')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
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
      alert('Analysis feature coming soon!')
    } else {
      alert('Please take a photo first')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="nav">
          <h2 className="logo">🍎 ScanWise</h2>
          <div className="nav-right">
            <button 
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
            >
              {isDarkMode ? '🌞' : '🌚'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h1 className="title">ScanWise</h1>
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
                    alt="Captured food label" 
                    className="preview-image"
                  />
                  <p className="file-name">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="camera-placeholder" onClick={startCamera}>
                  <div className="camera-icon">📷</div>
                  <h3>Take Photo of Food Label</h3>
                  <p>Capture ingredient labels to analyze nutrition facts</p>
                  <button className="camera-trigger-btn hidden" onClick={startCamera}>
                    📷 Take Photo
                  </button>
                </div>
              )}
            </>
          )}

          <button 
            className="analyze-btn"
            onClick={handleAnalyze}
          >
            🔍 Analyze Ingredients
          </button>
        </div>

        <footer className="footer">
          <div className="footer-nav">
            <button className="nav-item">
              <div className="nav-icon history-icon"></div>
              <span className="nav-label">History</span>
            </button>
            <button className="nav-item">
              <div className="nav-icon heart-icon"></div>
              <span className="nav-label">Favorites</span>
            </button>
            <button className="nav-item">
              <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
              <span className="nav-label">Profile</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App