import { useEffect, useState } from 'react'
import { isFriday } from '../utils/discount'

const FridayOfferBanner = () => {
  const [isFri, setIsFri] = useState(false)

  useEffect(() => {
    setIsFri(isFriday())
  }, [])

  if (!isFri) return null

  return (
    <div className="friday-offer-banner">
      <div className="friday-offer-scroll-container">
        <div className="friday-offer-content">
          <span className="friday-offer-icon">🎁</span>
          <span className="friday-offer-text">
            <strong>FRIDAY SPECIAL:</strong> Get 10% OFF on all products! Limited time offer.
          </span>
          <span className="friday-offer-icon">🎁</span>
        </div>
        <div className="friday-offer-content">
          <span className="friday-offer-icon">🎁</span>
          <span className="friday-offer-text">
            <strong>FRIDAY SPECIAL:</strong> Get 10% OFF on all products! Limited time offer.
          </span>
          <span className="friday-offer-icon">🎁</span>
        </div>
      </div>
    </div>
  )
}

export default FridayOfferBanner
