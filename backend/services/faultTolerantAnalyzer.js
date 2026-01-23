import RobustNutritionParser from './robustNutritionParser.js'
import HealthAnalysisEngine from './healthAnalysisEngine.js'

class FaultTolerantAnalyzer {
  constructor() {
    this.parser = new RobustNutritionParser()
    this.healthEngine = new HealthAnalysisEngine()
  }

  analyzeText(ocrText, ocrConfidence = 0.8) {
    console.log('=== FAULT-TOLERANT ANALYSIS START ===')
    console.log('OCR Text Length:', ocrText?.length || 0)
    console.log('OCR Confidence:', ocrConfidence)
    
    try {
      // NEVER throw errors - always return valid response
      const result = this.performSafeAnalysis(ocrText, ocrConfidence)
      
      console.log('=== ANALYSIS COMPLETED SUCCESSFULLY ===')
      console.log('Risk Level:', result.riskLevel)
      console.log('Confidence:', result.analysisConfidence)
      
      return result
      
    } catch (error) {
      console.error('Analysis error caught:', error)
      return this.createEmergencyFallback(ocrText, error.message)
    }
  }

  performSafeAnalysis(ocrText, ocrConfidence) {
    // Handle empty or invalid input
    if (!ocrText || typeof ocrText !== 'string' || ocrText.trim().length < 5) {
      return this.createMinimalResponse('Insufficient text detected', ocrConfidence)
    }
    
    // Parse nutrition (never throws)
    const nutritionResult = this.parser.parseNutrition(ocrText, ocrConfidence)
    
    // Parse ingredients (never throws)
    const ingredientResult = this.parser.parseIngredients(ocrText)
    
    // Determine overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      nutritionResult.nutritionConfidence,
      ingredientResult.ingredientConfidence,
      ocrConfidence
    )
    
    // Perform health analysis (never throws)
    const healthAnalysis = this.healthEngine.analyzeHealth(
      nutritionResult.nutrition,
      ingredientResult.ingredients,
      overallConfidence
    )
    
    // Generate explanations
    const explanations = this.healthEngine.generateExplanation(healthAnalysis)
    
    // Build safe response
    return {
      // Product info
      product: {
        name: this.extractProductName(ocrText) || 'Scanned Product',
        category: this.determineCategory(ocrText),
        dataUsed: this.getDataUsed(nutritionResult.nutrition, ingredientResult.ingredients)
      },
      
      // Core analysis
      overallRating: Math.round(healthAnalysis.score * 10) / 10,
      healthLabel: this.getHealthLabel(healthAnalysis.riskLevel),
      riskLevel: healthAnalysis.riskLevel,
      
      // Data
      nutritionFacts: nutritionResult.nutrition,
      ingredients: this.processIngredients(ingredientResult.ingredients),
      
      // Insights
      healthWarnings: healthAnalysis.warnings.slice(0, 3),
      prosAndCons: {
        pros: healthAnalysis.positives.slice(0, 3) || ['Text successfully extracted'],
        cons: healthAnalysis.concerns.slice(0, 3) || ['No major concerns identified']
      },
      
      // Metadata
      rawText: ocrText,
      ocrConfidence: ocrConfidence,
      analysisConfidence: overallConfidence,
      extractedFields: nutritionResult.detectedFields.concat(['ingredients']).filter(Boolean),
      missingFields: nutritionResult.missingFields,
      analysisNotes: explanations,
      
      // Final comment
      finalComment: this.generateSafeComment(healthAnalysis, overallConfidence),
      
      // Reason for transparency
      reason: this.generateReason(nutritionResult, ingredientResult, overallConfidence)
    }
  }

  createMinimalResponse(reason, ocrConfidence) {
    return {
      product: {
        name: 'Scanned Product',
        category: 'Food Product',
        dataUsed: 'Limited'
      },
      overallRating: 4.0,
      healthLabel: 'Moderate',
      riskLevel: 'moderate',
      nutritionFacts: null,
      ingredients: [],
      healthWarnings: ['Analysis incomplete due to unclear text'],
      prosAndCons: {
        pros: ['Image processed successfully'],
        cons: ['Limited data available for analysis']
      },
      rawText: '',
      ocrConfidence: ocrConfidence,
      analysisConfidence: 'low',
      extractedFields: [],
      missingFields: ['nutrition', 'ingredients'],
      analysisNotes: [reason],
      finalComment: 'Analysis incomplete due to unclear label text. For accurate results, ensure clear, well-lit images of nutrition labels.',
      reason: reason
    }
  }

  createEmergencyFallback(ocrText, errorMessage) {
    console.log('Creating emergency fallback response')
    
    return {
      product: {
        name: 'Scanned Product',
        category: 'Food Product',
        dataUsed: 'Error Recovery'
      },
      overallRating: 4.0,
      healthLabel: 'Moderate',
      riskLevel: 'moderate',
      nutritionFacts: null,
      ingredients: [],
      healthWarnings: ['System error during analysis'],
      prosAndCons: {
        pros: ['System recovered from error'],
        cons: ['Analysis could not be completed']
      },
      rawText: ocrText || '',
      ocrConfidence: 0.5,
      analysisConfidence: 'low',
      extractedFields: [],
      missingFields: ['nutrition', 'ingredients'],
      analysisNotes: [`System error: ${errorMessage}`],
      finalComment: 'Analysis could not be completed due to a system error. Please try again with a clearer image.',
      reason: `System error: ${errorMessage}`
    }
  }

  calculateOverallConfidence(nutritionConf, ingredientConf, ocrConf) {
    if (ocrConf < 0.5) return 'low'
    
    const confLevels = { low: 1, medium: 2, high: 3 }
    const avgConf = (confLevels[nutritionConf] + confLevels[ingredientConf]) / 2
    
    if (avgConf >= 2.5) return 'high'
    if (avgConf >= 1.5) return 'medium'
    return 'low'
  }

  processIngredients(ingredients) {
    return ingredients.map(ingredient => ({
      ...ingredient,
      rating: 'moderate' // Conservative default
    }))
  }

  getHealthLabel(riskLevel) {
    const labels = { low: 'Healthy', moderate: 'Moderate', high: 'Unhealthy' }
    return labels[riskLevel] || 'Moderate'
  }

  getDataUsed(nutrition, ingredients) {
    if (nutrition && ingredients.length > 0) return 'Both'
    if (nutrition) return 'Nutrition'
    if (ingredients.length > 0) return 'Ingredients'
    return 'Limited'
  }

  extractProductName(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    for (const line of lines.slice(0, 3)) {
      if (line.length < 50 && !line.match(/nutrition|calories|fat|sugar/i)) {
        return line.trim()
      }
    }
    return null
  }

  determineCategory(text) {
    const lower = text.toLowerCase()
    if (lower.includes('drink') || lower.includes('juice')) return 'Beverage'
    if (lower.includes('snack') || lower.includes('chip')) return 'Snack'
    return 'Packaged Food'
  }

  generateSafeComment(healthAnalysis, confidence) {
    const riskLevel = healthAnalysis.riskLevel
    const confQualifier = confidence === 'low' ? ' (based on limited data)' : ''
    
    if (riskLevel === 'low') {
      return `This product appears to be a healthy choice${confQualifier}. Suitable for regular consumption as part of a balanced diet.`
    } else if (riskLevel === 'moderate') {
      return `This product is acceptable for occasional consumption${confQualifier}. Monitor portion sizes and balance with healthier options.`
    } else {
      return `This product may have health concerns${confQualifier}. Consider healthier alternatives for regular consumption.`
    }
  }

  generateReason(nutritionResult, ingredientResult, confidence) {
    const reasons = []
    
    if (confidence === 'low') {
      reasons.push('Low analysis confidence due to unclear text')
    }
    
    reasons.push(nutritionResult.reason)
    reasons.push(ingredientResult.reason)
    
    return reasons.filter(Boolean).join('. ')
  }
}

export default FaultTolerantAnalyzer