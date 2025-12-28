/**
 * app component where user can add brands and see list of brands
 * 
 * **/

import { useState, useEffect } from 'react'
import './App.css'
import getBrands from './api/getBrands'

export default function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('') // message for user
  const [brands, setBrands] = useState([])

  // get brands on load
  useEffect(() => {
    getBrands().then((data) => setBrands(data))
  }, [])

  // add brand function 
  async function onSubmit(e) {
    e.preventDefault() // prevent default form submission so page doesn't refresh
    if (!name.trim() || !domain.trim()) return
    setLoading(true)
    setMsg('')
    const res = await fetch('api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), domain: domain.trim() }),
    })
    setLoading(false)
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setMsg(data.error || 'create failed')
      return
    }

    // if successful, data is the created object
    if (data && data.brand) {
      setBrands(prev => [data.brand, ...prev])
      console.log('Brand created successfully:', data.brand)
    } else {
      console.log('Brand created successfully (response structure check)', data)
    }


    console.log(res)
    setName('')
    setDomain('')
    setMsg('saved')

    // refresh the list after adding
    getBrands().then((data) => setBrands(data))
  }

  return (
    <>
      <div style={{ padding: 24 }}>
        <h2>brand add tester</h2>

        {/* add brand form */}
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Domain " value={domain} onChange={e => setDomain(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? 'saving…' : 'add'}</button>
        </form>
        {msg && <p>{msg}</p>} {/* show message to user*/}
      </div>

      {/* brands list */}
      <div style={{ padding: 24 }}>
        <h2>Brands List</h2>
        <ul>
          {brands.map(brand => (
            <li key={brand.id}> {/* unique key for each brand so react can identify them */}
              <strong>{brand.name}</strong> ({brand.domain}) || {"Created At: "} {brand.createdAt}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
