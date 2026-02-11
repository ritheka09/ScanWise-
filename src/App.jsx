import { useState, useEffect } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import LoadingPage from './pages/LoadingPage'
import ResultsPage from './pages/ResultsPage'
import ComparisonPage from './pages/ComparisonPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import QuizPage from './pages/QuizPage'
import ProfilePage from './pages/ProfilePage'
import { PAGES } from './data/constants'
import { useTheme } from './hooks/useTheme'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UserProfileProvider, useUserProfile } from './contexts/UserProfileContext'

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout, loading: authLoading } = useAuth()
  const { userProfile, profileLoading, profileError } = useUserProfile()
  const [currentPage, setCurrentPage] = useState(PAGES.HOME)
  const [analysisData, setAnalysisData] = useState(null)
  const [comparisonData, setComparisonData] = useState({ product1: null, product2: null })
  const [authPage, setAuthPage] = useState(PAGES.LOGIN)

  // Quiz Gate Enforcement: Redirect to quiz if not completed (unless on quiz page)
  useEffect(() => {
    if (
      userProfile && 
      !userProfile.quizCompleted && 
      currentPage !== PAGES.QUIZ
    ) {
      console.log('📋 Quiz not completed, redirecting to quiz page')
      setCurrentPage(PAGES.QUIZ)
    }
  }, [userProfile, currentPage])

  // Prevent access to quiz page if already completed
  useEffect(() => {
    if (userProfile && userProfile.quizCompleted && currentPage === PAGES.QUIZ) {
      console.log('✅ Quiz already completed, redirecting to home')
      setCurrentPage(PAGES.HOME)
    }
  }, [userProfile, currentPage])

  // Debug logging
  console.log('🔍 App State:', {
    user: !!user,
    userProfile: !!userProfile,
    authLoading,
    profileLoading,
    profileError,
    currentPage
  })

  // Show loading while auth is loading OR (user exists AND profile is loading)
  const isLoading = authLoading || (user && profileLoading)
  
  if (isLoading) {
    console.log('⏳ Showing loading page - Auth:', authLoading, 'Profile:', profileLoading)
    return <LoadingPage />
  }

  // Show error if profile failed to load
  if (user && profileError) {
    console.log('❌ Profile error:', profileError)
    return (
      <div className="app">
        <main className="main">
          <div className="error-page">
            <h2>Profile Error</h2>
            <p>Failed to load user profile: {profileError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </main>
      </div>
    )
  }

  // Show auth pages if not logged in
  if (!user) {
    console.log('🔐 User not logged in, showing auth page')
    return (
      <div className="app">
        <button 
          className="floating-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDarkMode ? '☀' : '☾'}
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

  console.log('🏠 Showing main app with current page:', currentPage)

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
    // Trigger history reload by changing a dependency
    window.dispatchEvent(new Event('scanHistoryUpdate'))
  }

  const navigateToComparison = (product1, product2) => {
    setComparisonData({ product1, product2 })
    setCurrentPage(PAGES.COMPARISON)
  }

  const navigateToProfile = () => {
    setCurrentPage(PAGES.PROFILE)
  }

  const navigateToQuiz = () => {
    setCurrentPage(PAGES.QUIZ)
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
      case PAGES.QUIZ:
        return <QuizPage />
      case PAGES.PROFILE:
        return <ProfilePage onBack={navigateToHome} onRetakeQuiz={navigateToQuiz} onLogout={logout} />
      default:
        return <HomePage onBarcodeAnalyze={navigateToBarcodeResults} onCompare={navigateToComparison} />
    }
  }

  return (
    <div className="app">
      <div className="floating-theme-toggle" onClick={toggleTheme}>
        <button className="icon-btn" aria-label="Toggle theme">
          {isDarkMode ? '☀' : '☾'}
        </button>
        <span className="floating-label">Theme</span>
      </div>

      <div 
        className="floating-profile-btn"
        onClick={navigateToProfile}
        style={{ display: currentPage === PAGES.PROFILE || currentPage === PAGES.RESULTS ? 'none' : 'flex' }}
      >
        <button className="icon-btn" aria-label="Profile">
          👤
        </button>
        <span className="floating-label">Profile</span>
      </div>

      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <AppContent />
      </UserProfileProvider>
    </AuthProvider>
  )
}

export default App