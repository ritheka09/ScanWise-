/**
 * Test file for Product Suitability Engine
 * Run this to verify the evaluation logic works correctly
 */

import { evaluateProductForUser, getVerdictDisplay } from '../utils/productSuitability.js'

// Test health profiles
const healthProfiles = {
  diabetic: {
    sugarRisk: 'high',
    saltRisk: 'medium',
    allergyFlags: [],
    dietType: 'non-vegetarian',
    lifestyle: 'sedentary'
  },
  hypertensive: {
    sugarRisk: 'low',
    saltRisk: 'high',
    allergyFlags: [],
    dietType: 'non-vegetarian',
    lifestyle: 'moderate'
  },
  allergic: {
    sugarRisk: 'low',
    saltRisk: 'low',
    allergyFlags: ['nuts', 'dairy'],
    dietType: 'vegetarian',
    lifestyle: 'active'
  },
  healthy: {
    sugarRisk: 'low',
    saltRisk: 'low',
    allergyFlags: [],
    dietType: 'non-vegetarian',
    lifestyle: 'active'
  }
}

// Test products
const testProducts = {
  healthyProduct: {
    productName: 'Organic Quinoa Salad',
    sugar: '2.1',
    salt: '0.4',
    fat: '1.2',
    calories: '180',
    ingredients: 'quinoa, vegetables, olive oil, herbs'
  },
  highSugarProduct: {
    productName: 'Chocolate Cake',
    sugar: '25.5',
    salt: '0.8',
    fat: '8.2',
    calories: '450',
    ingredients: 'flour, sugar, chocolate, butter, eggs'
  },
  highSaltProduct: {
    productName: 'Instant Noodles',
    sugar: '3.2',
    salt: '2.8',
    fat: '6.1',
    calories: '320',
    ingredients: 'wheat flour, palm oil, salt, msg, preservatives'
  },
  allergenProduct: {
    productName: 'Mixed Nuts Trail Mix',
    sugar: '8.5',
    salt: '0.6',
    fat: '15.2',
    calories: '380',
    ingredients: 'almonds, walnuts, cashews, peanuts, dried fruit'
  }
}

// Run tests
function runTests() {
  console.log('🧪 Testing Product Suitability Engine\\n')
  
  Object.entries(healthProfiles).forEach(([profileName, profile]) => {
    console.log(`👤 Testing profile: ${profileName.toUpperCase()}`)
    console.log('Profile:', profile)
    console.log('\\n')
    
    Object.entries(testProducts).forEach(([productName, product]) => {
      const evaluation = evaluateProductForUser(product, profile)
      const display = getVerdictDisplay(evaluation.verdict)
      
      console.log(`  📦 ${productName}:`)
      console.log(`    ${display.emoji} ${display.label} (Score: ${evaluation.score}/100)`)
      if (evaluation.reasons.length > 0) {
        evaluation.reasons.forEach(reason => {
          console.log(`    - ${reason}`)
        })
      }
      console.log('')
    })
    
    console.log('---\\n')
  })
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSuitabilityEngine = runTests
  console.log('💡 Run window.testSuitabilityEngine() in browser console to test')
}

export { runTests }