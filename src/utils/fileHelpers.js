import { ACCEPTED_FILE_TYPES } from '../data/constants'

export const isValidImageFile = (file) => {
  if (!file) return false
  return Object.values(ACCEPTED_FILE_TYPES).includes(file.type)
}

export const createFileURL = (file) => {
  return file ? URL.createObjectURL(file) : null
}

export const revokeFileURL = (url) => {
  if (url) URL.revokeObjectURL(url)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}