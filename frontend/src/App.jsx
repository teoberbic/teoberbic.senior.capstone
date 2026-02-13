// App.jsx
/**
 * Comments Here were genereated by Ai for readability
 * Main Application Entry Point
 * 
 * This file serves as the root component for the application's UI structure.
 * It is responsible for setting up the Client-Side Routing using React Router.
 * 
 * ROUTING EXPLAINED:
 * 1. BrowserRouter: This component wraps the entire application. It enables the use of
 *    HTML5 history API (pushState, replaceState, popState) to keep the UI in sync with the URL.
 * 
 * 2. Routes: This is a container for all the possible <Route> definitions. 
 *    It selects the component that best matches the current URL.
 * 
 * 3. Route: Defines a mapping between a URL path and a React Component.
 *    - path="/": The root URL. Renders the 'Home' component (Social Feed).
 *    - path="/brands": Renders the 'Brands' component (Management & List).
 * 
 * NAVIGATION:
 * A fixed 'Navbar' component is rendered outside the <Routes> container.
 * This ensures the navigation bar is always visible at the bottom of the screen,
 * regardless of which page is currently active.
 * 
 * AI genereated me starter code for routing and navigation. I was using it to research how to implement routing with BrowserRouter and Routes. The same is said about the Navbar component.
 * Lines (39-73) is the AI generated code for routing and navigation and the Navbar component (Copilot VScode IDE).
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Brands from './pages/Brands'
import BrandDetails from './pages/BrandDetails'
import CollectionDetails from './pages/CollectionDetails'
import ProductDetails from './pages/ProductDetails'
import Social from './pages/Social'
import Collections from './pages/Collections'
import Products from './pages/Products'
import BrandComparer from './pages/brandComparer'

import Navbar from './components/Navbar'

export default function App() {
  return (
    <>
      {/* 
        BrowserRouter initiates the routing context. 
        Everything inside here can use routing hooks and links. 
      */}
      <BrowserRouter>

        {/* 
          Main Content Area 
          The Routes component looks at the current URL and renders the matching child Route.
        */}
        <div className="main-content">
          <Routes>
            {/* Route for the Dashboard / Social Feed */}
            <Route path="/" element={<Home />} />

            {/* Route for Social Screen */}
            <Route path="/social" element={<Social />} />

            {/* Route for Brand Management (List & Add Form) */}
            <Route path="/brands" element={<Brands />} />

            {/* Route for Specific Brand Details */}
            <Route path="/brands/:brandId" element={<BrandDetails />} />

            {/* Route for Specific Collection Details */}
            <Route path="/collections/:collectionId" element={<CollectionDetails />} />

            {/* Route for Specific Product Details */}
            <Route path="/products/:productId" element={<ProductDetails />} />

            {/* Route for All Collections */}
            <Route path="/collections" element={<Collections />} />

            {/* Route for All Products */}
            <Route path="/products" element={<Products />} />

            {/* Route for All Products */}
            <Route path="/brandcomparer" element={<BrandComparer />} />


          </Routes>
        </div>

        {/* 
          Global Navbar 
          Placed outside of Routes so it persists across page changes.
        */}
        <Navbar />

      </BrowserRouter>
    </>
  )
}
