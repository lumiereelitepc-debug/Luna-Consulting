import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, Minus, Menu, X, Compass, Orbit, Layers3, MoveUpRight, Check } from 'lucide-react';
import ContactDialog from './components/ContactDialog.jsx';

const OrbitalScene = lazy(() => import('./components/OrbitalScene.jsx'));

const services = [
  { number: '01', icon: Compass, title: 'Estrategia de negocio', description: 'Una dirección clara para tomar mejores decisiones y construir lo que sigue.', tags: ['Visión & posicionamiento', 'Modelo de negocio', 'Hoja de ruta'], detail: 'Conectamos tu ambición con las oportunidades de tu negocio. Analizamos el contexto, definimos prioridades y trazamos una hoja de ruta que tu equipo pueda llevar a la acción.' },
  { number: '02', icon: Orbit, title: 'Innovación & crecimiento', description: 'Nuevas perspectivas para encontrar oportunidades donde otros ven límites.', tags: ['Nuevas oportunidades', 'Experiencia de cliente', 'Validación de ideas'], detail: 'Exploramos necesidades reales, diseñamos propuestas de valor y validamos nuevas ideas. Una forma de innovar con propósito, aprender pronto y enfocar los recursos donde más pueden aportar.' },
  { number: '03', icon: Layers3, title: 'Transformación organizacional', description: 'Equipos, procesos y tecnología alineados con tu próximo capítulo.', tags: ['Gestión del cambio', 'Procesos & operaciones', 'Cultura de equipo'], detail: 'La transformación empieza con las personas. Te acompañamos a simplificar procesos, alinear equipos y convertir una nueva dirección en hábitos de trabajo que perduren.' },
];

const steps = [
  { name: 'Escuchamos', title: 'Primero, entender.', text: 'Cada negocio tiene una historia. Escuchamos la tuya, exploramos tu contexto y hacemos las preguntas que ayudan a encontrar el verdadero reto.', items: ['Conversaciones con tu equipo', 'Análisis del contexto', 'Un reto bien definido'], label: '01 / DIAGNÓSTICO' },
  { name: 'Conectamos', title: 'Una nueva perspectiva.', text: 'Unimos datos, conocimiento y distintas miradas para reconocer oportunidades. Lo que parecía complejo empieza a tener una dirección.', items: ['Mapa de oportunidades', 'Prioridades compartidas', 'Perspectivas accionables'], label: '02 / PERSPECTIVA' },
  { name: 'Diseñamos', title: 'Una visión, un plan.', text: 'Convertimos las oportunidades en una hoja de ruta realista. Definimos qué hacer, cómo avanzar y qué señales nos ayudarán a medir el progreso.', items: ['Objetivos y hoja de ruta', 'Iniciativas concretas', 'Indicadores de progreso'], label: '03 / ESTRATEGIA' },
  { name: 'Acompañamos', title: 'Del plan a la acción.', text: 'Trabajamos junto a tu equipo para dar los siguientes pasos, aprender de los resultados y adaptar el camino. El cambio se construye en movimiento.', items: ['Acompañamiento al equipo', 'Seguimiento de resultados', 'Aprendizaje y adaptación'], label: '04 / EVOLUCIÓN' },
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
          {[['servicios', 'Qué hacemos'], ['metodo', 'Cómo trabajamos'], ['nosotros', 'Nuestra esencia']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className={activeSection === id ? 'nav-active' : ''}>{label}</a>)}
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
            <p className="hero-eyebrow"><span className="status-dot" /> UNA NUEVA PERSPECTIVA</p>
            <h1>Tu siguiente<br />capítulo empieza<br />con <span className="clarity-word">claridad<svg viewBox="0 0 270 14" aria-hidden="true"><path d="M2 9Q135 -5 268 7" /></svg></span>.</h1>
            <p className="hero-description">Transformamos retos complejos en una dirección clara.<br className="desktop-break" /> Estrategia, innovación y personas para llevar<br className="desktop-break" /> tu negocio más allá.</p>
            <div className="hero-buttons">
              <button className="button button-lime" onClick={openContact}>Construyamos lo que sigue <ArrowUpRight size={20} /></button>
              <a className="hero-secondary" href="#servicios">Explora nuestros servicios <ArrowDown size={16} /></a>
            </div>
            <p className="hero-note"><span className="small-cross">+</span> Grandes ideas. Pasos concretos. Contigo.</p>
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
          <div className="hero-disciplines"><span><i>01</i> Estrategia</span><span><i>02</i> Innovación</span><span><i>03</i> Transformación</span></div>
          <a className="scroll-link" href="#servicios" aria-label="Desplazarse a nuestros servicios"><ArrowDown size={20} /></a>
        </div>
      </section>

      <section id="servicios" className="services section-light">
        <div className="page-width">
          <div className="section-heading reveal"><div><SectionLabel light>QUÉ HACEMOS</SectionLabel><h2>Tu ambición.<br /><span>Nuestra siguiente misión.</span></h2></div><p>No hay dos negocios iguales.<br />Por eso, miramos más allá de las fórmulas<br />para encontrar el camino que tiene sentido para ti.</p></div>
          <div className="service-cards">
            {services.map((service, index) => { const Icon = service.icon; const expanded = expandedService === index; return <article className={`service-card reveal ${expanded ? 'service-expanded' : ''}`} key={service.number} style={{ '--reveal-delay': `${index * 100}ms` }}>
              <div className="service-top"><div className="service-icon"><Icon size={29} strokeWidth={1.2} /></div><span className="service-number">/ {service.number}</span></div>
              <h3>{service.title}</h3><p className="service-description">{service.description}</p>
              <div className="service-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="service-detail" id={`service-detail-${index}`} hidden={!expanded}><p>{service.detail}</p><button onClick={openContact}>Hablemos de tu reto <ArrowUpRight size={16} /></button></div>
              <button className="service-more" aria-expanded={expanded} aria-controls={`service-detail-${index}`} onClick={() => setExpandedService(expanded ? null : index)}><span>{expanded ? 'Ver menos' : 'Descubre el enfoque'}</span><span className="service-more-icon">{expanded ? <Minus size={19} /> : <ArrowUpRight size={19} />}</span></button>
            </article>; })}
          </div>
          <div className="service-footnote reveal"><span className="footnote-cross">✳</span><p>De la primera pregunta al siguiente gran paso.<br /><strong>Estamos para construirlo contigo.</strong></p><a href="#metodo">Conoce nuestra forma de trabajar <ArrowRight size={18} /></a></div>
        </div>
      </section>

      <section id="metodo" className="method">
        <div className="page-width">
          <div className="section-heading reveal"><div><SectionLabel>CÓMO TRABAJAMOS</SectionLabel><h2>Claridad en el proceso.<br /><span>Confianza en el camino.</span></h2></div><p>Sin cajas negras. Sin soluciones genéricas.<br />Un proceso cercano, colaborativo y diseñado<br />para avanzar con propósito.</p></div>
          <div className="method-layout reveal">
            <div className="method-steps" role="tablist" aria-label="Fases de nuestra metodología">{steps.map((item, index) => <button key={item.name} role="tab" id={`step-tab-${index}`} aria-selected={activeStep === index} aria-controls="method-panel" tabIndex={activeStep === index ? 0 : -1} className={activeStep === index ? 'step-active' : ''} onClick={() => setActiveStep(index)} onKeyDown={(event) => { if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : 3)) % 4; setActiveStep(next); document.getElementById(`step-tab-${next}`)?.focus(); } }}><span className="step-number">0{index + 1}</span><span>{item.name}</span><ArrowUpRight size={21} /></button>)}</div>
            <div className="method-panel glass-panel" id="method-panel" role="tabpanel" aria-labelledby={`step-tab-${activeStep}`} tabIndex={0}>
              <div className="method-panel-content" key={activeStep}><span className="panel-eyebrow">{step.label}</span><h3>{step.title}</h3><p>{step.text}</p><ul>{step.items.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></div>
              <div className="method-panel-orbit" aria-hidden="true"><div /><div /><div /><span>0{activeStep + 1}</span></div>
              <span className="panel-corner" aria-hidden="true">+</span>
            </div>
          </div>
        </div>
      </section>

      <section id="nosotros" className="about section-light">
        <div className="page-width about-layout">
          <div className="about-art reveal" aria-hidden="true"><div className="about-art-grid" /><div className="about-moon"><span /></div><span className="about-art-label">PERSPECTIVA / PROPÓSITO</span><span className="about-art-bottom">THE LUNA WAY <ArrowUpRight size={17} /></span><div className="about-floating-label glass-badge"><span className="status-dot" /> Cerca de ti. Más allá de lo evidente.</div></div>
          <div className="about-copy reveal"><SectionLabel light>NUESTRA ESENCIA</SectionLabel><h2>Cambiamos la mirada.<br /><span>Ampliamos lo posible.</span></h2><p>La luna nos recuerda que siempre hay otra forma de ver las cosas. Que los cambios tienen fases. Y que una nueva perspectiva puede iluminar el camino.</p><p>En Luna Consulting creemos en una consultoría que escucha, cuestiona y construye contigo. Combinamos pensamiento estratégico y sensibilidad humana para transformar la incertidumbre en posibilidades.</p><div className="about-values"><span><span className="value-dot" /> Visión estratégica</span><span><span className="value-dot" /> Cercanía real</span><span><span className="value-dot" /> Acción con propósito</span></div><button className="text-button" onClick={openContact}>Conversemos sobre tu visión <ArrowUpRight size={20} /></button></div>
        </div>
      </section>

      <section className="contact-section" id="contacto"><div className="contact-orbit" aria-hidden="true" /><div className="page-width contact-inner reveal"><SectionLabel>EL SIGUIENTE PASO ES TUYO</SectionLabel><h2>Las grandes transformaciones<br />empiezan con una <span>conversación.</span></h2><p>Cuéntanos dónde estás y hacia dónde quieres ir.<br />Demos forma a lo que sigue.</p><button className="button button-lime" onClick={openContact}>Hablemos de tu próximo capítulo <ArrowUpRight size={20} /></button><span className="contact-note">Sin fórmulas. Con perspectiva.</span></div></section>
    </main>

    <footer className="site-footer"><div className="page-width"><div className="footer-top"><Logo footer /><p>Una nueva perspectiva.<br />Un siguiente paso claro.</p><a href="#inicio">Volver al inicio <ArrowUpRight size={17} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Luna Consulting</span><span>Estrategia · Innovación · Transformación</span><span>Hecho para mirar más allá <span className="footer-star">✳</span></span></div></div></footer>
    <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
  </>;
}
