interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: 'image', label: 'Фотоаналіз' },
    { id: 'audio', label: 'Аудіоаналіз' },
    { id: 'multimodal', label: 'Мультимодальний аналіз' },
    { id: 'compare', label: 'Порівняння видів' },
    { id: 'history', label: 'Історія' }
  ]

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">Birdly</span>
      </div>
      <nav className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}