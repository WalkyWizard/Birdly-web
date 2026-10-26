import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { ImageAnalysisView } from './components/ImageAnalysisView'
import { AudioAnalysisView } from './components/AudioAnalysisView'
import { MultimodalView } from './components/MultimodalView'
import { HistoryView } from './components/HistoryView'
import { CompareView } from './components/CompareView'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('image')

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'image' && <ImageAnalysisView />}
        {activeTab === 'audio' && <AudioAnalysisView />}
        {activeTab === 'multimodal' && <MultimodalView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'compare' && <CompareView />}
      </main>
    </div>
  )
}