import { useState, useEffect } from 'react'
import { THEMES } from '../data/constants'

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme', 
      isDarkMode ? THEMES.DARK : THEMES.LIGHT
    )
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  return { isDarkMode, toggleTheme }
}