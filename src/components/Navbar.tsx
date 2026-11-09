import { useSubscription } from '../context/SubscriptionContext'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { account, balance, connecting, connectWallet, changeWallet, disconnectWallet } = useSubscription()

  const tabs = [
    { id: 'image', label: 'Фотоаналіз' },
    { id: 'audio', label: 'Аудіоаналіз' },
    { id: 'multimodal', label: 'Мультимодальний аналіз' },
    { id: 'compare', label: 'Порівняння видів' },
    { id: 'history', label: 'Історія' },
    { id: 'subscription', label: 'Підписка' }
  ]

  function formatAddress(addr: string) {
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

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
      <div className="navbar-wallet">
        {account ? (
          <div className="wallet-actions">
            <span className="wallet-badge" title={`${account} (${balance} ETH)`}>
              {formatAddress(account)}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={changeWallet}
              disabled={connecting}
            >
              Змінити
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={disconnectWallet}
            >
              Вийти
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={connectWallet}
            disabled={connecting}
          >
            {connecting ? 'Підключення...' : 'MetaMask'}
          </button>
        )}
      </div>
    </header>
  )
}
