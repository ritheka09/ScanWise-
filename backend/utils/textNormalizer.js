class TextNormalizer {
  constructor() {
    this.ocrCorrections = {
      // Broken words
      'kca|': 'kcal', 'kcal|': 'kcal', 'ca|ories': 'calories',
      'carbo hydrates': 'carbohydrates', 'carbohy drates': 'carbohydrates',
      'pro tein': 'protein', 'satu rated': 'saturated',
      'so dium': 'sodium', 'fi ber': 'fiber', 'ener gy': 'energy',
      // Spacing issues
      'ca lories': 'calories', 'sug ar': 'sugar', 'tota l': 'total'
    }
    
    // Context-aware number-letter fixes
    this.numberLetterFixes = [
      // Fix numbers that became letters in nutrition contexts
      { pattern: /([0-9]+)[oO]([0-9])/g, replacement: '$10$2' },  // 10o5 → 1005
      { pattern: /([0-9]+)[lI]([0-9])/g, replacement: '$11$2' },  // 2l5 → 215
      { pattern: /([0-9]+)[sS]([0-9])/g, replacement: '$15$2' },  // 1s0 → 150
      // Fix letters that should be numbers in nutrition context
      { pattern: /(calories?|kcal|energy)\s*[oO]([0-9])/gi, replacement: '$1 0$2' },
      { pattern: /(calories?|kcal|energy)\s*[lI]([0-9])/gi, replacement: '$1 1$2' },
      { pattern: /([0-9]+)\s*[oO]\s*(g|mg|kcal)/gi, replacement: '$10 $2' },
      { pattern: /([0-9]+)\s*[lI]\s*(g|mg|kcal)/gi, replacement: '$11 $2' }
    ]
    
    this.noisePatterns = [
      /[|\\\/\_\-]{2,}/g,  // Multiple separators
      /[^\w\s\d\.\,\:\(\)\%\-\+]/g,  // Non-essential symbols
      /\s+/g  // Multiple spaces
    ]
  }

  normalize(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return ''
    }

    console.log('=== ENHANCED TEXT NORMALIZATION ===')
    console.log('Input length:', rawText.length)
    
    let normalized = rawText.toLowerCase().trim()
    
    // Apply number-letter fixes first (context-aware)
    this.numberLetterFixes.forEach(fix => {
      normalized = normalized.replace(fix.pattern, fix.replacement)
    })
    
    // Apply OCR corrections
    Object.entries(this.ocrCorrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      normalized = normalized.replace(regex, correct)
    })
    
    // Remove noise patterns
    normalized = normalized
      .replace(this.noisePatterns[0], ' ')  // Multiple separators → space
      .replace(this.noisePatterns[1], ' ')  // Noise symbols → space
      .replace(this.noisePatterns[2], ' ')  // Multiple spaces → single space
      .trim()
    
    // Merge broken lines
    normalized = this.mergeBrokenLines(normalized)
    
    console.log('Output length:', normalized.length)
    console.log('Normalized preview:', normalized.substring(0, 200))
    
    return normalized
  }

  mergeBrokenLines(text) {
    return text
      .replace(/\n\s*([a-z])/g, ' $1')  // Merge lowercase continuations
      .replace(/\s+/g, ' ')  // Clean up spaces
      .trim()
  }
}

export default TextNormalizer