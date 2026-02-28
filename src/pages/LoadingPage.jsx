function LoadingPage({ message = 'Loading...', submessage = '' }) {
  return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
      {submessage && <p className="loading-submessage">{submessage}</p>}
    </div>
  )
}

export default LoadingPage