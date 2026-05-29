import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdAssignment, MdEdit, MdDelete, MdRefresh, MdSearch, MdFileDownload } from 'react-icons/md';
import { FiAlertCircle } from 'react-icons/fi';

const EMPTY = {
  car: '', service: '', serviceDate: '', amountPaid: '', paymentDate: '', paymentStatus: 'Unpaid',
};

const STATUS_STYLES = {
  Paid:    'bg-green-100 text-green-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Unpaid:  'bg-red-100 text-red-700',
};

export default function ServiceRecords() {
  const [records, setRecords]   = useState([]);
  const [cars, setCars]         = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => { document.title = 'Service Records · SmartPark CRPMS'; }, []);

  const fetchAll = (reset = false) => {
    if (reset) { cancelForm(); setSearch(''); setDeleteId(null); setErrors({}); }
    setFetching(true);
    api.get('/servicerecords').then(r => setRecords(r.data)).catch(console.error).finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchAll();
    api.get('/cars').then(r => setCars(r.data)).catch(console.error);
    api.get('/services').then(r => setServices(r.data)).catch(console.error);
  }, []);

  const exportCSV = () => {
    const headers = ['Plate Number', 'Service', 'Service Date', 'Price (RWF)', 'Amount Paid', 'Payment Date', 'Status'];
    const rows = filtered.map(r => [
      r.car?.plateNumber || '', r.service?.serviceName || '',
      r.serviceDate ? new Date(r.serviceDate).toLocaleDateString() : '',
      r.service?.servicePrice?.toString() || '', r.amountPaid?.toString() || '',
      r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '', r.paymentStatus || '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `service-records-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const filtered = records.filter(r =>
    !search || (r.car?.plateNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.service?.serviceName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.paymentStatus || '').toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.car)             e.car         = 'Required';
    if (!form.service)         e.service     = 'Required';
    if (!form.serviceDate)     e.serviceDate = 'Required';
    if (form.amountPaid === '' || form.amountPaid === undefined)
                               e.amountPaid  = 'Required';
    else if (Number(form.amountPaid) < 0)
                               e.amountPaid  = 'Must be ≥ 0';
    if (!form.paymentStatus)   e.paymentStatus = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (rec) => {
    setEditId(rec._id);
    setForm({
      car:           rec.car?._id || rec.car,
      service:       rec.service?._id || rec.service,
      serviceDate:   rec.serviceDate ? rec.serviceDate.slice(0, 10) : '',
      amountPaid:    rec.amountPaid ?? '',
      paymentDate:   rec.paymentDate ? rec.paymentDate.slice(0, 10) : '',
      paymentStatus: rec.paymentStatus || 'Unpaid',
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = {
      ...form,
      amountPaid:  Number(form.amountPaid),
      paymentDate: form.paymentDate || undefined,
    };
    try {
      if (editId) {
        await api.put(`/servicerecords/${editId}`, payload);
        toast.success('Service record updated!');
      } else {
        await api.post('/servicerecords', payload);
        toast.success('Service record created!');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditId(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/servicerecords/${deleteId}`);
      toast.success('Service record deleted.');
      setDeleteId(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY);
    setEditId(null);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Records</h1>
          <p className="text-gray-500 text-sm mt-1">Track car service history and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchAll(true)} disabled={fetching} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all" title="Refresh & reset">
            <MdRefresh size={16} className={fetching ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCSV} disabled={records.length === 0} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40" title="Export CSV">
            <MdFileDownload size={16} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <MdAdd size={20} /> Add Record
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MdAssignment className="text-purple-600" />
            {editId ? 'Edit Service Record' : 'New Service Record'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Car */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Car (Plate Number)</label>
              <select
                value={form.car}
                onChange={e => setForm({ ...form, car: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.car ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'}`}
              >
                <option value="">— Select Car —</option>
                {cars.map(c => (
                  <option key={c._id} value={c._id}>{c.plateNumber} — {c.model}</option>
                ))}
              </select>
              {errors.car && <p className="text-red-500 text-xs mt-1">{errors.car}</p>}
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={form.service}
                onChange={e => setForm({ ...form, service: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.service ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'}`}
              >
                <option value="">— Select Service —</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.serviceName} — RWF {s.servicePrice.toLocaleString()}</option>
                ))}
              </select>
              {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
              <input
                type="date"
                value={form.serviceDate}
                onChange={e => setForm({ ...form, serviceDate: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.serviceDate ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'}`}
              />
              {errors.serviceDate && <p className="text-red-500 text-xs mt-1">{errors.serviceDate}</p>}
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.amountPaid}
                onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                placeholder="e.g. 15000"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.amountPaid ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'}`}
              />
              {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={form.paymentStatus}
                onChange={e => setForm({ ...form, paymentStatus: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.paymentStatus ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'}`}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
              {errors.paymentStatus && <p className="text-red-500 text-xs mt-1">{errors.paymentStatus}</p>}
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? 'Saving...' : editId ? 'Update Record' : 'Save Record'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{filtered.length} / {records.length} record(s)</p>
          <div className="relative max-w-xs w-full sm:w-auto">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by plate, service, status..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                {['Plate Number', 'Service', 'Service Date', 'Price (RWF)', 'Amount Paid', 'Payment Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-purple-700 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <FiAlertCircle size={40} className="text-gray-300" />
                      <p className="text-gray-400 font-medium">{search ? 'No records match your search' : 'No service records yet'}</p>
                      {!search && (
                        <button onClick={openCreate} className="text-purple-600 hover:text-purple-700 text-sm font-medium">+ Create your first record</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700 whitespace-nowrap">{r.car?.plateNumber}</td>
                  <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{r.service?.serviceName}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{new Date(r.serviceDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{r.service?.servicePrice?.toLocaleString() ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{r.amountPaid.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
                        title="Edit"
                      >
                        <MdEdit size={17} />
                      </button>
                      <button
                        onClick={() => setDeleteId(r._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <MdDelete size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Service Record?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
