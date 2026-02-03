/**
 * Generate health profile from quiz answers using rule-based logic
 * @param {Object} quizAnswers - Raw quiz answers keyed by question id
 * @returns {Object} Structured health profile
 */
export function generateHealthProfile(quizAnswers) {
  // Extract key answers
  const sugarSensitivity = quizAnswers.sugarSensitivity || 'low'
  const saltSensitivity = quizAnswers.saltSensitivity || 'low'
  const diabetesRisk = quizAnswers.diabetesRisk || 'low'
  const bloodPressure = quizAnswers.bloodPressure || 'low'
  const allergies = quizAnswers.allergies || 'none'
  const dietaryPreference = quizAnswers.dietaryPreference || 'omnivore'
  const activityLevel = quizAnswers.activityLevel || 'sedentary'

  // Generate sugar risk level
  const sugarRisk = calculateSugarRisk(sugarSensitivity, diabetesRisk)
  
  // Generate salt risk level
  const saltRisk = calculateSaltRisk(saltSensitivity, bloodPressure)
  
  // Generate allergy flags
  const allergyFlags = generateAllergyFlags(allergies)
  
  // Map diet type
  const dietType = mapDietType(dietaryPreference)
  
  // Map lifestyle
  const lifestyle = mapLifestyle(activityLevel)

  return {
    sugarRisk,
    saltRisk,
    allergyFlags,
    dietType,
    lifestyle
  }
}

/**
 * Calculate sugar risk based on sensitivity and diabetes risk
 */
function calculateSugarRisk(sugarSensitivity, diabetesRisk) {
  if (sugarSensitivity === 'high' || diabetesRisk === 'high') return 'high'
  if (sugarSensitivity === 'medium' || diabetesRisk === 'medium') return 'medium'
  return 'low'
}

/**
 * Calculate salt risk based on sensitivity and blood pressure
 */
function calculateSaltRisk(saltSensitivity, bloodPressure) {
  if (saltSensitivity === 'high' || bloodPressure === 'high') return 'high'
  if (saltSensitivity === 'medium' || bloodPressure === 'medium') return 'medium'
  return 'low'
}

/**
 * Generate allergy flags array
 */
function generateAllergyFlags(allergies) {
  if (allergies === 'none') return []
  return [allergies]
}

/**
 * Map dietary preference to diet type
 */
function mapDietType(dietaryPreference) {
  switch (dietaryPreference) {
    case 'vegetarian': return 'vegetarian'
    case 'vegan': return 'vegan'
    default: return 'non-vegetarian'
  }
}

/**
 * Map activity level to lifestyle
 */
function mapLifestyle(activityLevel) {
  switch (activityLevel) {
    case 'sedentary':
    case 'light': return 'sedentary'
    case 'moderate': return 'moderate'
    case 'high':
    case 'athlete': return 'active'
    default: return 'sedentary'
  }
}