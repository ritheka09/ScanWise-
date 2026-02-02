import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import LoadingPage from './pages/LoadingPage'
import ResultsPage from './pages/ResultsPage'
import ComparisonPage from './pages/ComparisonPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { PAGES } from './data/constants'
import { useTheme } from './hooks/useTheme'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState(PAGES.HOME)
  const [analysisData, setAnalysisData] = useState(null)
  const [comparisonData, setComparisonData] = useState({ product1: null, product2: null })
  const [authPage, setAuthPage] = useState(PAGES.LOGIN)

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    return (
      <div className="app">
        <button 
          className="floating-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDarkMode ? '🌞' : '🌚'}
        </button>
        <main className="main">
          {authPage === PAGES.LOGIN ? (
            <LoginPage onSwitchToSignup={() => setAuthPage(PAGES.SIGNUP)} />
          ) : (
            <SignupPage onSwitchToLogin={() => setAuthPage(PAGES.LOGIN)} />
          )}
        </main>
      </div>
    )
  }

  const navigateToBarcodeResults = (productData) => {
    setCurrentPage(PAGES.LOADING)
    
    // Brief loading for UX consistency
    setTimeout(() => {
      setAnalysisData(productData)
      setCurrentPage(PAGES.RESULTS)
    }, 800)
  }

  const navigateToHome = () => {
    setCurrentPage(PAGES.HOME)
    setAnalysisData(null)
    setComparisonData({ product1: null, product2: null })
  }

  const navigateToComparison = (product1, product2) => {
    setComparisonData({ product1, product2 })
    setCurrentPage(PAGES.COMPARISON)
  }

  const renderPage = () => {
    switch (currentPage) {
      case PAGES.HOME:
        return <HomePage onBarcodeAnalyze={navigateToBarcodeResults} onCompare={navigateToComparison} />
      case PAGES.LOADING:
        return <LoadingPage />
      case PAGES.RESULTS:
        return <ResultsPage data={analysisData} onBack={navigateToHome} onCompare={navigateToComparison} />
      case PAGES.COMPARISON:
        return <ComparisonPage 
          product1={comparisonData.product1} 
          product2={comparisonData.product2} 
          onBack={navigateToHome} 
        />
      default:
        return <HomePage onBarcodeAnalyze={navigateToBarcodeResults} onCompare={navigateToComparison} />
    }
  }

  return (
    <div className="app">
      <button 
        className="floating-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDarkMode ? '🌞' : '🌚'}
      </button>

      <button 
        className="floating-logout-btn"
        onClick={logout}
        aria-label="Logout"
      >
        🚪
      </button>

      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App