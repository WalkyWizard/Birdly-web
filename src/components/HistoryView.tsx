import { useState, useEffect, type ChangeEvent } from 'react'
import { getHistory, deleteHistoryRecord, getBirdsMetadata, getCsvDownloadUrl } from '../services/api'
import type { HistoryRecord, BirdsMetadata } from '../types'

export function HistoryView() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedFamily, setSelectedFamily] = useState<string>('Усі')
  const [families, setFamilies] = useState<string[]>([])

  useEffect(() => {
    loadMetadata()
    loadHistory()
  }, [])

  async function loadMetadata() {
    try {
      const meta: BirdsMetadata = await getBirdsMetadata()
      setFamilies(['Усі', ...(meta.families || [])])
    } catch {
      setFamilies(['Усі'])
    }
  }

  async function loadHistory(searchVal?: string, familyVal?: string) {
    setLoading(true)
    setError(null)
    try {
      const s = searchVal !== undefined ? searchVal : searchTerm
      const f = familyVal !== undefined ? familyVal : selectedFamily
      const data = await getHistory(s, f)
      setRecords(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка завантаження історії')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearchTerm(val)
  }

  function handleSearchSubmit() {
    loadHistory(searchTerm, selectedFamily)
  }

  function handleFamilyChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedFamily(val)
    loadHistory(searchTerm, val)
  }

  async function handleDelete(id: number) {
    if (!window.confirm(`Ви дійсно бажаєте видалити запис ID ${id}?`)) {
      return
    }

    try {
      await deleteHistoryRecord(id)
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Помилка видалення запису')
    }
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Історія</h2>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Пошук за назвою або описом"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit()
            }}
            className="text-input"
          />
          <button type="button" onClick={handleSearchSubmit} className="btn btn-secondary">
            Пошук
          </button>
        </div>

        <div className="toolbar-filter">
          <label htmlFor="family-select" className="filter-label">Родина:</label>
          <select
            id="family-select"
            value={selectedFamily}
            onChange={handleFamilyChange}
            className="select-input"
          >
            {families.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            onClick={() => loadHistory(searchTerm, selectedFamily)}
            className="btn btn-secondary"
          >
            Оновити
          </button>
          <a
            href={getCsvDownloadUrl()}
            download="bird_analysis.csv"
            className="btn btn-primary link-button"
          >
            Завантажити CSV
          </a>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Завантаження записів</div>
      ) : records.length === 0 ? (
        <div className="empty-placeholder">
          <p>Записів не знайдено</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Тип</th>
                <th>Файл</th>
                <th>Визначений вид</th>
                <th>Упевненість</th>
                <th>Дата аналізу</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <span className={`type-badge type-${r.analysis_type}`}>
                      {r.analysis_type === 'image' ? 'Фото' : r.analysis_type === 'audio' ? 'Аудіо' : 'Мультимодальний'}
                    </span>
                  </td>
                  <td>{r.image_name || r.audio_name || 'Не вказано'}</td>
                  <td>
                    <strong>{r.predicted_species}</strong>
                    {r.scientific_name && <div className="sub-text">{r.scientific_name}</div>}
                  </td>
                  <td>{(r.confidence * 100).toFixed(1)}%</td>
                  <td>{r.analysis_date}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}