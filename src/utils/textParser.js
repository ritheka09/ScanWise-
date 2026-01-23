class TextParser {
  constructor() {
    this.ingredientPatterns = [
      /ingredients?\s*:?\s*(.*)/i,  // "INGREDIENTS: ..."
      /contains?\s*:?\s*(.*)/i,     // "CONTAINS: ..."
      /made\s+with\s*:?\s*(.*)/i    // "MADE WITH: ..."
    ]
    
    this.cleanupPatterns = [
      /\([^)]*\)/g,                 // Remove parentheses content
      /\d+%?/g,                     // Remove percentages
      /[.,;]\s*$/,                  // Remove trailing punctuation
      /^\s*[.,;]\s*/                // Remove leading punctuation
    ]
  }

  parse(ocrResult) {
    try {
      const ingredients = this.extractIngredients(ocrResult.text)
      const structured = this.structureIngredients(ingredients)
      
      return {
        success: true,
        ingredients: structured,
        confidence: ocrResult.confidence,
        originalText: ocrResult.text,
        metadata: ocrResult.metadata
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackData: this.getFallbackData()
      }
    }
  }

  extractIngredients(text) {
    // Find ingredient section
    let ingredientText = text
    
    for (const pattern of this.ingredientPatterns) {
      const match = text.match(pattern)
      if (match) {
        ingredientText = match[1]
        break
      }
    }

    // Split by common separators
    const separators = /[,;]\s*|\n\s*/
    return ingredientText
      .split(separators)
      .map(ingredient => this.cleanIngredient(ingredient))
      .filter(ingredient => ingredient.length > 2)
  }

  cleanIngredient(ingredient) {
    let cleaned = ingredient.trim()
    
    // Apply cleanup patterns
    for (const pattern of this.cleanupPatterns) {
      cleaned = cleaned.replace(pattern, '').trim()
    }
    
    return cleaned
  }

  structureIngredients(ingredients) {
    return ingredients.map((ingredient, index) => ({
      id: index + 1,
      name: ingredient,
      commonName: this.getCommonName(ingredient),
      quantity: this.extractQuantity(ingredient),
      analysis: 'pending' // Will be filled by AnalysisService
    }))
  }

  getCommonName(ingredient) {
    const commonNames = {
      'refined wheat flour': 'Maida',
      'palm oil': 'Vegetable Fat',
      'cocoa solids': 'Chocolate Extract',
      'invert sugar syrup': 'Liquid Sugar',
      'sodium bicarbonate': 'Baking Soda',
      'soy lecithin': 'Emulsifier',
      'artificial chocolate flavor': 'Synthetic Flavoring'
    }
    
    return commonNames[ingredient.toLowerCase()] || ingredient
  }

  extractQuantity(ingredient) {
    const quantityMatch = ingredient.match(/(\d+(?:\.\d+)?%?)/)
    return quantityMatch ? quantityMatch[1] : 'Not specified'
  }

  getFallbackData() {
    return {
      ingredients: [
        { id: 1, name: 'Unable to parse ingredients', commonName: 'OCR Error', quantity: 'N/A', analysis: 'unknown' }
      ],
      confidence: 0,
      originalText: 'OCR parsing failed'
    }
  }
}

export default TextParser