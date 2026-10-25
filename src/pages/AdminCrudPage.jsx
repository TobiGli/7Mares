import { useEffect, useState } from 'react';
import { Anchor, ArrowLeft, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import '../routes.css';
import '../admin-crud.css';

const emptyBoat = { name: '', type: 'Yates', location: '', price: '', year: new Date().getFullYear(), length: '', cabins: 0, image_url: '', tag: '', featured: false };
const types = ['Yates', 'Lanchas', 'Veleros', 'Catamaranes', 'Botes', 'Motos acuaticas'];

export default function AdminCrudPage() {
  const [boats, setBoats] = useState([]);
  const [form, setForm] = useState(emptyBoat);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [access, setAccess] = useState('checking');
  const [error, setError] = useState('');

  const loadBoats = async () => {
    const { data, error: queryError } = await supabase.from('boats').select('*').order('created_at', { ascending: false });
    if (queryError) setError(queryError.message);
    else setBoats(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) { setAccess('not-configured'); setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAccess('unauthenticated'); setLoading(false); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { setAccess('forbidden'); setLoading(false); return; }
      setAccess('allowed');
      await loadBoats();
    };
    load();
  }, []);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const editBoat = (boat) => { setEditingId(boat.id); setForm({ ...boat, price: String(boat.price) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const resetForm = () => { setEditingId(null); setForm(emptyBoat); };

  const saveBoat = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, price: Number(form.price), year: Number(form.year), cabins: Number(form.cabins) };
    const result = editingId ? await supabase.from('boats').update(payload).eq('id', editingId) : await supabase.from('boats').insert(payload);
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    resetForm();
    await loadBoats();
  };

  const removeBoat = async (id) => {
    if (!window.confirm('¿Eliminar este barco del inventario?')) return;
    const { error: deleteError } = await supabase.from('boats').delete().eq('id', id);
    if (deleteError) setError(deleteError.message);
    else setBoats((current) => current.filter((boat) => boat.id !== id));
  };

  if (access !== 'allowed') return <main className="admin-access"><Link className="brand" to="/"><span className="brand-mark"><Anchor size={20} /></span><span>7<span>MARES</span></span></Link><div><p className="kicker">Centro de control</p><h1>{access === 'checking' ? 'Comprobando acceso...' : 'Acceso restringido.'}</h1><p>{access === 'not-configured' ? 'Configura la clave pública de Supabase para activar el panel.' : access === 'unauthenticated' ? 'Inicia sesión con una cuenta autorizada para continuar.' : access === 'forbidden' ? 'Tu cuenta no tiene permisos de administrador.' : 'Cargando tu sesión.'}</p><Link className="primary-button" to="/"><ArrowLeft size={17} /> Volver al sitio</Link></div></main>;

  return <main className="admin-crud"><header className="admin-crud-header"><div><Link className="back-link" to="/"><ArrowLeft size={16} /> Sitio público</Link><p className="kicker">Inventario 7Mares</p><h1>Gestiona tu flota.</h1></div><button className="primary-button" onClick={() => { resetForm(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Plus size={17} /> Nuevo barco</button></header><section className="admin-crud-grid"><form className="admin-form" onSubmit={saveBoat}><div className="panel-heading"><div><p className="kicker">{editingId ? 'Editar ficha' : 'Nueva ficha'}</p><h2>{editingId ? 'Actualizar barco' : 'Publicar barco'}</h2></div>{editingId && <button type="button" className="icon-button" onClick={resetForm} aria-label="Cancelar edición"><X /></button>}</div><label>Nombre<input required name="name" value={form.name} onChange={updateField} placeholder="Ej. Azimut 62 Fly" /></label><div className="form-row"><label>Tipo<select name="type" value={form.type} onChange={updateField}>{types.map((type) => <option key={type}>{type}</option>)}</select></label><label>Año<input required type="number" name="year" value={form.year} onChange={updateField} /></label></div><label>Ubicación<input required name="location" value={form.location} onChange={updateField} placeholder="Palma, Mallorca" /></label><div className="form-row"><label>Precio USD<input required min="0" type="number" name="price" value={form.price} onChange={updateField} /></label><label>Cabinas<input min="0" type="number" name="cabins" value={form.cabins} onChange={updateField} /></label></div><div className="form-row"><label>Eslora<input name="length" value={form.length} onChange={updateField} placeholder="18.9 m" /></label><label>Etiqueta<input name="tag" value={form.tag} onChange={updateField} placeholder="Novedad" /></label></div><label>URL de imagen<input required name="image_url" value={form.image_url} onChange={updateField} placeholder="https://..." /></label><label className="check-field"><input type="checkbox" name="featured" checked={form.featured} onChange={updateField} /> Mostrar como destacado</label><button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Publicar barco'} {editingId ? <Save size={17} /> : <Plus size={17} />}</button>{error && <p className="admin-error">{error}</p>}</form><section className="admin-inventory"><div className="panel-heading"><div><p className="kicker">Catálogo conectado</p><h2>{boats.length} barcos</h2></div></div>{loading ? <p className="admin-muted">Cargando inventario...</p> : boats.map((boat) => <article className="inventory-row" key={boat.id}><img src={boat.image_url} alt="" loading="lazy" /><div><strong>{boat.name}</strong><span>{boat.type} · {boat.location}</span></div><b>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(boat.price)}</b><div className="row-actions"><button onClick={() => editBoat(boat)} aria-label={`Editar ${boat.name}`}><Edit3 size={16} /></button><button onClick={() => removeBoat(boat.id)} aria-label={`Eliminar ${boat.name}`}><Trash2 size={16} /></button></div></article>)}</section></section></main>;
}
