import { mockAnalysisResult } from '../data/mockData'
import TextParser from '../utils/textParser'

class AnalysisService {
  constructor() {
    this.textParser = new TextParser()
    this.ratingDatabase = new Map([
      ['refined wheat flour', 'moderate'],
      ['palm oil', 'bad'],
      ['cocoa solids', 'good'],
      ['invert sugar syrup', 'bad'],
      ['sodium bicarbonate', 'moderate'],
      ['soy lecithin', 'good'],
      ['artificial chocolate flavor', 'bad']
    ])
  }

  async analyzeIngredients(ocrResult) {
    try {
      // Parse OCR text into structured ingredients
      const parseResult = this.textParser.parse(ocrResult)
      
      if (!parseResult.success) {
        return this.getFallbackAnalysis(parseResult.error)
      }

      // Rate each ingredient
      const ratedIngredients = this.rateIngredients(parseResult.ingredients)
      
      // Generate insights and overall rating
      const insights = this.generateInsights(ratedIngredients)
      const overallRating = this.calculateOverallRating(ratedIngredients)
      
      return {
        product: this.extractProductInfo(ocrResult),
        ingredients: ratedIngredients,
        insights,
        overallRating,
        finalComment: this.generateComment(overallRating, insights),
        ocrMetadata: {
          confidence: parseResult.confidence,
          originalText: parseResult.originalText
        }
      }
    } catch (error) {
      return this.getFallbackAnalysis(error.message)
    }
  }

  rateIngredients(ingredients) {
    return ingredients.map(ingredient => ({
      ...ingredient,
      analysis: this.ratingDatabase.get(ingredient.name.toLowerCase()) || 'moderate'
    }))
  }

  generateInsights(ingredients) {
    const pros = []
    const cons = []
    
    // Ingredient-specific analysis
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase()
      const analysis = ingredient.analysis
      
      if (analysis === 'good') {
        pros.push(this.getPositiveInsight(name, ingredient.commonName))
      } else if (analysis === 'bad') {
        cons.push(this.getNegativeInsight(name, ingredient.commonName, ingredient.quantity))
      }
    })
    
    return {
      pros: pros.length > 0 ? pros : ['No significant nutritional benefits identified'],
      cons: cons.length > 0 ? cons : ['No major health concerns identified']
    }
  }
  
  getPositiveInsight(ingredientName, commonName) {
    const positiveInsights = {
      'cocoa solids': 'Rich in antioxidants - Cocoa provides flavonoids that support heart health',
      'soy lecithin': 'Natural emulsifier - Helps with nutrient absorption and brain function',
      'whole wheat flour': 'High fiber content - Supports digestive health and blood sugar control',
      'olive oil': 'Healthy fats - Contains monounsaturated fats that reduce inflammation',
      'oats': 'Beta-glucan fiber - Helps lower cholesterol and stabilize blood sugar'
    }
    
    return positiveInsights[ingredientName] || `Contains ${commonName} - Generally considered safe`
  }
  
  getNegativeInsight(ingredientName, commonName, quantity) {
    const negativeInsights = {
      'palm oil': 'High saturated fat - Palm oil increases bad cholesterol levels',
      'invert sugar syrup': `High sugar content - Liquid sugar (${quantity}) can cause blood sugar spikes`,
      'refined wheat flour': 'Processed carbs - Refined flour lacks fiber and essential nutrients',
      'artificial chocolate flavor': 'Artificial additives - Synthetic flavoring may cause allergic reactions',
      'high fructose corn syrup': 'Processed sugar - Linked to obesity and metabolic disorders',
      'trans fat': 'Harmful fats - Trans fats increase risk of heart disease',
      'sodium nitrate': 'Chemical preservative - May form harmful compounds when heated'
    }
    
    return negativeInsights[ingredientName] || `Contains ${commonName} - May have health concerns`
  }

  calculateOverallRating(ingredients) {
    const ratingValues = {
      'good': 8,
      'moderate': 5,
      'bad': 2
    }
    
    const totalScore = ingredients.reduce((sum, ingredient) => {
      return sum + (ratingValues[ingredient.analysis] || 5)
    }, 0)
    
    const averageScore = totalScore / ingredients.length
    return Math.round(averageScore) // Return whole number
  }

  generateComment(rating, insights) {
    const score = parseFloat(rating)
    
    if (score >= 7) {
      return 'This product has a good nutritional profile and can be consumed regularly.'
    } else if (score >= 5) {
      return 'This product can be consumed occasionally but monitor intake.'
    } else {
      return 'This product should be consumed sparingly due to concerning ingredients.'
    }
  }

  extractProductInfo(ocrResult) {
    // TODO: Extract product name from OCR text
    return {
      name: 'Scanned Product',
      brand: 'Unknown Brand',
      category: 'Food Product'
    }
  }

  getFallbackAnalysis(error) {
    return {
      ...mockAnalysisResult,
      error: `OCR Analysis failed: ${error}`,
      fallbackUsed: true
    }
  }
}

export default AnalysisService