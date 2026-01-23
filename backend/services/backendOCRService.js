import Tesseract from 'tesseract.js'

class BackendOCRService {
  async extractText(imageBuffer) {
    try {
      console.log('Starting OCR processing on backend...')
      
      const { data: { text, confidence } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: m => console.log('OCR Progress:', m.status, m.progress)
      })
      
      console.log('OCR completed. Confidence:', confidence)
      console.log('Extracted text preview:', text.substring(0, 200))
      
      return {
        text: text.trim(),
        confidence: confidence / 100,
        provider: 'tesseract-backend'
      }
    } catch (error) {
      console.error('Backend OCR failed:', error)
      throw new Error(`OCR processing failed: ${error.message}`)
    }
  }
}

export default BackendOCRService