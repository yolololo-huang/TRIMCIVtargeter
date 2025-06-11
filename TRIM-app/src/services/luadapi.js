import axios from 'axios'

const API_BASE_URL = '/backend/apiLuad' //import.meta.env.VITE_API_BASE_URL
// const API_BASE_URL = '/apiLuad'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 允许发送和接收 Cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

export const LUADfetchSymbolOptions = async (searchTerm, type) => {
  try {
    const response = await apiClient.get('/getGNoptions', {
      params: { searchTerm: searchTerm, type: type },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

export const getLUADpred = async (symbol, type) => {
  try {
    const response = await apiClient.get('/getLUADpred', {
      params: symbol,
      type,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}
