import { EnhancementService } from './enhancementService'

class ProductApiService {
  constructor() {
    this.baseUrl = 'https://world.openfoodfacts.org/api/v0/product'
  }

  async fetchProductByBarcode(barcode) {
    try {
      const response = await fetch(`${this.baseUrl}/${barcode}.json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === 0) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      const productData = this.normalizeProductData(data.product, barcode)
      
      // Save to history
      EnhancementService.saveScanHistory(productData, barcode)
      
      return productData
      
    } catch (error) {
      console.error('API fetch failed:', error)
      if (error.message === 'PRODUCT_NOT_FOUND') {
        throw new Error('PRODUCT_NOT_FOUND')
      }
      throw new Error(`Failed to fetch product: ${error.message}`)
    }
  }

  normalizeProductData(product, barcode) {
    // Check if product has meaningful data
    const hasNutrition = product.nutriments && Object.keys(product.nutriments).length > 0
    const hasIngredients = product.ingredients && product.ingredients.length > 0
    const hasName = product.product_name || product.generic_name
    
    // If no meaningful data, return minimal unknown product
    if (!hasNutrition && !hasIngredients && !hasName) {
      return {
        barcode,
        product: {
          name: 'Unknown Product',
          brand: 'Unknown Brand',
          category: 'Product not found in database'
        },
        dataQuality: 'none',
        isUnknown: true
      }
    }
    
    const nutrition = this.extractNutrition(product.nutriments || {})
    const ingredients = this.extractIngredients(product.ingredients || [])
    const analysis = this.analyzeProduct(nutrition, ingredients)
    
    const productData = {
      barcode,
      product: {
        name: product.product_name || product.generic_name || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        category: product.categories || 'Food Product',
        image: product.image_url || product.image_front_url
      },
      nutritionFacts: nutrition,
      ingredients: ingredients,
      overallRating: analysis.rating,
      healthLabel: analysis.healthLabel,
      healthWarnings: analysis.warnings,
      prosAndCons: analysis.prosAndCons,
      finalComment: analysis.comment,
      analysisSource: 'barcode',
      isUnknown: false
    }
    
    productData.dataQuality = EnhancementService.calculateDataQuality(productData)
    productData.healthExplanation = EnhancementService.generateHealthExplanation(
      analysis.rating, nutrition, analysis.warnings
    )
    productData.personalizedWarnings = EnhancementService.generateHealthWarnings(nutrition, ingredients)
    
    return productData
  }

  extractNutrition(nutriments) {
    return {
      calories: this.getValue(nutriments, 'energy-kcal_100g') || this.getValue(nutriments, 'energy_100g'),
      sugar: this.getValue(nutriments, 'sugars_100g'),
      saturatedFat: this.getValue(nutriments, 'saturated-fat_100g'),
      sodium: this.getValue(nutriments, 'sodium_100g') || this.getValue(nutriments, 'salt_100g') * 400, // Convert salt to sodium
      protein: this.getValue(nutriments, 'proteins_100g'),
      fiber: this.getValue(nutriments, 'fiber_100g'),
      fat: this.getValue(nutriments, 'fat_100g'),
      carbohydrates: this.getValue(nutriments, 'carbohydrates_100g')
    }
  }

  getValue(nutriments, key) {
    const value = nutriments[key]
    return value !== undefined && value !== null ? parseFloat(value) : 0
  }

  extractIngredients(ingredients) {
    // Don't show ingredients - they're rarely complete in the database
    return []
  }

  assessIngredientRisk(ingredientName) {
    const name = ingredientName.toLowerCase()
    
    // High risk ingredients
    if (name.includes('palm oil') || name.includes('trans fat') || 
        name.includes('high fructose') || name.includes('artificial color')) {
      return 'high'
    }
    
    // Medium risk ingredients  
    if (name.includes('sugar') || name.includes('sodium') || 
        name.includes('preservative') || name.includes('flavor')) {
      return 'medium'
    }
    
    // Low risk (natural ingredients)
    return 'low'
  }

  analyzeProduct(nutrition, ingredients) {
    let score = 5
    const warnings = []
    const pros = []
    const cons = []

    // Analyze nutrition
    if (nutrition.sugar > 15) {
      score -= 1.5
      warnings.push('High sugar content – may cause blood sugar spikes')
      cons.push('High in added sugar')
    } else if (nutrition.sugar < 5) {
      pros.push('Low sugar content')
    }

    if (nutrition.saturatedFat > 5) {
      score -= 1
      warnings.push('High saturated fat – may increase cholesterol levels')
      cons.push('High in saturated fat')
    }

    if (nutrition.sodium > 600) {
      score -= 1
      warnings.push('High sodium content – not suitable for low-salt diets')
      cons.push('High sodium content')
    }

    if (nutrition.protein > 10) {
      score += 0.5
      pros.push('Good source of protein')
    }

    if (nutrition.fiber > 6) {
      score += 0.5
      pros.push('High fiber content')
    }

    // Analyze ingredients
    const highRiskCount = ingredients.filter(i => i.riskLevel === 'high').length
    if (highRiskCount > 0) {
      score -= highRiskCount * 0.5
      warnings.push('Contains potentially harmful ingredients')
      cons.push('Contains artificial additives')
    }

    // Ensure minimum values
    if (pros.length === 0) pros.push('Provides essential nutrients')
    if (cons.length === 0) cons.push('Should be consumed as part of balanced diet')

    const finalScore = Math.max(1, Math.min(5, score))
    
    return {
      rating: finalScore,
      healthLabel: finalScore >= 4 ? 'Healthy' : finalScore >= 3 ? 'Moderate' : 'Unhealthy',
      warnings,
      prosAndCons: { pros, cons },
      comment: this.generateComment(finalScore)
    }
  }

  generateComment(rating) {
    if (rating >= 4) {
      return 'This product has a good nutritional profile and can be part of a healthy diet.'
    } else if (rating >= 3) {
      return 'This product has moderate nutritional value. Consume in moderation as part of a balanced diet.'
    } else {
      return 'This product is high in sugar, fat, or sodium. It should be consumed sparingly.'
    }
  }
}

export default ProductApiService