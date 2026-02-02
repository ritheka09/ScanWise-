// Demo file showcasing the new enhancement features
import { EnhancementService } from '../services/enhancementService'

// Example product data for testing
const sampleProduct1 = {
  barcode: '1234567890123',
  product: {
    name: 'Healthy Granola Bar',
    brand: 'NutriCorp',
    category: 'Snack Bar'
  },
  nutritionFacts: {
    calories: 150,
    sugar: 8,
    saturatedFat: 2,
    sodium: 120,
    protein: 5,
    fiber: 4
  },
  ingredients: [
    { name: 'Oats', riskLevel: 'low' },
    { name: 'Honey', riskLevel: 'medium' },
    { name: 'Almonds', riskLevel: 'low' }
  ],
  overallRating: 4.2
}

const sampleProduct2 = {
  barcode: '9876543210987',
  product: {
    name: 'Chocolate Cookie',
    brand: 'SweetTreats',
    category: 'Cookie'
  },
  nutritionFacts: {
    calories: 280,
    sugar: 18,
    saturatedFat: 8,
    sodium: 180,
    protein: 3,
    fiber: 1
  },
  ingredients: [
    { name: 'Refined Flour', riskLevel: 'medium' },
    { name: 'Palm Oil', riskLevel: 'high' },
    { name: 'High Fructose Corn Syrup', riskLevel: 'high' }
  ],
  overallRating: 2.1
}

// Demo functions to test the new features
export const demoEnhancements = {
  
  // 1. Test Data Quality Calculation
  testDataQuality: () => {
    console.log('=== Data Quality Demo ===')
    
    const quality1 = EnhancementService.calculateDataQuality(sampleProduct1)
    const quality2 = EnhancementService.calculateDataQuality(sampleProduct2)
    
    console.log(`Product 1 Data Quality: ${quality1}`)
    console.log(`Product 2 Data Quality: ${quality2}`)
    
    return { product1: quality1, product2: quality2 }
  },
  
  // 2. Test Health Explanation Generation
  testHealthExplanation: () => {
    console.log('=== Health Explanation Demo ===')
    
    const explanation1 = EnhancementService.generateHealthExplanation(
      sampleProduct1.overallRating, 
      sampleProduct1.nutritionFacts, 
      []
    )
    
    const explanation2 = EnhancementService.generateHealthExplanation(
      sampleProduct2.overallRating, 
      sampleProduct2.nutritionFacts, 
      []
    )
    
    console.log(`Product 1 Explanation: ${explanation1}`)
    console.log(`Product 2 Explanation: ${explanation2}`)
    
    return { product1: explanation1, product2: explanation2 }
  },
  
  // 3. Test Health Warnings Generation
  testHealthWarnings: () => {
    console.log('=== Health Warnings Demo ===')
    
    const warnings1 = EnhancementService.generateHealthWarnings(
      sampleProduct1.nutritionFacts, 
      sampleProduct1.ingredients
    )
    
    const warnings2 = EnhancementService.generateHealthWarnings(
      sampleProduct2.nutritionFacts, 
      sampleProduct2.ingredients
    )
    
    console.log('Product 1 Warnings:', warnings1)
    console.log('Product 2 Warnings:', warnings2)
    
    return { product1: warnings1, product2: warnings2 }
  },
  
  // 4. Test Product Comparison
  testProductComparison: () => {
    console.log('=== Product Comparison Demo ===')
    
    const comparison = EnhancementService.compareProducts(sampleProduct1, sampleProduct2)
    
    console.log('Comparison Result:', comparison)
    console.log(`Overall Winner: ${comparison.winner.overall}`)
    
    return comparison
  },
  
  // 5. Test Scan History Management
  testScanHistory: () => {
    console.log('=== Scan History Demo ===')
    
    // Save some products to history
    EnhancementService.saveScanHistory(sampleProduct1, sampleProduct1.barcode)
    EnhancementService.saveScanHistory(sampleProduct2, sampleProduct2.barcode)
    
    // Get history
    const history = EnhancementService.getScanHistory()
    
    console.log('Scan History:', history)
    console.log(`History Length: ${history.length}`)
    
    return history
  },
  
  // Run all demos
  runAllDemos: () => {
    console.log('🚀 Running All Enhancement Demos...\n')
    
    const results = {
      dataQuality: demoEnhancements.testDataQuality(),
      healthExplanations: demoEnhancements.testHealthExplanation(),
      healthWarnings: demoEnhancements.testHealthWarnings(),
      productComparison: demoEnhancements.testProductComparison(),
      scanHistory: demoEnhancements.testScanHistory()
    }
    
    console.log('\n✅ All demos completed!')
    return results
  }
}

// Usage example:
// import { demoEnhancements } from './demo/enhancementDemo'
// demoEnhancements.runAllDemos()

export default demoEnhancements