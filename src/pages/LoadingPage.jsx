function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p className="loading-message">Analyzing Product...</p>
      <p className="loading-submessage">Fetching nutrition data from OpenFoodFacts</p>
    </div>
  )
}

export default LoadingPage