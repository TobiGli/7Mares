import { useEffect, useState } from 'react';
import { ArrowLeft, Anchor, Heart, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import '../routes.css';
import '../profile.css';

export default function AccountPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadAccount = async () => {
      if (!isSupabaseConfigured || !supabase) { setStatus('not-configured'); return; }
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) { setStatus('unauthenticated'); return; }
      setSession(currentSession);
      const { data, error } = await supabase.from('profiles').select('full_name, role').eq('id', currentSession.user.id).single();
      if (error) { setMessage(error.message); setStatus('error'); return; }
      setProfile(data);
      setFullName(data.full_name || currentSession.user.user_metadata?.full_name || '');
      setStatus('ready');
    };
    loadAccount();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage('');
    const { error } = await supabase.rpc('update_my_profile', { new_full_name: fullName.trim() });
    setMessage(error ? error.message : 'Perfil actualizado correctamente.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (status !== 'ready') return <main className="account-state"><Link className="brand" to="/"><span className="brand-mark"><Anchor size={20} /></span><span>7<span>MARES</span></span></Link><div><p className="kicker">Tu espacio 7Mares</p><h1>{status === 'loading' ? 'Cargando tu cuenta...' : 'Necesitas iniciar sesión.'}</h1><p>{status === 'not-configured' ? 'Configura Supabase para activar la gestión de usuarios.' : status === 'error' ? message : 'Vuelve al catálogo e inicia sesión para acceder a tu perfil.'}</p><Link className="primary-button" to="/"><ArrowLeft size={17} /> Volver al catálogo</Link></div></main>;

  return <main className="route-page account-page"><header className="route-header"><Link className="brand" to="/"><span className="brand-mark"><Anchor size={20} /></span><span>7<span>MARES</span></span></Link><div className="account-header-actions"><span>{session.user.email}</span><button className="text-button" onClick={signOut}><LogOut size={16} /> Cerrar sesión</button></div></header><section className="account-layout"><div><p className="kicker">Tu espacio 7Mares</p><h1>Todo tu rumbo,<br /><em>en un mismo lugar.</em></h1><p className="route-lead">Gestiona tus datos, revisa tus favoritos y mantén tus consultas náuticas bajo control.</p></div><div className="account-options"><article><Heart size={22} /><h2>Favoritos</h2><p>Consulta los barcos que quieres volver a visitar.</p><Link to="/">Explorar barcos</Link></article><article><UserRound size={22} /><h2>Tu perfil</h2><form className="profile-form" onSubmit={saveProfile}><label>Nombre completo<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" /></label><label>Email<input value={session.user.email} readOnly /></label><span className="profile-role"><ShieldCheck size={15} /> Rol: {profile.role === 'admin' ? 'Administrador' : 'Comprador'}</span><button className="primary-button" type="submit">Guardar cambios</button>{message && <small>{message}</small>}</form></article>{profile.role === 'admin' && <article className="admin-access-card"><ShieldCheck size={22} /><h2>Administración</h2><p>Gestiona el inventario y las operaciones de 7Mares.</p><Link className="primary-button" to="/admin">Abrir dashboard admin</Link></article>}</div></section></main>;
}
