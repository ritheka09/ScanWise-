import { DATA_QUALITY, HEALTH_THRESHOLDS } from '../data/constants'

export class EnhancementService {
  // Calculate data quality confidence
  static calculateDataQuality(product) {
    let score = 0
    let total = 0
    
    // Check nutrition completeness
    const nutrition = product.nutritionFacts || {}
    const nutritionFields = ['calories', 'sugar', 'saturatedFat', 'sodium', 'protein', 'fiber']
    nutritionFields.forEach(field => {
      total++
      if (nutrition[field] && nutrition[field] > 0) score++
    })
    
    // Check product info completeness
    const productInfo = product.product || {}
    const productFields = ['name', 'brand', 'category']
    productFields.forEach(field => {
      total++
      if (productInfo[field] && productInfo[field] !== 'Unknown Product' && productInfo[field] !== 'Unknown Brand') score++
    })
    
    // Check ingredients
    total++
    if (product.ingredients && product.ingredients.length > 0) score++
    
    const confidence = score / total
    
    if (confidence >= 0.8) return DATA_QUALITY.HIGH
    if (confidence >= 0.5) return DATA_QUALITY.MEDIUM
    return DATA_QUALITY.LOW
  }
  
  // Generate health rating explanation
  static generateHealthExplanation(rating, nutrition, warnings) {
    const explanations = {
      5: "Excellent nutritional profile with balanced nutrients and minimal health concerns.",
      4: "Good nutritional choice with mostly positive health attributes.",
      3: "Moderate nutritional value - acceptable as part of a balanced diet.",
      2: "Poor nutritional profile with several health concerns to consider.",
      1: "Very poor nutritional choice with significant health risks."
    }
    
    const roundedRating = Math.round(rating)
    let explanation = explanations[roundedRating] || explanations[3]
    
    // Add specific factors
    const factors = []
    if (nutrition.sugar > HEALTH_THRESHOLDS.SUGAR_HIGH) factors.push("high sugar")
    if (nutrition.sodium > HEALTH_THRESHOLDS.SODIUM_HIGH) factors.push("high sodium")
    if (nutrition.saturatedFat > HEALTH_THRESHOLDS.SAT_FAT_HIGH) factors.push("high saturated fat")
    
    if (factors.length > 0) {
      explanation += ` Key concerns: ${factors.join(', ')}.`
    }
    
    return explanation
  }
  
  // Generate personalized health warnings
  static generateHealthWarnings(nutrition, ingredients) {
    const warnings = []
    
    if (nutrition.sugar > HEALTH_THRESHOLDS.SUGAR_HIGH) {
      warnings.push({
        type: 'high-sugar',
        message: `High sugar content (${nutrition.sugar}g) - may cause blood sugar spikes`,
        severity: 'high'
      })
    }
    
    if (nutrition.sodium > HEALTH_THRESHOLDS.SODIUM_HIGH) {
      warnings.push({
        type: 'high-sodium',
        message: `High sodium content (${nutrition.sodium}mg) - not suitable for low-salt diets`,
        severity: 'high'
      })
    }
    
    if (nutrition.saturatedFat > HEALTH_THRESHOLDS.SAT_FAT_HIGH) {
      warnings.push({
        type: 'high-saturated-fat',
        message: `High saturated fat (${nutrition.saturatedFat}g) - may increase cholesterol levels`,
        severity: 'medium'
      })
    }
    
    // Check for ultra-processed ingredients
    const ultraProcessed = ingredients.some(ingredient => 
      HEALTH_THRESHOLDS.ULTRA_PROCESSED_INGREDIENTS.some(term => 
        ingredient.name.toLowerCase().includes(term)
      )
    )
    
    if (ultraProcessed) {
      warnings.push({
        type: 'ultra-processed',
        message: 'Contains ultra-processed ingredients - limit consumption',
        severity: 'medium'
      })
    }
    
    return warnings
  }
  
  // Store scan history
  static saveScanHistory(productData, barcode) {
    const history = this.getScanHistory()
    const scanRecord = {
      id: Date.now(),
      barcode,
      name: productData.product.name,
      brand: productData.product.brand,
      rating: productData.overallRating,
      timestamp: Date.now(),
      data: productData
    }
    
    const updated = [scanRecord, ...history.filter(item => item.barcode !== barcode)].slice(0, 10)
    localStorage.setItem('scanwise-history', JSON.stringify(updated))
    return updated
  }
  
  // Get scan history
  static getScanHistory() {
    try {
      const history = localStorage.getItem('scanwise-history')
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }
  
  // Compare two products
  static compareProducts(product1, product2) {
    const comparison = {
      product1: {
        name: product1.product.name,
        rating: product1.overallRating,
        nutrition: product1.nutritionFacts
      },
      product2: {
        name: product2.product.name,
        rating: product2.overallRating,
        nutrition: product2.nutritionFacts
      },
      winner: {},
      summary: []
    }
    
    // Compare key metrics
    const metrics = ['calories', 'sugar', 'saturatedFat', 'sodium', 'protein', 'fiber']
    metrics.forEach(metric => {
      const val1 = product1.nutritionFacts[metric] || 0
      const val2 = product2.nutritionFacts[metric] || 0
      
      if (metric === 'protein' || metric === 'fiber') {
        comparison.winner[metric] = val1 > val2 ? 'product1' : val2 > val1 ? 'product2' : 'tie'
      } else {
        comparison.winner[metric] = val1 < val2 ? 'product1' : val2 < val1 ? 'product2' : 'tie'
      }
    })
    
    // Overall winner
    comparison.winner.overall = product1.overallRating > product2.overallRating ? 'product1' : 
                               product2.overallRating > product1.overallRating ? 'product2' : 'tie'
    
    return comparison
  }
}