import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { MdDirectionsCar, MdBuild, MdAssignment, MdAttachMoney, MdPayment, MdRefresh } from 'react-icons/md';

const STATUS_COLORS = { Paid: '#16a34a', Partial: '#d97706', Unpaid: '#dc2626' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SUMMARY_COLORS = ['#7e22ce','#9333ea','#a855f7','#c084fc'];

// Custom label for pie slices
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill='white' textAnchor='middle' dominantBaseline='central' fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className='bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2.5 text-sm'>
      <p className='font-semibold text-gray-800'>{d.name}</p>
      <p className='text-gray-500'>{d.value} record{d.value !== 1 ? 's' : ''}</p>
    </div>
  );
};

function LoadingSkeleton() {
  return (
    <div className='space-y-6 animate-pulse'>
      <div className='h-8 bg-gray-200 rounded w-48' />
      <div className='grid grid-cols-2 xl:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => <div key={i} className='h-24 bg-gray-200 rounded-2xl' />)}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {[...Array(3)].map((_, i) => <div key={i} className='h-72 bg-gray-200 rounded-2xl' />)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { document.title = 'Dashboard · SmartPark CRPMS'; }, []);

  const loadStats = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) return <LoadingSkeleton />;

  // Payment status pie
  const pieData = (stats.paymentBreakdown || []).map(item => ({
    name:  item._id,
    value: item.count,
    color: STATUS_COLORS[item._id] || '#a855f7',
  }));

  // Monthly revenue bar
  const barData = (stats.monthlyRevenue || []).map(item => ({
    month:   MONTHS[(item._id.month || 1) - 1],
    revenue: item.revenue,
    jobs:    item.count,
  }));

  // System summary pie
  const summaryPie = [
    { name: 'Cars',           value: stats.totalCars     || 0 },
    { name: 'Services',       value: stats.totalServices || 0 },
    { name: 'Service Records',value: stats.totalRecords  || 0 },
    { name: 'Payments',       value: stats.totalPayments || 0 },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Cars',      value: stats.totalCars,     icon: MdDirectionsCar, from: '#7e22ce', to: '#a855f7' },
    { label: 'Services',        value: stats.totalServices, icon: MdBuild,         from: '#6d28d9', to: '#8b5cf6' },
    { label: 'Service Records', value: stats.totalRecords,  icon: MdAssignment,    from: '#9333ea', to: '#c084fc' },
    { label: 'Total Revenue',   value: 'RWF ' + (stats.totalRevenue || 0).toLocaleString(), icon: MdAttachMoney, from: '#4f46e5', to: '#818cf8' },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
          <p className='text-gray-500 text-sm mt-1'>SmartPark CRPMS — system overview</p>
        </div>
        <button onClick={() => loadStats(true)} disabled={refreshing} className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-700 bg-white px-3 py-2 rounded-xl text-sm font-medium transition-all self-start">
          <MdRefresh size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        {statCards.map(({ label, value, icon: Icon, from, to }) => (
          <div key={label} className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow'>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0'
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
              <Icon className='text-white text-2xl' />
            </div>
            <div>
              <p className='text-2xl font-bold text-gray-800'>{value}</p>
              <p className='text-gray-500 text-sm'>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row — 3 columns */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        {/* 1. Payment Status Pie */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-base font-semibold text-gray-800 mb-1'>Payment Status</h3>
          <p className='text-xs text-gray-400 mb-4'>Breakdown of service record payments</p>
          {pieData.length === 0 ? (
            <div className='h-56 flex items-center justify-center text-gray-400 text-sm'>No records yet</div>
          ) : (
            <>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie data={pieData} cx='50%' cy='50%' innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey='value' labelLine={false} label={renderLabel}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend */}
              <div className='space-y-2 mt-2'>
                {pieData.map(d => {
                  const total = pieData.reduce((s, x) => s + x.value, 0);
                  const pct = total ? ((d.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={d.name} className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2'>
                        <span className='w-3 h-3 rounded-full shrink-0' style={{ background: d.color }} />
                        <span className='text-gray-600 font-medium'>{d.name}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-800 font-bold'>{d.value}</span>
                        <span className='text-gray-400 text-xs'>({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 2. System Summary Pie */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-base font-semibold text-gray-800 mb-1'>System Summary</h3>
          <p className='text-xs text-gray-400 mb-4'>Distribution of all records in the system</p>
          {summaryPie.length === 0 ? (
            <div className='h-56 flex items-center justify-center text-gray-400 text-sm'>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie data={summaryPie} cx='50%' cy='50%' outerRadius={90}
                    paddingAngle={2} dataKey='value' labelLine={false} label={renderLabel}>
                    {summaryPie.map((entry, i) => <Cell key={i} fill={SUMMARY_COLORS[i % SUMMARY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className='space-y-2 mt-2'>
                {summaryPie.map((d, i) => {
                  const total = summaryPie.reduce((s, x) => s + x.value, 0);
                  const pct = total ? ((d.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={d.name} className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2'>
                        <span className='w-3 h-3 rounded-full shrink-0' style={{ background: SUMMARY_COLORS[i % SUMMARY_COLORS.length] }} />
                        <span className='text-gray-600 font-medium'>{d.name}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-800 font-bold'>{d.value}</span>
                        <span className='text-gray-400 text-xs'>({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 3. Monthly Revenue Bar */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-base font-semibold text-gray-800 mb-1'>Monthly Revenue</h3>
          <p className='text-xs text-gray-400 mb-4'>Last 6 months collected (RWF)</p>
          {barData.length === 0 ? (
            <div className='h-56 flex items-center justify-center text-gray-400 text-sm'>No revenue data yet</div>
          ) : (
            <ResponsiveContainer width='100%' height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f3e8ff' />
                <XAxis dataKey='month' tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v} />
                <Tooltip formatter={v => ['RWF ' + v.toLocaleString(), 'Revenue']} />
                <Bar dataKey='revenue' fill='#9333ea' radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent service records */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <h3 className='text-base font-semibold text-gray-800 mb-4'>Recent Service Records</h3>
        {(stats.recentRecords || []).length === 0 ? (
          <p className='text-gray-400 text-sm text-center py-8'>No records yet</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-100'>
                  {['Plate','Service','Date','Amount Paid','Status'].map(h => (
                    <th key={h} className='text-left py-2 px-3 text-gray-500 font-medium text-xs uppercase tracking-wide'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentRecords.map(r => (
                  <tr key={r._id} className='border-b border-gray-50 hover:bg-purple-50 transition-colors'>
                    <td className='py-2.5 px-3 font-semibold text-purple-700'>{r.car?.plateNumber}</td>
                    <td className='py-2.5 px-3 text-gray-700'>{r.service?.serviceName}</td>
                    <td className='py-2.5 px-3 text-gray-500'>{new Date(r.serviceDate).toLocaleDateString()}</td>
                    <td className='py-2.5 px-3 text-gray-700'>RWF {(r.amountPaid || 0).toLocaleString()}</td>
                    <td className='py-2.5 px-3'><StatusBadge status={r.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = { Paid: 'bg-green-100 text-green-700', Partial: 'bg-yellow-100 text-yellow-700', Unpaid: 'bg-red-100 text-red-700' };
  return <span className={'px-2.5 py-1 rounded-full text-xs font-semibold ' + (styles[status] || 'bg-gray-100 text-gray-600')}>{status}</span>;
}
