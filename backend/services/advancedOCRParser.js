class AdvancedOCRParser {
  constructor() {
    this.ocrCorrections = {
      'kca|': 'kcal',
      'carbo hydrates': 'carbohydrates',
      'carbohy drates': 'carbohydrates',
      'pro tein': 'protein',
      'satu rated': 'saturated',
      'so dium': 'sodium',
      'fi ber': 'fiber',
      'ener gy': 'energy',
      'ca|ories': 'calories',
      'ca lories': 'calories',
      'sug ar': 'sugar',
      'tota| fat': 'total fat',
      'tota l fat': 'total fat'
    }

    this.nutritionKeywords = [
      'energy', 'calories', 'kcal', 'carbohydrates', 'carbs', 'sugar',
      'fat', 'saturated fat', 'protein', 'sodium', 'fiber', 'fibre'
    ]

    this.ingredientKeywords = ['ingredients', 'contains', 'allergens']
  }

  normalizeText(rawText) {
    console.log('=== TEXT NORMALIZATION ===')
    console.log('Original length:', rawText.length)
    
    let normalized = rawText.toLowerCase()
    
    // Apply OCR corrections
    Object.entries(this.ocrCorrections).forEach(([wrong, correct]) => {
      normalized = normalized.replace(new RegExp(wrong, 'gi'), correct)
    })
    
    // Remove excessive whitespace and noise
    normalized = normalized
      .replace(/[|\\\/\\_\-]{2,}/g, ' ') // Remove repeated separators
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\d\.\,\:\(\)\%\-]/g, ' ') // Remove noise characters
      .trim()
    
    console.log('Normalized length:', normalized.length)
    console.log('Normalized preview:', normalized.substring(0, 200))
    
    return normalized
  }

  detectSections(normalizedText) {
    console.log('=== SECTION DETECTION ===')
    
    const sections = {
      nutrition: null,
      ingredients: null
    }
    
    // Find nutrition section
    const nutritionMatch = normalizedText.match(
      /(nutrition|energy|calories|per 100g|per serving)[\s\S]*?(?=ingredients|allergens|$)/i
    )
    if (nutritionMatch) {
      sections.nutrition = nutritionMatch[0]
      console.log('Nutrition section found:', sections.nutrition.length, 'chars')
    }
    
    // Find ingredients section
    const ingredientsMatch = normalizedText.match(
      /(ingredients|contains)[\s\:]*([^\.]+)/i
    )
    if (ingredientsMatch) {
      sections.ingredients = ingredientsMatch[2] || ingredientsMatch[0]
      console.log('Ingredients section found:', sections.ingredients.length, 'chars')
    }
    
    return sections
  }

  extractNutritionValues(nutritionText, ocrConfidence) {
    console.log('=== NUTRITION EXTRACTION ===')
    console.log('OCR Confidence:', ocrConfidence)
    
    const nutrition = {}
    const extractedFields = []
    const missingFields = []
    
    const patterns = {
      calories: /(?:energy|calories?|kcal)[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*(?:kcal|cal)?/i,
      carbohydrates: /(?:carbohydrates?|carbs?)[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*g?/i,
      sugar: /sugar[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*g?/i,
      fat: /(?:total\s+)?fat[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*g?/i,
      saturatedFat: /saturated\s+fat[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*g?/i,
      protein: /protein[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*g?/i,
      sodium: /sodium[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*(?:mg|g)?/i,
      fiber: /(?:fiber|fibre)[\s\:]*([0-9]+(?:\.[0-9]+)?)\s*g?/i
    }
    
    Object.entries(patterns).forEach(([nutrient, pattern]) => {
      const match = nutritionText.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        if (!isNaN(value) && value >= 0 && value <= 10000) { // Sanity check
          nutrition[nutrient] = value
          extractedFields.push(nutrient)
          console.log(`✓ ${nutrient}: ${value}`)
        } else {
          console.log(`✗ ${nutrient}: invalid value ${match[1]}`)
          missingFields.push(nutrient)
        }
      } else {
        missingFields.push(nutrient)
      }
    })
    
    // Mark as low confidence if OCR confidence is poor
    const confidenceLevel = ocrConfidence < 0.7 ? 'low' : 'normal'
    
    return {
      values: nutrition,
      extractedFields,
      missingFields,
      confidenceLevel,
      totalFound: extractedFields.length
    }
  }

  extractIngredients(ingredientsText) {
    console.log('=== INGREDIENTS EXTRACTION ===')
    
    if (!ingredientsText || ingredientsText.length < 10) {
      return {
        ingredients: [],
        extractedFields: [],
        missingFields: ['ingredients'],
        confidenceLevel: 'low'
      }
    }
    
    // Split by common separators
    const ingredientList = ingredientsText
      .split(/[,;]/)
      .map(item => item.trim())
      .filter(item => item.length > 2 && item.length < 100) // Filter noise
      .slice(0, 15) // Limit to reasonable number
    
    const ingredients = ingredientList.map(ingredient => ({
      name: ingredient.toLowerCase().replace(/\([^)]*\)/g, '').trim(),
      commonName: ingredient,
      quantity: this.extractQuantity(ingredient)
    }))
    
    console.log(`Found ${ingredients.length} ingredients`)
    
    return {
      ingredients,
      extractedFields: ingredients.length > 0 ? ['ingredients'] : [],
      missingFields: ingredients.length === 0 ? ['ingredients'] : [],
      confidenceLevel: ingredients.length > 2 ? 'normal' : 'low'
    }
  }

  extractQuantity(ingredient) {
    const match = ingredient.match(/\(([^)]+)\)/)
    return match ? match[1] : 'Not specified'
  }

  parseOCRText(rawText, ocrConfidence = 0.8) {
    console.log('=== ADVANCED OCR PARSING START ===')
    console.log('Raw text length:', rawText.length)
    console.log('OCR confidence:', ocrConfidence)
    
    // Step 1: Normalize text
    const normalizedText = this.normalizeText(rawText)
    
    // Step 2: Detect sections
    const sections = this.detectSections(normalizedText)
    
    // Step 3: Extract nutrition values
    const nutritionResult = sections.nutrition 
      ? this.extractNutritionValues(sections.nutrition, ocrConfidence)
      : { values: {}, extractedFields: [], missingFields: ['nutrition'], confidenceLevel: 'low', totalFound: 0 }
    
    // Step 4: Extract ingredients
    const ingredientsResult = sections.ingredients
      ? this.extractIngredients(sections.ingredients)
      : { ingredients: [], extractedFields: [], missingFields: ['ingredients'], confidenceLevel: 'low' }
    
    // Step 5: Generate analysis notes
    const analysisNotes = this.generateAnalysisNotes(nutritionResult, ingredientsResult, ocrConfidence)
    
    const result = {
      nutritionFacts: Object.keys(nutritionResult.values).length > 0 ? nutritionResult.values : null,
      ingredients: ingredientsResult.ingredients,
      extractedFields: [...nutritionResult.extractedFields, ...ingredientsResult.extractedFields],
      missingFields: [...nutritionResult.missingFields, ...ingredientsResult.missingFields],
      confidenceLevel: this.getOverallConfidence(nutritionResult, ingredientsResult, ocrConfidence),
      analysisNotes,
      ocrConfidence,
      sectionsFound: {
        nutrition: !!sections.nutrition,
        ingredients: !!sections.ingredients
      }
    }
    
    console.log('=== PARSING COMPLETE ===')
    console.log('Nutrition values found:', Object.keys(nutritionResult.values).length)
    console.log('Ingredients found:', ingredientsResult.ingredients.length)
    console.log('Overall confidence:', result.confidenceLevel)
    
    return result
  }

  generateAnalysisNotes(nutritionResult, ingredientsResult, ocrConfidence) {
    const notes = []
    
    if (ocrConfidence < 0.7) {
      notes.push('Low OCR confidence detected - analysis may be incomplete')
    }
    
    if (nutritionResult.totalFound === 0 && ingredientsResult.ingredients.length === 0) {
      notes.push('No structured nutrition or ingredient data detected')
    } else if (nutritionResult.totalFound === 0) {
      notes.push('Nutrition facts not clearly detected - analysis based on ingredients only')
    } else if (ingredientsResult.ingredients.length === 0) {
      notes.push('Ingredient list not detected - analysis based on nutrition facts only')
    }
    
    if (nutritionResult.confidenceLevel === 'low' || ingredientsResult.confidenceLevel === 'low') {
      notes.push('Some extracted values have low confidence - recommendations are conservative')
    }
    
    return notes
  }

  getOverallConfidence(nutritionResult, ingredientsResult, ocrConfidence) {
    if (ocrConfidence < 0.6) return 'low'
    if (nutritionResult.totalFound === 0 && ingredientsResult.ingredients.length === 0) return 'low'
    if (nutritionResult.totalFound >= 3 || ingredientsResult.ingredients.length >= 3) return 'high'
    return 'medium'
  }
}

export default AdvancedOCRParser