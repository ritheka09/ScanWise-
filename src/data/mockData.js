export const foodFacts = [
  "Avocados have more potassium than bananas! 🥑",
  "Honey never spoils - archaeologists found edible honey in Egyptian tombs! 🍯",
  "Carrots were originally purple, not orange! 🥕",
  "Bananas are berries, but strawberries aren't! 🍌",
  "Apples float in water because they're 25% air! 🍎",
  "Tomatoes have more genes than humans! 🍅",
  "Chocolate was once used as currency by the Aztecs! 🍫"
]

export const mockAnalysisResult = {
  "product": {
    "name": "NutriCrunch Choco Bites",
    "brand": "HealthNest",
    "category": "Packaged Snack / Biscuits"
  },
  "ingredients": [
    {
      "name": "Refined Wheat Flour",
      "commonName": "Maida",
      "quantity": "38%",
      "analysis": "moderate"
    },
    {
      "name": "Palm Oil",
      "commonName": "Vegetable Fat",
      "quantity": "18%",
      "analysis": "bad"
    },
    {
      "name": "Cocoa Solids",
      "commonName": "Chocolate Extract",
      "quantity": "6%",
      "analysis": "good"
    },
    {
      "name": "Invert Sugar Syrup",
      "commonName": "Liquid Sugar",
      "quantity": "14%",
      "analysis": "bad"
    }
  ],
  "insights": {
    "pros": [
      "Rich in antioxidants - Cocoa provides flavonoids that support heart health",
      "Natural emulsifier - Soy lecithin helps with nutrient absorption"
    ],
    "cons": [
      "High saturated fat - Palm oil increases bad cholesterol levels",
      "High sugar content - Liquid Sugar (14%) can cause blood sugar spikes",
      "Processed carbs - Refined flour lacks fiber and nutrients",
      "Artificial additives - Synthetic flavoring may cause allergic reactions"
    ]
  },
  "overallRating": 4,
  "finalComment": "This product can be consumed occasionally but is not suitable for regular intake due to high sugar and saturated fat content."
}

export const mockAnalysisResult2 = {
  product: {
    name: "Crunchy Chocolate Biscuits",
    category: "Snack",
    dataUsed: "Nutrition"
  },
  overallRating: 3.9,
  healthLabel: "Unhealthy",
  nutritionFacts: {
    calories: 520,
    sugar: 28,
    saturatedFat: 14,
    sodium: 380,
    protein: 6,
    fiber: 1.8
  },
  ingredients: [],
  healthWarnings: [
    "High sugar content – not recommended for diabetics",
    "High saturated fat – may increase heart health risks",
    "Low fiber – not suitable for digestive health"
  ],
  prosAndCons: {
    pros: [
      "Provides quick energy",
      "Appealing taste for occasional snacks"
    ],
    cons: [
      "High in added sugar",
      "High saturated fat",
      "Low nutritional value"
    ]
  },
  finalComment: "This product is high in sugar and saturated fat, making it unsuitable for daily consumption. It can be consumed occasionally but should be avoided by people with diabetes or heart-related concerns."
}