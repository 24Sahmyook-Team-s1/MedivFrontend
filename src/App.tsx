import React from 'react'
import DicomViewer from './views/DicomViewer'
import BottomBar from './components/BottomBar'

export default function App() {
  return (
    <div className="viewer-shell">
      <DicomViewer />
      <BottomBar />
    </div>
  )
}
