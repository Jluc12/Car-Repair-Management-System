import { useNavigate } from 'react-router-dom';
import { MdBuild, MdDirectionsCar, MdAssignment, MdPayment, MdBarChart, MdShield, MdArrowForward, MdLogin } from 'react-icons/md';
import { FiTrendingUp, FiClipboard, FiUsers } from 'react-icons/fi';
import Stars from '../components/Stars';

const features = [
  { icon: MdDirectionsCar, title: 'Car Management', desc: 'Register and manage all vehicles with Rwandan plate validation, owner details, and full history tracking.' },
  { icon: MdBuild, title: 'Service Catalog', desc: 'Maintain a complete catalog of repair services with pricing, codes, and descriptions.' },
  { icon: MdAssignment, title: 'Service Records', desc: 'Track every repair job from start to finish with detailed records and payment status.' },
  { icon: MdPayment, title: 'Payments & Billing', desc: 'Process payments with auto-fill from service records and generate accurate bills instantly.' },
  { icon: MdBarChart, title: 'Reports & Analytics', desc: 'Generate daily payment reports and service bills with beautiful visualizations and charts.' },
  { icon: FiTrendingUp, title: 'Revenue Tracking', desc: 'Monitor monthly revenue, payment breakdowns, and system-wide statistics in real time.' },
];

const stats = [
  { value: '100%', label: 'Digital Workflow' },
  { value: 'Real-time', label: 'Data Sync' },
  { value: 'Secured', label: 'Session Auth' },
  { value: '24/7', label: 'System Access' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      <Stars count={150} speed={0.4} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <MdBuild size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">SmartPark</h1>
            <p className="text-purple-400 text-[10px] leading-tight">CAR REPAIR MANAGEMENT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-purple-500 rounded-xl transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login?tab=register')}
            className="px-5 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
          >
            Get Started <MdArrowForward size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-xs font-medium mb-8">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          Version 1.0 — SmartPark CRPMS
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Car Repair{' '}
          <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
            Management System
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          A complete digital solution for managing your car repair workshop — from service records and vehicle tracking to payment processing and daily reports.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login?tab=register')}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-purple-600/30 flex items-center gap-2 text-base"
          >
            <MdLogin size={20} />
            Create Free Account
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all text-base"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800 rounded-2xl overflow-hidden border border-gray-800">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-900/80 backdrop-blur-sm py-6 px-4 text-center">
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to <span className="text-purple-400">run your workshop</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto">Powerful tools designed for Rwandan car repair shops — from vehicle registration to payment reconciliation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-gray-900/60 backdrop-blur-sm border border-gray-800 hover:border-purple-700/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-600/10"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
                <f.icon size={24} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-gray-900/60 border border-purple-800/40 rounded-3xl p-10 md:p-16 text-center backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to modernize your workshop?</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">Join SmartPark CRPMS and take control of your car repair business with digital precision.</p>
          <button
            onClick={() => navigate('/login?tab=register')}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-purple-600/30 inline-flex items-center gap-2"
          >
            <MdBuild size={20} />
            Start Now — It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
              <MdBuild size={14} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm">SmartPark CRPMS v1.0</span>
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} SmartPark · Rubavu District, Western Province · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
