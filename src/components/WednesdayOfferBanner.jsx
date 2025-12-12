import { useEffect, useState } from 'react'
import { isWednesday } from '../utils/discount'

const WednesdayOfferBanner = () => {
  const [isWed, setIsWed] = useState(false)

  useEffect(() => {
    setIsWed(isWednesday())
  }, [])

  if (!isWed) return null

  return (
    <div className="wednesday-offer-banner">
      <div className="wednesday-offer-scroll-container">
        <div className="wednesday-offer-content">
          <span className="wednesday-offer-icon">🎁</span>
          <span className="wednesday-offer-text">
            <strong>WEDNESDAY SPECIAL:</strong> Get 10% OFF on all products! Limited time offer.
          </span>
          <span className="wednesday-offer-icon">🎁</span>
        </div>
        <div className="wednesday-offer-content">
          <span className="wednesday-offer-icon">🎁</span>
          <span className="wednesday-offer-text">
            <strong>WEDNESDAY SPECIAL:</strong> Get 10% OFF on all products! Limited time offer.
          </span>
          <span className="wednesday-offer-icon">🎁</span>
        </div>
      </div>
    </div>
  )
}

export default WednesdayOfferBanner

