<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LPG Agency Analysis Dashboard</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Recharts dependencies -->
    <script src="https://unpkg.com/prop-types/prop-types.min.js"></script>
    <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
    <!-- PapaParse for CSV -->
    <script src="https://unpkg.com/papaparse@5.4.1/papaparse.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo } = React;
        const { 
            LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
            Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart 
        } = Recharts;

        // Configuration
        const SPREADSHEET_ID = '1Iq_vJ3XWknrJKav23LOu28YNdPDgNZE5rTlLKynW8j4';
        const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
        const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

        const LucideIcon = ({ name, size = 24, className = "" }) => {
            const [iconSvg, setIconSvg] = useState("");
            useEffect(() => {
                if (window.lucide) {
                    const icon = window.lucide.icons[name];
                    if (icon) setIconSvg(icon.toSvg({ width: size, height: size, class: className }));
                }
            }, [name, size, className]);
            return <span dangerouslySetInnerHTML={{ __html: iconSvg }} />;
        };

        const App = () => {
            const [data, setData] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const [activeTab, setActiveTab] = useState('dashboard');
            const [selectedAgency, setSelectedAgency] = useState('');
            const [searchTerm, setSearchTerm] = useState('');

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
                            const processed = results.data.map(row => ({
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
                                total_received: (Number(row['Total Cylinders Received today (Domestic - 14.2 KG)']) || 0) + (Number(row['Total Cylinders Received today (Commercial - 19 KG)']) || 0) + (Number(row['Total Cylinders Received today (Industrial - 47.5 KG)']) || 0),
                                total_distributed: (Number(row['Total Cylinders Distributed today (Domestic- 14.2 KG)']) || 0) + (Number(row['Total Cylinders Distributed today (Commercial- 19 KG)']) || 0) + (Number(row['Total Cylinders Distributed today (Industrial- 47.5 KG)']) || 0),
                            }));
                            setData(processed);
                            if (processed.length > 0 && !selectedAgency) setSelectedAgency(processed[0].agency);
                            setLoading(false);
                        },
                        error: () => { setError("CSV Parsing Failed."); setLoading(false); }
                    });
                } catch (e) {
                    setError("Failed to fetch spreadsheet.");
                    setLoading(false);
                }
            };

            useEffect(() => { fetchData(); }, []);

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
                const agencyData = data.filter(d => d.agency === selectedAgency).sort((a, b) => new Date(a.date) - new Date(b.date));
                let currentStock = agencyData[0]?.starting_stock || 0;
                return agencyData.map(d => {
                    currentStock = currentStock + d.total_received - d.total_distributed;
                    return { ...d, runningStock: currentStock };
                });
            }, [selectedAgency, data]);

            const segmentData = useMemo(() => [
                { name: 'Domestic', value: data.reduce((a, c) => a + c.d_dom, 0) },
                { name: 'Commercial', value: data.reduce((a, c) => a + c.d_com, 0) },
                { name: 'Industrial', value: data.reduce((a, c) => a + c.d_ind, 0) }
            ], [data]);

            if (loading) return (
                <div className="h-screen flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold tracking-tight">Synchronizing Data...</p>
                </div>
            );

            return (
                <div className="min-h-screen flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-8 flex flex-col">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                                <LucideIcon name="Package" className="text-white" size={20} />
                            </div>
                            <h1 className="text-xl font-extrabold text-slate-800">LPG Analytic</h1>
                        </div>

                        <nav className="space-y-2 flex-1">
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="LayoutDashboard" size={18} /> Dashboard
                            </button>
                            <button onClick={() => setActiveTab('agencies')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'agencies' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="Building2" size={18} /> Agency Deep Dive
                            </button>
                        </nav>

                        <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-xs font-bold text-slate-700">Live Sync Enabled</p>
                            <button onClick={fetchData} className="mt-3 flex items-center gap-2 text-xs font-black text-indigo-600 hover:opacity-80">
                                <LucideIcon name="RefreshCw" size={12} /> Refresh Now
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-6 lg:p-12 max-h-screen overflow-y-auto custom-scrollbar">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab.replace('-', ' ')}</h2>
                                <p className="text-slate-500 font-medium mt-1">LPG flow monitoring for {stats.agencies} distribution agencies.</p>
                            </div>
                            <div className="relative group">
                                <LucideIcon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search registry..." 
                                    className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-sm w-full md:w-72 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </header>

                        {activeTab === 'dashboard' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                    {[
                                        { label: 'Total Inflow', val: stats.totalIn, icon: 'ArrowDownRight', col: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        { label: 'Total Outflow', val: stats.totalOut, icon: 'ArrowUpRight', col: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Active Agencies', val: stats.agencies, icon: 'Building2', col: 'text-amber-600', bg: 'bg-amber-50' },
                                        { label: 'Net Stock Delta', val: stats.net, icon: 'TrendingUp', col: 'text-rose-600', bg: 'bg-rose-50' }
                                    ].map(card => (
                                        <div key={card.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className={`${card.bg} ${card.col} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                                                <LucideIcon name={card.icon} size={20} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                                            <h3 className="text-2xl font-black text-slate-900 mt-1">{card.val.toLocaleString()}</h3>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                        <h3 className="text-xl font-black text-slate-800 mb-8">OMC Performance Benchmark</h3>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={omcMetrics}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                                                    <Bar dataKey="received" name="Inflow" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                                                    <Bar dataKey="distributed" name="Outflow" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                        <h3 className="text-xl font-black text-slate-800 mb-2">Segment Mix</h3>
                                        <p className="text-xs text-slate-400 font-bold mb-8">Total Distribution Split</p>
                                        <div className="h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={segmentData} innerRadius={60} outerRadius={90} paddingAngle={10} dataKey="value">
                                                        {segmentData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-4 mt-6">
                                            {segmentData.map((item, i) => (
                                                <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                                                        <span className="text-xs font-bold text-slate-600">{item.name}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-900">{item.value.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'agencies' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
                                            <LucideIcon name="Building2" size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Agency</p>
                                            <select 
                                                className="w-full md:w-80 bg-transparent text-xl font-black text-slate-900 focus:outline-none appearance-none cursor-pointer"
                                                value={selectedAgency}
                                                onChange={(e) => setSelectedAgency(e.target.value)}
                                            >
                                                {[...new Set(data.map(d => d.agency))].map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <div className="flex-1 md:w-44 bg-slate-900 p-5 rounded-2xl text-center shadow-xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Inventory</p>
                                            <p className="text-3xl font-black text-white">{agencyTrend[agencyTrend.length-1]?.runningStock || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-800 mb-10">Stock & Distribution Timeline</h3>
                                    <div className="h-[450px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={agencyTrend}>
                                                <defs>
                                                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                                                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                                                <Area type="monotone" dataKey="runningStock" name="Inventory" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorStock)" />
                                                <Bar dataKey="total_distributed" name="Distributed" fill="#10b981" barSize={18} radius={[4, 4, 0, 0]} />
                                                <Line type="monotone" dataKey="total_received" name="Received" stroke="#f59e0b" strokeWidth={2} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
