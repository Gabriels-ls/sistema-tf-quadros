function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-navy)', color: 'var(--color-steel-light)', padding: '32px 0', marginTop: '60px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <strong style={{ color: 'var(--color-white)', fontFamily: 'var(--font-display)' }}>TF QUADROS</strong>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Quadros para serigrafia sob medida.</p>
        </div>
        <div style={{ fontSize: '13px' }}>
          <p>tfquadros@terra.com.br</p>
          <p>(47) 3332-2923</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;