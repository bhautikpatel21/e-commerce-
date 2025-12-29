import '../App.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const heroImage =
  'https://thebearhouse.com/cdn/shop/files/1_a502f728-4635-4268-a369-45dbf7b9aa68.jpg?v=1742287184&width=1600'

const founders = [
  {
    name: 'Harsh Somaiya',
    title: 'Founder & Mr. Bear',
    copy:
      'Harsh Somaiya built Bloomcraft Apparels into a ₹55 Cr export house before creating The Bear House. His mission is simple: timeless pieces that feel like second skin so modern young gentlemen can move from boardrooms to bonfires without overthinking.',
    image:
      'https://thebearhouse.com/cdn/shop/files/3-min_1.jpg?v=1742288007&width=1080',
    alignment: 'left',
  },
  {
    name: 'Tanvi Somaiya',
    title: 'Co-founder & Creative Lead',
    copy:
      'Tanvi Somaiya, a NIFT Mumbai grad, vibe-checks every silhouette that leaves the studio. She fuses clean cuts, easy layers, and premium fabrics—bringing a fresh female lens to menswear and closing the gaps she spotted while running Bloomcraft’s sampling floor.',
    image:
      'https://thebearhouse.com/cdn/shop/files/2_e8475f22-3955-4a1c-9fa9-06ca5099ecc8.jpg?v=1742287190&width=1080',
    alignment: 'right',
  },
]

const manifesto = [
  'We don’t do fast fashion—we make forever pieces built for loud laughs, quiet silences, and everything in between.',
  'Our muse is the man with messy buns, 2 AM playlists, and last-minute road trips. Clean lines and European minimalism without the fuss.',
  'Whatever the mood or vibe, each thread is stitched into your story so you always look like you belong.',
]

const values = [
  'Second-skin comfort crafted with breathable, premium fabrics.',
  'Effortless silhouettes that keep pace with spontaneous plans.',
  'Honest pricing, transparent sourcing, and small-batch drops.',
  'Designed in Bengaluru, inspired by European ateliers.',
]

const stats = [
  { value: '2018', label: 'Born in Bengaluru' },
  { value: '120+', label: 'Slow-fashion styles' },
  { value: '55 Cr', label: 'Export legacy' },
  { value: '∞', label: 'Stories stitched' },
]

function About() {
  return (
    <div className="page-shell">
      <div className="announcement-bar fade-down" style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
        <div className="marquee-content" style={{
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
        </div>
      </div>


      <Navbar />

      <main>
        <div className="about-page">
          <section className="about-hero fade-down">
            <div className="about-hero-copy">
              <p className="eyebrow">Our Story</p>
              <h1>We are The Bear.</h1>
              <h3>Fashion for a new breed of modern young gentlemen.</h3>
              <ul className="about-manifesto">
                {manifesto.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="about-stats">
                {stats.map((stat) => (
                  <article key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </article>
                ))}
              </div>
            </div>
            <div className="about-hero-media fade-up">
              <img src={heroImage} alt="The Bear House atelier" loading="lazy" />
              <div className="about-hero-card">
                <p>
                  Crafted in Bengaluru • Inspired by European minimalism • Built for
                  every mood
                </p>
              </div>
            </div>
          </section>

          <section className="about-values fade-up">
            {values.map((value) => (
              <article key={value}>
                <span>✷</span>
                <p>{value}</p>
              </article>
            ))}
          </section>

          <section className="about-founders">
            {founders.map((founder) => (
              <article
                key={founder.name}
                className={`founder-row ${founder.alignment === 'right' ? 'reverse' : ''}`}
              >
                <div className="founder-media fade-up">
                  <img src={founder.image} alt={founder.name} loading="lazy" />
                </div>
                <div className="founder-copy fade-up">
                  <p className="eyebrow">{founder.title}</p>
                  <h2>{founder.name}</h2>
                  <p>{founder.copy}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="about-cta fade-up">
            <div>
              <h3>Built for real life. And real men.</h3>
              <p>Step into the world of Bear House to find pieces that move with you.</p>
            </div>
            <button type="button" className="ghost">
              Explore Collections
            </button>
          </section>

          <section className="about-signoff fade-up">
            <p>“European minimalism. Indian soul. Pieces that feel like a second skin.”</p>
            <small>— The Bear House</small>
          </section>
        </div>
      </main>

      <Footer />

      <footer className="site-footer fade-up">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>
    </div>
  )
}

export default About