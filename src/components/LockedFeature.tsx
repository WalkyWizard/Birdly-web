import { useSubscription } from '../context/SubscriptionContext'

interface LockedFeatureProps {
  title: string
  description: string
  onOpenSubscription: () => void
}

export function LockedFeature({ title, description, onOpenSubscription }: LockedFeatureProps) {
  const { account, connectWallet } = useSubscription()

  return (
    <div className="locked-feature-container">
      <div className="locked-card">
        <h3>{title}</h3>
        <p>{description}</p>
        {!account ? (
          <button type="button" className="btn btn-primary" onClick={connectWallet}>
            Підключити MetaMask
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onOpenSubscription}>
            Оформити підписку
          </button>
        )}
      </div>
    </div>
  )
}
