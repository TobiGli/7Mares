import { Component, lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Anchor, ArrowRight, ChevronDown, Heart, MapPin, Menu, MessageCircle, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import './styles.css';
import './error-pages.css';
import './auth.css';
import './hero-fixes.css';
import './performance.css';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const AccountPage = lazy(() => import('./pages/AccountPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

const boats = [
  { id: 1, name: 'Azimut 62 Fly', type: 'Yates', location: 'Palma, Mallorca', price: 1250000, year: 2022, length: '18.9 m', cabins: 3, image: '/Imagenes/Stock/mansour-ujJlWFDPa58-unsplash.jpg', tag: 'Selección 7Mares' },
  { id: 2, name: 'Pardo 38', type: 'Lanchas', location: 'Barcelona, España', price: 398000, year: 2023, length: '11.9 m', cabins: 1, image: '/Imagenes/Stock/Arrow460-Granturismo-1.jpg', tag: 'Como nuevo' },
  { id: 3, name: 'Bavaria Cruiser 46', type: 'Veleros', location: 'Alicante, España', price: 315000, year: 2021, length: '14.3 m', cabins: 4, image: '/Imagenes/Stock/velero.jpg', tag: 'Bajada de precio' },
  { id: 4, name: 'Silent 79 Ocean', type: 'Catamaranes', location: 'Lisboa, Portugal', price: 2890000, year: 2024, length: '23.9 m', cabins: 4, image: '/Imagenes/Stock/SILENT79_Render_Ext_14_hy02.jpg', tag: 'Novedad' },
  { id: 5, name: 'Boston Whaler 280', type: 'Lanchas', location: 'Ibiza, España', price: 175000, year: 2022, length: '8.5 m', cabins: 0, image: '/Imagenes/Stock/gallart-barco-de-pesca-tercera-lista-de-fibra-08694030170457546966546555654570g.jpg', tag: 'Oportunidad' },
  { id: 6, name: 'Riva 88 Folgore', type: 'Yates', location: 'Cannes, Francia', price: 6400000, year: 2020, length: '26.9 m', cabins: 4, image: '/Imagenes/Stock/Yate-Luis-Miguel-2000.jpg', tag: 'Colección privada' }
];
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

function Card({ boat, favorite, onFavorite, onSelect }) {
  return <article className="boat-card"><div className="boat-image-wrap"><img src={boat.image} alt={boat.name} loading="lazy" decoding="async" width="800" height="520" /><span className="boat-tag">{boat.tag}</span><button className={`icon-button ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(boat.id)} aria-label="Guardar barco"><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="boat-card-body"><div className="card-title-row"><div><p className="eyebrow">{boat.type}</p><h3>{boat.name}</h3></div><span className="year">{boat.year}</span></div><p className="location"><MapPin size={14} />{boat.location}</p><div className="boat-specs"><span>{boat.length}</span><span>{boat.cabins ? `${boat.cabins} cabinas` : 'Open deck'}</span></div><div className="card-footer"><strong>{money(boat.price)}</strong><button className="text-button" onClick={() => onSelect(boat)}>Ver detalles <ArrowRight size={16} /></button></div></div></article>;
}

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <section className="error-page"><span className="error-code">500</span><h1>Algo se salió de rumbo.</h1><p>La página encontró un problema inesperado. Vuelve a intentarlo o regresa al inicio.</p><button className="primary-button" onClick={() => window.location.reload()}>Intentar de nuevo <ArrowRight size={17} /></button></section>;
    }

    return this.props.children;
  }
}

function NotFoundPage() {
  return <section className="error-page"><span className="error-code">404</span><h1>Este rumbo no existe.</h1><p>La página que buscas ya no está aquí o nunca formó parte de nuestra carta de navegación.</p><Link className="primary-button" to="/">Volver al inicio <ArrowRight size={17} /></Link></section>;
}

function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!isSupabaseConfigured) {
      setError('Configura Supabase en las variables de entorno de Render para activar las cuentas.');
      return;
    }
    setBusy(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (result.data.session) onAuthenticated(result.data.session);
    else setError('Revisa tu email para confirmar la cuenta.');
  };

  return <div className="modal-backdrop" onClick={onClose}><div className="contact-modal auth-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X /></button><p className="kicker">Cuenta 7Mares</p><h2>{mode === 'login' ? 'Vuelve a tu rumbo.' : 'Crea tu cuenta.'}</h2><p>{mode === 'login' ? 'Guarda barcos y recibe asesoría personalizada.' : 'Guarda favoritos y sigue tus consultas.'}</p><form onSubmit={submit}>{mode === 'signup' && <input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nombre completo" />}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" /><input required minLength="6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" />{error && <p className="auth-error">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} <ArrowRight size={17} /></button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>{mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button></div></div>;
}

function App() {
  const [type, setType] = useState('Todos');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contact, setContact] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const types = ['Todos', 'Yates', 'Lanchas', 'Veleros', 'Catamaranes'];
  const visible = useMemo(() => boats.filter((boat) => (type === 'Todos' || boat.type === type) && `${boat.name} ${boat.location}`.toLowerCase().includes(query.toLowerCase())), [type, query]);
  const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2600); };
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  return <div className="app-shell">
    <header className="site-header"><a className="brand" href="#top"><span className="brand-mark"><Anchor size={20} /></span><span>7<span>MARES</span></span></a><nav className={menu ? 'main-nav open' : 'main-nav'}><a href="#barcos" onClick={() => setMenu(false)}>Explorar barcos</a><a href="#experiencia" onClick={() => setMenu(false)}>La experiencia</a><a href="#contacto" onClick={() => setContact(true)}>Asesoría privada</a></nav><div className="header-actions"><button className="saved-link" onClick={() => notify(`${favorites.length} barcos guardados`)}><Heart size={17} /><span>Guardados</span><b>{favorites.length}</b></button><button className="account-button" onClick={() => setAuthOpen(true)}>{session ? 'Mi cuenta' : 'Iniciar sesión'}</button><button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Abrir menú">{menu ? <X /> : <Menu />}</button></div></header>
    <main id="top"><section className="hero"><img src="/Imagenes/Stock/marcin-ciszewski-Zexjl0v3MRU-unsplash.jpg" alt="Yate navegando en el mar" className="hero-image" /><div className="hero-shade" /><div className="hero-content" style={{ paddingBottom: '150px' }}><p className="kicker light"><Sparkles size={15} /> Curaduría náutica desde 1998</p><h1>Tu próximo <em>horizonte</em><br />empieza aquí.</h1><p className="hero-copy">Barcos excepcionales, seleccionados para quienes entienden que la libertad también tiene una dirección.</p><a className="primary-button" href="#barcos">Explorar la colección <ArrowRight size={17} /></a></div><div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', width: 'calc(100% - 16vw)', gap: '18px' }}><span><strong>+120</strong> embarcaciones</span><span><strong>12</strong> destinos</span><span><strong>25 años</strong> de experiencia</span></div></section>
      <section className="search-panel" id="barcos"><div className="search-heading"><div><p className="kicker">Encuentra tu barco</p><h2>Una colección con rumbo propio.</h2></div><span className="search-count">{visible.length} resultados</span></div><div className="search-controls"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por modelo o destino" /></label><div className="type-filters">{types.map((item) => <button key={item} className={type === item ? 'active' : ''} onClick={() => setType(item)}>{item}</button>)}</div><button className="filter-button"><SlidersHorizontal size={17} /> Filtros</button></div></section>
      <section className="collection"><div className="collection-head"><div><p className="kicker">Selección editorial</p><h2>Barcos destacados</h2></div><button className="sort-button">Más relevantes <ChevronDown size={16} /></button></div><div className="boat-grid">{visible.map((boat) => <Card key={boat.id} boat={boat} favorite={favorites.includes(boat.id)} onFavorite={toggleFavorite} onSelect={setSelected} />)}</div>{!visible.length && <div className="empty-state"><Search size={28} /><h3>No encontramos ese rumbo</h3><p>Prueba con otra marca, ciudad o categoría.</p></div>}</section>
      <section className="experience" id="experiencia"><div className="experience-image"><img src="/Imagenes/Stock/pietro-de-grandi-0WQLuFqMYYI-unsplash.jpg" alt="Velero navegando al atardecer" loading="lazy" decoding="async" width="1200" height="800" /></div><div className="experience-content"><p className="kicker light">Más que una compra</p><h2>El mar no se explica.<br /><em>Se vive.</em></h2><p>Te acompañamos desde la primera conversación hasta el día en que sueltas amarras. Inspección, financiación, documentación y entrega: cada detalle bajo control.</p><div className="trust-points"><span><ShieldCheck size={19} /> Compra segura y transparente</span><span><Anchor size={19} /> Red internacional de especialistas</span></div><button className="outline-button" onClick={() => setContact(true)}>Conoce nuestro servicio <ArrowRight size={17} /></button></div></section>
      <section className="newsletter"><div><p className="kicker">Bitácora 7Mares</p><h2>Ideas, rutas y barcos<br />en tu bandeja.</h2></div><form onSubmit={(event) => { event.preventDefault(); notify('Te has suscrito a la Bitácora 7Mares'); }}><input type="email" required placeholder="Tu email" aria-label="Tu email" /><button className="primary-button" type="submit">Suscribirme <ArrowRight size={17} /></button></form></section></main>
    <footer id="contacto"><div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark"><Anchor size={20} /></span><span>7<span>MARES</span></span></a><p>El siguiente horizonte<br />te está esperando.</p></div><div className="footer-links"><div><b>Explorar</b><a href="#barcos">Todos los barcos</a><a href="#barcos">Yates</a><a href="#barcos">Veleros</a></div><div><b>7Mares</b><a href="#experiencia">Nuestra experiencia</a><button onClick={() => setContact(true)}>Contactar un asesor</button><a href="#top">Privacidad</a></div></div><div className="footer-bottom"><span>© 2024 7Mares</span><span>Palma · Barcelona · Lisboa</span></div></footer>
    <button className="whatsapp" onClick={() => setContact(true)} aria-label="Contactar por WhatsApp"><MessageCircle size={22} /></button>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="boat-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar"><X /></button><img src={selected.image} alt={selected.name} /><div><p className="kicker">{selected.type} · {selected.year}</p><h2>{selected.name}</h2><p className="location"><MapPin size={14} />{selected.location}</p><strong className="modal-price">{money(selected.price)}</strong><p className="modal-description">Una embarcación lista para convertir cada salida en una historia. Nuestro equipo puede preparar una visita privada y compartirte la ficha técnica completa.</p><button className="primary-button" onClick={() => { setSelected(null); setContact(true); }}>Solicitar información <ArrowRight size={17} /></button></div></div></div>}
    {contact && <div className="modal-backdrop" onClick={() => setContact(false)}><div className="contact-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setContact(false)} aria-label="Cerrar"><X /></button><p className="kicker">Asesoría privada</p><h2>Hablemos de tu próximo barco.</h2><p>Cuéntanos qué estás buscando y un especialista te contactará.</p><form onSubmit={(event) => { event.preventDefault(); setContact(false); notify('Mensaje enviado. Te contactaremos pronto.'); }}><input required placeholder="Nombre" /><input required type="email" placeholder="Email" /><textarea required placeholder="¿Qué barco tienes en mente?" rows="4" /><button className="primary-button" type="submit">Enviar consulta <ArrowRight size={17} /></button></form></div></div>}
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthenticated={(nextSession) => { setSession(nextSession); setAuthOpen(false); notify('Sesión iniciada correctamente.'); }} />}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
export default App;

function RouteLoading() {
  return <section className="route-loading" aria-live="polite">Preparando tu rumbo...</section>;
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><BrowserRouter><Suspense fallback={<RouteLoading />}><Routes><Route path="/" element={<App />} /><Route path="/cuenta" element={<AccountPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="/404" element={<NotFoundPage />} /><Route path="*" element={<Navigate to="/404" replace />} /></Routes></Suspense></BrowserRouter></ErrorBoundary>);
