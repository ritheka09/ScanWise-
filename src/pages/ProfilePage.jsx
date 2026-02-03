import { useState, useEffect } from 'react'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useAuth } from '../contexts/AuthContext'
import { scanHistoryService } from '../services/scanHistoryService'
import { generateHealthInsights, getVerdictColor, formatScanDate } from '../utils/insightsEngine'

const QUESTION_LABELS = {
  allergies: 'Food Allergies',
  dietaryPreference: 'Dietary Preference',
  sugarSensitivity: 'Sugar Sensitivity',
  saltSensitivity: 'Salt Sensitivity',
  cholesterolConcerns: 'Cholesterol Concerns',
  diabetesRisk: 'Diabetes Risk',
  bloodPressure: 'Blood Pressure',
  gutSensitivity: 'Gut Sensitivity',
  weightGoals: 'Weight Goals',
  activityLevel: 'Activity Level'
}

const ANSWER_LABELS = {
  // Allergies
  'none': 'No allergies',
  'nuts': 'Nuts/Tree nuts',
  'gluten': 'Gluten/Wheat',
  'dairy': 'Dairy/Lactose',
  'soy': 'Soy',
  'eggs': 'Eggs',
  'shellfish': 'Shellfish',
  
  // Diet preferences
  'omnivore': 'Omnivore',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'keto': 'Keto/Low-carb',
  'paleo': 'Paleo',
  'mediterranean': 'Mediterranean',
  
  // Sensitivity levels
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  
  // Weight goals
  'lose': 'Weight loss',
  'gain': 'Weight gain',
  'maintain': 'Maintain weight',
  'muscle': 'Build muscle',
  
  // Activity levels
  'sedentary': 'Sedentary',
  'light': 'Light activity',
  'moderate': 'Moderate activity',
  'athlete': 'Athlete level'
}

const HEALTH_PROFILE_LABELS = {
  sugarRisk: 'Sugar Risk Level',
  saltRisk: 'Salt Risk Level',
  allergyFlags: 'Allergy Flags',
  dietType: 'Diet Type',
  lifestyle: 'Lifestyle',
  diabetesRisk: 'Diabetes Risk',
  bpRisk: 'Blood Pressure Risk',
  cholesterolRisk: 'Cholesterol Risk',
  gutSensitivity: 'Gut Sensitivity',
  weightGoal: 'Weight Goal'
}

function ProfilePage({ onBack, onRetakeQuiz, onLogout }) {
  const { user } = useAuth()
  const { userProfile, resetQuiz } = useUserProfile()
  const [isRetaking, setIsRetaking] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [insights, setInsights] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Load scan history and generate insights
  useEffect(() => {
    if (user && userProfile?.quizCompleted) {
      loadScanHistory()
    }
  }, [user, userProfile])

  const loadScanHistory = async () => {
    try {
      setLoadingHistory(true)
      const history = await scanHistoryService.getUserScanHistory(user.uid, 10)
      setScanHistory(history)
      const healthInsights = generateHealthInsights(history)
      setInsights(healthInsights)
    } catch (error) {
      console.error('Error loading scan history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleRetakeQuiz = async () => {
    try {
      setIsRetaking(true)
      console.log('🔄 Initiating quiz retake')
      await resetQuiz()
      onRetakeQuiz()
    } catch (error) {
      console.error('❌ Error retaking quiz:', error)
    } finally {
      setIsRetaking(false)
    }
  }

  if (!userProfile) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1>Profile</h1>
        </div>
        <div className="profile-content">
          <div className="loading-message">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1 className="profile-title">
          <span className="app-logo">👤</span>
          Your Health Profile
        </h1>
      </div>

      <div className="profile-content">
        {/* Health Insights Dashboard */}
        {userProfile.quizCompleted && (
          <div className="profile-card">
            <h2>🌟 Health Insights</h2>
            {loadingHistory ? (
              <div className="loading-message">Loading your insights...</div>
            ) : insights ? (
              <div className="insights-content">
                <div className="summary-message">
                  <p>{insights.summaryMessage}</p>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{insights.totalScans}</span>
                    <span className="stat-label">Products Scanned</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: getVerdictColor('good') }}>
                      {insights.verdictStats.good}
                    </span>
                    <span className="stat-label">Good Choices</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: getVerdictColor('moderate') }}>
                      {insights.verdictStats.moderate}
                    </span>
                    <span className="stat-label">Moderate</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: getVerdictColor('avoid') }}>
                      {insights.verdictStats.avoid}
                    </span>
                    <span className="stat-label">To Avoid</span>
                  </div>
                </div>
                
                {insights.topConcern && (
                  <div className="top-concern">
                    <h4>💡 Focus Area</h4>
                    <p>Your most common concern is <strong>{insights.topConcern.label}</strong> 
                    (found in {insights.topConcern.count} products)</p>
                  </div>
                )}
                
                {scanHistory.length > 0 && (
                  <div className="recent-scans">
                    <h4>Recent Scans</h4>
                    <div className="scans-list">
                      {scanHistory.slice(0, 5).map((scan, index) => (
                        <div key={scan.id || index} className="scan-item">
                          <div className="scan-info">
                            <span className="scan-name">{scan.productName}</span>
                            <span className="scan-date">{formatScanDate(scan.scannedAt)}</span>
                          </div>
                          <div 
                            className="scan-verdict"
                            style={{ color: getVerdictColor(scan.verdict) }}
                          >
                            {scan.verdict === 'good' ? '✅' : scan.verdict === 'moderate' ? '⚠️' : '❌'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-insights">
                <p>Start scanning products to see your health insights!</p>
              </div>
            )}
          </div>
        )}

        {/* Account Information */}
        <div className="profile-card">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Quiz Status:</span>
              <span className={`quiz-status ${userProfile.quizCompleted ? 'completed' : 'pending'}`}>
                {userProfile.quizCompleted ? '✅ Completed' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Health Profile Summary */}
        {userProfile.quizCompleted && userProfile.healthProfile && (
          <div className="profile-card">
            <details className="collapsible-section">
              <summary className="section-summary">
                <h2>🧬 Health Profile</h2>
                <span className="expand-icon">▼</span>
              </summary>
              <div className="collapsible-content">
                <div className="health-profile-grid">
                  {Object.entries(userProfile.healthProfile).map(([key, value]) => (
                    <div key={key} className="health-item">
                      <span className="health-label">
                        {HEALTH_PROFILE_LABELS[key] || key}
                      </span>
                      <span className={`health-value ${key.includes('Risk') ? `risk-${value}` : ''}`}>
                        {Array.isArray(value) ? value.join(', ') : (ANSWER_LABELS[value] || value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Quiz Answers */}
        {userProfile.quizCompleted && userProfile.quizAnswers && (
          <div className="profile-card">
            <details className="collapsible-section">
              <summary className="section-summary">
                <h2>📋 Quiz Answers</h2>
                <span className="expand-icon">▼</span>
              </summary>
              <div className="collapsible-content">
                <div className="answers-grid">
                  {Object.entries(userProfile.quizAnswers).map(([questionId, answer]) => (
                    <div key={questionId} className="answer-item">
                      <span className="answer-label">
                        {QUESTION_LABELS[questionId] || questionId}
                      </span>
                      <span className="answer-value">
                        {ANSWER_LABELS[answer] || answer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="profile-actions">
          <button 
            className="retake-quiz-btn"
            onClick={handleRetakeQuiz}
            disabled={isRetaking}
          >
            {isRetaking ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              '🔄 Retake Health Quiz'
            )}
          </button>
          
          <button 
            className="logout-btn"
            onClick={onLogout}
          >
            🚪 Logout
          </button>
        </div>

        {/* Info */}
        <div className="profile-info">
          <p className="info-text">
            Your health profile helps us provide personalized food analysis and recommendations. 
            You can retake the quiz anytime to update your health information.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage