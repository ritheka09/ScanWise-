import { useUserProfile } from '../contexts/UserProfileContext'
import { evaluateProductForUser, getVerdictDisplay } from '../utils/productSuitability'
import { getRecommendedAlternatives } from '../utils/recommendationsEngine'
import { scanHistoryService } from '../services/scanHistoryService'
import { useAuth } from '../contexts/AuthContext'

function ResultsPage({ data, onBack, onCompare }) {
  const { userProfile } = useUserProfile()
  const { user } = useAuth()
  
  console.log('ResultsPage data:', data)
  console.log('RESULTS_PAGE_SOURCE:', data?.analysisSource)
  
  // Evaluate product suitability for the user
  let suitabilityEvaluation = null
  let recommendations = null
  
  if (userProfile?.healthProfile && data) {
    try {
      // Transform data to match expected format
      const productData = {
        productName: data.product?.name || 'Unknown Product',
        sugar: data.nutritionFacts?.sugar || 'N/A',
        salt: data.nutritionFacts?.sodium ? (data.nutritionFacts.sodium / 1000).toFixed(1) : 'N/A', // Convert mg to g
        fat: data.nutritionFacts?.saturatedFat || 'N/A',
        calories: data.nutritionFacts?.calories || 'N/A',
        ingredients: data.ingredients?.map(ing => ing.name).join(', ') || ''
      }
      
      suitabilityEvaluation = evaluateProductForUser(productData, userProfile.healthProfile)
      console.log('🎯 Product suitability evaluation:', suitabilityEvaluation)
      console.log('📊 Product data used:', productData)
      console.log('👤 Health profile used:', userProfile.healthProfile)
      
      // Get recommendations if product is not "good"
      if (suitabilityEvaluation.verdict !== 'good') {
        recommendations = getRecommendedAlternatives(productData, userProfile.healthProfile)
        console.log('💡 Generated recommendations:', recommendations)
      }
      
      // Save scan to history (non-blocking)
      if (user && suitabilityEvaluation) {
        // Calculate risk levels from nutrition values
        const sugarValue = parseFloat(productData.sugar) || 0
        const saltValue = parseFloat(productData.salt) || 0
        
        const sugarRiskLevel = sugarValue > 15 ? 'high' : sugarValue > 5 ? 'medium' : 'low'
        const saltRiskLevel = saltValue > 1.5 ? 'high' : saltValue > 0.3 ? 'medium' : 'low'
        
        const scanData = {
          productName: data.product?.name || 'Unknown Product',
          brand: data.product?.brand || 'Unknown Brand',
          score: suitabilityEvaluation.score || 0,
          verdict: suitabilityEvaluation.verdict || 'moderate',
          sugarRisk: sugarRiskLevel,
          saltRisk: saltRiskLevel,
          productData: data
        }
        scanHistoryService.saveScan(user.uid, scanData).then(() => {
          console.log('✅ Scan saved to history successfully')
        }).catch(err => {
          console.error('Failed to save scan history:', err)
        })
      }
    } catch (error) {
      console.error('❌ Error evaluating product suitability:', error)
    }
  }
  
  if (!data) {
    console.log('No data provided to ResultsPage')
    return (
      <div className="results-page">
        <button className="floating-back-btn" onClick={onBack}>
          ← Back to Scan
        </button>
        <div className="results-content">
          <div className="product-overview">
            <h2 className="product-name">No Data</h2>
            <p className="product-category">Please try scanning again</p>
          </div>
        </div>
      </div>
    )
  }

  try {
    const hasIngredients = data.ingredients && data.ingredients.length > 0
    const hasNutrition = data.nutritionFacts && Object.keys(data.nutritionFacts).length > 0

    return (
      <div className="results-page">
        <button className="floating-back-btn" onClick={onBack}>
          ← Back to Scan
        </button>
        
        <div className="results-content">
          {/* 1. Product Overview */}
          <div className="product-overview">
            <h2 className="product-name">{data.product?.name || 'Unknown Product'}</h2>
            <p className="product-category">{data.product?.category || 'Food Product'}</p>
            <p className="data-used">Analysis based on: {data.product?.dataUsed || 'Available data'}</p>
          </div>

          {/* Personalized Suitability Assessment */}
          {suitabilityEvaluation && (
            <div className="suitability-section">
              <h3 className="section-title">⚙ Personalized Assessment</h3>
              
              {suitabilityEvaluation.reasons.length > 0 && (
                <div className="suitability-reasons">
                  <ul className="reasons-list">
                    {suitabilityEvaluation.reasons.map((reason, index) => (
                      <li key={index} className="reason-item">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}


          {!userProfile?.healthProfile && (
            <div className="quiz-prompt-section">
              <h3 className="section-title">⚙ Get Personalized Recommendations</h3>
              <div className="quiz-prompt-card">
                <p>Complete your health profile quiz to get personalized product recommendations!</p>
                <button 
                  className="quiz-prompt-btn"
                  onClick={() => window.location.reload()}
                >
                  Complete Health Quiz
                </button>
              </div>
            </div>
          )}
          
          <div className="data-quality-section">
            <h3 className="section-title">Data Confidence</h3>
            <div className={`quality-indicator ${data.dataQuality}`}>
              <span className="quality-badge">
                {data.dataQuality === 'high' ? '🟢 High' : 
                 data.dataQuality === 'medium' ? '🟡 Medium' : '🔴 Low'}
              </span>
              <span className="quality-text">
                {data.dataQuality === 'high' ? 'Complete product information available' :
                 data.dataQuality === 'medium' ? 'Some product information missing' :
                 'Limited product information - verify with product label'}
              </span>
            </div>
          </div>

          {hasIngredients && (
            <div className="ingredients-section">
              <h3 className="section-title">Ingredient Analysis</h3>
              <div className="ingredients-table">
                {data.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-row">
                    <div className="ingredient-info">
                      <span className="ingredient-name">{ingredient.name || 'Unknown'}</span>
                      {ingredient.commonName && ingredient.commonName !== ingredient.name && (
                        <span className="ingredient-common">({ingredient.commonName})</span>
                      )}
                    </div>
                    <div className="ingredient-quantity">{ingredient.quantity || 'Not specified'}</div>
                    <div className={`ingredient-rating ${ingredient.rating || 'moderate'}`}>
                      {(ingredient.rating || 'moderate').charAt(0).toUpperCase() + (ingredient.rating || 'moderate').slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.allergens && data.allergens.length > 0 && (
            <div className="allergen-section">
              <h3 className="section-title">⚠️ Allergen Information</h3>
              <div className="allergen-list">
                {data.allergens.map((allergen, index) => (
                  <span key={index} className="allergen-tag">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasNutrition && (
            <div className="nutrition-section">
              <h3 className="section-title">Nutrition Analysis (per 100g)</h3>
              <div className="nutrition-grid">
                {Object.entries(data.nutritionFacts).map(([nutrient, value]) => {
                  if (value === null) {
                    return (
                      <div key={nutrient} className="nutrition-item">
                        <div className="nutrient-name">{formatNutrientName(nutrient)}</div>
                        <div className="nutrient-value not-detected">Not detected</div>
                        <div className="nutrient-level unknown">
                          Unknown
                        </div>
                      </div>
                    )
                  }
                  
                  const classification = classifyNutrient(nutrient, value)
                  return (
                    <div key={nutrient} className="nutrition-item">
                      <div className="nutrient-name">{formatNutrientName(nutrient)}</div>
                      <div className="nutrient-value">{value}{getNutrientUnit(nutrient)}</div>
                      <div className={`nutrient-level ${classification.toLowerCase()}`}>
                        {classification}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="health-rating">
            <h3 className="section-title">Health Rating</h3>
            <div className="rating-display">
              <span className="rating-score">{data.overallRating ? data.overallRating.toFixed(1) : '5.0'}</span>
              <span className="rating-scale">/5</span>
            </div>
            <div className={`health-label ${(data.healthLabel || 'moderate').toLowerCase()}`}>
              {data.healthLabel || 'Moderate'}
            </div>
            {data.healthExplanation && (
              <div className="health-explanation">
                <h4>Why this rating?</h4>
                <p>{data.healthExplanation}</p>
              </div>
            )}
          </div>

          {recommendations && recommendations.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3 className="section-title">★ Better choices for you</h3>
              <div className="recommendations-grid">
                {recommendations.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <h4 className="recommendation-title">{rec.title}</h4>
                    <p className="recommendation-example">{rec.example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.rawText && (
            <div className="raw-ocr-section">
              <h3 className="section-title">Analysis Details</h3>
              <div className="raw-ocr-content">
                <div className="ocr-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Analysis Method:</span>
                    <span className="metadata-value">{data.analysisMethod || 'OCR'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Confidence Level:</span>
                    <span className={`confidence-level ${data.confidence || 'medium'}`}>
                      {(data.confidence || 'medium').charAt(0).toUpperCase() + (data.confidence || 'medium').slice(1)}
                    </span>
                  </div>
                </div>
                
                <details className="raw-text-details">
                  <summary>View Extracted Text</summary>
                  <div className="raw-text">
                    {data.rawText}
                  </div>
                </details>
                
                {data.normalizedText && (
                  <details className="raw-text-details">
                    <summary>View Normalized Text</summary>
                    <div className="raw-text">
                      {data.normalizedText}
                    </div>
                  </details>
                )}
                
                {data.warning && (
                  <div className="analysis-warning">
                    ⚠️ {data.warning}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. Navigation */}
          <div className="navigation-buttons">
            <button className="scan-another-btn" onClick={onBack}>
              ↻ Scan Another Product
            </button>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error rendering ResultsPage:', error)
    return (
      <div className="results-page">
        <button className="floating-back-btn" onClick={onBack}>
          ← Back to Scan
        </button>
        <div className="results-content">
          <div className="product-overview">
            <h2 className="product-name">Error</h2>
            <p className="product-category">Something went wrong displaying results</p>
            <p className="data-used">Please try scanning again</p>
          </div>
        </div>
      </div>
    )
  }
}

// Helper functions
function extractFlags(reasons) {
  const flags = []
  reasons.forEach(reason => {
    if (reason.includes('sugar')) flags.push('high_sugar')
    if (reason.includes('sodium') || reason.includes('salt')) flags.push('high_sodium')
    if (reason.includes('fat')) flags.push('high_fat')
    if (reason.includes('allergen') || reason.includes('allergy')) flags.push('allergens')
    if (reason.includes('calorie')) flags.push('high_calories')
    if (reason.includes('diet') || reason.includes('vegetarian') || reason.includes('vegan')) flags.push('diet_incompatible')
  })
  return flags
}

function getConfidenceClass(confidence) {
  if (!confidence) return 'unknown'
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

function formatNutrientName(nutrient) {
  const names = {
    calories: 'Calories',
    sugar: 'Sugar',
    saturatedFat: 'Saturated Fat',
    sodium: 'Sodium',
    protein: 'Protein',
    fiber: 'Fiber'
  }
  return names[nutrient] || nutrient
}

function getNutrientUnit(nutrient) {
  if (nutrient === 'calories') return ' kcal'
  if (nutrient === 'sodium') return ' mg'
  return ' g'
}

function classifyNutrient(nutrient, value) {
  const thresholds = {
    calories: { low: 150, high: 400 },
    sugar: { low: 5, high: 15 },
    saturatedFat: { low: 1.5, high: 5 },
    sodium: { low: 120, high: 600 },
    protein: { low: 5, high: 15 },
    fiber: { low: 3, high: 6 }
  }
  
  const threshold = thresholds[nutrient]
  if (!threshold) return 'Moderate'
  
  if (nutrient === 'protein' || nutrient === 'fiber') {
    // Higher is better for protein and fiber
    if (value >= threshold.high) return 'High'
    if (value >= threshold.low) return 'Moderate'
    return 'Low'
  } else {
    // Lower is better for calories, sugar, saturated fat, sodium
    if (value >= threshold.high) return 'High'
    if (value >= threshold.low) return 'Moderate'
    return 'Low'
  }
}

export default ResultsPage