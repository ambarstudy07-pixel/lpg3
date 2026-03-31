import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  LayoutDashboard, Building2, TrendingUp, Package, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Database, AlertCircle, RefreshCw, FileText, Download, UserCheck
} from 'lucide-react';
import Papa from 'papaparse';

// --- CONFIGURATION ---
const SPREADSHEET_ID = '1Iq_vJ3XWknrJKav23LOu28YNdPDgNZE5rTlLKynW8j4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Mapping keys to cleaner versions
          const processed = results.data.map((row, idx) => ({
            timestamp: row['Timestamp'],
            date: row['Date of Entry'],
            omc: row['OMC Name'],
            agency: row['Agency Name/ID'],
            r_dom: Number(row['Total Cylinders Received today (Domestic - 14.2 KG)']) || 0,
            r_com: Number(row['Total Cylinders Received today (Commercial - 19 KG)']) || 0,
            r_ind: Number(row['Total Cylinders Received today (Industrial - 47.5 KG)']) || 0,
            d_dom: Number(row['Total Cylinders Distributed today (Domestic- 14.2 KG)']) || 0,
            d_com: Number(row['Total Cylinders Distributed today (Commercial- 19 KG)']) || 0,
            d_ind: Number(row['Total Cylinders Distributed today (Industrial- 47.5 KG)']) || 0,
            starting_stock: Number(row['stock starting data']) || 0,
            total_received: 
              (Number(row['Total Cylinders Received today (Domestic - 14.2 KG)']) || 0) +
              (Number(row['Total Cylinders Received today (Commercial - 19 KG)']) || 0) +
              (Number(row['Total Cylinders Received today (Industrial - 47.5 KG)']) || 0),
            total_distributed: 
              (Number(row['Total Cylinders Distributed today (Domestic- 14.2 KG)']) || 0) +
              (Number(row['Total Cylinders Distributed today (Commercial- 19 KG)']) || 0) +
              (Number(row['Total Cylinders Distributed today (Industrial- 47.5 KG)']) || 0),
          }));
          
          setData(processed);
          if (processed.length > 0 && !selectedAgency) {
            setSelectedAgency(processed[0].agency);
          }
          setLoading(false);
          setError(null);
        },
        error: (err) => {
          setError("Could not parse spreadsheet data. Ensure it is published as CSV.");
          setLoading(false);
        }
      });
    } catch (e) {
      setError("Failed to fetch data. Check if your spreadsheet is 'Published to the Web'.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ANALYTICS CALCULATIONS ---
  
  const stats = useMemo(() => {
    if (!data.length) return { totalIn: 0, totalOut: 0, agencies: 0, net: 0 };
    const totalIn = data.reduce((acc, curr) => acc + curr.total_received, 0);
    const totalOut = data.reduce((acc, curr) => acc + curr.total_distributed, 0);
    const agencies = new Set(data.map(d => d.agency)).size;
    return { totalIn, totalOut, agencies, net: totalIn - totalOut };
  }, [data]);

  const omcMetrics = useMemo(() => {
    const groups = {};
    data.forEach(d => {
      if (!groups[d.omc]) groups[d.omc] = { name: d.omc, received: 0, distributed: 0 };
      groups[d.omc].received += d.total_received;
      groups[d.omc].distributed += d.total_distributed;
    });
    return Object.values(groups);
  }, [data]);

  const agencyTrend = useMemo(() => {
    if (!selectedAgency) return [];
    const agencyData = data
      .filter(d => d.agency === selectedAgency)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let currentStock = agencyData[0]?.starting_stock || 0;
    
    return agencyData.map(d => {
      currentStock = currentStock + d.total_received - d.total_distributed;
      return { ...d, runningStock: currentStock };
    });
  }, [selectedAgency, data]);

  const segmentData = useMemo(() => {
    return [
      { name: 'Domestic', value: data.reduce((a, c) => a + c.d_dom, 0) },
      { name: 'Commercial', value: data.reduce((a, c) => a + c.d_com, 0) },
      { name: 'Industrial', value: data.reduce((a, c) => a + c.d_ind, 0) }
    ];
  }, [data]);

  // --- SUB-COMPONENTS ---

  const StatCard = ({ title, value, sub, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
        {sub && <p className="text-slate-400 text-xs mt-2">{sub}</p>}
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <RefreshCw className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="text-slate-600 font-medium animate-pulse">Syncing with Google Sheets...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md">
        <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Issue</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <div className="text-left bg-slate-50 p-4 rounded-lg text-sm mb-6">
          <p className="font-bold mb-1">How to fix:</p>
          <ol className="list-decimal ml-4 space-y-1 text-slate-500">
            <li>Open your Google Sheet</li>
            <li>File > Share > Publish to Web</li>
            <li>Select "Link" and "Comma-separated values (.csv)"</li>
            <li>Click "Publish"</li>
          </ol>
        </div>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          Retry Sync
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Package className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-800 leading-tight">LPG Pro</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">District Analytics</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'agencies', label: 'Agency Deep Dive', icon: Building2 },
            { id: 'data', label: 'Historical Registry', icon: Database },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync Status</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-600 font-medium truncate">Live Sheet Connected</p>
            <button onClick={fetchData} className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700">
              <RefreshCw size={12} /> Force Refresh
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-10 max-h-screen overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {activeTab === 'dashboard' && 'District Executive View'}
              {activeTab === 'agencies' && 'Agency Intelligence'}
              {activeTab === 'data' && 'Data Records'}
            </h2>
            <p className="text-slate-500 font-medium">Monitoring distribution across {stats.agencies} providers.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all w-full md:w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Inflow" value={stats.totalIn.toLocaleString()} sub="Cylinders Received" icon={ArrowDownRight} color="bg-indigo-600" />
              <StatCard title="Total Outflow" value={stats.totalOut.toLocaleString()} sub="Cylinders Distributed" icon={ArrowUpRight} color="bg-emerald-500" />
              <StatCard title="Active Agencies" value={stats.agencies} sub="Registered Vendors" icon={Building2} color="bg-amber-500" />
              <StatCard title="Net Inventory" value={stats.net.toLocaleString()} sub="Cylinders in Circulation" icon={TrendingUp} color="bg-rose-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">OMC Performance</h3>
                    <p className="text-sm text-slate-500">Distribution volume per Oil Marketing Company</p>
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={omcMetrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}} 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" />
                      <Bar dataKey="received" name="Inflow" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
                      <Bar dataKey="distributed" name="Outflow" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Segment Usage</h3>
                <p className="text-sm text-slate-500 mb-8">Distribution by cylinder type</p>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="250">
                    <PieChart>
                      <Pie
                        data={segmentData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {segmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-8 space-y-4">
                    {segmentData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                          <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENCY DEEP DIVE */}
        {activeTab === 'agencies' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                  <Building2 size={32} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Select Agency</p>
                  <select 
                    className="w-full md:w-80 bg-transparent text-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                    value={selectedAgency}
                    onChange={(e) => setSelectedAgency(e.target.value)}
                  >
                    {[...new Set(data.map(d => d.agency))].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-40 bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Stock</p>
                  <p className="text-2xl font-black text-indigo-600">{agencyTrend[agencyTrend.length-1]?.runningStock || 0}</p>
                </div>
                <div className="flex-1 md:w-40 bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Parent OMC</p>
                  <p className="text-lg font-black text-slate-800">{agencyTrend[0]?.omc || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Inventory & Usage Trend</h3>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={agencyTrend}>
                    <defs>
                      <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="runningStock" name="Inventory Level" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" />
                    <Bar dataKey="total_distributed" name="Daily Distributed" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="total_received" name="Daily Received" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Efficiency Check</h3>
                <div className="space-y-6">
                   <div className="p-6 bg-emerald-50 rounded-2xl">
                     <div className="flex justify-between items-center mb-2">
                       <p className="text-sm font-bold text-emerald-700">Distribution Capacity</p>
                       <span className="text-xs bg-emerald-100 px-2 py-1 rounded text-emerald-600 font-black">HIGH</span>
                     </div>
                     <div className="w-full bg-emerald-200 h-3 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                     </div>
                     <p className="text-xs text-emerald-600 mt-2">Consistent daily delivery patterns observed.</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="border border-slate-100 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Avg Recieved</p>
                        <p className="text-xl font-black text-slate-800">
                          {Math.round(agencyTrend.reduce((a,c) => a+c.total_received, 0) / (agencyTrend.length || 1))}
                        </p>
                     </div>
                     <div className="border border-slate-100 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Avg Dist.</p>
                        <p className="text-xl font-black text-slate-800">
                          {Math.round(agencyTrend.reduce((a,c) => a+c.total_distributed, 0) / (agencyTrend.length || 1))}
                        </p>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Type Breakdown (Cumulative)</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Domestic', r: 'r_dom', d: 'd_dom', color: 'bg-blue-500' },
                    { label: 'Commercial', r: 'r_com', d: 'd_com', color: 'bg-pink-500' },
                    { label: 'Industrial', r: 'r_ind', d: 'd_ind', color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="font-bold text-slate-700">{item.label}</span>
                      </div>
                      <div className="flex gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Received</p>
                          <p className="font-bold text-slate-800">{agencyTrend.reduce((a,c) => a + c[item.r], 0)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Distributed</p>
                          <p className="font-bold text-slate-800">{agencyTrend.reduce((a,c) => a + c[item.d], 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA LOGS */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <div>
                 <h3 className="text-lg font-bold text-slate-800">Master Audit Log</h3>
                 <p className="text-xs text-slate-500 font-medium">Showing {data.length} entries from Google Sheet</p>
               </div>
               <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:bg-white px-4 py-2 rounded-xl transition-all">
                 <Download size={16} /> Export View
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 font-black border-b border-slate-100 bg-white">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Agency Profile</th>
                    <th className="px-8 py-5">OMC</th>
                    <th className="px-8 py-5">Inflow (D/C/I)</th>
                    <th className="px-8 py-5">Outflow (D/C/I)</th>
                    <th className="px-8 py-5">Daily Balance</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {data
                    .filter(d => 
                      d.agency.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      d.omc.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-slate-600 font-medium">{row.date}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                             {row.agency.substring(0,2)}
                           </div>
                           <span className="font-bold text-slate-800">{row.agency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${
                          row.omc === 'BPCL' ? 'bg-orange-100 text-orange-700' : 
                          row.omc === 'HPCL' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {row.omc}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-mono text-slate-500">
                        <span className="text-indigo-600 font-bold">{row.r_dom}</span> / {row.r_com} / {row.r_ind}
                      </td>
                      <td className="px-8 py-5 font-mono text-slate-500">
                        <span className="text-emerald-600 font-bold">{row.d_dom}</span> / {row.d_com} / {row.d_ind}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                          {row.total_received - row.total_distributed > 0 ? (
                            <TrendingUp size={14} className="text-emerald-500" />
                          ) : (
                            <TrendingUp size={14} className="text-rose-500 rotate-180" />
                          )}
                          {row.total_received - row.total_distributed}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
