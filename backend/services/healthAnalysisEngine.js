class HealthAnalysisEngine {
  constructor() {
    this.nutritionThresholds = {
      calories: { moderate: 200, high: 400 },
      sugar: { moderate: 10, high: 20 },
      saturatedFat: { moderate: 3, high: 8 },
      sodium: { moderate: 300, high: 800 },
      protein: { good: 8, excellent: 15 },
      fiber: { good: 4, excellent: 8 }
    }
    
    this.riskFactors = {
      'palm oil': 'high',
      'trans fat': 'high',
      'artificial': 'moderate',
      'preservative': 'moderate',
      'additive': 'moderate'
    }
  }

  analyzeHealth(nutritionData, ingredients, confidence) {
    console.log('=== HEALTH ANALYSIS ENGINE ===')
    console.log('Nutrition available:', !!nutritionData)
    console.log('Ingredients available:', ingredients.length)
    console.log('Confidence level:', confidence)
    
    const analysis = {
      riskLevel: 'low',
      score: 5.0,
      warnings: [],
      positives: [],
      concerns: [],
      explanation: [],
      analysisConfidence: confidence
    }
    
    // Analyze nutrition if available
    if (nutritionData && Object.keys(nutritionData).length > 0) {
      this.analyzeNutritionRisks(nutritionData, analysis)
    }
    
    // Analyze ingredients if available
    if (ingredients && ingredients.length > 0) {
      this.analyzeIngredientRisks(ingredients, analysis)
    }
    
    // Handle missing data conservatively
    if (!nutritionData && ingredients.length === 0) {
      analysis.riskLevel = 'moderate'
      analysis.score = 4.0
      analysis.explanation.push('Limited data available - conservative assessment applied')
      analysis.analysisConfidence = 'low'
    }
    
    // Adjust for confidence
    if (confidence === 'low') {
      analysis.score = Math.max(3.0, analysis.score - 1.0)
      analysis.warnings.unshift('Analysis based on unclear text - results may be incomplete')
    }
    
    // Determine final risk level
    analysis.riskLevel = this.calculateRiskLevel(analysis.score)
    
    console.log('Final risk level:', analysis.riskLevel)
    console.log('Final score:', analysis.score)
    
    return analysis
  }

  analyzeNutritionRisks(nutrition, analysis) {
    Object.entries(nutrition).forEach(([nutrient, value]) => {
      const threshold = this.nutritionThresholds[nutrient]
      if (!threshold) return
      
      switch (nutrient) {
        case 'calories':
          if (value >= threshold.high) {
            analysis.score -= 1.5
            analysis.concerns.push(`High calorie content (${value} kcal)`)
            analysis.warnings.push('High calorie - monitor portion sizes')
          } else if (value <= threshold.moderate) {
            analysis.positives.push(`Moderate calorie content (${value} kcal)`)
          }
          break
          
        case 'sugar':
          if (value >= threshold.high) {
            analysis.score -= 2.0
            analysis.concerns.push(`High sugar content (${value}g)`)
            analysis.warnings.push('High sugar - not suitable for diabetics')
          } else if (value <= threshold.moderate) {
            analysis.score += 0.5
            analysis.positives.push(`Low sugar content (${value}g)`)
          }
          break
          
        case 'saturatedFat':
          if (value >= threshold.high) {
            analysis.score -= 2.0
            analysis.concerns.push(`High saturated fat (${value}g)`)
            analysis.warnings.push('High saturated fat - heart health concern')
          } else if (value <= threshold.moderate) {
            analysis.score += 0.5
            analysis.positives.push(`Low saturated fat (${value}g)`)
          }
          break
          
        case 'sodium':
          if (value >= threshold.high) {
            analysis.score -= 1.5
            analysis.concerns.push(`High sodium content (${value}mg)`)
            analysis.warnings.push('High sodium - may affect blood pressure')
          } else if (value <= threshold.moderate) {
            analysis.positives.push(`Moderate sodium content (${value}mg)`)
          }
          break
          
        case 'protein':
          if (value >= threshold.excellent) {
            analysis.score += 1.0
            analysis.positives.push(`Excellent protein source (${value}g)`)
          } else if (value >= threshold.good) {
            analysis.score += 0.5
            analysis.positives.push(`Good protein content (${value}g)`)
          }
          break
          
        case 'fiber':
          if (value >= threshold.excellent) {
            analysis.score += 1.0
            analysis.positives.push(`High fiber content (${value}g)`)
          } else if (value >= threshold.good) {
            analysis.score += 0.5
            analysis.positives.push(`Good fiber content (${value}g)`)
          }
          break
      }
    })
  }

  analyzeIngredientRisks(ingredients, analysis) {
    let riskCount = 0
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase()
      
      // Check for risk factors
      Object.entries(this.riskFactors).forEach(([riskIngredient, riskLevel]) => {
        if (name.includes(riskIngredient)) {
          riskCount++
          if (riskLevel === 'high') {
            analysis.score -= 1.0
            analysis.concerns.push(`Contains ${riskIngredient}`)
          } else {
            analysis.score -= 0.5
            analysis.concerns.push(`Contains ${riskIngredient}`)
          }
        }
      })
    })
    
    // General ingredient assessment
    if (ingredients.length <= 5) {
      analysis.positives.push('Simple ingredient list')
    } else if (ingredients.length > 15) {
      analysis.concerns.push('Complex ingredient list')
      analysis.score -= 0.5
    }
    
    if (riskCount === 0) {
      analysis.positives.push('No major concerning ingredients detected')
    }
  }

  calculateRiskLevel(score) {
    if (score >= 6.5) return 'low'
    if (score >= 4.0) return 'moderate'
    return 'high'
  }

  generateExplanation(analysis) {
    const explanations = []
    
    if (analysis.warnings.length > 0) {
      explanations.push(`Health concerns: ${analysis.warnings.join(', ')}`)
    }
    
    if (analysis.concerns.length > 0) {
      explanations.push(`Product concerns: ${analysis.concerns.slice(0, 2).join(', ')}`)
    }
    
    if (analysis.positives.length > 0) {
      explanations.push(`Positive aspects: ${analysis.positives.slice(0, 2).join(', ')}`)
    }
    
    if (analysis.analysisConfidence === 'low') {
      explanations.push('Analysis confidence is limited due to unclear label text')
    }
    
    return explanations
  }
}

export default HealthAnalysisEngine