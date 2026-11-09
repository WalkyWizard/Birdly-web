import { ethers } from 'ethers'
import { useSubscription, type Plan } from '../context/SubscriptionContext'

const DEFAULT_PRO_PLANS: Plan[] = [
  {
    id: 3,
    name: 'Birdly Pro Monthly',
    price: 12000000000000000n,
    duration: 2592000,
    unlocksHistory: true,
    unlocksMultimodal: true,
    active: true
  },
  {
    id: 4,
    name: 'Birdly Pro Yearly',
    price: 100000000000000000n,
    duration: 31536000,
    unlocksHistory: true,
    unlocksMultimodal: true,
    active: true
  }
]

export function SubscriptionView() {
  const {
    account,
    balance,
    plans,
    status,
    pendingPlanId,
    isCancelling,
    connecting,
    error,
    connectWallet,
    changeWallet,
    disconnectWallet,
    subscribe,
    cancelSubscription
  } = useSubscription()

  const hasActive = Boolean(status?.hasHistory || status?.hasMultimodal)

  const activePlans = plans.filter((p) => p.id === 3 || p.id === 4 || p.name.toLowerCase().includes('pro'))
  const displayPlans = activePlans.length >= 2 ? activePlans : DEFAULT_PRO_PLANS

  function formatDuration(seconds: number): string {
    const days = Math.round(seconds / 86400)
    return `${days} днів`
  }

  function formatExpiry(timestamp: number): string {
    if (!timestamp) return 'Немає'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('uk-UA') + ' ' + date.toLocaleTimeString('uk-UA')
  }

  return (
    <div className="view-container subscription-page">
      <div className="view-header">
        <h2>Підписка Birdly</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card subscription-account-card">
        <div className="account-card-header">
          <h3>Стан облікового запису</h3>
          <span className={account ? 'badge badge-success' : 'badge badge-secondary'}>
            {account ? 'Підключено' : 'Не підключено'}
          </span>
        </div>

        {!account ? (
          <div className="account-empty-state">
            <p>Підключіть MetaMask для перегляду деталей балансу та оформлення підписки</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? 'Підключення...' : 'Підключити MetaMask'}
            </button>
          </div>
        ) : (
          <div className="account-details-grid">
            <div className="account-detail-item">
              <span className="detail-label">Адреса гаманця:</span>
              <span className="detail-value">{account}</span>
            </div>
            <div className="account-detail-item">
              <span className="detail-label">Баланс:</span>
              <span className="detail-value balance-value">{balance} ETH</span>
            </div>
            <div className="account-detail-item">
              <span className="detail-label">Доступ до історії:</span>
              <span className={status?.hasHistory ? 'badge badge-success' : 'badge badge-warning'}>
                {status?.hasHistory ? `Активна до ${formatExpiry(status.historyExpiresAt)}` : 'Заблоковано'}
              </span>
            </div>
            <div className="account-detail-item">
              <span className="detail-label">Мультимодальний аналіз:</span>
              <span className={status?.hasMultimodal ? 'badge badge-success' : 'badge badge-warning'}>
                {status?.hasMultimodal ? `Активна до ${formatExpiry(status.multimodalExpiresAt)}` : 'Заблоковано'}
              </span>
            </div>

            <div className="account-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={changeWallet}
                disabled={connecting}
              >
                Змінити гаманець
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={disconnectWallet}
              >
                Відключити
              </button>
              {hasActive && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={isCancelling}
                  onClick={cancelSubscription}
                >
                  {isCancelling ? 'Скасування...' : 'Скасувати підписку'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="subscription-plans-section">
        <h3>Доступні плани</h3>
        <div className="plans-cards-container">
          {displayPlans.map((plan) => {
            const isPendingThis = pendingPlanId === plan.id
            const isAnyPending = pendingPlanId !== null

            return (
              <div key={plan.id} className="plan-featured-card">
                <div className="plan-card-top">
                  <div className="plan-name-title">{plan.name}</div>
                  <div className="plan-price-tag">
                    <span className="price-number">{ethers.formatEther(plan.price)}</span>
                    <span className="price-currency">ETH</span>
                  </div>
                  <div className="plan-duration-badge">Тривалість: {formatDuration(plan.duration)}</div>
                </div>

                <div className="plan-benefits-list">
                  <div className="benefit-item">Повний доступ до збереженої історії аналізів</div>
                  <div className="benefit-item">Комбінований мультимодальний аналіз (фото + аудіо)</div>
                  <div className="benefit-item">Вивантаження результатів у CSV та перегляд деталей</div>
                </div>

                <div className="plan-card-footer">
                  {!account ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={connectWallet}
                      disabled={connecting}
                    >
                      Підключити MetaMask
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      disabled={hasActive || isAnyPending || !plan.active}
                      onClick={() => subscribe(plan.id, plan.price)}
                    >
                      {hasActive
                        ? 'План заблоковано'
                        : isPendingThis
                        ? 'Очікування транзакції...'
                        : 'Придбати'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
