import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { userService } from '../services/userService'

const UserProfileContext = createContext()

export const useUserProfile = () => {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider')
  }
  return context
}

export const UserProfileProvider = ({ children }) => {
  const { user } = useAuth() // Firebase auth user
  const [userProfile, setUserProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  // Load or create user profile when user changes
  useEffect(() => {
    if (user) {
      // User is authenticated - load or create profile
      loadUserProfile()
    } else {
      // User is not authenticated - reset profile state
      console.log('🔐 User logged out, clearing profile')
      setUserProfile(null)
      setProfileLoading(false)
      setProfileError(null)
    }
  }, [user])

  /**
   * Load existing profile or create new one for authenticated user
   */
  const loadUserProfile = async () => {
    try {
      console.log('🚀 Loading user profile for authenticated user:', user.email)
      setProfileLoading(true)
      setProfileError(null)
      
      // Get existing profile or create new one
      const profile = await userService.getOrCreateUserProfile(user)
      
      setUserProfile(profile)
      console.log('💾 Profile loaded into context:', profile)
      
    } catch (error) {
      console.error('❌ Failed to load user profile:', error)
      setProfileError(error.message)
      setUserProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  /**
   * Submit quiz answers and update profile
   * @param {Object} quizAnswers - Raw quiz answers
   */
  const saveQuizAnswers = async (quizAnswers) => {
    try {
      console.log('📝 Saving quiz answers:', quizAnswers)
      
      // Submit quiz to Firestore
      const updatedProfile = await userService.submitUserQuiz(user.uid, quizAnswers)
      
      // Update context with new profile data
      setUserProfile(prev => ({
        ...prev,
        ...updatedProfile
      }))
      
      console.log('✅ Quiz saved and context updated')
    } catch (error) {
      console.error('❌ Failed to save quiz:', error)
      throw error
    }
  }

  const value = {
    userProfile,
    profileLoading,
    profileError,
    refreshProfile: loadUserProfile,
    saveQuizAnswers
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}