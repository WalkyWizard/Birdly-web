import { useState, type ChangeEvent, type FormEvent } from 'react'
import { analyzeImage } from '../services/api'
import type { ImageAnalysisResponse } from '../types'
import { BirdInfoCard } from './BirdInfoCard'

export function ImageAnalysisView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setError('Будь ласка, оберіть файл зображення')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeImage(selectedFile)
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Невідома помилка під час аналізу')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Фотоаналіз</h2>
      </div>

      <div className="grid-two-columns">
        <div className="panel">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="image-input" className="form-label">
                Оберіть файл фотографії:
              </label>
              <input
                id="image-input"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Попередній перегляд" className="preview-image" />
                <p className="file-caption">{selectedFile?.name}</p>
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div className="button-group">
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="btn btn-primary"
              >
                {loading ? 'Триває аналіз' : 'Виконати аналіз'}
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  Очистити
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel">
          {result ? (
            <div className="results-container">
              <div className="card">
                <h3>Результат розпізнавання</h3>
                <div className="result-main-info">
                  <div className="result-species">
                    <span className="result-label">Визначений вид:</span>
                    <strong className="result-value">{result.predicted_species}</strong>
                  </div>
                  <div className="result-confidence">
                    <span className="result-label">Рівень упевненості:</span>
                    <strong className="result-value">{(result.confidence * 100).toFixed(2)}%</strong>
                  </div>
                  {result.record_id && (
                    <div className="result-saved">
                      <span className="badge badge-success">Збережено в базі даних (ID: {result.record_id})</span>
                    </div>
                  )}
                </div>
              </div>

              {result.variants && result.variants.length > 0 && (
                <div className="card">
                  <h4>Найбільш імовірні варіанти</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Назва виду</th>
                        <th>Упевненість</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.variants.map((v, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{v.species}</td>
                          <td>{(v.confidence * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <BirdInfoCard info={result.bird_info} />
            </div>
          ) : (
            <div className="empty-placeholder">
              <p>Оберіть зображення ліворуч та натисніть кнопку Виконати аналіз</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}