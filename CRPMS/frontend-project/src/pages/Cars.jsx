import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdDirectionsCar, MdEdit, MdDelete, MdRefresh, MdSearch, MdFileDownload } from 'react-icons/md';
import { FiInfo, FiAlertCircle } from 'react-icons/fi';

const EMPTY = { plateNumber: '', type: '', model: '', manufacturingYear: '', driverPhone: '', mechanicName: '' };
const PLATE_RE = /^(RA[A-Z]|RDF|RNP|GR|GP|IT)\d{3}[BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz]$/;
const PHONE_RE = /^(078|079|072|073)\d{7}$/;
const LETTERS_RE = /^[A-Za-z\s'-]+$/;

function vPlate(v) {
  if (!v.trim()) return 'Plate number is required';
  if (!PLATE_RE.test(v.trim().toUpperCase().replace(/\s/g,''))) return 'Format: RAA-Z 123C or RDF/RNP/GR/GP/IT 123C (last char = consonant)';
  return '';
}
function vPhone(v) {
  if (!v.trim()) return 'Phone is required';
  if (!/^\d+$/.test(v)) return 'Digits only';
  if (v.length !== 10) return 'Must be exactly 10 digits';
  if (!PHONE_RE.test(v)) return 'Must start with 078, 079, 072 or 073';
  return '';
}
function vName(v, label) {
  if (!v.trim()) return label + ' is required';
  if (!LETTERS_RE.test(v)) return label + ' must contain letters only (no numbers or special characters)';
  return '';
}
function vLetters(v, label) {
  if (!v.trim()) return label + ' is required';
  if (!LETTERS_RE.test(v)) return label + ' must contain letters only (no numbers or digits)';
  return '';
}

function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Delete Car?</h3>
        <p className="text-sm text-gray-500 mb-6">Plate <span className="font-bold text-purple-700">{name}</span> will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Delete</button>
          <button onClick={onCancel}  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Cars() {
  const [cars, setCars]         = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => { document.title = 'Cars · SmartPark CRPMS'; }, []);

  const fetchCars = (reset = false) => {
    if (reset) {
      cancelForm();
      setSearch('');
      setDeleteTarget(null);
      setErrors({});
    }
    setFetching(true);
    api.get('/cars').then(r => setCars(r.data)).catch(console.error).finally(() => setFetching(false));
  };
  useEffect(() => { fetchCars(); }, []);

  const exportCSV = () => {
    const headers = ['Plate Number', 'Type', 'Model', 'Year', 'Driver Phone', 'Mechanic'];
    const rows = filtered.map(c => [c.plateNumber, c.type, c.model, c.manufacturingYear, c.driverPhone, c.mechanicName]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `cars-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const filtered = cars.filter(c =>
    !search || c.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    c.model.toLowerCase().includes(search.toLowerCase()) ||
    c.mechanicName.toLowerCase().includes(search.toLowerCase()) ||
    c.driverPhone.includes(search)
  );

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    let err = '';
    if (field === 'plateNumber')       err = vPlate(value);
    else if (field === 'driverPhone')  err = vPhone(value);
    else if (field === 'mechanicName') err = vName(value, 'Mechanic name');
    else if (field === 'type')         err = vLetters(value, 'Car type');
    else if (field === 'model')        err = vLetters(value, 'Model');
    else if (field === 'manufacturingYear') {
      const yr = Number(value);
      err = !value ? 'Year is required' : (yr < 1900 || yr > new Date().getFullYear() + 1) ? 'Invalid year' : '';
    }
    setErrors(e => ({ ...e, [field]: err }));
  };

  const validate = () => {
    const e = {
      plateNumber: vPlate(form.plateNumber),
      driverPhone: vPhone(form.driverPhone),
      mechanicName: vName(form.mechanicName, 'Mechanic name'),
      type:  vLetters(form.type, 'Car type'),
      model: vLetters(form.model, 'Model'),
      manufacturingYear: !form.manufacturingYear ? 'Year is required'
        : (Number(form.manufacturingYear) < 1900 || Number(form.manufacturingYear) > new Date().getFullYear() + 1) ? 'Invalid year' : '',
    };
    setErrors(e);
    return Object.values(e).every(v => !v);
  };

  const openCreate = () => { setEditId(null); setForm(EMPTY); setErrors({}); setShowForm(true); };
  const openEdit   = (car) => {
    setEditId(car._id);
    setForm({ plateNumber: car.plateNumber, type: car.type, model: car.model,
      manufacturingYear: car.manufacturingYear, driverPhone: car.driverPhone, mechanicName: car.mechanicName });
    setErrors({});
    setShowForm(true);
  };
  const cancelForm = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = { ...form, plateNumber: form.plateNumber.trim().toUpperCase(), manufacturingYear: Number(form.manufacturingYear) };
    try {
      if (editId) {
        await api.put('/cars/' + editId, payload);
        toast.success('Car updated successfully!');
      } else {
        await api.post('/cars', payload);
        toast.success('Car registered successfully!');
      }
      cancelForm(); fetchCars();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete('/cars/' + deleteTarget._id); toast.success('Car deleted.'); setDeleteTarget(null); fetchCars(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const ic = (f) => 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ' +
    (errors[f] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white');

  return (
    <div className="space-y-6">
      {deleteTarget && <DeleteModal name={deleteTarget.plateNumber} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cars</h1>
          <p className="text-gray-500 text-sm mt-1">Manage registered vehicles</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchCars(true)} disabled={fetching} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all" title="Refresh & reset">
            <MdRefresh size={16} className={fetching ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCSV} disabled={cars.length === 0} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40" title="Export CSV">
            <MdFileDownload size={16} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <MdAdd size={20} /> Add Car
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <MdDirectionsCar className="text-purple-600" /> {editId ? 'Edit Car' : 'Register New Car'}
          </h3>
          <p className="text-xs text-gray-400 mb-5 flex items-center gap-1">
            <FiInfo size={12} /> Plate: RAA-Z 123C or RDF/RNP/GR/GP/IT 123C &mdash; last character must be a consonant
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number <span className="text-red-400">*</span></label>
              <input type="text" value={form.plateNumber} onChange={e => handleChange('plateNumber', e.target.value.toUpperCase())} placeholder="e.g. RAB 123B" maxLength={10} className={ic('plateNumber')} />
              {errors.plateNumber ? <p className="text-red-500 text-xs mt-1">&#9888; {errors.plateNumber}</p> : <p className="text-gray-400 text-xs mt-1">RA[A-Z] or RDF/RNP/GR/GP/IT + 3 digits + consonant</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Car Type <span className="text-red-400">*</span></label>
              <input type="text" value={form.type} onChange={e => handleChange('type', e.target.value.replace(/[^A-Za-z\s'-]/g, ''))} placeholder="e.g. Sedan, SUV" className={ic('type')} />
              {errors.type ? <p className="text-red-500 text-xs mt-1">&#9888; {errors.type}</p> : <p className="text-gray-400 text-xs mt-1">Letters only — no numbers or digits</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model <span className="text-red-400">*</span></label>
              <input type="text" value={form.model} onChange={e => handleChange('model', e.target.value.replace(/[^A-Za-z\s'-]/g, ''))} placeholder="e.g. Toyota Corolla" className={ic('model')} />
              {errors.model ? <p className="text-red-500 text-xs mt-1">&#9888; {errors.model}</p> : <p className="text-gray-400 text-xs mt-1">Letters only — no numbers or digits</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year <span className="text-red-400">*</span></label>
              <input type="number" value={form.manufacturingYear} onChange={e => handleChange('manufacturingYear', e.target.value)} placeholder="e.g. 2020" min="1900" max={new Date().getFullYear()+1} className={ic('manufacturingYear')} />
              {errors.manufacturingYear && <p className="text-red-500 text-xs mt-1">&#9888; {errors.manufacturingYear}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone <span className="text-red-400">*</span></label>
              <input type="text" value={form.driverPhone} onChange={e => handleChange('driverPhone', e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="e.g. 0781234567" maxLength={10} className={ic('driverPhone')} />
              {errors.driverPhone ? <p className="text-red-500 text-xs mt-1">&#9888; {errors.driverPhone}</p> : <p className="text-gray-400 text-xs mt-1">10 digits: 078/079/072/073</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mechanic Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.mechanicName} onChange={e => handleChange('mechanicName', e.target.value.replace(/[^A-Za-z\s'-]/g,''))} placeholder="e.g. Jean Pierre" className={ic('mechanicName')} />
              {errors.mechanicName ? <p className="text-red-500 text-xs mt-1">&#9888; {errors.mechanicName}</p> : <p className="text-gray-400 text-xs mt-1">Letters only</p>}
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {loading ? 'Saving...' : editId ? 'Update Car' : 'Save Car'}
              </button>
              <button type="button" onClick={cancelForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{filtered.length} / {cars.length} car(s)</p>
          <div className="relative max-w-xs w-full sm:w-auto">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by plate, type, model..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                {['Plate Number','Type','Model','Year','Driver Phone','Mechanic','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-purple-700 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <FiAlertCircle size={40} className="text-gray-300" />
                      <p className="text-gray-400 font-medium">{search ? 'No cars match your search' : 'No cars registered yet'}</p>
                      {!search && (
                        <button onClick={openCreate} className="text-purple-600 hover:text-purple-700 text-sm font-medium">+ Register your first car</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(car => (
                <tr key={car._id} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700">{car.plateNumber}</td>
                  <td className="py-3 px-4 text-gray-700">{car.type}</td>
                  <td className="py-3 px-4 text-gray-700">{car.model}</td>
                  <td className="py-3 px-4 text-gray-600">{car.manufacturingYear}</td>
                  <td className="py-3 px-4 text-gray-600">{car.driverPhone}</td>
                  <td className="py-3 px-4 text-gray-700">{car.mechanicName}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(car)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Edit"><MdEdit size={17} /></button>
                      <button onClick={() => setDeleteTarget(car)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"><MdDelete size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
