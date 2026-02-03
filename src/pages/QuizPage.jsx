import { useState } from 'react'
import { useUserProfile } from '../contexts/UserProfileContext'
import { PAGES } from '../data/constants'

const QUIZ_QUESTIONS = [
  {
    id: 'allergies',
    question: 'Do you have any food allergies or intolerances?',
    options: [
      { value: 'none', label: 'No allergies' },
      { value: 'nuts', label: 'Nuts/Tree nuts' },
      { value: 'gluten', label: 'Gluten/Wheat' },
      { value: 'dairy', label: 'Dairy/Lactose' },
      { value: 'soy', label: 'Soy' },
      { value: 'eggs', label: 'Eggs' },
      { value: 'shellfish', label: 'Shellfish' }
    ]
  },
  {
    id: 'dietaryPreference',
    question: 'What best describes your dietary preference?',
    options: [
      { value: 'omnivore', label: 'Omnivore (eat everything)' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'keto', label: 'Keto/Low-carb' },
      { value: 'paleo', label: 'Paleo' },
      { value: 'mediterranean', label: 'Mediterranean' }
    ]
  },
  {
    id: 'sugarSensitivity',
    question: 'How sensitive are you to sugar intake?',
    options: [
      { value: 'low', label: 'Not sensitive - I can handle high sugar' },
      { value: 'medium', label: 'Moderately sensitive - I watch my intake' },
      { value: 'high', label: 'Very sensitive - I avoid sugar when possible' }
    ]
  },
  {
    id: 'saltSensitivity',
    question: 'How sensitive are you to salt/sodium?',
    options: [
      { value: 'low', label: 'Not sensitive - I enjoy salty foods' },
      { value: 'medium', label: 'Moderately sensitive - I watch sodium' },
      { value: 'high', label: 'Very sensitive - I follow low-sodium diet' }
    ]
  },
  {
    id: 'cholesterolConcerns',
    question: 'Do you have cholesterol concerns?',
    options: [
      { value: 'low', label: 'No concerns - normal cholesterol' },
      { value: 'medium', label: 'Slightly elevated - monitoring' },
      { value: 'high', label: 'High cholesterol - managing actively' }
    ]
  },
  {
    id: 'diabetesRisk',
    question: 'What is your diabetes risk or status?',
    options: [
      { value: 'low', label: 'Low risk - no family history' },
      { value: 'medium', label: 'Moderate risk - family history or prediabetes' },
      { value: 'high', label: 'High risk or diagnosed diabetes' }
    ]
  },
  {
    id: 'bloodPressure',
    question: 'What is your blood pressure status?',
    options: [
      { value: 'low', label: 'Normal blood pressure' },
      { value: 'medium', label: 'Slightly elevated - monitoring' },
      { value: 'high', label: 'High blood pressure - managing' }
    ]
  },
  {
    id: 'gutSensitivity',
    question: 'How sensitive is your digestive system?',
    options: [
      { value: 'low', label: 'Not sensitive - I can eat most foods' },
      { value: 'medium', label: 'Moderately sensitive - some foods bother me' },
      { value: 'high', label: 'Very sensitive - I have digestive issues' }
    ]
  },
  {
    id: 'weightGoals',
    question: 'What are your weight management goals?',
    options: [
      { value: 'lose', label: 'Weight loss' },
      { value: 'gain', label: 'Weight gain' },
      { value: 'maintain', label: 'Maintain current weight' },
      { value: 'muscle', label: 'Build muscle/body composition' }
    ]
  },
  {
    id: 'activityLevel',
    question: 'What is your typical activity level?',
    options: [
      { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
      { value: 'light', label: 'Light activity (1-3 days/week)' },
      { value: 'moderate', label: 'Moderate activity (3-5 days/week)' },
      { value: 'high', label: 'High activity (6-7 days/week)' },
      { value: 'athlete', label: 'Athlete/Very high activity' }
    ]
  }
]

function QuizPage({ onQuizComplete }) {
  const { saveQuizAnswers } = useUserProfile()
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    setError(null)
  }

  const handleNext = () => {
    const currentQuestionId = QUIZ_QUESTIONS[currentQuestion].id
    if (!answers[currentQuestionId]) {
      setError('Please select an answer before continuing.')
      return
    }
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    // Validate all questions answered
    const unanswered = QUIZ_QUESTIONS.find(q => !answers[q.id])
    if (unanswered) {
      setError('Please answer all questions before submitting.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      console.log('📋 Submitting quiz answers:', answers)
      await saveQuizAnswers(answers)
      console.log('✅ Quiz submitted successfully')
      
      // Navigate to home page after successful submission
      if (onQuizComplete) {
        onQuizComplete()
      }
    } catch (err) {
      console.error('❌ Quiz submission failed:', err)
      setError('Failed to save quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const question = QUIZ_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100
  const isLastQuestion = currentQuestion === QUIZ_QUESTIONS.length - 1
  const currentAnswer = answers[question.id]
  const allAnswered = QUIZ_QUESTIONS.every(q => answers[q.id])

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1 className="quiz-title">
          <span className="app-logo">🥑</span>
          Health Profile Quiz
        </h1>
        <p className="quiz-subtitle">
          Help us personalize your food analysis experience
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </p>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <h2 className="question-title">{question.question}</h2>
          
          <div className="options-list">
            {question.options.map((option) => (
              <label 
                key={option.value} 
                className={`option-item ${currentAnswer === option.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
                <span className="option-label">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="quiz-navigation">
          <button 
            className="nav-btn secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {isLastQuestion ? (
            <button 
              className="nav-btn primary submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !allAnswered}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : (
                '✅ Complete Quiz'
              )}
            </button>
          ) : (
            <button 
              className="nav-btn primary"
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPage