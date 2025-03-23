import axios from 'axios'

const API_BASE_URL = '/backend/api' //import.meta.env.VITE_API_BASE_URL
// const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 允许发送和接收 Cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

export const checkCookiesAccepted = async () => {
  try {
    const response = await apiClient.get('/check-cookies', { withCredentials: true })
    return response.data
  } catch (error) {
    console.error('Error checking cookies:', error)
    throw error
  }
}

export const acceptCookies = async () => {
  try {
    const response = await apiClient.post('/accept-cookies', {}, { withCredentials: true })
    return response.data
  } catch (error) {
    console.error('Error accepting cookies:', error)
    throw error
  }
}

//degplot
export const fetchDegTables = async () => {
  try {
    const response = await apiClient.get('/degTables')
    return response.data
  } catch (error) {
    console.error('Error fetching deg tables:', error)
    throw error
  }
}

export const fetchDegPlotData = async (datasetX, datasetY) => {
  try {
    const response = await apiClient.get('/degPlot', {
      params: { datasetX, datasetY }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching deg plot data:', error)
    throw error
  }
}

export const fetchDegTabData = async (datasets, GNs) => {
  try {
    const params = {
      datasets: Array.isArray(datasets) ? datasets.join(',') : datasets,
      GNs: Array.isArray(GNs) ? GNs.join(',') : GNs
    }
    const response = await apiClient.get('/degTab', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching deg tab data:', error)
    throw error
  }
}

export const fetchRecommendedGNsDeg = async (query) => {
  try {
    const response = await apiClient.get('/searchGeneNamesDegdb', {
      params: { searchTerm: query }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

//trimcortab

export const fetchCorTables = async () => {
  try {
    const response = await apiClient.get('/corTables')
    return response.data
  } catch (error) {
    console.error('Error fetching correlation tables:', error)
    throw error
  }
}

export const fetchCorTRIMsData = async (dataset, TRIMs, geneNames) => {
  try {
    const params = { dataset, TRIMs }
    if (geneNames) {
      params.geneNames = geneNames
    }
    const response = await apiClient.get('/corTRIMs', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching TRIMs correlation data:', error)
    throw error
  }
}

// obsolete 表单genename
export const fetchRecommendedGNsCor = async (query) => {
  try {
    const response = await apiClient.get('/searchGeneNamesCordb', {
      params: { searchTerm: query }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

// indexoverview
export const fetchResOverview = async (query) => {
  try {
    const response = await apiClient.get('/getResOverview', {
      params: { TRIMnum: query }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

// appform
export const fetchSymbolOptions = async (searchTerm, type) => {
  try {
    const response = await apiClient.get('/getSymbolOptions', {
      params: { searchTerm: searchTerm, type: type }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

export const fetchCancerOptions = async () => {
  try {
    const response = await apiClient.get('/getCancerOptions')
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

export const fupdateSymbolOptions = async (searchTerm, cancerList, type) => {
  try {
    const response = await apiClient.get('/getupdateSymbolOptions', {
      params: { searchTerm: searchTerm, cancerList: cancerList, type: type }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}
export const fupdateCancerOptions = async (symbol, type) => {
  try {
    const response = await apiClient.get('/getupdateCancerOptions', {
      params: { symbol: symbol, type: type }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}
export const fetchRecommendedGNsUid = async (geneName) => {
  try {
    const response = await apiClient.get(`/uid`, {
      params: { searchTerm: geneName }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching uniprot ids:', error)
    throw error
  }
}

export const fetchResult = async (formData) => {
  try {
    const response = await apiClient.get(`/submitForm`, {
      params: formData
    })
    return response.data
  } catch (error) {
    console.error('Error submitting form:', error)
    throw error
  }
}

export const fetchResbyTRIM = async (formData) => {
  try {
    const response = await apiClient.get(`/submitFormbyTRIM`, {
      params: formData
    })
    return response.data
  } catch (error) {
    console.error('Error submitting form:', error)
    throw error
  }
}

export const fetchGO = async (symbol1, symbol2) => {
  try {
    const response = await apiClient.get(`/getGO`, {
      params: { symbol1: symbol1, symbol2: symbol2 }
    })
    return response.data
  } catch (error) {
    console.error('Error submitting form:', error)
    throw error
  }
}

export const submitNew = async (formData) => {
  try {
    const response = await apiClient.post('/submitNew', formData)
    return response.status
  } catch (error) {
    console.error('Error submitting form:', error)
    throw error
  }
}

export const downloadTableData = async (tableName) => {
  try {
    const response = await apiClient.get('/downloadTable', {
      params: { tableName },
      responseType: 'blob' // Ensure the response is treated as a blob
    })
    return response
  } catch (error) {
    console.error('Error downloading table data:', error)
    throw error
  }
}

export const getRepoInfo = async () => {
  try {
    const response = await apiClient.get('/getRepoinfo')
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}

export const getTMscore = async () => {
  try {
    const response = await apiClient.get('/getTMscore')
    return response.data
  } catch (error) {
    console.error('Error fetching gene names:', error)
    throw error
  }
}
