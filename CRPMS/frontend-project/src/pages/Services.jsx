import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdBuild, MdEdit, MdDelete } from 'react-icons/md';

const EMPTY = { serviceCode: '', serviceName: '', servicePrice: '', serviceDescription: '' };

function Modal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Delete Service?</h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-bold text-purple-700">{name}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">Delete</button>
          <button onClick={onCancel}  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [del, setDel]           = useState(null);

  const fetch = () => api.get('/services').then(r => setServices(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const validate = () => {
    const e = {};
    if (!form.serviceCode.trim())  e.serviceCode  = 'Required';
    if (!form.serviceName.trim())  e.serviceName  = 'Required';
    if (!form.servicePrice)        e.servicePrice = 'Required';
    else if (Number(form.servicePrice) < 0) e.servicePrice = 'Must be positive';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditId(null); setForm(EMPTY); setErrors({}); setShowForm(true); };
  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ serviceCode: s.serviceCode, serviceName: s.serviceName, servicePrice: s.servicePrice, serviceDescription: s.serviceDescription || '' });
    setErrors({}); setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return; setLoading(true);
    try {
      const payload = { ...form, servicePrice: Number(form.servicePrice) };
      if (editId) { await api.put('/services/' + editId, payload); toast.success('Service updated!'); }
      else        { await api.post('/services', payload);           toast.success('Service created!'); }
      cancel(); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try { await api.delete('/services/' + del._id); toast.success('Service deleted.'); setDel(null); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const ic = (f) => 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ' +
    (errors[f] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white');

  return (
    <div className="space-y-6">
      {del && <Modal name={del.serviceName} onConfirm={handleDelete} onCancel={() => setDel(null)} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-500 text-sm mt-1">Manage repair service catalog</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <MdAdd size={20} /> Add Service
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MdBuild className="text-purple-600" /> {editId ? 'Edit Service' : 'New Service'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Code <span className="text-red-400">*</span></label>
              <input type="text" value={form.serviceCode} onChange={e => setForm({...form, serviceCode: e.target.value})} placeholder="e.g. SRV001" className={ic('serviceCode')} />
              {errors.serviceCode && <p className="text-red-500 text-xs mt-1">&#9888; {errors.serviceCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.serviceName} onChange={e => setForm({...form, serviceName: e.target.value})} placeholder="e.g. Oil Change" className={ic('serviceName')} />
              {errors.serviceName && <p className="text-red-500 text-xs mt-1">&#9888; {errors.serviceName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF) <span className="text-red-400">*</span></label>
              <input type="number" value={form.servicePrice} onChange={e => setForm({...form, servicePrice: e.target.value})} placeholder="e.g. 15000" min="0" className={ic('servicePrice')} />
              {errors.servicePrice && <p className="text-red-500 text-xs mt-1">&#9888; {errors.servicePrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={form.serviceDescription} onChange={e => setForm({...form, serviceDescription: e.target.value})} placeholder="Brief description..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {loading ? 'Saving...' : editId ? 'Update Service' : 'Save Service'}
              </button>
              <button type="button" onClick={cancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{services.length} service(s) available</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                {['Code','Service Name','Price (RWF)','Description','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-purple-700 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No services yet</td></tr>
              ) : services.map(s => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700">{s.serviceCode}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{s.serviceName}</td>
                  <td className="py-3 px-4 text-gray-700">{s.servicePrice.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{s.serviceDescription || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Edit"><MdEdit size={17} /></button>
                      <button onClick={() => setDel(s)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"><MdDelete size={17} /></button>
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
