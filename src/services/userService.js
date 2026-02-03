import { db } from '../config/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { generateHealthProfile } from '../utils/healthProfileGenerator'

export const userService = {
  /**
   * Get existing user profile from Firestore
   * @param {string} uid - User's Firebase UID
   * @returns {Object|null} User profile or null if doesn't exist
   */
  async getUserProfile(uid) {
    try {
      console.log('📄 Fetching user profile for:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      
      if (userDoc.exists()) {
        console.log('✅ User profile found')
        return userDoc.data()
      } else {
        console.log('❌ User profile not found')
        return null
      }
    } catch (error) {
      console.error('💥 Error fetching user profile:', error)
      throw error
    }
  },

  /**
   * Create new user profile document in Firestore
   * @param {Object} user - Firebase user object
   * @returns {Object} Created user profile
   */
  async createUserProfile(user) {
    try {
      console.log('🆕 Creating new user profile for:', user.email)
      
      const userProfile = {
        uid: user.uid,
        email: user.email,
        quizCompleted: false,
        quizAnswers: null,
        healthProfile: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)
      console.log('✅ User profile created successfully')
      
      return userProfile
    } catch (error) {
      console.error('💥 Error creating user profile:', error)
      throw error
    }
  },

  /**
   * Get existing profile or create new one if doesn't exist
   * @param {Object} user - Firebase user object
   * @returns {Object} User profile (existing or newly created)
   */
  async getOrCreateUserProfile(user) {
    try {
      console.log('🔄 Getting or creating profile for:', user.email)
      
      // First, try to get existing profile
      let profile = await this.getUserProfile(user.uid)
      
      // If profile doesn't exist, create it
      if (!profile) {
        console.log('🔨 Profile not found, creating new one...')
        profile = await this.createUserProfile(user)
      }
      
      console.log('📋 Final profile loaded:', profile)
      return profile
    } catch (error) {
      console.error('💥 Error in getOrCreateUserProfile:', error)
      throw error
    }
  },

  /**
   * Submit quiz answers and update user profile
   * @param {string} uid - User's Firebase UID
   * @param {Object} quizAnswers - Raw quiz answers
   * @returns {Object} Updated user profile
   */
  async submitUserQuiz(uid, quizAnswers) {
    try {
      console.log('📝 Submitting quiz for user:', uid)
      
      // Generate health profile from answers
      const healthProfile = generateHealthProfile(quizAnswers)
      console.log('🧬 Generated health profile:', healthProfile)
      
      // Update user document
      const updateData = {
        quizAnswers,
        quizCompleted: true,
        healthProfile,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(doc(db, 'users', uid), updateData)
      console.log('✅ Quiz submission saved to Firestore')
      
      // Return updated profile data
      return {
        ...updateData,
        uid,
        updatedAt: new Date() // For immediate context update
      }
    } catch (error) {
      console.error('💥 Error submitting quiz:', error)
      throw error
    }
  }
}