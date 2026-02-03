/**
 * Product Suitability Engine - Rule-Based Evaluation
 * Evaluates whether a product is suitable for a user based on their health profile
 */

// Nutrition thresholds (per 100g)
const NUTRITION_THRESHOLDS = {
  SUGAR: {
    LOW: 5,
    HIGH: 15
  },
  SALT: {
    LOW: 0.3,
    HIGH: 1.5
  },
  SATURATED_FAT: {
    LOW: 1.5,
    HIGH: 5
  },
  CALORIES: {
    LOW: 100,
    HIGH: 400
  }
}

// Common allergen keywords to detect in ingredients
const ALLERGEN_KEYWORDS = {
  nuts: ['nuts', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'peanut'],
  gluten: ['wheat', 'gluten', 'barley', 'rye', 'oats', 'flour'],
  dairy: ['milk', 'dairy', 'lactose', 'cheese', 'butter', 'cream', 'whey', 'casein'],
  soy: ['soy', 'soya', 'soybean', 'tofu'],
  eggs: ['egg', 'eggs', 'albumin', 'lecithin'],
  shellfish: ['shrimp', 'crab', 'lobster', 'shellfish', 'prawns', 'scallops']
}

/**
 * Main evaluation function - determines product suitability for user
 * @param {Object} productData - Nutrition data from barcode scan
 * @param {Object} healthProfile - User's health profile from quiz
 * @returns {Object} Evaluation result with verdict and reasons
 */
export function evaluateProductForUser(productData, healthProfile) {
  console.log('🔍 Evaluating product suitability:', { productData, healthProfile })
  
  const reasons = []
  let score = 100 // Start with perfect score, deduct points for issues
  
  // 1. CRITICAL CHECK: Allergen detection (immediate avoid)
  const allergenCheck = checkAllergens(productData.ingredients, healthProfile.allergyFlags)
  if (allergenCheck.hasAllergens) {
    return {
      verdict: 'avoid',
      reasons: allergenCheck.reasons,
      score: 0
    }
  }
  
  // 2. Sugar evaluation based on user's sugar risk
  const sugarEval = evaluateSugar(productData.sugar, healthProfile.sugarRisk)
  score -= sugarEval.penalty
  reasons.push(...sugarEval.reasons)
  
  // 3. Salt evaluation based on user's salt risk
  const saltEval = evaluateSalt(productData.salt, healthProfile.saltRisk)
  score -= saltEval.penalty
  reasons.push(...saltEval.reasons)
  
  // 4. Fat evaluation (general health consideration)
  const fatEval = evaluateFat(productData.fat)
  score -= fatEval.penalty
  reasons.push(...fatEval.reasons)
  
  // 5. Calorie evaluation based on lifestyle
  const calorieEval = evaluateCalories(productData.calories, healthProfile.lifestyle)
  score -= calorieEval.penalty
  reasons.push(...calorieEval.reasons)
  
  // 6. Diet type compatibility
  const dietEval = evaluateDietCompatibility(productData.ingredients, healthProfile.dietType)
  score -= dietEval.penalty
  reasons.push(...dietEval.reasons)
  
  // Determine final verdict based on score
  const verdict = determineVerdict(score)
  
  console.log('✅ Evaluation complete:', { verdict, score, reasons })
  
  return {
    verdict,
    reasons: reasons.filter(reason => reason), // Remove empty reasons
    score: Math.max(0, score)
  }
}

/**
 * Check for allergens in product ingredients
 */
function checkAllergens(ingredients, allergyFlags) {
  if (!ingredients || !allergyFlags || allergyFlags.length === 0) {
    return { hasAllergens: false, reasons: [] }
  }
  
  const ingredientText = ingredients.toLowerCase()
  const foundAllergens = []
  
  allergyFlags.forEach(allergen => {
    const keywords = ALLERGEN_KEYWORDS[allergen] || [allergen]
    const found = keywords.some(keyword => ingredientText.includes(keyword.toLowerCase()))
    
    if (found) {
      foundAllergens.push(allergen)
    }
  })
  
  if (foundAllergens.length > 0) {
    return {
      hasAllergens: true,
      reasons: [`⚠️ Contains ${foundAllergens.join(', ')} - matches your allergy profile`]
    }
  }
  
  return { hasAllergens: false, reasons: [] }
}

/**
 * Evaluate sugar content against user's sugar risk
 */
function evaluateSugar(sugar, sugarRisk) {
  if (!sugar || sugar === 'N/A' || isNaN(parseFloat(sugar))) {
    return { penalty: 0, reasons: [] }
  }
  
  const sugarValue = parseFloat(sugar)
  const reasons = []
  let penalty = 0
  
  if (sugarRisk === 'high') {
    if (sugarValue > NUTRITION_THRESHOLDS.SUGAR.LOW) {
      penalty = sugarValue > NUTRITION_THRESHOLDS.SUGAR.HIGH ? 40 : 25
      reasons.push(`🍯 High sugar content (${sugarValue}g) - not ideal for your sugar sensitivity`)
    }
  } else if (sugarRisk === 'medium') {
    if (sugarValue > NUTRITION_THRESHOLDS.SUGAR.HIGH) {
      penalty = 20
      reasons.push(`🍯 Very high sugar content (${sugarValue}g) - consume in moderation`)
    }
  } else {
    if (sugarValue > NUTRITION_THRESHOLDS.SUGAR.HIGH * 1.5) {
      penalty = 15
      reasons.push(`🍯 Extremely high sugar content (${sugarValue}g)`)
    }
  }
  
  return { penalty, reasons }
}

/**
 * Evaluate salt content against user's salt risk
 */
function evaluateSalt(salt, saltRisk) {
  if (!salt || salt === 'N/A' || isNaN(parseFloat(salt))) {
    return { penalty: 0, reasons: [] }
  }
  
  const saltValue = parseFloat(salt)
  const reasons = []
  let penalty = 0
  
  if (saltRisk === 'high') {
    if (saltValue > NUTRITION_THRESHOLDS.SALT.LOW) {
      penalty = saltValue > NUTRITION_THRESHOLDS.SALT.HIGH ? 40 : 25
      reasons.push(`🧂 High sodium content (${saltValue}g) - not suitable for your blood pressure profile`)
    }
  } else if (saltRisk === 'medium') {
    if (saltValue > NUTRITION_THRESHOLDS.SALT.HIGH) {
      penalty = 20
      reasons.push(`🧂 Very high sodium content (${saltValue}g) - monitor your intake`)
    }
  } else {
    if (saltValue > NUTRITION_THRESHOLDS.SALT.HIGH * 1.5) {
      penalty = 15
      reasons.push(`🧂 Extremely high sodium content (${saltValue}g)`)
    }
  }
  
  return { penalty, reasons }
}

/**
 * Evaluate fat content (general health consideration)
 */
function evaluateFat(fat) {
  if (!fat || fat === 'N/A' || isNaN(parseFloat(fat))) {
    return { penalty: 0, reasons: [] }
  }
  
  const fatValue = parseFloat(fat)
  const reasons = []
  let penalty = 0
  
  if (fatValue > NUTRITION_THRESHOLDS.SATURATED_FAT.HIGH) {
    penalty = 15
    reasons.push(`🥓 High saturated fat content (${fatValue}g) - limit consumption`)
  } else if (fatValue > NUTRITION_THRESHOLDS.SATURATED_FAT.LOW * 2) {
    penalty = 8
    reasons.push(`🥓 Moderate fat content (${fatValue}g) - consume in moderation`)
  }
  
  return { penalty, reasons }
}

/**
 * Evaluate calories based on user's lifestyle
 */
function evaluateCalories(calories, lifestyle) {
  if (!calories || calories === 'N/A' || isNaN(parseFloat(calories))) {
    return { penalty: 0, reasons: [] }
  }
  
  const calorieValue = parseFloat(calories)
  const reasons = []
  let penalty = 0
  
  // Adjust thresholds based on activity level
  const activityMultiplier = lifestyle === 'active' ? 1.2 : lifestyle === 'moderate' ? 1.0 : 0.8
  const adjustedHighThreshold = NUTRITION_THRESHOLDS.CALORIES.HIGH * activityMultiplier
  
  if (calorieValue > adjustedHighThreshold) {
    penalty = lifestyle === 'sedentary' ? 20 : 10
    reasons.push(`⚡ High calorie content (${calorieValue} kcal) - ${lifestyle === 'sedentary' ? 'consider your activity level' : 'balance with your active lifestyle'}`)
  }
  
  return { penalty, reasons }
}

/**
 * Evaluate diet type compatibility
 */
function evaluateDietCompatibility(ingredients, dietType) {
  if (!ingredients || dietType === 'non-vegetarian') {
    return { penalty: 0, reasons: [] }
  }
  
  const ingredientText = ingredients.toLowerCase()
  const reasons = []
  let penalty = 0
  
  // Check for animal products
  const animalProducts = ['meat', 'beef', 'pork', 'chicken', 'fish', 'seafood', 'gelatin']
  const dairyProducts = ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose']
  
  if (dietType === 'vegan') {
    const hasAnimal = animalProducts.some(product => ingredientText.includes(product))
    const hasDairy = dairyProducts.some(product => ingredientText.includes(product))
    
    if (hasAnimal || hasDairy) {
      penalty = 50
      reasons.push(`🌱 Contains animal products - not suitable for vegan diet`)
    }
  } else if (dietType === 'vegetarian') {
    const hasAnimal = animalProducts.some(product => ingredientText.includes(product))
    
    if (hasAnimal) {
      penalty = 50
      reasons.push(`🥬 Contains meat/fish - not suitable for vegetarian diet`)
    }
  }
  
  return { penalty, reasons }
}

/**
 * Determine final verdict based on score
 */
function determineVerdict(score) {
  if (score >= 70) return 'good'
  if (score >= 40) return 'moderate'
  return 'avoid'
}

/**
 * Get verdict display properties for UI
 */
export function getVerdictDisplay(verdict) {
  const displays = {
    good: {
      emoji: '✅',
      label: 'Good for you',
      color: '#4caf50',
      bgColor: '#e8f5e8'
    },
    moderate: {
      emoji: '⚠️',
      label: 'Consume in moderation',
      color: '#ff9800',
      bgColor: '#fff8e1'
    },
    avoid: {
      emoji: '❌',
      label: 'Avoid',
      color: '#f44336',
      bgColor: '#ffebee'
    }
  }
  
  return displays[verdict] || displays.moderate
}