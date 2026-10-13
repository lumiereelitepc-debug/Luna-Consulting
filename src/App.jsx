import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, Minus, Menu, X, Compass, Orbit, Layers3, MoveUpRight, Check, Users, ChartNoAxesCombined, Monitor } from 'lucide-react';
import ContactDialog from './components/ContactDialog.jsx';

const OrbitalScene = lazy(() => import('./components/OrbitalScene.jsx'));

const services = [
  { number: '01', icon: Compass, title: 'Diagnóstico estratégico', description: 'Una visión integral de tu negocio para reconocer fortalezas, retos y prioridades.', tags: ['Diagnóstico integral', 'FODA', 'Competencia'], detail: 'Evaluamos operación, servicio, ventas, comunicación y presencia digital. Integramos un análisis FODA y un estudio de negocios comparables para entender tu posicionamiento y detectar oportunidades con información.' },
  { number: '02', icon: Users, title: 'Clientes & experiencia', description: 'Entendemos qué valora tu cliente y dónde puede mejorar su experiencia.', tags: ['Encuestas', 'Reseñas', 'Customer Journey'], detail: 'Diseñamos encuestas de percepción, analizamos reseñas y mapeamos el recorrido del cliente, desde el primer contacto hasta la recompra. Evaluamos atención y puntos críticos; cuando es viable, complementamos con una visita de cliente incógnito.' },
  { number: '03', icon: Layers3, title: 'Operación & capacitación', description: 'Procesos más claros y un equipo preparado para brindar un servicio consistente.', tags: ['Procesos', 'Protocolos de atención', 'Capacitación'], detail: 'Revisamos flujos de trabajo, tiempos de servicio, coordinación y manejo de errores. Proponemos mejoras y oportunidades de estandarización. Adaptamos la capacitación a los hallazgos: atención, comunicación, trabajo en equipo, quejas y venta sugerida.' },
  { number: '04', icon: ChartNoAxesCombined, title: 'Desarrollo comercial', description: 'Estrategias de venta y fidelización conectadas con las oportunidades de tu negocio.', tags: ['Venta sugerida', 'Promociones', 'Fidelización'], detail: 'Diseñamos propuestas de venta sugerida y cruzada, promociones, combos y acciones para la recompra y recomendación. La selección de iniciativas parte del diagnóstico, las características de tu oferta y las necesidades de tus clientes.' },
  { number: '05', icon: Monitor, title: 'Marketing & presencia digital', description: 'Una comunicación coherente en redes, buscadores y puntos de contacto digitales.', tags: ['Contenidos', 'Reputación digital', 'Propuesta web'], detail: 'Auditamos perfiles, información y reputación digital. Definimos pilares de contenido, calendario editorial y recomendaciones para redes sociales y Google. Proponemos la estructura y los contenidos de tu página web como punto central de información y contacto.' },
  { number: '06', icon: Orbit, title: 'Plan de mejora & seguimiento', description: 'De los hallazgos a acciones priorizadas, acompañamiento e indicadores claros.', tags: ['Plan de acción', 'Acompañamiento', 'KPIs'], detail: 'Convertimos el diagnóstico en un plan con acciones, objetivos, prioridades, plazos, recursos e indicadores. Presentamos los hallazgos contigo, acordamos el alcance del acompañamiento y definimos cómo seguir el desempeño comercial, de servicio y digital.' },
];

const steps = [
  { name: 'Investigar', title: 'Primero, conocer.', text: 'Recopilamos información interna y externa para entender el negocio desde distintas perspectivas: operación, clientes, competencia y canales digitales.', items: ['Información del negocio y procesos', 'Encuestas y reseñas de clientes', 'Revisión de competencia y presencia digital'], label: '01 / INVESTIGACIÓN' },
  { name: 'Analizar', title: 'Escuchar lo que dicen los datos.', text: 'Interpretamos la información y detectamos patrones en el servicio, la percepción del cliente y el posicionamiento del negocio.', items: ['Análisis de encuestas y reseñas', 'Benchmarking de competidores', 'Recorrido del cliente y procesos'], label: '02 / ANÁLISIS' },
  { name: 'Diagnosticar', title: 'Claridad sobre lo que importa.', text: 'Integramos los hallazgos en una visión estructurada. Identificamos fortalezas, áreas de oportunidad y prioridades, y las presentamos contigo.', items: ['Diagnóstico integral y análisis FODA', 'Hallazgos y oportunidades prioritarias', 'Sesión de presentación de resultados'], label: '03 / DIAGNÓSTICO' },
  { name: 'Diseñar', title: 'Una estrategia que puedes usar.', text: 'Diseñamos un plan de mejora adaptado a los hallazgos. Cada iniciativa tiene un objetivo, una prioridad, un plazo, recursos e indicadores.', items: ['Acciones comerciales y fidelización', 'Recomendaciones operativas y digitales', 'Plan de mejora con prioridades y plazos'], label: '04 / ESTRATEGIA' },
  { name: 'Implementar', title: 'Hacer, aprender y medir.', text: 'Capacitamos al equipo y definimos el acompañamiento para poner en marcha el plan. Establecemos indicadores que permitan evaluar el desempeño y ajustar las acciones.', items: ['Capacitación adaptada al diagnóstico', 'Acompañamiento según el alcance acordado', 'Indicadores comerciales, de servicio y digitales'], label: '05 / IMPLEMENTACIÓN Y MEDICIÓN' },
];

const deliverables = [
  { number: '01', title: 'Una radiografía del negocio', items: ['Diagnóstico integral y análisis FODA', 'Resultados de encuestas y análisis de reseñas', 'Benchmarking de competencia', 'Mapa de experiencia del cliente'] },
  { number: '02', title: 'Un plan para actuar', items: ['Acciones con objetivo, prioridad, plazo y recursos', 'Recomendaciones de mejora de procesos', 'Propuestas comerciales y de fidelización', 'Indicadores para evaluar cada iniciativa'] },
  { number: '03', title: 'Equipo y comunicación alineados', items: ['Capacitación en servicio, comunicación y venta sugerida', 'Estrategia de redes y calendario de contenidos', 'Recomendaciones de presencia y reputación digital', 'Propuesta de estructura y contenido para tu web'] },
  { number: '04', title: 'Indicadores para decidir', items: ['Ventas, ticket promedio y frecuencia de compra', 'Satisfacción, quejas y tiempos de atención', 'Alcance, consultas y conversiones digitales', 'Reseñas, calificación y percepción del cliente'] },
];

function Logo({ footer = false }) {
  return <a href="#inicio" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="Luna Consulting, ir al inicio">
    <img src="/luna-symbol.png" className="brand-symbol" width="42" height="42" alt="" onError={(event) => { event.currentTarget.src = '/favicon.svg'; }} />
    <span className="brand-wordmark">luna<span className="brand-registered" aria-hidden="true">✦</span><span className="brand-subtitle">CONSULTING</span></span>
  </a>;
}

function SectionLabel({ children, light = false }) {
  return <p className={`section-label ${light ? 'label-dark' : ''}`}><span className="label-square" />{children}</p>;
}

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedService, setExpandedService] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: '-15% 0px -60% 0px' });
    document.querySelectorAll('main > section[id]').forEach((element) => sectionObserver.observe(element));
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); sectionObserver.disconnect(); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const openContact = () => { if (menuOpen) menuButton.current?.focus(); setMenuOpen(false); setContactOpen(true); };
  const step = steps[activeStep];

  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        <Logo />
        <nav className={`desktop-nav ${menuOpen ? 'nav-open' : ''}`} id="main-navigation" aria-label="Navegación principal">
          {[['servicios', 'Qué hacemos'], ['metodo', 'Cómo trabajamos'], ['entregables', 'Qué recibes'], ['nosotros', 'Nuestra esencia']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className={activeSection === id ? 'nav-active' : ''}>{label}</a>)}
          <button className="mobile-contact" onClick={openContact}>Hablemos <ArrowUpRight size={17} /></button>
        </nav>
        <div className="header-actions"><button className="button button-outline header-contact" onClick={openContact}>Hablemos <ArrowUpRight size={17} /></button>
          <button ref={menuButton} className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="contenido">
      <section className="hero" id="inicio">
        <div className="hero-grid-texture" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-main page-width">
          <div className="hero-copy">
            <p className="hero-eyebrow"><span className="status-dot" /> CONSULTORÍA EMPRESARIAL INTEGRAL</p>
            <h1>Tu siguiente<br />capítulo empieza<br />con <span className="clarity-word">claridad<svg viewBox="0 0 270 14" aria-hidden="true"><path d="M2 9Q135 -5 268 7" /></svg></span>.</h1>
            <p className="hero-description">Conocemos tu negocio, escuchamos a tus clientes<br className="desktop-break" /> y conectamos operación, ventas y presencia digital<br className="desktop-break" /> en un plan de mejora con acciones medibles.</p>
            <div className="hero-buttons">
              <button className="button button-lime" onClick={openContact}>Hablemos de tu negocio <ArrowUpRight size={20} /></button>
              <a className="hero-secondary" href="#servicios">Explora nuestros servicios <ArrowDown size={16} /></a>
            </div>
            <p className="hero-note"><span className="small-cross">+</span> Investigación. Acciones priorizadas. Indicadores claros.</p>
          </div>
          <div className="hero-visual">
            <div className="visual-orbit orbit-one" aria-hidden="true" />
            <div className="visual-orbit orbit-two" aria-hidden="true" />
            <span className="visual-coordinate coordinate-top">VISIÓN / DIRECCIÓN / EVOLUCIÓN</span>
            <span className="visual-cross cross-top" aria-hidden="true">+</span>
            <Suspense fallback={<div className="orbital-scene" aria-hidden="true"><div className="orbital-fallback"><div /><span /><i /></div></div>}><OrbitalScene /></Suspense>
            <div className="glass-badge badge-perspective"><div className="badge-icon"><Orbit size={20} strokeWidth={1.3} /></div><div><span>PERSPECTIVA LUNA</span><strong>Todo empieza con una visión.</strong></div><span className="badge-live" /></div>
            <div className="glass-badge badge-progress"><span className="progress-label">IDEAS QUE SE MUEVEN</span><div className="mini-chart" aria-hidden="true">{[22, 30, 26, 43, 38, 58, 65, 77, 90].map((height, i) => <i key={i} style={{ '--bar-height': `${height}%`, '--bar-delay': `${i * 0.08}s` }} />)}</div><span className="progress-arrow"><MoveUpRight size={21} /></span></div>
            <span className="visual-coordinate coordinate-bottom"><span className="tiny-dot" /> EN CONSTANTE EVOLUCIÓN</span>
          </div>
        </div>
        <div className="hero-bottom page-width">
          <p>Una mirada distinta.<br /><span>Posibilidades reales.</span></p>
          <div className="hero-disciplines"><span><i>01</i> Diagnóstico</span><span><i>02</i> Estrategia</span><span><i>03</i> Implementación</span></div>
          <a className="scroll-link" href="#servicios" aria-label="Desplazarse a nuestros servicios"><ArrowDown size={20} /></a>
        </div>
      </section>

      <section id="servicios" className="services section-light">
        <div className="page-width">
          <div className="section-heading reveal"><div><SectionLabel light>QUÉ HACEMOS</SectionLabel><h2>Entendemos tu negocio.<br /><span>Conectamos sus oportunidades.</span></h2></div><p>Una mirada integral a la estrategia, los clientes,<br />la operación y los canales comerciales y digitales.<br />Cada propuesta parte de lo que tu negocio necesita.</p></div>
          <div className="service-cards">
            {services.map((service, index) => { const Icon = service.icon; const expanded = expandedService === index; return <article className={`service-card reveal ${expanded ? 'service-expanded' : ''}`} key={service.number} style={{ '--reveal-delay': `${index * 100}ms` }}>
              <div className="service-top"><div className="service-icon"><Icon size={29} strokeWidth={1.2} /></div><span className="service-number">/ {service.number}</span></div>
              <h3>{service.title}</h3><p className="service-description">{service.description}</p>
              <div className="service-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="service-detail" id={`service-detail-${index}`} hidden={!expanded}><p>{service.detail}</p><button onClick={openContact}>Hablemos de tu reto <ArrowUpRight size={16} /></button></div>
              <button className="service-more" aria-expanded={expanded} aria-controls={`service-detail-${index}`} onClick={() => setExpandedService(expanded ? null : index)}><span>{expanded ? 'Ver menos' : 'Descubre el enfoque'}</span><span className="service-more-icon">{expanded ? <Minus size={19} /> : <ArrowUpRight size={19} />}</span></button>
            </article>; })}
          </div>
          <div className="service-footnote reveal"><span className="footnote-cross">✳</span><p>Un diagnóstico, una estrategia y un camino para avanzar.<br /><strong>Alcance, tiempos e inversión definidos contigo.</strong></p><a href="#metodo">Conoce nuestra forma de trabajar <ArrowRight size={18} /></a></div>
        </div>
      </section>

      <section id="metodo" className="method">
        <div className="page-width">
          <div className="section-heading reveal"><div><SectionLabel>CÓMO TRABAJAMOS</SectionLabel><h2>Información para entender.<br /><span>Estrategia para avanzar.</span></h2></div><p>Cinco etapas que conectan investigación,<br />análisis, diagnóstico, estrategia<br />e implementación con medición.</p></div>
          <div className="method-layout reveal">
            <div className="method-steps" role="tablist" aria-orientation="vertical" aria-label="Etapas de nuestra metodología">{steps.map((item, index) => <button key={item.name} role="tab" id={`step-tab-${index}`} aria-selected={activeStep === index} aria-controls="method-panel" tabIndex={activeStep === index ? 0 : -1} className={activeStep === index ? 'step-active' : ''} onClick={() => setActiveStep(index)} onKeyDown={(event) => { if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : steps.length - 1)) % steps.length; setActiveStep(next); document.getElementById(`step-tab-${next}`)?.focus(); } }}><span className="step-number">0{index + 1}</span><span>{item.name}</span><ArrowUpRight size={21} /></button>)}</div>
            <div className="method-panel glass-panel" id="method-panel" role="tabpanel" aria-labelledby={`step-tab-${activeStep}`} tabIndex={0}>
              <div className="method-panel-content" key={activeStep}><span className="panel-eyebrow">{step.label}</span><h3>{step.title}</h3><p>{step.text}</p><ul>{step.items.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></div>
              <div className="method-panel-orbit" aria-hidden="true"><div /><div /><div /><span>0{activeStep + 1}</span></div>
              <span className="panel-corner" aria-hidden="true">+</span>
            </div>
          </div>
        </div>
      </section>

      <section id="entregables" className="deliverables section-light">
        <div className="page-width">
          <div className="section-heading reveal"><div><SectionLabel light>QUÉ RECIBES</SectionLabel><h2>Más que ideas.<br /><span>Herramientas para decidir.</span></h2></div><p>Documentos, recomendaciones y capacitación<br />para convertir la información en decisiones.<br />Los entregables se definen según el alcance acordado.</p></div>
          <div className="deliverable-grid">{deliverables.map((item, index) => <article key={item.number} className="deliverable-card reveal" style={{ '--reveal-delay': `${index % 2 * 100}ms` }}><div className="deliverable-heading"><span className="deliverable-number">{item.number}</span><h3>{item.title}</h3></div><ul>{item.items.map((text) => <li key={text}><Check size={15} />{text}</li>)}</ul></article>)}</div>
          <div className="deliverable-note reveal"><span className="label-square" /><p>Tu proyecto, a tu medida. Definimos contigo el alcance, los tiempos y la inversión después de la reunión inicial.</p><button onClick={openContact}>Preparemos tu diagnóstico <ArrowUpRight size={17} /></button></div>
        </div>
      </section>

      <section id="nosotros" className="about section-light">
        <div className="page-width about-layout">
          <div className="about-art reveal" aria-hidden="true"><div className="about-art-grid" /><div className="about-moon"><span /></div><span className="about-art-label">PERSPECTIVA / PROPÓSITO</span><span className="about-art-bottom">THE LUNA WAY <ArrowUpRight size={17} /></span><div className="about-floating-label glass-badge"><span className="status-dot" /> Cerca de ti. Más allá de lo evidente.</div></div>
          <div className="about-copy reveal"><SectionLabel light>NUESTRA ESENCIA</SectionLabel><h2>Cambiamos la mirada.<br /><span>Ampliamos lo posible.</span></h2><p>La luna nos recuerda que siempre hay otra forma de ver las cosas. Para nosotros, esa nueva perspectiva empieza por investigar, escuchar a tus clientes y entender cómo funciona tu negocio.</p><p>En Luna Consulting conectamos diagnóstico, experiencia del cliente, operación, desarrollo comercial y presencia digital. Nuestro trabajo convierte los hallazgos en recomendaciones, capacitación y un plan de mejora que puedas usar para decidir.</p><div className="about-values"><span><span className="value-dot" /> Información, no suposiciones</span><span><span className="value-dot" /> Cercanía real</span><span><span className="value-dot" /> Acciones medibles</span></div><button className="text-button" onClick={openContact}>Conversemos sobre tu negocio <ArrowUpRight size={20} /></button></div>
        </div>
      </section>

      <section className="contact-section" id="contacto"><div className="contact-orbit" aria-hidden="true" /><div className="page-width contact-inner reveal"><SectionLabel>EL SIGUIENTE PASO ES TUYO</SectionLabel><h2>El siguiente paso de tu negocio<br />empieza con un <span>diagnóstico.</span></h2><p>Cuéntanos qué quieres mejorar en tu operación,<br />servicio, ventas o presencia digital.</p><button className="button button-lime" onClick={openContact}>Preparemos el punto de partida <ArrowUpRight size={20} /></button><span className="contact-note">Una propuesta personalizada. Acciones con dirección.</span></div></section>
    </main>

    <footer className="site-footer"><div className="page-width"><div className="footer-top"><Logo footer /><p>Consultoría empresarial integral.<br />Información para avanzar.</p><a href="#inicio">Volver al inicio <ArrowUpRight size={17} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Luna Consulting</span><span>Diagnóstico · Estrategia · Implementación</span><span>Hecho para mirar más allá <span className="footer-star">✳</span></span></div></div></footer>
    <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
  </>;
}
