function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p className="loading-message">Reading text from image...</p>
      <p className="loading-submessage">This may take 10-30 seconds</p>
    </div>
  )
}

export default LoadingPage