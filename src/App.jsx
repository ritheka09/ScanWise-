import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import LoadingPage from './pages/LoadingPage'
import ResultsPage from './pages/ResultsPage'
import { PAGES } from './data/constants'
import { useTheme } from './hooks/useTheme'
import { useOCR } from './hooks/useOCR'

function App() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { processImage, isProcessing, error } = useOCR()
  const [currentPage, setCurrentPage] = useState(PAGES.HOME)
  const [analysisData, setAnalysisData] = useState(null)

  const navigateToResults = async (file) => {
    setCurrentPage(PAGES.LOADING)
    
    try {
      const result = await processImage(file)
      setAnalysisData(result)
      setCurrentPage(PAGES.RESULTS)
    } catch (err) {
      console.error('Analysis failed:', err)
      setCurrentPage(PAGES.HOME)
    }
  }

  const navigateToHome = () => {
    setCurrentPage(PAGES.HOME)
    setAnalysisData(null)
  }

  const renderPage = () => {
    switch (currentPage) {
      case PAGES.HOME:
        return <HomePage onAnalyze={navigateToResults} />
      case PAGES.LOADING:
        return <LoadingPage />
      case PAGES.RESULTS:
        return <ResultsPage data={analysisData} onBack={navigateToHome} />
      default:
        return <HomePage onAnalyze={navigateToResults} />
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

      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}

export default App