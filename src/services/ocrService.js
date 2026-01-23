// OCR Service - Abstraction layer for different OCR providers
class OCRService {
  constructor(provider = 'tesseract') {
    this.provider = provider
    this.worker = null
  }

  async extractText(imageFile) {
    switch (this.provider) {
      case 'mock':
        return this.mockOCR(imageFile)
      case 'tesseract':
        return this.tesseractOCR(imageFile)
      case 'google':
        return this.googleVisionOCR(imageFile)
      default:
        return this.mockOCR(imageFile)
    }
  }

  // Tesseract.js implementation using CDN
  async tesseractOCR(imageFile) {
    try {
      console.log('Starting OCR processing...')
      
      // Check if Tesseract is loaded from CDN
      if (typeof window.Tesseract === 'undefined') {
        console.error('Tesseract not loaded from CDN')
        throw new Error('Tesseract not loaded. Using fallback.')
      }

      console.log('Tesseract loaded, processing image:', imageFile.name)
      
      const { data: { text, confidence } } = await window.Tesseract.recognize(imageFile, 'eng', {
        logger: m => {
          console.log('OCR Progress:', m.status, m.progress)
        }
      })
      
      console.log('OCR Result:', { text: text.substring(0, 200), confidence, fullText: text })
      
      return {
        text: text.trim(),
        confidence: confidence / 100,
        provider: 'tesseract'
      }
    } catch (error) {
      console.error('Tesseract OCR failed:', error)
      console.log('Falling back to mock OCR')
      return this.mockOCR(imageFile)
    }
  }

  // Cleanup worker
  async cleanup() {
    // No cleanup needed for CDN version
  }

  // Mock OCR for development
  async mockOCR(imageFile) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      text: "INGREDIENTS: Refined Wheat Flour (Maida), Palm Oil, Cocoa Solids (6%), Invert Sugar Syrup, Sodium Bicarbonate, Soy Lecithin, Artificial Chocolate Flavor",
      confidence: 0.95,
      provider: 'mock'
    }
  }

  // Google Vision API implementation (future)
  async googleVisionOCR(imageFile) {
    // TODO: Implement Google Vision API
    throw new Error('Google Vision OCR not implemented yet')
  }
}

export default OCRService