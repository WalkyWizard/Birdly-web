import type { BirdInfo } from '../types'

interface BirdInfoCardProps {
  info?: BirdInfo
  title?: string
}

export function BirdInfoCard({ info, title = 'Інформаційна довідка про птаха' }: BirdInfoCardProps) {
  if (!info) {
    return (
      <div className="card">
        <h3>{title}</h3>
        <p className="empty-text">Інформація відсутня або не завантажена</p>
      </div>
    )
  }

  return (
    <div className="card bird-info-card">
      <h3 className="card-title">{title}</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Українська назва:</span>
          <span className="info-value highlight">{info.ukr_name || 'Невідомо'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Наукова назва:</span>
          <span className="info-value italic">{info.scientific_name || 'Невідомо'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Родина:</span>
          <span className="info-value">{info.family || 'Дані відсутні'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Середовище існування:</span>
          <span className="info-value">{info.habitat || 'Дані відсутні'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Географічне поширення:</span>
          <span className="info-value">{info.region || 'Дані відсутні'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Тип живлення:</span>
          <span className="info-value">{info.diet || 'Дані відсутні'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Середні розміри:</span>
          <span className="info-value">{info.size || 'Дані відсутні'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Природоохоронний статус:</span>
          <span className="info-value badge">{info.conservation_status || 'Дані відсутні'}</span>
        </div>
      </div>
      {info.interesting_facts && (
        <div className="facts-section">
          <span className="info-label">Цікаві факти:</span>
          <p className="facts-text">{info.interesting_facts}</p>
        </div>
      )}
    </div>
  )
}