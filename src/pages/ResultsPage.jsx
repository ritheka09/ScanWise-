function ResultsPage({ data, onBack, onCompare }) {
  console.log('ResultsPage data:', data)
  console.log('RESULTS_PAGE_SOURCE:', data?.analysisSource)
  
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

          {/* Data Quality Indicator */}
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

          {/* 3. Ingredient Analysis (only if ingredients exist) */}
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

          {/* Allergen Warnings */}
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

          {/* 4. Nutrition Analysis (most important) */}
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

          {/* Health Alerts - moved after nutrition */}
          {data.personalizedWarnings && data.personalizedWarnings.length > 0 && (
            <div className="personalized-warnings">
              <h3 className="section-title">⚠️ Health Alerts</h3>
              <div className="warnings-grid">
                {data.personalizedWarnings.map((warning, index) => (
                  <div key={index} className={`warning-card ${warning.severity}`}>
                    <div className="warning-type">{warning.type.replace('-', ' ').toUpperCase()}</div>
                    <div className="warning-message">{warning.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Overall Health Rating with Explanation */}
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

          {/* 7. Final AI Comment */}
          <div className="final-comment">
            <h3 className="section-title">Recommendation</h3>
            <p className="comment-text">{data.finalComment || 'No specific recommendations available.'}</p>
          </div>

          {/* Raw OCR Data Section - Enhanced */}
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
              🔍 Scan Another Product
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