import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Activity, AlertTriangle, ArrowDownLeft, ArrowUpRight, Bell, Boxes, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, CreditCard, Download, FileBarChart, LayoutDashboard, Menu, Package, Plus, Search, Settings, ShoppingCart, SlidersHorizontal, Sparkles, Stethoscope, TrendingUp, Users, Upload, Save, X } from 'lucide-react'

type Medicine = { id: number; name: string; generic: string; category: string; stock: number; price: number; expiry: string; status: 'পর্যাপ্ত' | 'কম স্টক' | 'স্টক শেষ' }
const initialMedicines: Medicine[] = [
  { id: 1, name: 'নাপা ৫০০ মি.গ্রা.', generic: 'প্যারাসিটামল', category: 'ট্যাবলেট', stock: 248, price: 1.2, expiry: '১২/২০২৭', status: 'পর্যাপ্ত' },
  { id: 2, name: 'সেকলো ২০ মি.গ্রা.', generic: 'ওমিপ্রাজল', category: 'ক্যাপসুল', stock: 18, price: 6, expiry: '০৮/২০২৭', status: 'কম স্টক' },
  { id: 3, name: 'ফেক্সো ১২০ মি.গ্রা.', generic: 'ফেক্সোফেনাডিন', category: 'ট্যাবলেট', stock: 0, price: 8, expiry: '০৩/২০২৭', status: 'স্টক শেষ' },
  { id: 4, name: 'মন্টিলুকাস্ট ১০', generic: 'মন্টিলুকাস্ট', category: 'ট্যাবলেট', stock: 96, price: 12, expiry: '১১/২০২৭', status: 'পর্যাপ্ত' },
  { id: 5, name: 'ওরস্যালাইন-এন', generic: 'ওআরএস', category: 'স্যাশে', stock: 32, price: 6, expiry: '০৬/২০২৭', status: 'কম স্টক' },
  { id: 6, name: 'আজিথ্রোমাইসিন ৫০০', generic: 'আজিথ্রোমাইসিন', category: 'ট্যাবলেট', stock: 74, price: 15, expiry: '০৯/২০২৭', status: 'পর্যাপ্ত' },
]
const bn = (n: number) => new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 2 }).format(n)
const money = (n: number) => `৳${bn(n)}`
const navItems = [
  { label: 'ড্যাশবোর্ড', icon: LayoutDashboard, group: 'মূল মেনু' },
  { label: 'বিক্রয়', icon: ShoppingCart, group: 'মূল মেনু' },
  { label: 'ওষুধের তালিকা', icon: Package, group: 'মূল মেনু' },
  { label: 'স্টক ব্যবস্থাপনা', icon: Boxes, group: 'মূল মেনু' },
  { label: 'ক্রেতা ও সরবরাহকারী', icon: Users, group: 'ব্যবসা পরিচালনা' },
  { label: 'রিপোর্ট', icon: FileBarChart, group: 'ব্যবসা পরিচালনা' },
  { label: 'সেটিংস', icon: Settings, group: 'অন্যান্য' },
]

export default function App() {
  const [lastSaved, setLastSaved] = useState('')
  const importInput = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState('ড্যাশবোর্ড')
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try { const saved = localStorage.getItem('urvi-pharmacy-data-v1'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed.medicines)) return parsed.medicines } } catch { /* corrupted local data */ }
    return initialMedicines
  })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('সব ওষুধ')
  const [showAdd, setShowAdd] = useState(false)
  const [showSale, setShowSale] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState('')
  const [newName, setNewName] = useState('')
  const [newGeneric, setNewGeneric] = useState('')
  const [newStock, setNewStock] = useState('৫০')
  const [newPrice, setNewPrice] = useState('১০')
  const [saleItem, setSaleItem] = useState('নাপা ৫০০ মি.গ্রা.')
  const [saleQty, setSaleQty] = useState('১')
  const [saleCustomer, setSaleCustomer] = useState('')
  const filtered = useMemo(() => medicines.filter(m => {
    const matches = `${m.name} ${m.generic} ${m.category}`.toLowerCase().includes(query.toLowerCase())
    return matches && (filter === 'সব ওষুধ' || m.status === filter)
  }), [medicines, query, filter])
  const lowStock = medicines.filter(m => m.stock > 0 && m.stock < 30).length
  const stockOut = medicines.filter(m => m.stock === 0).length
  const totalUnits = medicines.reduce((sum, m) => sum + m.stock, 0)

  useEffect(() => {
    try {
      localStorage.setItem('urvi-pharmacy-data-v1', JSON.stringify({ app: 'Urvi Pharmacy', version: 1, savedAt: new Date().toISOString(), medicines }))
      setLastSaved(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }))
    } catch { setNotice('ব্রাউজারে ডেটা সংরক্ষণ করা যায়নি। JSON ব্যাকআপ ডাউনলোড করুন।') }
  }, [medicines])

  function downloadBackup() {
    const backup = { app: 'Urvi Pharmacy', version: 1, exportedAt: new Date().toISOString(), medicines }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `urvi-pharmacy-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
    setNotice('JSON ব্যাকআপ ডাউনলোড হয়েছে।')
  }

  function uploadBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as { app?: string; version?: number; medicines?: Medicine[] }
        if (data.app !== 'Urvi Pharmacy' || !Array.isArray(data.medicines) || !data.medicines.every(m => m && typeof m.id === 'number' && typeof m.name === 'string' && typeof m.stock === 'number' && typeof m.price === 'number' && typeof m.generic === 'string' && typeof m.category === 'string' && typeof m.expiry === 'string')) throw new Error('ফাইলটি Urvi Pharmacy-এর বৈধ JSON ব্যাকআপ নয়।')
        if (!window.confirm(`ব্যাকআপ থেকে ${bn(data.medicines.length)}টি ওষুধের তথ্য লোড হবে। বর্তমান তালিকা প্রতিস্থাপন করবেন?`)) return
        setMedicines(data.medicines.map(m => ({ ...m, status: (m.stock === 0 ? 'স্টক শেষ' : m.stock < 30 ? 'কম স্টক' : 'পর্যাপ্ত') as Medicine['status'] })))
        setNotice('JSON ব্যাকআপ সফলভাবে পুনরুদ্ধার হয়েছে।')
      } catch (error) { setNotice(error instanceof Error ? error.message : 'JSON ফাইল পড়া যায়নি।') }
      finally { event.target.value = '' }
    }
    reader.onerror = () => { setNotice('ফাইল পড়া যায়নি। আবার চেষ্টা করুন।'); event.target.value = '' }
    reader.readAsText(file)
  }

  function addMedicine(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const stock = Number(newStock.replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))) || 0
    const price = Number(newPrice.replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))) || 0
    const item: Medicine = { id: Date.now(), name: newName, generic: newGeneric || 'তথ্য যোগ করা হয়নি', category: 'ট্যাবলেট', stock, price, expiry: '১২/২০২৭', status: stock === 0 ? 'স্টক শেষ' : stock < 30 ? 'কম স্টক' : 'পর্যাপ্ত' }
    setMedicines(prev => [item, ...prev]); setShowAdd(false); setNewName(''); setNewGeneric(''); setNotice('নতুন ওষুধের তথ্য সফলভাবে যোগ করা হয়েছে।'); setTimeout(() => setNotice(''), 3500)
  }
  function completeSale(e: FormEvent) {
    e.preventDefault()
    const qty = Number(saleQty.replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))) || 1
    const selected = medicines.find(m => m.name === saleItem)
    if (!selected || selected.stock < qty) { setNotice('পর্যাপ্ত স্টক নেই। স্টক যাচাই করে আবার চেষ্টা করুন।'); setTimeout(() => setNotice(''), 3500); return }
    setMedicines(prev => prev.map(m => m.id === selected.id ? { ...m, stock: m.stock - qty, status: m.stock - qty === 0 ? 'স্টক শেষ' : m.stock - qty < 30 ? 'কম স্টক' : 'পর্যাপ্ত' } : m))
    setShowSale(false); setNotice('বিক্রয় সম্পন্ন হয়েছে। ইনভেন্টরি আপডেট করা হয়েছে।'); setTimeout(() => setNotice(''), 3500)
  }
  return <div className="app-shell"><input ref={importInput} type="file" accept=".json,application/json" hidden onChange={uploadBackup}/>
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Activity size={24} strokeWidth={2.5}/></div><div><div className="brand-name">Urvi <span>Pharmacy</span></div><div className="brand-sub">স্মার্ট ফার্মেসি ম্যানেজমেন্ট</div></div><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="মেনু বন্ধ"><X size={18}/></button></div>
      <div className="store-switch"><div className="store-avatar">উ</div><div className="store-info"><strong>উর্বী ফার্মেসি</strong><span><span className="live-dot"/> প্রধান শাখা</span></div><ChevronDown size={16} className="muted-icon"/></div>
      <nav className="navigation">{['মূল মেনু','ব্যবসা পরিচালনা','অন্যান্য'].map(group => <div className="nav-group" key={group}><div className="nav-label">{group}</div>{navItems.filter(item => item.group === group).map(item => <button key={item.label} className={`nav-item ${active === item.label ? 'active' : ''}`} onClick={() => { setActive(item.label); setMobileNav(false) }}><item.icon size={18} strokeWidth={1.8}/><span>{item.label}</span>{item.label === 'স্টক ব্যবস্থাপনা' && <span className="nav-count">{bn(lowStock + stockOut)}</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={19}/></div><strong>সাহায্য প্রয়োজন?</strong><p>আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p><button onClick={() => { setNotice('সাপোর্ট: support@urvipharmacy.example'); setTimeout(() => setNotice(''), 3500) }}>সাপোর্ট সেন্টার <ArrowUpRight size={14}/></button></div><button className="nav-item logout" onClick={downloadBackup}><Download size={18}/><span>ব্যাকআপ ডাউনলোড</span></button><div className="user-profile"><div className="user-avatar">উ</div><div className="user-info"><strong>উর্বী ফার্মেসি</strong><span>লোকাল মোড · {lastSaved ? `সংরক্ষিত ${lastSaved}` : 'ডেটা সংরক্ষণ'}</span></div><button className="icon-btn" aria-label="ব্যাকআপ ডাউনলোড" onClick={downloadBackup}><Download size={16}/></button></div></div>
    </aside>
    {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="মেনু খুলুন"><Menu size={21}/></button><div className="breadcrumb">পেজ <ChevronRight size={14}/> <strong>{active}</strong></div></div><div className="topbar-right"><div className="date-pill"><CalendarDays size={16}/><span>শুক্রবার, ০৯ অক্টোবর ২০২৬</span></div><button className="notification-btn" aria-label="নোটিফিকেশন" onClick={() => setNotice('আপনার ৩টি নতুন নোটিফিকেশন রয়েছে।')}><Bell size={19}/><span/></button><div className="top-avatar">উ</div></div></header>
      <div className="page-content">
        {active === 'ড্যাশবোর্ড' ? <>
          <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> আপনার ব্যবসার এক নজরে চিত্র</div><h1>স্বাগতম, উর্বী ফার্মেসি <span className="wave">!</span></h1><p className="page-description">আজকের ব্যবসার অবস্থা এবং গুরুত্বপূর্ণ তথ্য এখানে দেখুন।</p></div><div className="header-actions"><button className="btn btn-secondary" onClick={() => { setNotice('রিপোর্ট প্রস্তুত করা হচ্ছে।'); setTimeout(() => setNotice(''), 3000) }}><Download size={16}/> রিপোর্ট ডাউনলোড</button><button className="btn btn-primary" onClick={() => setShowSale(true)}><Plus size={17}/> নতুন বিক্রয়</button></div></div>
          <div className="summary-grid"><StatCard icon={<CreditCard size={20}/>} tone="green" label="আজকের মোট বিক্রয়" value="৳২৪,৫৮০" delta="১২.৮%" caption="গতকালের তুলনায়" up/><StatCard icon={<ShoppingCart size={20}/>} tone="blue" label="মোট অর্ডার" value="১২৮" delta="৮.২%" caption="গতকালের তুলনায়" up/><StatCard icon={<Package size={20}/>} tone="violet" label="মোট ওষুধ" value={bn(medicines.length * 124 + 86)} delta={`${bn(totalUnits)} ইউনিট`} caption="বর্তমান স্টক"/><StatCard icon={<TrendingUp size={20}/>} tone="amber" label="আজকের লাভ" value="৳৬,৪২০" delta="৬.৪%" caption="গতকালের তুলনায়" up/></div>
          <div className="content-grid"><section className="panel sales-panel"><div className="panel-heading"><div><h2>বিক্রয়ের সারসংক্ষেপ</h2><p>আপনার বিক্রয়ের প্রবণতা পর্যবেক্ষণ করুন</p></div><button className="select-button" onClick={() => setNotice('এখন ৭ দিনের বিক্রয় তথ্য দেখানো হচ্ছে।')} >এই ৭ দিন <ChevronDown size={15}/></button></div><div className="chart-legend"><span><i className="legend-dot sales-dot"/> বিক্রয়</span><span><i className="legend-dot profit-dot"/> লাভ</span><div className="chart-total"><strong>৳১,৮৪,৫৬০</strong><small><span className="positive">↗ ১২.৮%</span> গত সপ্তাহের তুলনায়</small></div></div><div className="chart-wrap"><div className="y-labels"><span>৳৩০হা.</span><span>৳২০হা.</span><span>৳১০হা.</span><span>৳০</span></div><div className="chart-area"><div className="grid-lines"><i/><i/><i/><i/></div><svg className="chart-svg" viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label="সাপ্তাহিক বিক্রয় ও লাভের রেখাচিত্র"><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#20a879" stopOpacity=".18"/><stop offset="100%" stopColor="#20a879" stopOpacity="0"/></linearGradient></defs><path d="M0,128 C30,118 48,135 82,105 S126,115 160,83 S210,100 240,72 S290,94 320,61 S365,83 400,55 S445,74 480,45 S520,67 560,30 S610,48 640,18 L640,190 L0,190Z" fill="url(#salesFill)"/><path d="M0,128 C30,118 48,135 82,105 S126,115 160,83 S210,100 240,72 S290,94 320,61 S365,83 400,55 S445,74 480,45 S520,67 560,30 S610,48 640,18" fill="none" stroke="#20a879" strokeWidth="3" strokeLinecap="round"/><path d="M0,162 C36,150 50,164 82,145 S130,155 160,132 S210,143 240,124 S285,138 320,110 S365,128 400,104 S450,118 480,95 S530,111 560,80 S610,93 640,75" fill="none" stroke="#91b9f7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5"/></svg><div className="x-labels"><span>শনি</span><span>রবি</span><span>সোম</span><span>মঙ্গল</span><span>বুধ</span><span>বৃহঃ</span><span>শুক্র</span></div></div></div></section>
            <section className="panel inventory-panel"><div className="panel-heading"><div><h2>স্টকের অবস্থা</h2><p>ওষুধের বর্তমান মজুত</p></div><button className="more-btn" onClick={() => setActive('স্টক ব্যবস্থাপনা')}>বিস্তারিত <ArrowUpRight size={14}/></button></div><div className="inventory-donut-wrap"><div className="donut"><div className="donut-center"><strong>{bn(medicines.length)}</strong><span>ধরনের ওষুধ</span></div></div></div><div className="stock-legend"><div><span className="stock-dot in-stock"/><span>পর্যাপ্ত স্টক</span><strong>{bn(medicines.filter(m => m.status === 'পর্যাপ্ত').length)}</strong></div><div><span className="stock-dot low-stock"/><span>কম স্টক</span><strong>{bn(lowStock)}</strong></div><div><span className="stock-dot out-stock"/><span>স্টক শেষ</span><strong>{bn(stockOut)}</strong></div></div><button className="full-link" onClick={() => setActive('স্টক ব্যবস্থাপনা')}>স্টক ব্যবস্থাপনা দেখুন <ArrowUpRight size={15}/></button></section></div>
          <section className="panel medicines-panel"><div className="panel-heading medicine-heading"><div><h2>ওষুধের তালিকা</h2><p>আপনার ইনভেন্টরির ওষুধগুলো পরিচালনা করুন</p></div><button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16}/> ওষুধ যোগ করুন</button></div><div className="table-toolbar"><div className="tabs">{['সব ওষুধ','পর্যাপ্ত','কম স্টক','স্টক শেষ'].map(t => <button key={t} className={filter === t ? 'tab active-tab' : 'tab'} onClick={() => setFilter(t)}>{t}{t === 'কম স্টক' && <span className="tab-count">{bn(lowStock)}</span>}</button>)}</div><div className="table-tools"><label className="search-field"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ওষুধ খুঁজুন..."/></label><button className="filter-btn" onClick={() => setFilter(filter === 'সব ওষুধ' ? 'কম স্টক' : 'সব ওষুধ')}><SlidersHorizontal size={16}/><span>ফিল্টার</span></button></div></div><div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="সব নির্বাচন"/></th><th>ওষুধের নাম</th><th>ক্যাটাগরি</th><th>স্টক</th><th>একক মূল্য</th><th>মেয়াদ উত্তীর্ণ</th><th>স্ট্যাটাস</th><th/></tr></thead><tbody>{filtered.map(m => <tr key={m.id}><td><input type="checkbox" aria-label={`${m.name} নির্বাচন`}/></td><td><div className="medicine-cell"><div className={`med-icon med-${m.id % 4}`}><Package size={17}/></div><div><strong>{m.name}</strong><span>{m.generic}</span></div></div></td><td><span className="category-pill">{m.category}</span></td><td><strong className={m.stock < 30 ? 'stock-number-low' : ''}>{bn(m.stock)}</strong> <span className="unit">টি</span></td><td>{money(m.price)}</td><td>{m.expiry}</td><td><Status status={m.status}/></td><td><button className="row-menu" aria-label="আরও অপশন" onClick={() => { setNotice(`${m.name} — ${bn(m.stock)} টি স্টকে আছে।`); setTimeout(() => setNotice(''), 3000) }}>•••</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><Package size={26}/><strong>কোনো ওষুধ পাওয়া যায়নি</strong><span>অন্য নামে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।</span></div>}</div><div className="table-footer"><span>মোট {bn(filtered.length)}টি ওষুধ দেখানো হচ্ছে</span><div className="pagination"><button disabled aria-label="আগের পৃষ্ঠা"><ChevronLeft size={16}/></button><button className="page-active">১</button><button onClick={() => setNotice('সব ওষুধ এই পৃষ্ঠাতেই দেখানো হচ্ছে।')}>২</button><button onClick={() => setNotice('সব ওষুধ এই পৃষ্ঠাতেই দেখানো হচ্ছে।')}>৩</button><span>...</span><button onClick={() => setNotice('সব ওষুধ এই পৃষ্ঠাতেই দেখানো হচ্ছে।')}>১২</button><button onClick={() => setNotice('সব ওষুধ এই পৃষ্ঠাতেই দেখানো হচ্ছে।')} aria-label="পরের পৃষ্ঠা"><ChevronRight size={16}/></button></div></div></section>
          <div className="bottom-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>সাম্প্রতিক কার্যক্রম</h2><p>আপনার ফার্মেসির সর্বশেষ আপডেট</p></div><button className="more-btn" onClick={() => setActive('রিপোর্ট')}>সব দেখুন <ArrowUpRight size={14}/></button></div><div className="activity-list"><ActivityItem icon={<ShoppingCart size={16}/>} tone="green" title="নতুন বিক্রয় সম্পন্ন হয়েছে" detail="অর্ডার #INV-2084 · নাপা, সেকলো" time="১০ মিনিট আগে" amount="৳১,২৫০"/><ActivityItem icon={<ArrowDownLeft size={16}/>} tone="blue" title="নতুন স্টক যোগ করা হয়েছে" detail="প্যারাসিটামল · ২০০ পিস" time="৩৫ মিনিট আগে"/><ActivityItem icon={<Users size={16}/>} tone="violet" title="নতুন ক্রেতা যুক্ত হয়েছে" detail="মোঃ রাকিব হাসান" time="১ ঘণ্টা আগে"/></div></section><section className="panel alerts-panel"><div className="panel-heading"><div><h2>সতর্কতা ও নোটিশ</h2><p>যেসব বিষয়ে আপনার নজর দেওয়া দরকার</p></div><span className="alert-count">{bn(lowStock + stockOut)}</span></div>{lowStock + stockOut > 0 ? <div className="alert-list">{medicines.filter(m => m.status !== 'পর্যাপ্ত').slice(0, 3).map(m => <div className="alert-item" key={m.id}><div className={`alert-icon ${m.stock === 0 ? 'danger' : ''}`}><AlertTriangle size={17}/></div><div className="alert-copy"><strong>{m.stock === 0 ? 'ওষুধের স্টক শেষ' : 'স্টক কমে এসেছে'}</strong><span>{m.name} · {bn(m.stock)} টি বাকি</span></div><button onClick={() => setActive('স্টক ব্যবস্থাপনা')} aria-label="স্টক দেখুন"><ChevronRight size={17}/></button></div>)}</div> : <div className="empty-alert">এই মুহূর্তে কোনো সতর্কতা নেই।</div>}<button className="full-link" onClick={() => setActive('স্টক ব্যবস্থাপনা')}>সব সতর্কতা দেখুন <ArrowUpRight size={15}/></button></section></div>
        </> : <SectionPage active={active} medicines={medicines} onAdd={() => setShowAdd(true)} onSale={() => setShowSale(true)} onDashboard={() => setActive('ড্যাশবোর্ড')} onBackup={downloadBackup} onRestore={() => importInput.current?.click()}/>}
        <footer className="footer"><span>© ২০২৬ Urvi Pharmacy. সর্বস্বত্ব সংরক্ষিত।</span><span><span className="footer-dot"/> সিস্টেম সচল <span className="footer-sep">·</span> সংস্করণ ১.০.০</span></footer>
      </div>
    </main>
    {notice && <div className="toast"><Check size={17}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="বন্ধ করুন"><X size={15}/></button></div>}
    {showAdd && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAdd(false) }}><form className="modal" onSubmit={addMedicine}><div className="modal-head"><div><div className="modal-icon"><Package size={20}/></div><h2>নতুন ওষুধ যোগ করুন</h2><p>ইনভেন্টরিতে নতুন ওষুধের তথ্য যুক্ত করুন।</p></div><button type="button" className="icon-btn" onClick={() => setShowAdd(false)} aria-label="বন্ধ করুন"><X size={19}/></button></div><label className="form-label">ওষুধের নাম <span>*</span><input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="যেমন: নাপা ৫০০ মি.গ্রা."/></label><label className="form-label">জেনেরিক নাম<input value={newGeneric} onChange={e => setNewGeneric(e.target.value)} placeholder="যেমন: প্যারাসিটামল"/></label><div className="form-row"><label className="form-label">স্টকের পরিমাণ<input value={newStock} onChange={e => setNewStock(e.target.value)} inputMode="numeric" required/></label><label className="form-label">একক মূল্য (৳)<input value={newPrice} onChange={e => setNewPrice(e.target.value)} inputMode="decimal" required/></label></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>বাতিল</button><button type="submit" className="btn btn-primary"><Plus size={16}/> ওষুধ যোগ করুন</button></div></form></div>}
    {showSale && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowSale(false) }}><form className="modal" onSubmit={completeSale}><div className="modal-head"><div><div className="modal-icon sale-modal-icon"><ShoppingCart size={20}/></div><h2>নতুন বিক্রয়</h2><p>বিক্রয়ের তথ্য দিন এবং ইনভেন্টরি আপডেট করুন।</p></div><button type="button" className="icon-btn" onClick={() => setShowSale(false)} aria-label="বন্ধ করুন"><X size={19}/></button></div><label className="form-label">ওষুধ নির্বাচন <span>*</span><select value={saleItem} onChange={e => setSaleItem(e.target.value)}>{medicines.filter(m => m.stock > 0).map(m => <option key={m.id} value={m.name}>{m.name} — স্টক {bn(m.stock)}</option>)}</select></label><div className="form-row"><label className="form-label">পরিমাণ <span>*</span><input value={saleQty} onChange={e => setSaleQty(e.target.value)} inputMode="numeric" required/></label><label className="form-label">ক্রেতার নাম<input value={saleCustomer} onChange={e => setSaleCustomer(e.target.value)} placeholder="ঐচ্ছিক"/></label></div><div className="sale-note"><Clock3 size={16}/> বিক্রয় সম্পন্ন হলে ওষুধের স্টক স্বয়ংক্রিয়ভাবে কমবে।</div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowSale(false)}>বাতিল</button><button type="submit" className="btn btn-primary"><Check size={16}/> বিক্রয় নিশ্চিত করুন</button></div></form></div>}
  </div>
}
function StatCard({ icon, tone, label, value, delta, caption, up }: { icon: ReactNode; tone: string; label: string; value: string; delta: string; caption: string; up?: boolean }) { return <div className="stat-card"><div className="stat-top"><div className={`stat-icon ${tone}`}>{icon}</div>{up && <span className="stat-change"><ArrowUpRight size={13}/>{delta}</span>}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-caption">{!up && <span className="units-caption">{delta}</span>} {caption}</div></div> }
function Status({ status }: { status: Medicine['status'] }) { return <span className={`status-pill ${status === 'পর্যাপ্ত' ? 'status-good' : status === 'কম স্টক' ? 'status-low' : 'status-out'}`}><i/>{status}</span> }
function ActivityItem({ icon, tone, title, detail, time, amount }: { icon: ReactNode; tone: string; title: string; detail: string; time: string; amount?: string }) { return <div className="activity-item"><div className={`activity-icon ${tone}`}>{icon}</div><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><div className="activity-meta">{amount && <strong>{amount}</strong>}<span>{time}</span></div></div> }
function SectionPage({ active, medicines, onAdd, onSale, onDashboard, onBackup, onRestore }: { active: string; medicines: Medicine[]; onAdd: () => void; onSale: () => void; onDashboard: () => void; onBackup: () => void; onRestore: () => void }) {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('সব')
  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) && (range === 'সব' || m.status === range))
  const titles: Record<string, string> = { 'বিক্রয়': 'বিক্রয় ব্যবস্থাপনা', 'ওষুধের তালিকা': 'ওষুধের তালিকা', 'স্টক ব্যবস্থাপনা': 'স্টক ব্যবস্থাপনা', 'ক্রেতা ও সরবরাহকারী': 'ক্রেতা ও সরবরাহকারী', 'রিপোর্ট': 'ব্যবসায়িক রিপোর্ট', 'সেটিংস': 'সেটিংস' }
  return <>
    <div className="welcome-row"><div><div className="eyebrow"><Activity size={14}/> উর্বী ফার্মেসি</div><h1>{titles[active] || active}</h1><p className="page-description">{active === 'সেটিংস' ? 'লোকাল ডেটা সংরক্ষণ এবং JSON ব্যাকআপ পরিচালনা করুন।' : 'আপনার ফার্মেসির তথ্য এক জায়গা থেকে পরিচালনা করুন।'}</p></div><div className="header-actions">{active === 'বিক্রয়' && <button className="btn btn-primary" onClick={onSale}><Plus size={16}/> নতুন বিক্রয়</button>}{['ওষুধের তালিকা','স্টক ব্যবস্থাপনা'].includes(active) && <button className="btn btn-primary" onClick={onAdd}><Plus size={16}/> ওষুধ যোগ করুন</button>}</div></div>
    {active === 'সেটিংস' ? <div className="panel settings-card">
      <div className="settings-row"><div className="settings-symbol"><Save size={19}/></div><div><strong>স্বয়ংক্রিয় লোকাল সংরক্ষণ</strong><p>ওষুধের তালিকা এই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়। একই ব্রাউজার ও ডিভাইসে আবার খুললে ডেটা থাকবে।</p><p>ব্রাউজারের ডেটা মুছে গেলে বা অন্য ডিভাইস ব্যবহার করলে JSON ব্যাকআপ দিয়ে পুনরুদ্ধার করুন।</p></div><span className="settings-enabled">সক্রিয়</span></div>
      <div className="settings-row"><div className="settings-symbol drive-symbol"><Download size={19}/></div><div><strong>JSON ব্যাকআপ ডাউনলোড</strong><p>ওষুধের তালিকার ব্যাকআপ .json ফাইল হিসেবে আপনার ডিভাইসে সংরক্ষণ করুন। নিরাপদ স্থানে ফাইলটি রাখুন।</p></div><div className="drive-actions"><button className="btn btn-primary" onClick={onBackup}><Download size={15}/> JSON ডাউনলোড</button></div></div>
      <div className="settings-row"><div className="settings-symbol"><Upload size={19}/></div><div><strong>JSON ব্যাকআপ আপলোড / পুনরুদ্ধার</strong><p>আগে ডাউনলোড করা Urvi Pharmacy JSON ফাইল বেছে নিয়ে বর্তমান ওষুধের তালিকা পুনরুদ্ধার করুন। এতে বর্তমান তালিকা প্রতিস্থাপিত হবে।</p></div><div className="drive-actions"><button className="btn btn-secondary" onClick={onRestore}><Upload size={15}/> JSON আপলোড</button></div></div>
    </div> : active === 'ক্রেতা ও সরবরাহকারী' ? <div className="content-grid directory-grid"><div className="panel directory-card"><div className="stat-icon blue"><Users size={21}/></div><h2>ক্রেতা</h2><div className="directory-number">১,২৪৮</div><p>নিবন্ধিত ক্রেতা</p><button className="btn btn-secondary" onClick={() => alert('ক্রেতা তালিকা ডেমো মোডে রয়েছে।')}>ক্রেতার তালিকা দেখুন <ArrowUpRight size={15}/></button></div><div className="panel directory-card"><div className="stat-icon green"><Boxes size={21}/></div><h2>সরবরাহকারী</h2><div className="directory-number">৩৬</div><p>সক্রিয় সরবরাহকারী</p><button className="btn btn-secondary" onClick={() => alert('সরবরাহকারী তালিকা ডেমো মোডে রয়েছে।')}>সরবরাহকারীর তালিকা <ArrowUpRight size={15}/></button></div></div> : active === 'রিপোর্ট' ? <div className="summary-grid report-stats"><StatCard icon={<CreditCard size={20}/>} tone="green" label="মোট বিক্রয়" value="৳৬,৮৪,৫৬০" delta="এই মাস" caption="অক্টোবর ২০২৬"/><StatCard icon={<TrendingUp size={20}/>} tone="violet" label="মোট লাভ" value="৳১,২৪,৮২০" delta="এই মাস" caption="অক্টোবর ২০২৬"/><StatCard icon={<ShoppingCart size={20}/>} tone="blue" label="মোট অর্ডার" value="২,৪৮৬" delta="এই মাস" caption="অক্টোবর ২০২৬"/><StatCard icon={<Package size={20}/>} tone="amber" label="স্টক ইউনিট" value={bn(medicines.reduce((s, m) => s + m.stock, 0))} delta="বর্তমান" caption="সকল ওষুধ মিলিয়ে"/></div> : <div className="panel medicines-panel subpage-table"><div className="panel-heading"><div><h2>{active === 'বিক্রয়' ? 'দ্রুত বিক্রয়' : 'ইনভেন্টরি তালিকা'}</h2><p>মোট {bn(medicines.length)} ধরনের ওষুধ</p></div><label className="search-field"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ওষুধ খুঁজুন..."/></label></div>{active === 'স্টক ব্যবস্থাপনা' && <div className="tabs stock-filter">{['সব','পর্যাপ্ত','কম স্টক','স্টক শেষ'].map(t => <button key={t} className={range === t ? 'tab active-tab' : 'tab'} onClick={() => setRange(t)}>{t}</button>)}</div>}<div className="table-scroll"><table><thead><tr><th>ওষুধের নাম</th><th>জেনেরিক নাম</th><th>স্টক</th><th>একক মূল্য</th><th>মেয়াদ</th><th>স্ট্যাটাস</th></tr></thead><tbody>{filtered.map(m => <tr key={m.id}><td><div className="medicine-cell"><div className="med-icon"><Package size={17}/></div><strong>{m.name}</strong></div></td><td>{m.generic}</td><td><strong>{bn(m.stock)}</strong> টি</td><td>{money(m.price)}</td><td>{m.expiry}</td><td><Status status={m.status}/></td></tr>)}</tbody></table></div><div className="table-footer"><span>মোট {bn(filtered.length)}টি ওষুধ</span></div></div>}
    <div className="back-dashboard"><button className="btn btn-secondary" onClick={onDashboard}><LayoutDashboard size={16}/> ড্যাশবোর্ডে ফিরে যান</button></div>
  </>
}

