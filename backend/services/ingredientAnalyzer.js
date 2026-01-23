class IngredientAnalyzer {
  constructor() {
    this.ratingDatabase = new Map([
      ['refined wheat flour', 'moderate'],
      ['palm oil', 'bad'],
      ['cocoa solids', 'good'],
      ['invert sugar syrup', 'bad'],
      ['sodium bicarbonate', 'moderate'],
      ['soy lecithin', 'good'],
      ['artificial chocolate flavor', 'bad'],
      ['whole wheat flour', 'good'],
      ['olive oil', 'good'],
      ['oats', 'good'],
      ['high fructose corn syrup', 'bad'],
      ['trans fat', 'bad'],
      ['sodium nitrate', 'bad']
    ])
  }

  analyzeText(ocrText) {
    try {
      const ingredients = this.parseIngredients(ocrText)
      const ratedIngredients = this.rateIngredients(ingredients)
      const insights = this.generateInsights(ratedIngredients)
      const overallRating = this.calculateOverallRating(ratedIngredients)
      
      return {
        product: { name: 'Scanned Product', brand: 'Unknown Brand', category: 'Food Product' },
        ingredients: ratedIngredients,
        insights,
        overallRating,
        finalComment: this.generateComment(overallRating)
      }
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`)
    }
  }

  parseIngredients(text) {
    // Try to find ingredients section first
    let ingredientsMatch = text.match(/ingredients?:?\s*(.+)/i)
    
    if (!ingredientsMatch) {
      // If no ingredients section found, treat entire text as ingredients
      console.log('No ingredients section found, analyzing entire text')
      ingredientsMatch = [null, text]
    }
    
    if (!ingredientsMatch[1] || ingredientsMatch[1].trim().length < 3) {
      throw new Error('No readable text found')
    }
    
    return ingredientsMatch[1]
      .split(/[,;\n]/) // Split by comma, semicolon, or newline
      .map(ingredient => ({
        name: ingredient.trim().toLowerCase().replace(/\([^)]*\)/g, '').trim(),
        commonName: ingredient.trim(),
        quantity: this.extractQuantity(ingredient)
      }))
      .filter(ingredient => ingredient.name.length > 2) // Filter out very short words
      .slice(0, 10) // Limit to first 10 items
  }

  extractQuantity(ingredient) {
    const match = ingredient.match(/\(([^)]+)\)/)
    return match ? match[1] : 'Not specified'
  }

  rateIngredients(ingredients) {
    return ingredients.map(ingredient => ({
      ...ingredient,
      analysis: this.ratingDatabase.get(ingredient.name) || 'moderate'
    }))
  }

  generateInsights(ingredients) {
    const pros = []
    const cons = []
    
    ingredients.forEach(ingredient => {
      if (ingredient.analysis === 'good') {
        pros.push(this.getPositiveInsight(ingredient.name))
      } else if (ingredient.analysis === 'bad') {
        cons.push(this.getNegativeInsight(ingredient.name))
      }
    })
    
    return {
      pros: pros.length > 0 ? pros : ['No significant nutritional benefits identified'],
      cons: cons.length > 0 ? cons : ['No major health concerns identified']
    }
  }

  getPositiveInsight(ingredientName) {
    const insights = {
      'cocoa solids': 'Rich in antioxidants - Supports heart health',
      'soy lecithin': 'Natural emulsifier - Aids nutrient absorption',
      'whole wheat flour': 'High fiber - Supports digestive health',
      'olive oil': 'Healthy fats - Reduces inflammation',
      'oats': 'Beta-glucan fiber - Lowers cholesterol'
    }
    return insights[ingredientName] || `Contains ${ingredientName} - Generally safe`
  }

  getNegativeInsight(ingredientName) {
    const insights = {
      'palm oil': 'High saturated fat - Increases bad cholesterol',
      'invert sugar syrup': 'High sugar content - Can cause blood sugar spikes',
      'refined wheat flour': 'Processed carbs - Lacks fiber and nutrients',
      'artificial chocolate flavor': 'Artificial additives - May cause reactions',
      'high fructose corn syrup': 'Processed sugar - Linked to obesity',
      'trans fat': 'Harmful fats - Increases heart disease risk'
    }
    return insights[ingredientName] || `Contains ${ingredientName} - May have health concerns`
  }

  calculateOverallRating(ingredients) {
    const ratingValues = { 'good': 8, 'moderate': 5, 'bad': 2 }
    const totalScore = ingredients.reduce((sum, ingredient) => 
      sum + (ratingValues[ingredient.analysis] || 5), 0)
    return Math.round(totalScore / ingredients.length)
  }

  generateComment(rating) {
    if (rating >= 7) return 'Good nutritional profile - can be consumed regularly'
    if (rating >= 5) return 'Moderate quality - consume occasionally'
    return 'Poor quality - consume sparingly due to concerning ingredients'
  }
}

export default IngredientAnalyzer