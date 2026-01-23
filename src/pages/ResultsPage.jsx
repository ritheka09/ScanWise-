function ResultsPage({ data, onBack }) {
  console.log('ResultsPage data:', data)
  
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

          {/* 4. Nutrition Analysis (most important) */}
          {hasNutrition && (
            <div className="nutrition-section">
              <h3 className="section-title">Nutrition Analysis (per 100g)</h3>
              <div className="nutrition-grid">
                {Object.entries(data.nutritionFacts).map(([nutrient, value]) => {
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

          {/* 5. Health Warnings */}
          {data.healthWarnings && data.healthWarnings.length > 0 && (
            <div className="health-warnings">
              <h3 className="section-title">⚠️ Health Warnings</h3>
              <div className="warnings-list">
                {data.healthWarnings.map((warning, index) => (
                  <div key={index} className="warning-item">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Pros & Cons Summary */}
          {data.prosAndCons && (
            <div className="pros-cons">
              <div className="pros">
                <h4 className="pros-title">✓ Pros</h4>
                <ul className="pros-list">
                  {(data.prosAndCons.pros || []).map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="cons">
                <h4 className="cons-title">✗ Cons</h4>
                <ul className="cons-list">
                  {(data.prosAndCons.cons || []).map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 2. Overall Health Rating - Moved here */}
          <div className="health-rating">
            <h3 className="section-title">Health Rating</h3>
            <div className="rating-display">
              <span className="rating-score">{data.overallRating || 5}</span>
              <span className="rating-scale">/10</span>
            </div>
            <div className={`health-label ${(data.healthLabel || 'moderate').toLowerCase()}`}>
              {data.healthLabel || 'Moderate'}
            </div>
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
                    <span className="metadata-label">OCR Confidence:</span>
                    <span className={`confidence-value ${getConfidenceClass(data.ocrConfidence)}`}>
                      {data.ocrConfidence ? Math.round(data.ocrConfidence * 100) : 'Unknown'}%
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Analysis Confidence:</span>
                    <span className={`confidence-level ${data.confidenceLevel || 'medium'}`}>
                      {(data.confidenceLevel || 'medium').charAt(0).toUpperCase() + (data.confidenceLevel || 'medium').slice(1)}
                    </span>
                  </div>
                  {data.extractedFields && data.extractedFields.length > 0 && (
                    <div className="metadata-item">
                      <span className="metadata-label">Extracted Fields:</span>
                      <span className="extracted-fields">{data.extractedFields.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <details className="raw-text-details">
                  <summary>View Extracted Text</summary>
                  <div className="raw-text">
                    {data.rawText}
                  </div>
                </details>
                
                {data.analysisNotes && data.analysisNotes.length > 0 && (
                  <div className="analysis-notes">
                    <h4>Analysis Notes:</h4>
                    <ul>
                      {data.analysisNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {data.analysisWarning && (
                  <div className="analysis-warning">
                    ⚠️ {data.analysisWarning}
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
    // Higher is better
    if (value >= threshold.high) return 'High'
    if (value >= threshold.low) return 'Moderate'
    return 'Low'
  } else {
    // Lower is better
    if (value >= threshold.high) return 'High'
    if (value >= threshold.low) return 'Moderate'
    return 'Low'
  }
}

export default ResultsPage