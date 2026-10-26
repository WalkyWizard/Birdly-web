import { useState, useEffect, type ChangeEvent } from 'react'
import { getBirdsMetadata, compareBirds } from '../services/api'
import type { BirdsMetadata, CompareResponse, SpeciesOption } from '../types'

export function CompareView() {
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([])
  const [bird1, setBird1] = useState<string>('')
  const [bird2, setBird2] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [metaLoading, setMetaLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompareResponse | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const data: BirdsMetadata = await getBirdsMetadata()
        const list = data.species || []
        setSpeciesList(list)
        if (list.length >= 2) {
          setBird1(list[0].key)
          setBird2(list[1].key)
        }
      } catch {
        setError('Помилка завантаження списку видів')
      } finally {
        setMetaLoading(false)
      }
    }
    init()
  }, [])

  async function handleCompare() {
    if (!bird1 || !bird2) {
      setError('Оберіть двох птахів для порівняння')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await compareBirds(bird1, bird2)
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка порівняння видів')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Порівняння видів</h2>
      </div>

      <div className="card">
        {metaLoading ? (
          <div>Завантаження переліку видів</div>
        ) : (
          <div className="compare-selectors">
            <div className="form-group">
              <label htmlFor="bird1-select" className="form-label">
                Перший птах:
              </label>
              <select
                id="bird1-select"
                value={bird1}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setBird1(e.target.value)}
                className="select-input"
              >
                {speciesList.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.ukr_name} ({s.scientific_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bird2-select" className="form-label">
                Другий птах:
              </label>
              <select
                id="bird2-select"
                value={bird2}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setBird2(e.target.value)}
                className="select-input"
              >
                {speciesList.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.ukr_name} ({s.scientific_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group align-bottom">
              <button
                type="button"
                onClick={handleCompare}
                disabled={loading || !bird1 || !bird2}
                className="btn btn-primary"
              >
                {loading ? 'Порівняння' : 'Порівняти'}
              </button>
            </div>
          </div>
        )}

        {error && <div className="alert-error">{error}</div>}
      </div>

      {result && (
        <div className="card">
          <div className="compare-header">
            <h3>
              {result.bird1_name} та {result.bird2_name}
            </h3>
            <span className={result.same_family ? 'badge badge-success' : 'badge badge-warning'}>
              {result.same_family ? 'Одна родина' : 'Різні родини'}
            </span>
          </div>

          <table className="data-table compare-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Характеристика</th>
                <th style={{ width: '37.5%' }}>{result.bird1_name}</th>
                <th style={{ width: '37.5%' }}>{result.bird2_name}</th>
              </tr>
            </thead>
            <tbody>
              {result.comparison_rows.map((row, idx) => (
                <tr key={idx} className={row.is_identical ? 'row-match' : 'row-diff'}>
                  <td>
                    <strong>{row.parameter}</strong>
                  </td>
                  <td>{row.bird1_value}</td>
                  <td>{row.bird2_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}