import type {
  ImageAnalysisResponse,
  AudioAnalysisResponse,
  MultimodalAnalysisResponse,
  HistoryRecord,
  BirdsMetadata,
  BirdInfo,
  CompareResponse,
  StatsSummary
} from '../types'

const BASE_URL = ['http:', '', '127.0.0.1:8000', 'api'].join('/')

export async function analyzeImage(file: File): Promise<ImageAnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/analyze/image`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Помилка аналізу зображення')
  }

  return response.json()
}

export async function analyzeAudio(file: File): Promise<AudioAnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/analyze/audio`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Помилка аналізу аудіо')
  }

  return response.json()
}

export async function analyzeMultimodal(imageFile: File, audioFile: File): Promise<MultimodalAnalysisResponse> {
  const formData = new FormData()
  formData.append('image_file', imageFile)
  formData.append('audio_file', audioFile)

  const response = await fetch(`${BASE_URL}/analyze/multimodal`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Помилка мультимодального аналізу')
  }

  return response.json()
}

export async function getHistory(
  search?: string,
  family?: string,
  habitat?: string
): Promise<HistoryRecord[]> {
  const params = new URLSearchParams()
  if (search && search.trim() !== '') {
    params.append('search', search.trim())
  }
  if (family && family !== 'Усі') {
    params.append('family', family)
  }
  if (habitat && habitat.trim() !== '') {
    params.append('habitat', habitat.trim())
  }

  const queryStr = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${BASE_URL}/history${queryStr}`)

  if (!response.ok) {
    throw new Error('Помилка завантаження історії')
  }

  return response.json()
}

export async function deleteHistoryRecord(id: number): Promise<{ success: boolean; deleted_id: number }> {
  const response = await fetch(`${BASE_URL}/history/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Помилка видалення запису')
  }

  return response.json()
}

export async function getBirdsMetadata(): Promise<BirdsMetadata> {
  const response = await fetch(`${BASE_URL}/birds`)
  if (!response.ok) {
    throw new Error('Помилка завантаження довідника')
  }
  return response.json()
}

export async function getBirdInfo(speciesName: string): Promise<BirdInfo> {
  const encoded = encodeURIComponent(speciesName)
  const response = await fetch(`${BASE_URL}/birds/info/${encoded}`)
  if (!response.ok) {
    throw new Error('Помилка завантаження інформації про птаха')
  }
  return response.json()
}

export async function compareBirds(speciesA: string, speciesB: string): Promise<CompareResponse> {
  const encA = encodeURIComponent(speciesA)
  const encB = encodeURIComponent(speciesB)
  const response = await fetch(`${BASE_URL}/birds/compare/${encA}/${encB}`)
  if (!response.ok) {
    throw new Error('Помилка порівняння птахів')
  }
  return response.json()
}

export async function getStats(): Promise<StatsSummary> {
  const response = await fetch(`${BASE_URL}/stats`)
  if (!response.ok) {
    throw new Error('Помилка завантаження статистики')
  }
  return response.json()
}

export function getCsvDownloadUrl(): string {
  return `${BASE_URL}/stats/csv`
}