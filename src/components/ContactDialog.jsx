import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './ContactDialog.css';

const initialFields = { name: '', email: '', company: '', challenge: '' };

function ArrowIcon({ download = false }) {
  return download ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 16v4h16v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A local briefing builder. It does not send information to a server. */
export default function ContactDialog({ open, onClose }) {
  const [fields, setFields] = useState(initialFields);
  const [completed, setCompleted] = useState(false);
  const [briefing, setBriefing] = useState('');
  const [filename, setFilename] = useState('');
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const confirmationRef = useRef(null);
  const closeRef = useRef(onClose);
  const id = useId();

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const animationFrame = requestAnimationFrame(() => {
      (confirmationRef.current || nameRef.current)?.focus();
    });

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'
      ) || []).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !focusable.includes(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !focusable.includes(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
    // Keep the trigger focus and scroll lock stable while the dialog is open.
  }, [open]);

  useEffect(() => {
    if (open && completed) confirmationRef.current?.focus();
  }, [completed, open]);

  function updateField(event) {
    const { name, value } = event.target;
    event.target.setCustomValidity('');
    setFields((previous) => ({ ...previous, [name]: value }));
  }

  function download(text, file) {
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = file;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const name of ['name', 'challenge']) {
      const input = form.elements.namedItem(name);
      input.setCustomValidity(fields[name].trim() ? '' : 'Completa este campo.');
    }
    if (!form.reportValidity()) return;
    const today = new Date();
    const text = [
      'LUNA CONSULTING',
      'Briefing de proyecto',
      '',
      `Fecha: ${today.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Nombre: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      `Empresa: ${fields.company.trim() || 'No especificada'}`,
      '',
      'EL RETO',
      fields.challenge.trim(),
      '',
      'Este documento se creó localmente en tu dispositivo.',
      'No se ha enviado información a Luna Consulting.',
    ].join('\n');
    const file = `luna-consulting-briefing-${today.toISOString().slice(0, 10)}.txt`;
    setBriefing(text);
    setFilename(file);
    download(text, file);
    setCompleted(true);
  }

  function resetBriefing() {
    setCompleted(false);
    setFields(initialFields);
    setBriefing('');
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  if (!open) return null;

  return createPortal(
    <div className="lc-contact-overlay" onClick={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section
        className="lc-contact-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        tabIndex={-1}
      >
        <button className="lc-contact-close" type="button" onClick={onClose} aria-label="Cerrar conversación">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {completed ? (
          <div className="lc-contact-confirmation">
            <span className="lc-contact-check" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <p className="lc-contact-eyebrow">EL PRIMER PASO, HECHO</p>
            <h2 id={`${id}-title`} ref={confirmationRef} tabIndex={-1}>Tu briefing está listo.</h2>
            <p id={`${id}-description`} className="lc-contact-description">
              Se inició la descarga de un archivo de texto en tu dispositivo. Tu información no se ha enviado.
            </p>
            <div className="lc-contact-file"><span aria-hidden="true">↳</span><span>{filename}</span><span className="lc-contact-file-type">TXT</span></div>
            <button className="lc-contact-submit" type="button" onClick={() => download(briefing, filename)}>
              Descargar de nuevo <ArrowIcon download />
            </button>
            <button className="lc-contact-secondary" type="button" onClick={resetBriefing}>Crear otro briefing <ArrowIcon /></button>
          </div>
        ) : (
          <>
            <p className="lc-contact-eyebrow"><span /> HABLEMOS DE LO QUE SIGUE</p>
            <h2 id={`${id}-title`}>Las grandes ideas<br />empiezan <em>contigo.</em></h2>
            <p id={`${id}-description`} className="lc-contact-description">Cuéntanos qué quieres mejorar en tu operación, servicio, ventas o presencia digital. Preparemos el punto de partida de tu diagnóstico.</p>

            <form className="lc-contact-form" onSubmit={handleSubmit}>
              <div className="lc-contact-field-row">
                <label className="lc-contact-field" htmlFor={`${id}-name`}>Tu nombre <span aria-hidden="true">*</span>
                  <input ref={nameRef} id={`${id}-name`} name="name" value={fields.name} onChange={updateField} autoComplete="name" placeholder="¿Cómo te llamas?" required maxLength={120} />
                </label>
                <label className="lc-contact-field" htmlFor={`${id}-email`}>Email <span aria-hidden="true">*</span>
                  <input id={`${id}-email`} name="email" type="email" value={fields.email} onChange={updateField} autoComplete="email" placeholder="tu@empresa.com" required maxLength={254} />
                </label>
              </div>
              <label className="lc-contact-field" htmlFor={`${id}-company`}>Empresa <small>Opcional</small>
                <input id={`${id}-company`} name="company" value={fields.company} onChange={updateField} autoComplete="organization" placeholder="El nombre de tu proyecto" maxLength={160} />
              </label>
              <label className="lc-contact-field" htmlFor={`${id}-challenge`}>¿Cuál es tu próximo reto? <span aria-hidden="true">*</span>
                <textarea id={`${id}-challenge`} name="challenge" value={fields.challenge} onChange={updateField} placeholder="¿Qué está pasando en tu negocio? ¿Qué quieres mejorar? ¿Qué necesitas entender de tus clientes?" required rows={3} maxLength={4000} />
              </label>
              <p className="lc-contact-local-note">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <span>El briefing se descargará en tu dispositivo. Este formulario no envía tus datos.</span>
              </p>
              <button className="lc-contact-submit" type="submit">Descargar mi briefing <ArrowIcon /></button>
            </form>
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}
