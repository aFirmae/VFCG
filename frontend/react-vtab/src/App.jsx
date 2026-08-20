import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

function Home() { return <div className="p-6">Home</div> }
function Tab() { return <div className="p-6">Tab content</div> }

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-4 border-b">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/tab">Tab</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tab" element={<Tab />} />
      </Routes>
    </div>
  )
}
