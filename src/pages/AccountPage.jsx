import { ArrowLeft, Anchor, Heart, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../routes.css';

export default function AccountPage() {
  return <main className="route-page account-page"><header className="route-header"><Link className="brand" to="/"><span className="brand-mark"><Anchor size={20} /></span><span>7<span>MARES</span></span></Link><Link className="back-link" to="/"><ArrowLeft size={16} /> Volver al catálogo</Link></header><section className="account-layout"><div><p className="kicker">Tu espacio 7Mares</p><h1>Todo tu rumbo,<br /><em>en un mismo lugar.</em></h1><p className="route-lead">Guarda barcos, sigue tus consultas y recibe recomendaciones pensadas para tu próxima navegación.</p></div><div className="account-options"><article><Heart size={22} /><h2>Favoritos</h2><p>Consulta los barcos que quieres volver a visitar.</p><Link to="/">Explorar barcos</Link></article><article><UserRound size={22} /><h2>Perfil</h2><p>Actualiza tus datos y preferencias de contacto.</p><span>Disponible al iniciar sesión</span></article></div></section></main>;
}
