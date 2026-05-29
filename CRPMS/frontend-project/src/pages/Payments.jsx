import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdPayment, MdEdit, MdDelete, MdRefresh, MdSearch, MdFileDownload } from 'react-icons/md';
import { FiInfo, FiAlertCircle } from 'react-icons/fi';

const EMPTY = { serviceRecord: '', car: '', paymentDate: '', receivedBy: '', amountPaid: '' };

function Modal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Delete Payment?</h3>
        <p className="text-sm text-gray-500 mb-6">This payment record will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">Delete</button>
          <button onClick={onCancel}  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments]   = useState([]);
  const [records, setRecords]     = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [del, setDel]             = useState(null);
  const [search, setSearch]       = useState('');

  useEffect(() => { document.title = 'Payments · SmartPark CRPMS'; }, []);

  /* ── auto-fill state ── */
  const [selectedCar, setSelectedCar]         = useState('');
  const [autoService, setAutoService]         = useState('');
  const [autoAmount, setAutoAmount]           = useState('');
  const [autoStatus, setAutoStatus]           = useState('');
  const [carRecords, setCarRecords]           = useState([]);

  const fetchPayments = (reset = false) => {
    if (reset) { cancel(); setSearch(''); setDel(null); setErrors({}); }
    setFetching(true); api.get('/payments').then(r => setPayments(r.data)).catch(console.error).finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchPayments();
    api.get('/servicerecords').then(r => setRecords(r.data)).catch(console.error);
  }, []);

  const exportCSV = () => {
    const headers = ['Plate', 'Service', 'Service Date', 'Amount Paid', 'Payment Date', 'Received By'];
    const rows = filtered.map(p => [
      p.car?.plateNumber || '', p.serviceRecord?.service?.serviceName || '',
      p.serviceRecord?.serviceDate ? new Date(p.serviceRecord.serviceDate).toLocaleDateString() : '',
      p.amountPaid.toString(), new Date(p.paymentDate).toLocaleDateString(), p.receivedBy,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const filtered = payments.filter(p =>
    !search || (p.car?.plateNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.serviceRecord?.service?.serviceName || '').toLowerCase().includes(search.toLowerCase()) ||
    p.receivedBy.toLowerCase().includes(search.toLowerCase())
  );

  /* ── when user picks a car, filter its service records ── */
  const handleCarSelect = (carId) => {
    setSelectedCar(carId);
    setAutoService('');
    setAutoAmount('');
    setAutoStatus('');
    setForm(f => ({ ...f, serviceRecord: '', car: carId, amountPaid: '' }));

    if (!carId) { setCarRecords([]); return; }
    const filtered = records.filter(r => (r.car?._id || r.car) === carId);
    setCarRecords(filtered);
  };

  /* ── when user picks a service record, auto-fill amount & service info ── */
  const handleRecordChange = (id) => {
    const rec = records.find(r => r._id === id);
    if (rec) {
      setAutoService(rec.service?.serviceName || '');
      setAutoAmount(rec.service?.servicePrice ?? rec.amountPaid ?? '');
      setAutoStatus(rec.paymentStatus || '');
    } else {
      setAutoService('');
      setAutoAmount('');
      setAutoStatus('');
    }
    setForm(f => ({
      ...f,
      serviceRecord: id,
      car: rec?.car?._id || rec?.car || f.car,
      amountPaid: rec?.service?.servicePrice ?? rec?.amountPaid ?? '',
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.serviceRecord)     e.serviceRecord = 'Please select a service record';
    if (!form.paymentDate)       e.paymentDate   = 'Required';
    if (!form.receivedBy.trim()) e.receivedBy    = 'Required';
    if (form.amountPaid === '')  e.amountPaid    = 'Required';
    else if (Number(form.amountPaid) < 0) e.amountPaid = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setErrors({});
    setSelectedCar('');
    setCarRecords([]);
    setAutoService('');
    setAutoAmount('');
    setAutoStatus('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    const carId = p.car?._id || p.car || '';
    setSelectedCar(carId);
    const filtered = records.filter(r => (r.car?._id || r.car) === carId);
    setCarRecords(filtered);
    const rec = records.find(r => r._id === (p.serviceRecord?._id || p.serviceRecord));
    setAutoService(rec?.service?.serviceName || '');
    setAutoAmount(rec?.service?.servicePrice ?? rec?.amountPaid ?? '');
    setAutoStatus(rec?.paymentStatus || '');
    setForm({
      serviceRecord: p.serviceRecord?._id || p.serviceRecord,
      car:           carId,
      paymentDate:   p.paymentDate ? p.paymentDate.slice(0, 10) : '',
      receivedBy:    p.receivedBy,
      amountPaid:    p.amountPaid,
    });
    setErrors({});
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setForm(EMPTY);
    setEditId(null);
    setErrors({});
    setSelectedCar('');
    setCarRecords([]);
    setAutoService('');
    setAutoAmount('');
    setAutoStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, amountPaid: Number(form.amountPaid) };
      if (editId) { await api.put('/payments/' + editId, payload);  toast.success('Payment updated!'); }
      else        { await api.post('/payments', payload);            toast.success('Payment recorded!'); }
      cancel();
      fetchPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try { await api.delete('/payments/' + del._id); toast.success('Payment deleted.'); setDel(null); fetchPayments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const ic = (f) => 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ' +
    (errors[f] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white');

  /* unique cars from service records */
  const uniqueCars = records.reduce((acc, r) => {
    const id = r.car?._id || r.car;
    if (id && !acc.find(c => c._id === id)) acc.push(r.car);
    return acc;
  }, []);

  const STATUS_BADGE = {
    Paid:    'bg-green-100 text-green-700',
    Partial: 'bg-yellow-100 text-yellow-700',
    Unpaid:  'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {del && <Modal onConfirm={handleDelete} onCancel={() => setDel(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Record and manage payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchPayments(true)} disabled={fetching} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all" title="Refresh & reset">
            <MdRefresh size={16} className={fetching ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCSV} disabled={payments.length === 0} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40" title="Export CSV">
            <MdFileDownload size={16} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <MdAdd size={20} /> Add Payment
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <MdPayment className="text-purple-600" /> {editId ? 'Edit Payment' : 'New Payment'}
          </h3>
          <p className="text-xs text-gray-400 mb-5 flex items-center gap-1">
            <FiInfo size={12} /> Select a car first — its service records and bill details will auto-fill.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ── STEP 1: Select Car ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car (Plate Number) <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedCar}
                onChange={e => handleCarSelect(e.target.value)}
                className={ic('car')}
              >
                <option value="">— Select Car —</option>
                {uniqueCars.map(c => c && (
                  <option key={c._id || c} value={c._id || c}>
                    {c.plateNumber || c} {c.model ? `— ${c.model}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* ── STEP 2: Select Service Record (filtered by car) ── */}
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Record <span className="text-red-400">*</span>
              </label>
              <select
                value={form.serviceRecord}
                onChange={e => handleRecordChange(e.target.value)}
                disabled={!selectedCar}
                className={ic('serviceRecord') + (!selectedCar ? ' opacity-50 cursor-not-allowed' : '')}
              >
                <option value="">
                  {selectedCar ? '— Select Service Record —' : '— Select a car first —'}
                </option>
                {carRecords.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.service?.serviceName} | {new Date(r.serviceDate).toLocaleDateString()} | {r.paymentStatus}
                  </option>
                ))}
              </select>
              {errors.serviceRecord && <p className="text-red-500 text-xs mt-1">⚠ {errors.serviceRecord}</p>}
            </div>

            {/* ── AUTO-FILLED: Service Info ── */}
            {autoService && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex flex-wrap gap-4 items-center">
                  <div>
                    <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Service</p>
                    <p className="text-sm font-semibold text-purple-800">{autoService}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Bill Amount</p>
                    <p className="text-sm font-semibold text-purple-800">RWF {Number(autoAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Current Status</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[autoStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {autoStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Received By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.receivedBy}
                onChange={e => setForm({ ...form, receivedBy: e.target.value })}
                placeholder="e.g. Jean Paul"
                className={ic('receivedBy')}
              />
              {errors.receivedBy && <p className="text-red-500 text-xs mt-1">⚠ {errors.receivedBy}</p>}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                className={ic('paymentDate')}
              />
              {errors.paymentDate && <p className="text-red-500 text-xs mt-1">⚠ {errors.paymentDate}</p>}
            </div>

            {/* Amount Paid — pre-filled from service price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (RWF) <span className="text-red-400">*</span>
                {autoAmount !== '' && (
                  <span className="ml-2 text-xs text-purple-500 font-normal">auto-filled from bill</span>
                )}
              </label>
              <input
                type="number"
                value={form.amountPaid}
                onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                placeholder="e.g. 15000"
                min="0"
                className={ic('amountPaid')}
              />
              {errors.amountPaid && <p className="text-red-500 text-xs mt-1">⚠ {errors.amountPaid}</p>}
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {loading ? 'Saving...' : editId ? 'Update Payment' : 'Save Payment'}
              </button>
              <button type="button" onClick={cancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{filtered.length} / {payments.length} payment(s)</p>
          <div className="relative max-w-xs w-full sm:w-auto">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by plate, service, receiver..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                {['Plate', 'Service', 'Service Date', 'Amount Paid', 'Payment Date', 'Received By', 'Actions'].map(h => (
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
                      <p className="text-gray-400 font-medium">{search ? 'No payments match your search' : 'No payments recorded yet'}</p>
                      {!search && (
                        <button onClick={openCreate} className="text-purple-600 hover:text-purple-700 text-sm font-medium">+ Record your first payment</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700 whitespace-nowrap">{p.car?.plateNumber || '—'}</td>
                  <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{p.serviceRecord?.service?.serviceName || '—'}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {p.serviceRecord?.serviceDate ? new Date(p.serviceRecord.serviceDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">RWF {p.amountPaid.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{p.receivedBy}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Edit"><MdEdit size={17} /></button>
                      <button onClick={() => setDel(p)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"><MdDelete size={17} /></button>
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
