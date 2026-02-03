/**
 * Smart Recommendation Engine - Step 5
 * Suggests healthier alternatives when products are "moderate" or "avoid"
 */

// Product category mappings for better recommendations
const PRODUCT_CATEGORIES = {
  snacks: ['chips', 'crackers', 'cookies', 'candy', 'chocolate', 'nuts', 'popcorn'],
  beverages: ['soda', 'juice', 'drink', 'cola', 'energy', 'sports'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
  bread: ['bread', 'bagel', 'muffin', 'roll', 'toast'],
  cereal: ['cereal', 'granola', 'oats', 'muesli'],
  sauce: ['sauce', 'dressing', 'ketchup', 'mayo', 'mustard'],
  frozen: ['frozen', 'pizza', 'meal', 'dinner'],
  meat: ['chicken', 'beef', 'pork', 'turkey', 'ham', 'bacon']
}

/**
 * Generate personalized recommendations for healthier alternatives
 * @param {Object} productData - Product nutrition data
 * @param {Object} healthProfile - User's health profile
 * @returns {Object} Recommendations object
 */
export function getRecommendedAlternatives(productData, healthProfile) {
  const recommendations = []
  
  // Analyze nutrition issues and generate recommendations
  const sugarIssue = analyzeSugarIssue(productData, healthProfile)
  if (sugarIssue) recommendations.push(sugarIssue)
  
  const saltIssue = analyzeSaltIssue(productData, healthProfile)
  if (saltIssue) recommendations.push(saltIssue)
  
  const fatIssue = analyzeFatIssue(productData)
  if (fatIssue) recommendations.push(fatIssue)
  
  const allergenIssue = analyzeAllergenIssue(productData, healthProfile)
  if (allergenIssue) recommendations.push(allergenIssue)
  
  const dietIssue = analyzeDietIssue(productData, healthProfile)
  if (dietIssue) recommendations.push(dietIssue)
  
  const calorieIssue = analyzeCalorieIssue(productData, healthProfile)
  if (calorieIssue) recommendations.push(calorieIssue)
  
  // Add general category-based recommendation if no specific issues found
  if (recommendations.length === 0) {
    const generalRec = getGeneralRecommendation(productData)
    if (generalRec) recommendations.push(generalRec)
  }
  
  return { recommendations }
}

/**
 * Analyze sugar content and suggest alternatives
 */
function analyzeSugarIssue(productData, healthProfile) {
  const sugar = parseFloat(productData.sugar)
  if (isNaN(sugar) || sugar < 10) return null
  
  const category = detectProductCategory(productData.productName)
  
  return {
    title: "🍯 Try a lower-sugar option",
    reason: `This product contains ${sugar}g of sugar per 100g`,
    example: getSugarAlternative(category)
  }
}

/**
 * Analyze salt content and suggest alternatives
 */
function analyzeSaltIssue(productData, healthProfile) {
  const salt = parseFloat(productData.salt)
  if (isNaN(salt) || salt < 1.0) return null
  
  const category = detectProductCategory(productData.productName)
  
  return {
    title: "🧂 Look for low-sodium versions",
    reason: `This product is high in sodium (${salt}g per 100g)`,
    example: getSaltAlternative(category)
  }
}

/**
 * Analyze fat content and suggest alternatives
 */
function analyzeFatIssue(productData) {
  const fat = parseFloat(productData.fat)
  if (isNaN(fat) || fat < 10) return null
  
  const category = detectProductCategory(productData.productName)
  
  return {
    title: "🥑 Consider lower-fat alternatives",
    reason: `This product contains ${fat}g of saturated fat per 100g`,
    example: getFatAlternative(category)
  }
}

/**
 * Analyze allergens and suggest alternatives
 */
function analyzeAllergenIssue(productData, healthProfile) {
  if (!healthProfile.allergyFlags || healthProfile.allergyFlags.length === 0) return null
  
  const ingredients = productData.ingredients.toLowerCase()
  const foundAllergens = healthProfile.allergyFlags.filter(allergen => {
    const keywords = getAllergenKeywords(allergen)
    return keywords.some(keyword => ingredients.includes(keyword))
  })
  
  if (foundAllergens.length === 0) return null
  
  return {
    title: "🚫 Find allergen-free options",
    reason: `This product contains ${foundAllergens.join(', ')} which you're sensitive to`,
    example: getAllergenFreeAlternative(foundAllergens[0])
  }
}

/**
 * Analyze diet compatibility and suggest alternatives
 */
function analyzeDietIssue(productData, healthProfile) {
  if (healthProfile.dietType === 'non-vegetarian') return null
  
  const ingredients = productData.ingredients.toLowerCase()
  const hasAnimal = ['meat', 'beef', 'pork', 'chicken', 'fish', 'gelatin'].some(item => ingredients.includes(item))
  const hasDairy = ['milk', 'cheese', 'butter', 'cream', 'whey'].some(item => ingredients.includes(item))
  
  if (healthProfile.dietType === 'vegan' && (hasAnimal || hasDairy)) {
    return {
      title: "🌱 Try plant-based alternatives",
      reason: "This product contains animal ingredients",
      example: getVeganAlternative(productData.productName)
    }
  }
  
  if (healthProfile.dietType === 'vegetarian' && hasAnimal) {
    return {
      title: "🥬 Look for vegetarian options",
      reason: "This product contains meat or fish",
      example: getVegetarianAlternative(productData.productName)
    }
  }
  
  return null
}

/**
 * Analyze calorie content for sedentary users
 */
function analyzeCalorieIssue(productData, healthProfile) {
  if (healthProfile.lifestyle !== 'sedentary') return null
  
  const calories = parseFloat(productData.calories)
  if (isNaN(calories) || calories < 300) return null
  
  return {
    title: "⚡ Consider lighter options",
    reason: `This product is quite calorie-dense (${calories} kcal per 100g)`,
    example: "Try portion-controlled versions or lighter alternatives with similar taste"
  }
}

/**
 * Get general recommendation based on product category
 */
function getGeneralRecommendation(productData) {
  const category = detectProductCategory(productData.productName)
  
  const generalTips = {
    snacks: {
      title: "🥜 Try healthier snacking",
      reason: "Processed snacks can be high in additives",
      example: "Consider nuts, seeds, or fresh fruit for natural energy"
    },
    beverages: {
      title: "💧 Stay naturally hydrated",
      reason: "Many drinks contain added sugars",
      example: "Try sparkling water with fresh fruit or herbal teas"
    },
    frozen: {
      title: "🥘 Fresh is often better",
      reason: "Frozen meals can be high in sodium and preservatives",
      example: "Consider meal prep with fresh ingredients when possible"
    }
  }
  
  return generalTips[category] || null
}

/**
 * Detect product category from name
 */
function detectProductCategory(productName) {
  const name = productName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(PRODUCT_CATEGORIES)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category
    }
  }
  
  return 'general'
}

/**
 * Get sugar-specific alternatives by category
 */
function getSugarAlternative(category) {
  const alternatives = {
    beverages: "Try unsweetened versions or dilute with sparkling water",
    snacks: "Look for products sweetened with dates or stevia",
    cereal: "Choose whole grain cereals with <5g sugar per serving",
    dairy: "Try plain yogurt and add fresh fruit yourself",
    default: "Look for 'no added sugar' or 'reduced sugar' versions"
  }
  
  return alternatives[category] || alternatives.default
}

/**
 * Get salt-specific alternatives by category
 */
function getSaltAlternative(category) {
  const alternatives = {
    snacks: "Try unsalted nuts or lightly salted versions",
    sauce: "Look for 'low sodium' versions or make your own",
    frozen: "Choose meals with <600mg sodium per serving",
    bread: "Try fresh bakery bread which often has less sodium",
    default: "Look for 'low sodium' or 'reduced salt' versions"
  }
  
  return alternatives[category] || alternatives.default
}

/**
 * Get fat-specific alternatives by category
 */
function getFatAlternative(category) {
  const alternatives = {
    dairy: "Try low-fat or fat-free versions",
    snacks: "Choose baked instead of fried options",
    meat: "Look for lean cuts or plant-based proteins",
    frozen: "Choose meals with <10g total fat",
    default: "Look for 'reduced fat' or 'light' versions"
  }
  
  return alternatives[category] || alternatives.default
}

/**
 * Get allergen-free alternatives
 */
function getAllergenFreeAlternative(allergen) {
  const alternatives = {
    nuts: "Try seed-based products like sunflower or pumpkin seeds",
    dairy: "Look for oat, almond, or coconut-based alternatives",
    gluten: "Choose certified gluten-free versions made with rice or quinoa",
    soy: "Try pea protein or hemp-based alternatives",
    eggs: "Look for plant-based binding alternatives",
    default: "Check specialty allergen-free brands in health food sections"
  }
  
  return alternatives[allergen] || alternatives.default
}

/**
 * Get vegan alternatives
 */
function getVeganAlternative(productName) {
  if (productName.toLowerCase().includes('milk')) return "Try oat, almond, or soy milk"
  if (productName.toLowerCase().includes('cheese')) return "Look for cashew or nutritional yeast-based cheeses"
  if (productName.toLowerCase().includes('meat')) return "Try plant-based proteins like lentils, tofu, or tempeh"
  return "Look for certified vegan alternatives in the plant-based section"
}

/**
 * Get vegetarian alternatives
 */
function getVegetarianAlternative(productName) {
  if (productName.toLowerCase().includes('meat')) return "Try plant-based meat alternatives or legume-based proteins"
  return "Look for vegetarian-certified versions of this product"
}

/**
 * Get allergen keywords for detection
 */
function getAllergenKeywords(allergen) {
  const keywords = {
    nuts: ['nuts', 'almond', 'walnut', 'pecan', 'cashew', 'peanut'],
    dairy: ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein'],
    gluten: ['wheat', 'gluten', 'barley', 'rye'],
    soy: ['soy', 'soya', 'tofu'],
    eggs: ['egg', 'albumin'],
    shellfish: ['shrimp', 'crab', 'lobster', 'shellfish']
  }
  
  return keywords[allergen] || [allergen]
}