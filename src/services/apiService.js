class ApiService {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl
  }

  async analyzeImage(imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await fetch(`${this.baseUrl}/api/analyze-image`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.useFallback || data.warning) {
        return {
          ...data,
          fallbackUsed: true
        }
      }

      return data
    } catch (error) {
      console.error('API call failed:', error)
      throw new Error(`Backend analysis failed: ${error.message}`)
    }
  }

  // Legacy method for backward compatibility
  async analyzeIngredients(ocrResult) {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ocrResult.text,
          confidence: ocrResult.confidence
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.useFallback || data.warning) {
        return {
          ...data,
          fallbackUsed: true
        }
      }

      return data
    } catch (error) {
      console.error('API call failed:', error)
      throw new Error(`Backend analysis failed: ${error.message}`)
    }
  }
}

export default ApiService