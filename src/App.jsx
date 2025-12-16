import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductPage from './pages/ProductPage'
import ProductDetailPage from './pages/ProductDetailPage'
import Login from './pages/Login'
import About from './pages/About'
import Faq from './pages/Faq'
import Help from './pages/Help'
import Policy from './pages/Policy'
import Ourshop from './pages/Ourshop'
import ScrollToTop from './components/ScrollToTop'
import Newsletter from './pages/Newsletter'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import NewArrival from './pages/NewArrival'
import TrendingNow from './pages/TrendingNow'
import Orders from './pages/Orders'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/ourshop" element={<Ourshop />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path='/help' element={<Help/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/wishlist' element={<Wishlist/>}/>
        <Route path='/newarrival' element={<NewArrival/>}/>
        <Route path='/trendingnow' element={<TrendingNow/>}/>
        <Route path='/orders' element={<Orders/>}/>
      </Routes>
    </Router>
  )
}

export default App
