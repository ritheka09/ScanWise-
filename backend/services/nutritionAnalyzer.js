import AdvancedOCRParser from './advancedOCRParser.js'

class NutritionAnalyzer {
  constructor() {
    this.parser = new AdvancedOCRParser()
    
    // Nutrition thresholds per 100g
    this.thresholds = {
      calories: { low: 150, high: 400 },
      sugar: { low: 5, high: 15 },
      saturatedFat: { low: 1.5, high: 5 },
      sodium: { low: 120, high: 600 },
      protein: { low: 5, high: 15 },
      fiber: { low: 3, high: 6 }
    }
    
    this.ingredientRatings = new Map([
      ['palm oil', 'bad'], ['refined wheat flour', 'moderate'],
      ['cocoa solids', 'good'], ['invert sugar syrup', 'bad'],
      ['sodium bicarbonate', 'moderate'], ['soy lecithin', 'good'],
      ['artificial chocolate flavor', 'bad'], ['whole wheat flour', 'good']
    ])
  }

  analyzeText(ocrText, ocrConfidence = 0.8) {
    console.log('=== NUTRITION ANALYZER START ===')
    console.log('OCR Text Length:', ocrText.length)
    console.log('OCR Confidence:', ocrConfidence)
    
    // Use advanced parser for extraction
    const parseResult = this.parser.parseOCRText(ocrText, ocrConfidence)
    
    // Generate analysis based on parsed data
    const analysis = this.generateSafeAnalysis(parseResult)
    
    const result = {
      product: {
        name: this.extractProductName(ocrText) || 'Scanned Product',
        category: this.determineCategory(ocrText, parseResult.nutritionFacts),
        dataUsed: this.getDataUsed(parseResult.nutritionFacts, parseResult.ingredients)
      },
      overallRating: analysis.rating,
      healthLabel: this.getHealthLabel(analysis.rating),
      nutritionFacts: parseResult.nutritionFacts,
      ingredients: this.processIngredients(parseResult.ingredients),
      healthWarnings: analysis.warnings,
      prosAndCons: analysis.prosAndCons,
      finalComment: analysis.comment,
      // Enhanced metadata
      rawText: ocrText,
      ocrConfidence: parseResult.ocrConfidence,
      confidenceLevel: parseResult.confidenceLevel,
      extractedFields: parseResult.extractedFields,
      missingFields: parseResult.missingFields,
      analysisNotes: parseResult.analysisNotes,
      analysisWarning: this.generateWarning(parseResult)
    }
    
    console.log('=== ANALYSIS COMPLETE ===')
    console.log('Confidence Level:', result.confidenceLevel)
    console.log('Rating:', result.overallRating)
    console.log('Extracted Fields:', result.extractedFields.length)
    
    return result
  }

  createBasicAnalysis(ocrText) {
    console.log('Creating basic analysis for unstructured text')
    
    // Basic text analysis - look for keywords
    const text = ocrText.toLowerCase()
    let score = 5.0
    const warnings = []
    const pros = ['Text successfully extracted from image']
    const cons = []
    
    // Look for concerning keywords
    if (text.includes('sugar') || text.includes('glucose') || text.includes('fructose')) {
      score -= 1
      cons.push('Contains sugar-related terms')
    }
    
    if (text.includes('fat') || text.includes('oil')) {
      score -= 0.5
      cons.push('Contains fat-related terms')
    }
    
    if (text.includes('sodium') || text.includes('salt')) {
      score -= 0.5
      cons.push('Contains sodium-related terms')
    }
    
    // Look for positive keywords
    if (text.includes('protein') || text.includes('fiber') || text.includes('vitamin')) {
      score += 1
      pros.push('Contains beneficial nutrients')
    }
    
    if (text.includes('organic') || text.includes('natural')) {
      score += 0.5
      pros.push('Contains natural/organic terms')
    }
    
    if (cons.length === 0) {
      cons.push('No specific concerns identified')
    }
    
    const finalScore = Math.max(1, Math.min(10, score))
    
    return {
      product: {
        name: 'Scanned Product',
        category: 'Food Product',
        dataUsed: 'Text Analysis'
      },
      overallRating: Math.round(finalScore * 10) / 10,
      healthLabel: this.getHealthLabel(finalScore),
      nutritionFacts: null,
      ingredients: [],
      healthWarnings: warnings,
      prosAndCons: { pros, cons },
      finalComment: `Based on text analysis, this product appears to be ${finalScore >= 6 ? 'acceptable' : 'concerning'} for consumption. For detailed analysis, please ensure the image contains clear nutrition facts or ingredient lists.`,
      ocrText: ocrText.substring(0, 500)
    }
  }

  parseNutritionFacts(text) {
    const nutrition = {}
    
    const caloriesMatch = text.match(/(?:calories?|energy)[:\s]*(\d+)/i)
    if (caloriesMatch) nutrition.calories = parseInt(caloriesMatch[1])
    
    const sugarMatch = text.match(/sugar[s]?[:\s]*(\d+(?:\.\d+)?)/i)
    if (sugarMatch) nutrition.sugar = parseFloat(sugarMatch[1])
    
    const satFatMatch = text.match(/saturated\s+fat[:\s]*(\d+(?:\.\d+)?)/i)
    if (satFatMatch) nutrition.saturatedFat = parseFloat(satFatMatch[1])
    
    const sodiumMatch = text.match(/sodium[:\s]*(\d+(?:\.\d+)?)/i)
    if (sodiumMatch) nutrition.sodium = parseFloat(sodiumMatch[1])
    
    const proteinMatch = text.match(/protein[:\s]*(\d+(?:\.\d+)?)/i)
    if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1])
    
    const fiberMatch = text.match(/(?:dietary\s+)?fiber[:\s]*(\d+(?:\.\d+)?)/i)
    if (fiberMatch) nutrition.fiber = parseFloat(fiberMatch[1])

    return Object.keys(nutrition).length > 0 ? nutrition : null
  }

  parseIngredients(text) {
    const ingredientsMatch = text.match(/ingredients?:?\s*(.+)/i)
    if (!ingredientsMatch) return []
    
    return ingredientsMatch[1]
      .split(/[,;]/) 
      .map(ingredient => {
        const name = ingredient.trim().toLowerCase().replace(/\([^)]*\)/g, '').trim()
        const quantity = this.extractQuantity(ingredient)
        return {
          name,
          commonName: ingredient.trim(),
          quantity,
          rating: this.ingredientRatings.get(name) || 'moderate'
        }
      })
      .filter(ingredient => ingredient.name.length > 2)
      .slice(0, 8)
  }

  extractQuantity(ingredient) {
    const match = ingredient.match(/\(([^)]+)\)/)
    return match ? match[1] : 'Not specified'
  }

  generateSafeAnalysis(parseResult) {
    console.log('=== SAFE ANALYSIS GENERATION ===')
    
    let score = 5.0
    const warnings = []
    const pros = []
    const cons = []
    
    // Only analyze confirmed extracted values
    if (parseResult.nutritionFacts && Object.keys(parseResult.nutritionFacts).length > 0) {
      const nutritionAnalysis = this.analyzeConfirmedNutrition(parseResult.nutritionFacts, parseResult.confidenceLevel)
      score = nutritionAnalysis.score
      warnings.push(...nutritionAnalysis.warnings)
      pros.push(...nutritionAnalysis.pros)
      cons.push(...nutritionAnalysis.cons)
    }
    
    // Analyze ingredients if available
    if (parseResult.ingredients && parseResult.ingredients.length > 0) {
      const ingredientAnalysis = this.analyzeConfirmedIngredients(parseResult.ingredients)
      if (!parseResult.nutritionFacts) score = ingredientAnalysis.score
      pros.push(...ingredientAnalysis.pros)
      cons.push(...ingredientAnalysis.cons)
    }
    
    // Adjust confidence based on extraction quality
    if (parseResult.confidenceLevel === 'low') {
      warnings.unshift('Analysis based on limited data - recommendations are conservative')
    }
    
    // Ensure we have some content
    if (pros.length === 0) {
      pros.push(parseResult.extractedFields.length > 0 ? 'Product information successfully extracted' : 'Text extracted from image')
    }
    if (cons.length === 0) {
      cons.push('No major concerns identified from available data')
    }
    
    return {
      rating: Math.round(score * 10) / 10,
      warnings: warnings.slice(0, 3),
      prosAndCons: { pros: pros.slice(0, 3), cons: cons.slice(0, 3) },
      comment: this.generateSafeComment(score, parseResult)
    }
  }

  analyzeConfirmedNutrition(nutrition, confidenceLevel) {
    console.log('Analyzing confirmed nutrition values:', Object.keys(nutrition))
    
    let score = 5.0
    const warnings = []
    const pros = []
    const cons = []
    
    // Only make strong claims for high-confidence data
    const isHighConfidence = confidenceLevel === 'high'
    
    Object.entries(nutrition).forEach(([nutrient, value]) => {
      const analysis = this.analyzeNutrient(nutrient, value, isHighConfidence)
      score += analysis.scoreImpact
      
      if (analysis.warning) warnings.push(analysis.warning)
      if (analysis.pro) pros.push(analysis.pro)
      if (analysis.con) cons.push(analysis.con)
    })
    
    return {
      score: Math.max(1, Math.min(10, score)),
      warnings,
      pros,
      cons
    }
  }

  analyzeNutrient(nutrient, value, isHighConfidence) {
    const threshold = this.thresholds[nutrient]
    if (!threshold) return { scoreImpact: 0 }
    
    const result = { scoreImpact: 0 }
    const confidencePrefix = isHighConfidence ? '' : 'Appears to have '
    
    switch (nutrient) {
      case 'calories':
        if (value >= threshold.high) {
          result.scoreImpact = -1.5
          result.con = `${confidencePrefix}high calorie content (${value} kcal)`
        } else if (value <= threshold.low) {
          result.scoreImpact = 0.5
          result.pro = `${confidencePrefix}moderate calorie content (${value} kcal)`
        }
        break
        
      case 'sugar':
        if (value >= threshold.high) {
          result.scoreImpact = -2
          if (isHighConfidence) {
            result.warning = 'High sugar content - not recommended for diabetics'
          }
          result.con = `${confidencePrefix}high sugar content (${value}g)`
        } else if (value <= threshold.low) {
          result.scoreImpact = 1
          result.pro = `${confidencePrefix}low sugar content (${value}g)`
        }
        break
        
      case 'saturatedFat':
        if (value >= threshold.high) {
          result.scoreImpact = -2
          if (isHighConfidence) {
            result.warning = 'High saturated fat - may affect heart health'
          }
          result.con = `${confidencePrefix}high saturated fat (${value}g)`
        } else if (value <= threshold.low) {
          result.scoreImpact = 1
          result.pro = `${confidencePrefix}low saturated fat (${value}g)`
        }
        break
        
      case 'sodium':
        if (value >= threshold.high) {
          result.scoreImpact = -1.5
          if (isHighConfidence) {
            result.warning = 'High sodium - may affect blood pressure'
          }
          result.con = `${confidencePrefix}high sodium content (${value}mg)`
        } else if (value <= threshold.low) {
          result.scoreImpact = 0.5
          result.pro = `${confidencePrefix}low sodium content (${value}mg)`
        }
        break
        
      case 'protein':
        if (value >= threshold.high) {
          result.scoreImpact = 1
          result.pro = `${confidencePrefix}good protein source (${value}g)`
        }
        break
        
      case 'fiber':
        if (value >= threshold.high) {
          result.scoreImpact = 1.5
          result.pro = `${confidencePrefix}high fiber content (${value}g)`
        } else if (value <= threshold.low) {
          result.con = `${confidencePrefix}low fiber content (${value}g)`
        }
        break
    }
    
    return result
  }

  analyzeConfirmedIngredients(ingredients) {
    const processedIngredients = ingredients.map(ing => ({
      ...ing,
      rating: this.ingredientRatings.get(ing.name) || 'moderate'
    }))
    
    const badCount = processedIngredients.filter(i => i.rating === 'bad').length
    const goodCount = processedIngredients.filter(i => i.rating === 'good').length
    
    let score = 5.0
    const pros = []
    const cons = []
    
    if (badCount > goodCount) {
      score -= badCount * 0.5
      cons.push('Contains some concerning ingredients')
    }
    
    if (goodCount > 0) {
      score += goodCount * 0.3
      pros.push('Contains some beneficial ingredients')
    }
    
    if (ingredients.length <= 5) {
      pros.push('Simple ingredient list')
    }
    
    return { score: Math.max(1, Math.min(10, score)), pros, cons }
  }

  processIngredients(ingredients) {
    return ingredients.map(ingredient => ({
      ...ingredient,
      rating: this.ingredientRatings.get(ingredient.name) || 'moderate'
    }))
  }

  generateWarning(parseResult) {
    if (parseResult.confidenceLevel === 'low') {
      return 'Analysis confidence is low due to unclear text. Recommendations are conservative.'
    }
    if (parseResult.extractedFields.length === 0) {
      return 'No structured nutrition or ingredient data detected. Analysis is limited.'
    }
    if (parseResult.analysisNotes.length > 0) {
      return parseResult.analysisNotes[0]
    }
    return null
  }

  generateSafeComment(score, parseResult) {
    const dataQuality = parseResult.confidenceLevel
    const hasNutrition = parseResult.nutritionFacts && Object.keys(parseResult.nutritionFacts).length > 0
    const hasIngredients = parseResult.ingredients && parseResult.ingredients.length > 0
    
    let baseComment = ''
    if (score >= 7) {
      baseComment = 'This product appears to have a good nutritional profile'
    } else if (score >= 4) {
      baseComment = 'This product appears acceptable for occasional consumption'
    } else {
      baseComment = 'This product may have some nutritional concerns'
    }
    
    let qualifiers = []
    if (dataQuality === 'low') {
      qualifiers.push('based on limited data available')
    }
    if (!hasNutrition && !hasIngredients) {
      qualifiers.push('analysis is incomplete due to unclear label text')
    } else if (!hasNutrition) {
      qualifiers.push('based on ingredient analysis only')
    } else if (!hasIngredients) {
      qualifiers.push('based on nutrition facts only')
    }
    
    const qualifier = qualifiers.length > 0 ? ` - ${qualifiers.join(', ')}` : ''
    return `${baseComment}${qualifier}. For complete analysis, ensure clear nutrition label images.`
  }

  createBasicTextAnalysis(ocrText, warning) {
    const text = ocrText.toLowerCase()
    let score = 5.0
    const pros = ['Text successfully extracted from image']
    const cons = []
    
    // Basic keyword analysis
    if (text.includes('sugar') || text.includes('glucose')) {
      score -= 1
      cons.push('Contains sugar-related terms')
    }
    
    if (text.includes('fat') || text.includes('oil')) {
      score -= 0.5
      cons.push('Contains fat-related terms')
    }
    
    if (text.includes('protein') || text.includes('fiber')) {
      score += 1
      pros.push('Contains beneficial nutrients')
    }
    
    if (cons.length === 0) cons.push('No specific concerns identified')
    
    const finalScore = Math.max(1, Math.min(10, score))
    
    return {
      rating: Math.round(finalScore * 10) / 10,
      warnings: [],
      prosAndCons: { pros, cons },
      comment: `Based on text analysis, this product appears ${finalScore >= 6 ? 'acceptable' : 'concerning'} for consumption. For detailed analysis, ensure the image contains clear nutrition facts.`,
      warning,
      ocrConfidence: 0.6
    }
  }

  analyzeNutrition(nutrition) {
    let score = 5.0
    const warnings = []
    const pros = []
    const cons = []

    // Analyze each nutrient
    Object.entries(nutrition).forEach(([key, value]) => {
      const analysis = this.analyzeNutrient(key, value)
      score += analysis.scoreImpact
      
      if (analysis.warning) warnings.push(analysis.warning)
      if (analysis.pro) pros.push(analysis.pro)
      if (analysis.con) cons.push(analysis.con)
    })

    return {
      score: Math.max(0, Math.min(10, score)),
      warnings,
      pros,
      cons
    }
  }

  analyzeNutrient(nutrient, value) {
    const threshold = this.thresholds[nutrient]
    if (!threshold) return { scoreImpact: 0 }

    const result = { scoreImpact: 0 }

    switch (nutrient) {
      case 'calories':
        if (value >= threshold.high) {
          result.scoreImpact = -1.5
          result.con = 'High calorie content'
        } else if (value <= threshold.low) {
          result.scoreImpact = 0.5
          result.pro = 'Moderate calorie content'
        }
        break
        
      case 'sugar':
        if (value >= threshold.high) {
          result.scoreImpact = -2
          result.warning = 'High sugar - Not recommended for diabetics'
          result.con = 'High added sugar'
        } else if (value <= threshold.low) {
          result.scoreImpact = 1
          result.pro = 'Low sugar content'
        }
        break
        
      case 'saturatedFat':
        if (value >= threshold.high) {
          result.scoreImpact = -2
          result.warning = 'High saturated fat - Heart health risk'
          result.con = 'High saturated fat'
        } else if (value <= threshold.low) {
          result.scoreImpact = 1
          result.pro = 'Low saturated fat'
        }
        break
        
      case 'sodium':
        if (value >= threshold.high) {
          result.scoreImpact = -1.5
          result.warning = 'High sodium - May affect blood pressure'
          result.con = 'High sodium content'
        } else if (value <= threshold.low) {
          result.scoreImpact = 0.5
          result.pro = 'Low sodium content'
        }
        break
        
      case 'protein':
        if (value >= threshold.high) {
          result.scoreImpact = 1
          result.pro = 'Good protein source'
        }
        break
        
      case 'fiber':
        if (value >= threshold.high) {
          result.scoreImpact = 1.5
          result.pro = 'High fiber content'
        } else if (value <= threshold.low) {
          result.con = 'Low fiber content'
        }
        break
    }

    return result
  }

  analyzeIngredients(ingredients) {
    const badCount = ingredients.filter(i => i.rating === 'bad').length
    const goodCount = ingredients.filter(i => i.rating === 'good').length
    
    let score = 5.0
    const pros = []
    const cons = []

    if (badCount > goodCount) {
      score -= badCount * 0.5
      cons.push('Contains concerning ingredients')
    }
    
    if (goodCount > 0) {
      score += goodCount * 0.3
      pros.push('Contains beneficial ingredients')
    }
    
    if (ingredients.length <= 5) {
      pros.push('Simple ingredient list')
    }

    return { score: Math.max(0, Math.min(10, score)), pros, cons }
  }

  getHealthLabel(rating) {
    if (rating >= 7) return 'Healthy'
    if (rating >= 4) return 'Moderate'
    return 'Unhealthy'
  }

  getDataUsed(nutritionData, ingredients) {
    if (nutritionData && ingredients.length > 0) return 'Both'
    if (nutritionData) return 'Nutrition'
    return 'Ingredients'
  }

  determineCategory(text, nutritionData) {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('drink') || lowerText.includes('juice') || lowerText.includes('beverage')) {
      return 'Beverage'
    }
    if (lowerText.includes('snack') || lowerText.includes('chip') || lowerText.includes('cookie')) {
      return 'Snack'
    }
    return 'Packaged Food'
  }

  extractProductName(text) {
    // Simple product name extraction - first line that's not nutrition info
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    for (const line of lines) {
      if (!line.match(/nutrition|ingredients|calories|fat|sugar|sodium/i) && line.length < 50) {
        return line.trim()
      }
    }
    return null
  }

  generateFinalComment(score, warnings) {
    if (score >= 7) {
      return 'This product has a good nutritional profile and can be consumed regularly. Suitable for most people as part of a balanced diet.'
    } else if (score >= 4) {
      return 'This product is acceptable for occasional consumption. Monitor portion sizes and balance with healthier food choices.'
    } else {
      const mainConcern = warnings[0] ? warnings[0].split(' - ')[0] : 'nutritional concerns'
      return `This product should be consumed sparingly due to ${mainConcern}. Consider healthier alternatives for regular consumption.`
    }
  }

  classifyNutrient(nutrient, value) {
    const threshold = this.thresholds[nutrient]
    if (!threshold) return 'Moderate'
    
    if (nutrient === 'protein' || nutrient === 'fiber') {
      // Higher is better for these
      if (value >= threshold.high) return 'High'
      if (value >= threshold.low) return 'Moderate'
      return 'Low'
    } else {
      // Lower is better for these
      if (value >= threshold.high) return 'High'
      if (value >= threshold.low) return 'Moderate'
      return 'Low'
    }
  }
}

export default NutritionAnalyzer