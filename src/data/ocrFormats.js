// OCR Output Format Standards

export const OCR_OUTPUT_FORMAT = {
  // Raw OCR Response
  text: "string",           // Extracted text
  confidence: "number",     // 0-1 confidence score
  provider: "string",       // OCR provider used
  metadata: {
    processingTime: "number", // ms
    imageSize: "object",      // {width, height}
    language: "string"        // detected language
  }
}

// Example OCR Outputs
export const sampleOCROutputs = {
  // Standard ingredient list
  standard: {
    text: "INGREDIENTS: Refined Wheat Flour (Maida), Palm Oil, Cocoa Solids (6%), Invert Sugar Syrup, Sodium Bicarbonate, Soy Lecithin, Artificial Chocolate Flavor",
    confidence: 0.95,
    provider: 'tesseract',
    metadata: {
      processingTime: 1200,
      imageSize: { width: 800, height: 600 },
      language: 'eng'
    }
  },

  // Multi-line format
  multiLine: {
    text: "INGREDIENTS:\nRefined Wheat Flour (Maida)\nPalm Oil\nCocoa Solids (6%)\nInvert Sugar Syrup\nSodium Bicarbonate",
    confidence: 0.88,
    provider: 'tesseract',
    metadata: {
      processingTime: 1500,
      imageSize: { width: 1024, height: 768 },
      language: 'eng'
    }
  },

  // Poor quality scan
  lowConfidence: {
    text: "INGRED1ENTS: Ref1ned Wheat F1our, Pa1m 0i1, Cocoa So1ids",
    confidence: 0.65,
    provider: 'tesseract',
    metadata: {
      processingTime: 2000,
      imageSize: { width: 400, height: 300 },
      language: 'eng'
    }
  }
}