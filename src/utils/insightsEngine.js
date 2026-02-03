/**
 * Health Insights Engine - Step 6
 * Analyzes scan history to generate personalized health insights
 */

/**
 * Generate health insights from user's scan history
 * @param {Array} scanHistory - Array of scan documents
 * @returns {Object} Health insights object
 */
export function generateHealthInsights(scanHistory) {
  if (!scanHistory || scanHistory.length === 0) {
    return {
      totalScans: 0,
      verdictStats: { good: 0, moderate: 0, avoid: 0 },
      topConcern: null,
      summaryMessage: "Start scanning products to see your health insights!"
    }
  }

  const totalScans = scanHistory.length
  
  // Calculate verdict distribution
  const verdictStats = scanHistory.reduce((stats, scan) => {
    const verdict = scan.verdict || 'moderate'
    stats[verdict] = (stats[verdict] || 0) + 1
    return stats
  }, { good: 0, moderate: 0, avoid: 0 })

  // Find most common nutrition concern
  const topConcern = findTopConcern(scanHistory)
  
  // Generate summary message
  const summaryMessage = generateSummaryMessage(totalScans, verdictStats, topConcern)

  return {
    totalScans,
    verdictStats,
    topConcern,
    summaryMessage
  }
}

/**
 * Find the most common nutrition concern from scan flags
 */
function findTopConcern(scanHistory) {
  const flagCounts = {}
  
  scanHistory.forEach(scan => {
    if (scan.flags && Array.isArray(scan.flags)) {
      scan.flags.forEach(flag => {
        flagCounts[flag] = (flagCounts[flag] || 0) + 1
      })
    }
  })
  
  if (Object.keys(flagCounts).length === 0) return null
  
  // Find most common flag
  const topFlag = Object.entries(flagCounts)
    .sort(([,a], [,b]) => b - a)[0]
  
  if (!topFlag) return null
  
  return {
    flag: topFlag[0],
    count: topFlag[1],
    label: formatConcernLabel(topFlag[0])
  }
}

/**
 * Format concern flag into human-readable label
 */
function formatConcernLabel(flag) {
  const labels = {
    'high_sugar': 'High Sugar',
    'high_sodium': 'High Sodium',
    'high_fat': 'High Saturated Fat',
    'allergens': 'Allergen Concerns',
    'diet_incompatible': 'Diet Compatibility',
    'high_calories': 'High Calories'
  }
  
  return labels[flag] || flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Generate personalized summary message
 */
function generateSummaryMessage(totalScans, verdictStats, topConcern) {
  const goodPercentage = Math.round((verdictStats.good / totalScans) * 100)
  
  if (totalScans < 5) {
    return "Keep scanning to build your health insights! Every scan helps you make better choices."
  }
  
  if (goodPercentage >= 70) {
    return `Great job! ${goodPercentage}% of your scanned products are good choices. You're building healthy habits! 🌟`
  }
  
  if (goodPercentage >= 40) {
    let message = `You're making progress! ${goodPercentage}% of your scans are good choices.`
    if (topConcern) {
      message += ` Consider looking for products with lower ${topConcern.label.toLowerCase()} to improve further.`
    }
    return message
  }
  
  let message = "Every healthy choice counts! "
  if (topConcern) {
    message += `Try looking for alternatives with lower ${topConcern.label.toLowerCase()} - small changes make a big difference.`
  } else {
    message += "Keep exploring healthier options - you're on the right path!"
  }
  
  return message
}

/**
 * Get verdict display properties
 */
export function getVerdictColor(verdict) {
  const colors = {
    good: '#4caf50',
    moderate: '#ff9800', 
    avoid: '#f44336'
  }
  return colors[verdict] || colors.moderate
}

/**
 * Format scan date for display
 */
export function formatScanDate(timestamp) {
  if (!timestamp) return 'Unknown'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}