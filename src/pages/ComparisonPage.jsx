import { EnhancementService } from '../services/enhancementService'

function ComparisonPage({ product1, product2, onBack }) {
  if (!product1 || !product2) {
    return (
      <div className="comparison-page">
        <button className="floating-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="comparison-content">
          <h2>Product Comparison</h2>
          <p>Please select two products to compare</p>
        </div>
      </div>
    )
  }

  const comparison = EnhancementService.compareProducts(product1, product2)

  const getWinnerClass = (metric) => {
    const winner = comparison.winner[metric]
    if (winner === 'tie') return 'tie'
    return winner
  }

  const formatValue = (value, metric) => {
    if (!value) return 'N/A'
    if (metric === 'calories') return `${value} kcal`
    if (metric === 'sodium') return `${value} mg`
    return `${value} g`
  }

  return (
    <div className="comparison-page">
      <button className="floating-back-btn" onClick={onBack}>
        ← Back
      </button>
      
      <div className="comparison-content">
        <h2>Product Comparison</h2>
        
        {/* Product Headers */}
        <div className="comparison-header">
          <div className="product-header">
            <h3>{product1.product.name}</h3>
            <p>{product1.product.brand}</p>
            <div className={`rating-badge ${getWinnerClass('overall')}`}>
              ⭐ {product1.overallRating.toFixed(1)}/5
            </div>
          </div>
          <div className="vs-divider">VS</div>
          <div className="product-header">
            <h3>{product2.product.name}</h3>
            <p>{product2.product.brand}</p>
            <div className={`rating-badge ${getWinnerClass('overall')}`}>
              ⭐ {product2.overallRating.toFixed(1)}/5
            </div>
          </div>
        </div>

        {/* Nutrition Comparison */}
        <div className="comparison-table">
          <div className="comparison-row header">
            <div className="metric-name">Metric</div>
            <div className="product-value">{product1.product.name}</div>
            <div className="product-value">{product2.product.name}</div>
            <div className="winner">Better</div>
          </div>
          
          {['calories', 'sugar', 'saturatedFat', 'sodium', 'protein', 'fiber'].map(metric => (
            <div key={metric} className="comparison-row">
              <div className="metric-name">
                {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
              </div>
              <div className={`product-value ${getWinnerClass(metric) === 'product1' ? 'winner' : ''}`}>
                {formatValue(product1.nutritionFacts[metric], metric)}
              </div>
              <div className={`product-value ${getWinnerClass(metric) === 'product2' ? 'winner' : ''}`}>
                {formatValue(product2.nutritionFacts[metric], metric)}
              </div>
              <div className="winner">
                {getWinnerClass(metric) === 'tie' ? '🤝 Tie' : 
                 getWinnerClass(metric) === 'product1' ? '👈 Left' : '👉 Right'}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Winner */}
        <div className="overall-winner">
          <h3>Overall Winner</h3>
          {comparison.winner.overall === 'tie' ? (
            <p>🤝 It's a tie! Both products have similar nutritional profiles.</p>
          ) : (
            <p>🏆 <strong>
              {comparison.winner.overall === 'product1' ? product1.product.name : product2.product.name}
            </strong> is the healthier choice overall.</p>
          )}
        </div>

        <button className="scan-another-btn" onClick={onBack}>
          🔍 Scan Another Product
        </button>
      </div>
    </div>
  )
}

export default ComparisonPage