function InfoSection({ title, items }) {
  return (
    <article className="info-card fade-up">
      <header>
        <h3>{title}</h3>
      </header>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

export default InfoSection

