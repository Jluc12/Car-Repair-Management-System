import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdBarChart, MdSearch, MdPrint } from 'react-icons/md';

const STATUS_STYLES = {
  Paid:    'bg-green-100 text-green-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Unpaid:  'bg-red-100 text-red-700',
};

export default function Reports() {
  const [tab, setTab]             = useState('bill');

  // Service Bill state
  const [billData, setBillData]   = useState([]);
  const [plateFilter, setPlate]   = useState('');
  const [billLoading, setBillLoading] = useState(false);

  // Daily Report state
  const [dailyData, setDailyData] = useState(null);
  const [dateFilter, setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [dailyLoading, setDailyLoading] = useState(false);

  const fetchBill = async () => {
    setBillLoading(true);
    try {
      const params = plateFilter ? { plateNumber: plateFilter } : {};
      const res = await api.get('/reports/service-bill', { params });
      setBillData(res.data);
    } catch (err) {
      toast.error('Failed to load service bill');
    } finally {
      setBillLoading(false);
    }
  };

  const fetchDaily = async () => {
    setDailyLoading(true);
    try {
      const res = await api.get('/reports/daily-payments', { params: { date: dateFilter } });
      setDailyData(res.data);
    } catch (err) {
      toast.error('Failed to load daily report');
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => { fetchBill(); }, []);
  useEffect(() => { if (tab === 'daily') fetchDaily(); }, [tab]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Service bills and daily payment reports</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <MdPrint size={18} /> Print
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'bill',  label: 'Service Bill' },
          { key: 'daily', label: 'Daily Payment Report' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors
              ${tab === t.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Service Bill ── */}
      {tab === 'bill' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={plateFilter}
                  onChange={e => setPlate(e.target.value)}
                  placeholder="Filter by plate number..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all"
                />
              </div>
              <button
                onClick={fetchBill}
                disabled={billLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {billLoading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MdBarChart className="text-purple-600" /> Service Bill
              </p>
              <p className="text-xs text-gray-400">{billData.length} record(s)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50">
                  <tr>
                    {['Plate Number','Service Name','Service Date','Price (RWF)','Amount Paid','Status','Payment Date'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-purple-700 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billLoading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                  ) : billData.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">No records found</td></tr>
                  ) : billData.map(r => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-purple-700 whitespace-nowrap">{r.plateNumber}</td>
                      <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{r.serviceName}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{new Date(r.serviceDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{(r.servicePrice || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{(r.amountPaid || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {billData.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-sm font-semibold text-gray-700">Total</td>
                      <td className="py-3 px-4 text-sm font-bold text-purple-700">
                        RWF {billData.reduce((s, r) => s + (r.servicePrice || 0), 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-green-700">
                        RWF {billData.reduce((s, r) => s + (r.amountPaid || 0), 0).toLocaleString()}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Payment Report ── */}
      {tab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDate(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white text-sm outline-none transition-all"
              />
              <button
                onClick={fetchDaily}
                disabled={dailyLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {dailyLoading ? 'Loading...' : 'Load Report'}
              </button>
            </div>
          </div>

          {dailyData && (
            <>
              <div className="bg-purple-600 text-white rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total Collected on</p>
                  <p className="text-lg font-bold">{dailyData.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-200 text-sm">Amount</p>
                  <p className="text-2xl font-bold">RWF {(dailyData.totalCollected || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">Daily Service Payment Report</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-purple-50">
                      <tr>
                        {['Plate Number', 'Service Name', 'Service Date', 'Amount Paid (RWF)'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-purple-700 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dailyLoading ? (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>
                      ) : dailyData.records.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-400">No records for this date</td></tr>
                      ) : dailyData.records.map(r => (
                        <tr key={r._id} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-purple-700 whitespace-nowrap">{r.plateNumber}</td>
                          <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{r.serviceName}</td>
                          <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{new Date(r.serviceDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{(r.amountPaid || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    {dailyData.records.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-sm font-semibold text-gray-700">Total Collected</td>
                          <td className="py-3 px-4 text-sm font-bold text-green-700">
                            RWF {(dailyData.totalCollected || 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
