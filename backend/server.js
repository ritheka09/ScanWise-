import express from 'express'
import cors from 'cors'
import multer from 'multer'
import FaultTolerantAnalyzer from './services/faultTolerantAnalyzer.js'
import GoogleVisionOCR from './services/googleVisionOCR.js'

const app = express()
const PORT = 8080

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Initialize services with Google Vision API
const analyzer = new FaultTolerantAnalyzer()
const ocrService = new GoogleVisionOCR()

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// OCR + Analysis endpoint (handles image upload)
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    console.log('Received image:', req.file.originalname, 'Size:', req.file.size)
    
    // Step 1: OCR - Extract text from image
    const ocrResult = await ocrService.extractText(req.file.buffer)
    
    // Step 2: Check confidence - lower threshold for Google Vision
    if (ocrResult.confidence < 0.2) {
      return res.status(200).json({ 
        warning: `Low OCR confidence: ${Math.round(ocrResult.confidence * 100)}%`,
        extractedText: ocrResult.text,
        useFallback: true 
      })
    }

    // Step 3: Analyze the extracted text with confidence
    console.log('Analyzing extracted text with confidence...')
    const analysis = analyzer.analyzeText(ocrResult.text, ocrResult.confidence)
    
    res.json({
      ...analysis,
      ocrMetadata: {
        confidence: ocrResult.confidence,
        provider: ocrResult.provider,
        extractedText: ocrResult.text.substring(0, 500) // First 500 chars for debugging
      }
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ 
      error: error.message,
      useFallback: true 
    })
  }
})

// Legacy text analysis endpoint (for backward compatibility)
app.post('/api/analyze', (req, res) => {
  try {
    const { text, confidence } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    if (confidence < 0.3) {
      return res.status(200).json({ 
        warning: `Low OCR confidence: ${Math.round(confidence * 100)}%`,
        useFallback: true 
      })
    }

    console.log('Analyzing text:', text.substring(0, 100) + '...')
    const analysis = analyzer.analyzeText(text)
    console.log('Analysis type:', analysis.analysisType)
    res.json(analysis)
    
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ 
      error: error.message,
      useFallback: true 
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Food Label Analyzer API running on http://localhost:${PORT}`)
})