/**
 * Generate health profile from quiz answers using rule-based logic
 * @param {Object} quizAnswers - Raw quiz answers keyed by question id
 * @returns {Object} Structured health profile
 */
export function generateHealthProfile(quizAnswers) {
  // Base profile with default values
  const profile = {
    sugarRisk: 'low',
    saltRisk: 'low',
    allergyFlags: [],
    dietType: 'non-vegetarian',
    lifestyle: 'sedentary'
  }

  // === Sugar Risk Evaluation ===
  const isHighSugar = quizAnswers.sugarSensitivity === 'high' || quizAnswers.diabetesRisk === 'high'
  const isMediumSugar = quizAnswers.sugarSensitivity === 'medium' || quizAnswers.diabetesRisk === 'medium'
  
  if (isHighSugar) {
    profile.sugarRisk = 'high'
  } else if (isMediumSugar) {
    profile.sugarRisk = 'medium'
  }

  // === Salt Risk Evaluation ===
  const isHighSalt = quizAnswers.saltSensitivity === 'high' || quizAnswers.bloodPressure === 'high'
  const isMediumSalt = quizAnswers.saltSensitivity === 'medium' || quizAnswers.bloodPressure === 'medium'
  
  if (isHighSalt) {
    profile.saltRisk = 'high'
  } else if (isMediumSalt) {
    profile.saltRisk = 'medium'
  }

  // === Allergy Detection ===
  const hasAllergy = quizAnswers.allergies && quizAnswers.allergies !== 'none'
  
  if (hasAllergy) {
    profile.allergyFlags = [quizAnswers.allergies]
  }

  // === Diet Type Mapping ===
  const isVegetarian = quizAnswers.dietaryPreference === 'vegetarian'
  const isVegan = quizAnswers.dietaryPreference === 'vegan'
  
  if (isVegan) {
    profile.dietType = 'vegan'
  } else if (isVegetarian) {
    profile.dietType = 'vegetarian'
  } else {
    profile.dietType = 'non-vegetarian'
  }

  // === Lifestyle Mapping ===
  const isHighActivity = quizAnswers.activityLevel === 'high' || quizAnswers.activityLevel === 'athlete'
  const isModerateActivity = quizAnswers.activityLevel === 'light' || quizAnswers.activityLevel === 'moderate'
  
  if (isHighActivity) {
    profile.lifestyle = 'active'
  } else if (isModerateActivity) {
    profile.lifestyle = 'moderate'
  } else {
    profile.lifestyle = 'sedentary'
  }

  return profile
}
