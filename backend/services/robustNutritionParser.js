import TextNormalizer from '../utils/textNormalizer.js'

class RobustNutritionParser {
  constructor() {
    this.normalizer = new TextNormalizer()
    
    // Flexible nutrition patterns - work without tables, tolerate OCR noise
    this.nutritionPatterns = {
      calories: [
        /(?:energy|calories?|kcal)[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*(?:kcal|cal|calories?)/i,
        /([0-9]+)\s*[\s\|\-]*(?:kcal|cal)/i
      ],
      carbohydrates: [
        /(?:carbohydrates?|carbs?)[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*g?\s*carb/i,
        /carb[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ],
      sugar: [
        /sugar[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*g?\s*sugar/i,
        /sug[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ],
      fat: [
        /(?:total\s+)?fat[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*g?\s*fat/i,
        /fat[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ],
      saturatedFat: [
        /(?:saturated|sat)\s*fat[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*g?\s*saturated/i,
        /sat[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ],
      protein: [
        /protein[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*g?\s*protein/i,
        /prot[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ],
      sodium: [
        /sodium[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*(?:mg|g)?\s*sodium/i,
        /sod[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /salt[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ],
      fiber: [
        /(?:fiber|fibre)[\s\:\(\)\|\-]*([0-9]+(?:\.[0-9]+)?)/i,
        /([0-9]+(?:\.[0-9]+)?)\s*g?\s*fib/i,
        /fib[\s\|\-]*([0-9]+(?:\.[0-9]+)?)/i
      ]
    }
  }

  parseNutrition(rawText, ocrConfidence = 0.8) {
    console.log('=== ROBUST NUTRITION PARSING ===')
    
    const normalizedText = this.normalizer.normalize(rawText)
    const nutrition = {}
    const nutritionConfidence = {}
    const detectedFields = []
    const missingFields = []
    
    // Try to extract each nutrient individually with confidence scoring
    Object.entries(this.nutritionPatterns).forEach(([nutrient, patterns]) => {
      let value = null
      let confidence = 'low'
      
      // Try each pattern until one matches
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i]
        const match = normalizedText.match(pattern)
        if (match && match[1]) {
          const parsedValue = parseFloat(match[1])
          if (this.isValidNutrientValue(nutrient, parsedValue)) {
            value = parsedValue
            // First pattern match = higher confidence
            confidence = i === 0 ? 'high' : 'medium'
            break
          }
        }
      }
      
      if (value !== null) {
        nutrition[nutrient] = value
        nutritionConfidence[nutrient] = confidence
        detectedFields.push(nutrient)
        console.log(`✓ ${nutrient}: ${value} (${confidence} confidence)`)
      } else {
        missingFields.push(nutrient)
      }
    })
    
    const overallNutritionConfidence = this.calculateNutritionConfidence(detectedFields.length, ocrConfidence)
    
    return {
      nutrition: Object.keys(nutrition).length > 0 ? nutrition : null,
      nutritionConfidence,
      detectedFields,
      missingFields,
      overallConfidence: overallNutritionConfidence,
      reason: this.getNutritionReason(detectedFields.length, ocrConfidence)
    }
  }

  parseIngredients(rawText) {
    console.log('=== INGREDIENT PARSING (BEST EFFORT) ===')
    
    const normalizedText = this.normalizer.normalize(rawText)
    const ingredients = []
    
    // Look for ingredient patterns (optional, not mandatory)
    const ingredientPatterns = [
      /ingredients?[\s\:]*([^\.]+)/i,
      /contains?[\s\:]*([^\.]+)/i,
      // Look for comma-separated lists that might be ingredients
      /([a-z\s]+(?:,[a-z\s]+){2,})/i
    ]
    
    for (const pattern of ingredientPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        const ingredientList = match[1]
          .split(/[,;]/)
          .map(item => item.trim())
          .filter(item => item.length > 2 && item.length < 50)
          .slice(0, 10)
        
        if (ingredientList.length >= 2) {
          ingredients.push(...ingredientList.map(ingredient => ({
            name: ingredient.toLowerCase(),
            commonName: ingredient,
            quantity: 'Not specified'
          })))
          break
        }
      }
    }
    
    const ingredientConfidence = ingredients.length >= 3 ? 'medium' : 'low'
    
    return {
      ingredients,
      ingredientConfidence,
      reason: ingredients.length === 0 ? 'No ingredient list detected' : `Found ${ingredients.length} ingredients`
    }
  }

  isValidNutrientValue(nutrient, value) {
    if (isNaN(value) || value < 0) return false
    
    // Enhanced sanity check ranges with sodium-specific logic
    const maxValues = {
      calories: 9000,
      carbohydrates: 100,
      sugar: 100,
      fat: 100,
      saturatedFat: 100,
      protein: 100,
      sodium: 50000, // Allow higher range for sodium (mg)
      fiber: 50
    }
    
    // Special sodium validation
    if (nutrient === 'sodium') {
      // Sodium can be in mg (0-50000) or g (0-50)
      if (value > 50000) return false // Too high even for mg
      if (value > 50 && value < 100) return false // Suspicious range
      return true
    }
    
    return value <= (maxValues[nutrient] || 1000)
  }

  calculateNutritionConfidence(detectedCount, ocrConfidence) {
    if (ocrConfidence < 0.6) return 'low'
    if (detectedCount === 0) return 'low'
    if (detectedCount >= 4) return 'high'
    if (detectedCount >= 2) return 'medium'
    return 'low'
  }

  getNutritionReason(detectedCount, ocrConfidence) {
    if (ocrConfidence < 0.6) return 'Low OCR confidence detected'
    if (detectedCount === 0) return 'No nutrition values clearly detected'
    if (detectedCount >= 4) return 'Multiple nutrition values detected'
    return 'Partial nutrition data detected'
  }
}

export default RobustNutritionParser