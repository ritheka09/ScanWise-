/**
 * Scan History Service - Step 6
 * Manages user scan history in Firestore subcollection
 */

import { db } from '../config/firebase'
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore'

export const scanHistoryService = {
  /**
   * Save scan data to user's scan history
   * @param {string} uid - User's Firebase UID
   * @param {Object} scanData - Scan data to save
   */
  async saveScan(uid, scanData) {
    try {
      console.log('💾 Saving scan to history:', scanData)
      
      const scanHistoryRef = collection(db, 'users', uid, 'scanHistory')
      
      const scanDocument = {
        productName: scanData.productName,
        verdict: scanData.verdict,
        flags: scanData.flags || [],
        scannedAt: serverTimestamp()
      }
      
      await addDoc(scanHistoryRef, scanDocument)
      console.log('✅ Scan saved to history')
      
    } catch (error) {
      console.error('❌ Error saving scan to history:', error)
      // Don't throw - we don't want to block UI for history saving
    }
  },

  /**
   * Get user's scan history
   * @param {string} uid - User's Firebase UID
   * @param {number} limitCount - Number of scans to retrieve
   * @returns {Array} Array of scan documents
   */
  async getUserScanHistory(uid, limitCount = 20) {
    try {
      console.log('📚 Fetching scan history for user:', uid)
      
      const scanHistoryRef = collection(db, 'users', uid, 'scanHistory')
      const q = query(
        scanHistoryRef,
        orderBy('scannedAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const scans = []
      
      querySnapshot.forEach((doc) => {
        scans.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      console.log('✅ Retrieved scan history:', scans.length, 'scans')
      return scans
      
    } catch (error) {
      console.error('❌ Error fetching scan history:', error)
      return []
    }
  }
}