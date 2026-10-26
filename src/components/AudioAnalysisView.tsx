import { useState, type ChangeEvent, type FormEvent } from 'react'
import { analyzeAudio } from '../services/api'
import type { AudioAnalysisResponse } from '../types'
import { BirdInfoCard } from './BirdInfoCard'

export function AudioAnalysisView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AudioAnalysisResponse | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setError('Будь ласка, оберіть аудіофайл')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeAudio(selectedFile)
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Невідома помилка під час аналізу аудіо')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSelectedFile(null)
    setAudioUrl(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Аудіоаналіз</h2>
      </div>

      <div className="grid-two-columns">
        <div className="panel">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="audio-input" className="form-label">
                Оберіть аудіофайл:
              </label>
              <input
                id="audio-input"
                type="file"
                accept=".wav,.flac,.ogg,audio/wav,audio/flac,audio/ogg"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {audioUrl && (
              <div className="audio-player-container">
                <audio controls src={audioUrl} className="audio-player">
                  Ваш браузер не підтримує аудіоелемент
                </audio>
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
                {loading ? 'Аналіз звуку' : 'Класифікувати звук'}
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
                <h3>Результат акустичного аналізу</h3>
                <div className="result-main-info">
                  <div className="result-species">
                    <span className="result-label">Визначений вид:</span>
                    <strong className="result-value">{result.predicted_species}</strong>
                  </div>
                  <div className="result-confidence">
                    <span className="result-label">Рівень упевненості:</span>
                    <strong className="result-value">{(result.confidence * 100).toFixed(2)}%</strong>
                  </div>
                </div>

                <div className={result.is_reliable ? 'alert-box alert-success' : 'alert-box alert-warning'}>
                  <strong>Статус достовірності:</strong> {result.status_description}
                </div>

                {result.record_id && (
                  <div className="result-saved">
                    <span className="badge badge-success">Збережено в базі даних (ID: {result.record_id})</span>
                  </div>
                )}
              </div>

              {result.variants && result.variants.length > 0 && (
                <div className="card">
                  <h4>Ймовірні класи звуків</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Клас або вид</th>
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
              <p>Оберіть аудіозапис ліворуч та натисніть кнопку Класифікувати звук</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}