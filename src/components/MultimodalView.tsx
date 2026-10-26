import { useState, type ChangeEvent, type FormEvent } from 'react'
import { analyzeMultimodal } from '../services/api'
import type { MultimodalAnalysisResponse } from '../types'
import { BirdInfoCard } from './BirdInfoCard'

export function MultimodalView() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MultimodalAnalysisResponse | null>(null)

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  function handleAudioChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!imageFile || !audioFile) {
      setError('Необхідно обрати обидва файли: фотографію та аудіозапис')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeMultimodal(imageFile, audioFile)
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка виконання мультимодального аналізу')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setImageFile(null)
    setAudioFile(null)
    setImagePreview(null)
    setAudioPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Мультимодальний аналіз</h2>
      </div>

      <div className="grid-two-columns">
        <div className="panel">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="multi-image-input" className="form-label">
                Фотографія птаха (JPG, PNG):
              </label>
              <input
                id="multi-image-input"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleImageChange}
                className="file-input"
              />
              {imagePreview && (
                <div className="image-preview-container small">
                  <img src={imagePreview} alt="Попередній перегляд" className="preview-image" />
                  <p className="file-caption">{imageFile?.name}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="multi-audio-input" className="form-label">
                Аудіозапис співу (WAV, FLAC, OGG):
              </label>
              <input
                id="multi-audio-input"
                type="file"
                accept=".wav,.flac,.ogg,audio/wav,audio/flac,audio/ogg"
                onChange={handleAudioChange}
                className="file-input"
              />
              {audioPreview && (
                <div className="audio-player-container small">
                  <audio controls src={audioPreview} className="audio-player">
                    Ваш браузер не підтримує аудіоелемент
                  </audio>
                  <p className="file-caption">{audioFile?.name}</p>
                </div>
              )}
            </div>

            {error && <div className="alert-error">{error}</div>}

            <div className="button-group">
              <button
                type="submit"
                disabled={!imageFile || !audioFile || loading}
                className="btn btn-primary"
              >
                {loading ? 'Зіставлення даних' : 'Виконати аналіз'}
              </button>
              {(imageFile || audioFile) && (
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
                <h3>Вердикт зіставлення двох моделей</h3>
                <div className={result.is_match ? 'alert-box alert-success' : 'alert-box alert-warning'}>
                  <strong>{result.verdict}</strong>
                </div>
                <div className="note-box">
                  <strong>Зауваження щодо достовірності:</strong> {result.reliability_note}
                </div>
                {result.record_id && (
                  <div className="result-saved">
                    <span className="badge badge-success">Збережено в базі даних (ID: {result.record_id})</span>
                  </div>
                )}
              </div>

              <div className="grid-two-columns">
                <div className="card">
                  <h4>Візуальна модель (Фото)</h4>
                  <p><strong>Вид:</strong> {result.image_result.predicted_species}</p>
                  <p><strong>Упевненість:</strong> {(result.image_result.confidence * 100).toFixed(2)}%</p>
                </div>

                <div className="card">
                  <h4>Акустична модель (Спів)</h4>
                  <p><strong>Вид:</strong> {result.audio_result.predicted_species}</p>
                  <p><strong>Упевненість:</strong> {(result.audio_result.confidence * 100).toFixed(2)}%</p>
                  <p><strong>Статус:</strong> {result.audio_result.status_description}</p>
                </div>
              </div>

              <BirdInfoCard info={result.image_result.bird_info} title="Інформація про вид за фотографією" />
            </div>
          ) : (
            <div className="empty-placeholder">
              <p>Оберіть зображення та аудіофайл ліворуч і натисніть кнопку Виконати аналіз</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}