/**
 * Scan History Service
 * Manages user scan history in Firestore
 */

import { db } from '../config/firebase'
import { doc, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore'

export const scanHistoryService = {
  /**
   * Save scan data to user's scan history
   * @param {string} uid - User's Firebase UID
   * @param {Object} scanData - Scan data to save
   */
  async saveScan(uid, scanData) {
    try {
      console.log('💾 Saving scan to history:', scanData)
      
      const userDocRef = doc(db, 'scanHistory', uid)
      const itemsCollectionRef = collection(userDocRef, 'items')
      
      const scanDocument = {
        productName: scanData.productName || 'Unknown Product',
        brand: scanData.brand || 'Unknown Brand',
        score: scanData.score || 0,
        verdict: scanData.verdict || 'moderate',
        sugarRisk: scanData.sugarRisk || 'N/A',
        saltRisk: scanData.saltRisk || 'N/A',
        productData: scanData.productData || null,
        scannedAt: serverTimestamp()
      }
      
      await addDoc(itemsCollectionRef, scanDocument)
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
      
      const userDocRef = doc(db, 'scanHistory', uid)
      const itemsCollectionRef = collection(userDocRef, 'items')
      const q = query(
        itemsCollectionRef,
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