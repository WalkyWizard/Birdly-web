import { useState } from 'react'
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext'
import { Navbar } from './components/Navbar'
import { ImageAnalysisView } from './components/ImageAnalysisView'
import { AudioAnalysisView } from './components/AudioAnalysisView'
import { MultimodalView } from './components/MultimodalView'
import { HistoryView } from './components/HistoryView'
import { CompareView } from './components/CompareView'
import { SubscriptionView } from './components/SubscriptionView'
import { LockedFeature } from './components/LockedFeature'
import './App.css'

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('image')
  const { status } = useSubscription()

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="main-content">
        {activeTab === 'image' && <ImageAnalysisView />}
        {activeTab === 'audio' && <AudioAnalysisView />}
        {activeTab === 'multimodal' && (
          status?.hasMultimodal ? (
            <MultimodalView />
          ) : (
            <LockedFeature
              title="Мультимодальний аналіз заблоковано"
              description="Для доступу до комбінованого фото та аудіо аналізу потрібна активна підписка Birdly"
              onOpenSubscription={() => setActiveTab('subscription')}
            />
          )
        )}
        {activeTab === 'history' && (
          status?.hasHistory ? (
            <HistoryView />
          ) : (
            <LockedFeature
              title="Історію заблоковано"
              description="Для перегляду збереженої історії аналізів та вивантаження CSV потрібна активна підписка Birdly"
              onOpenSubscription={() => setActiveTab('subscription')}
            />
          )
        )}
        {activeTab === 'compare' && <CompareView />}
        {activeTab === 'subscription' && <SubscriptionView />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  )
}
