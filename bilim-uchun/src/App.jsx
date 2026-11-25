import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BookOpen, Search, Heart, Flame, Library, LogOut, User, Shield,
  Plus, X, Menu, Languages, Moon, Sun, Download, BookMarked, Info
} from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const demoBooks = [
  { id:"d1", title:"O‘tkan kunlar", author:"Abdulla Qodiriy", genre:"Roman", age_group:"Kattalar", language:"uz", description:"O‘zbek adabiyotining mashhur romani.", cover_url:"", file_url:"", downloads:120 },
  { id:"d2", title:"Sariq devni minib", author:"Xudoyberdi To‘xtaboyev", genre:"Sarguzasht", age_group:"Bolalar", language:"uz", description:"Bolalar uchun qiziqarli sarguzasht asari.", cover_url:"", file_url:"", downloads:98 },
  { id:"d3", title:"Kichkina shahzoda", author:"Antuan de Sent-Ekzyuperi", genre:"Ertak", age_group:"Bolalar", language:"uz", description:"Do‘stlik va mehr haqida falsafiy ertak.", cover_url:"", file_url:"", downloads:86 },
  { id:"d4", title:"Atomic Habits", author:"James Clear", genre:"Shaxsiy rivojlanish", age_group:"Kattalar", language:"en", description:"Yaxshi odatlarni shakllantirish haqida.", cover_url:"", file_url:"", downloads:75 },
  { id:"d5", title:"Mehrobdan chayon", author:"Abdulla Qodiriy", genre:"Roman", age_group:"Kattalar", language:"uz", description:"Tarixiy-ijtimoiy roman.", cover_url:"", file_url:"", downloads:63 },
  { id:"d6", title:"Zumrad va Qimmat", author:"O‘zbek xalq ertagi", genre:"Ertak", age_group:"Bolalar", language:"uz", description:"Xalq og‘zaki ijodidan ertak.", cover_url:"", file_url:"", downloads:58 }
];

const words = {
  uz: { library:"Elektron kutubxona", search:"Kitob yoki muallifni qidiring...", genres:"Janrlar", all:"Barchasi", children:"Bolalar", adults:"Kattalar", favorites:"Sevimlilar", trending:"Trenddagilar", myLibrary:"Kutubxonam", requests:"Kitob buyurtma qilish", help:"Yordam", login:"Kirish", signup:"Ro‘yxatdan o‘tish", logout:"Chiqish", welcome:"Xush kelibsiz!", email:"Elektron pochta", password:"Parol", first:"Ism", last:"Familiya", open:"Kitobni ochish", save:"Saqlash", admin:"Admin paneli", add:"Kitob qo‘shish", title:"Kitob nomi", author:"Muallif", genre:"Janr", age:"Yosh toifasi", description:"Tavsif", file:"PDF/EPUB fayl URL manzili", cover:"Muqova URL manzili", submit:"Qo‘shish", noBooks:"Hozircha kitob topilmadi.", demo:"Demo rejimi", setup:"Saytni to‘liq ishlatish uchun Supabase sozlamalarini kiriting.", requestPlaceholder:"Kitob nomi va muallifini yozing", send:"So‘rov yuborish", sent:"So‘rov yuborildi!", roleNote:"Admin huquqi Supabase bazasida belgilanadi." },
  ru: { library:"Электронная библиотека", search:"Поиск книги или автора...", genres:"Жанры", all:"Все", children:"Детям", adults:"Взрослым", favorites:"Избранное", trending:"Популярное", myLibrary:"Моя библиотека", requests:"Заказать книгу", help:"Помощь", login:"Войти", signup:"Регистрация", logout:"Выйти", welcome:"Добро пожаловать!", email:"Эл. почта", password:"Пароль", first:"Имя", last:"Фамилия", open:"Открыть книгу", save:"Сохранить", admin:"Панель администратора", add:"Добавить книгу", title:"Название", author:"Автор", genre:"Жанр", age:"Возраст", description:"Описание", file:"Ссылка PDF/EPUB", cover:"Ссылка на обложку", submit:"Добавить", noBooks:"Книги не найдены.", demo:"Демо-режим", setup:"Для полной работы настройте Supabase.", requestPlaceholder:"Название книги и автор", send:"Отправить", sent:"Запрос отправлен!", roleNote:"Права администратора назначаются в Supabase." },
  en: { library:"Digital Library", search:"Search title or author...", genres:"Genres", all:"All", children:"Children", adults:"Adults", favorites:"Favorites", trending:"Trending", myLibrary:"My Library", requests:"Request a book", help:"Help", login:"Sign in", signup:"Sign up", logout:"Sign out", welcome:"Welcome!", email:"Email", password:"Password", first:"First name", last:"Last name", open:"Open book", save:"Save", admin:"Admin panel", add:"Add a book", title:"Book title", author:"Author", genre:"Genre", age:"Age group", description:"Description", file:"PDF/EPUB file URL", cover:"Cover image URL", submit:"Add", noBooks:"No books found.", demo:"Demo mode", setup:"Configure Supabase to enable the full service.", requestPlaceholder:"Book title and author", send:"Send request", sent:"Request sent!", roleNote:"Admin access is assigned in Supabase." }
};

export default function App() {
  const [lang,setLang] = useState("uz");
  const t = words[lang];
  const [session,setSession] = useState(null);
  const [profile,setProfile] = useState(null);
  const [books,setBooks] = useState(demoBooks);
  const [favorites,setFavorites] = useState([]);
  const [query,setQuery] = useState("");
  const [category,setCategory] = useState("all");
  const [section,setSection] = useState("all");
  const [authMode,setAuthMode] = useState("login");
  const [auth,setAuth] = useState({ first:"", last:"", email:"", password:"" });
  const [message,setMessage] = useState("");
  const [selected,setSelected] = useState(null);
  const [showAdmin,setShowAdmin] = useState(false);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [dark,setDark] = useState(true);
  const [requestText,setRequestText] = useState("");
  const [newBook,setNewBook] = useState({ title:"", author:"", genre:"Roman", age_group:"Kattalar", description:"", file_url:"", cover_url:"", language:"uz" });
  const [loading,setLoading] = useState(false);
  const isDemo = !supabase;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => setSession(data.session));
    const { data:{subscription} } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id",session.user.id).maybeSingle()
      .then(({data}) => setProfile(data || null));
  }, [session]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("books").select("*").order("created_at",{ascending:false})
      .then(({data,error}) => { if (!error && data) setBooks(data); });
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) return;
    supabase.from("favorites").select("book_id").eq("user_id",session.user.id)
      .then(({data}) => setFavorites((data || []).map(x => x.book_id)));
  }, [session]);

  const isAdmin = profile?.role === "admin" || profile?.role === "manager";
  const filtered = useMemo(() => books.filter(b => {
    const q = query.toLowerCase();
    const matchesText = !q || `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(q);
    const matchesAge = category === "all" || b.age_group === category;
    const matchesSection = section === "all" || (section === "favorites" && favorites.includes(b.id)) || (section === "trending" && true) || (section === "my" && favorites.includes(b.id));
    return matchesText && matchesAge && matchesSection;
  }).sort((a,b) => section === "trending" ? (b.downloads||0)-(a.downloads||0) : 0), [books,query,category,section,favorites]);

  async function handleAuth(e) {
    e.preventDefault(); setMessage(""); setLoading(true);
    if (!supabase) { setMessage("Demo rejimida haqiqiy akkaunt yaratib bo‘lmaydi. Supabase sozlang."); setLoading(false); return; }
    if (authMode === "signup") {
      const {error} = await supabase.auth.signUp({ email:auth.email, password:auth.password, options:{ data:{ first_name:auth.first, last_name:auth.last } } });
      setMessage(error ? error.message : "Ro‘yxatdan o‘tish so‘rovi yuborildi. Emailni tasdiqlang.");
    } else {
      const {error} = await supabase.auth.signInWithPassword({ email:auth.email, password:auth.password });
      setMessage(error ? error.message : "Muvaffaqiyatli kirdingiz.");
    }
    setLoading(false);
  }

  async function logout() { if (supabase) await supabase.auth.signOut(); setSession(null); setProfile(null); }

  async function toggleFavorite(book) {
    if (!session?.user || !supabase) { setMessage("Sevimlilarni saqlash uchun akkauntga kiring."); return; }
    const exists = favorites.includes(book.id);
    if (exists) {
      await supabase.from("favorites").delete().eq("user_id",session.user.id).eq("book_id",book.id);
      setFavorites(favorites.filter(id => id !== book.id));
    } else {
      const {error} = await supabase.from("favorites").insert({user_id:session.user.id,book_id:book.id});
      if (!error) setFavorites([...favorites,book.id]);
    }
  }

  async function addBook(e) {
    e.preventDefault();
    if (!supabase || !isAdmin) { setMessage("Kitob qo‘shish uchun Supabase va admin huquqi kerak."); return; }
    const {data,error} = await supabase.from("books").insert(newBook).select().single();
    if (error) setMessage(error.message);
    else { setBooks([data,...books]); setNewBook({title:"",author:"",genre:"Roman",age_group:"Kattalar",description:"",file_url:"",cover_url:"",language:"uz"}); setMessage("Kitob qo‘shildi."); }
  }

  async function sendRequest(e) {
    e.preventDefault();
    if (!requestText.trim()) return;
    if (supabase && session?.user) {
      const {error} = await supabase.from("book_requests").insert({user_id:session.user.id,request_text:requestText});
      setMessage(error ? error.message : t.sent);
    } else setMessage(isDemo ? "Demo: so‘rov namunasi qabul qilindi." : "So‘rov yuborish uchun tizimga kiring.");
    setRequestText("");
  }

  async function openBook(book) {
    setSelected(book);
    if (supabase && session?.user && !String(book.id).startsWith("d")) {
      await supabase.from("books").update({downloads:(book.downloads||0)+1}).eq("id",book.id);
    }
  }

  return <div className={dark ? "app dark" : "app light"}>
    <header className="topbar">
      <a className="brand" href="#" onClick={() => {setSection("all");setCategory("all");}}>
        <span className="brand-mark"><BookOpen size={22}/></span><span>BILIM <b>UCHUN</b><small>ELEKTRON KUTUBXONA</small></span>
      </a>
      <div className="top-actions">
        <div className="lang"><Languages size={16}/><select value={lang} onChange={e=>setLang(e.target.value)}><option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option></select></div>
        <button className="icon-btn" onClick={()=>setDark(!dark)} title="Mavzuni almashtirish">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        {session ? <><span className="user-chip"><User size={15}/>{profile?.first_name || session.user.email}</span><button className="outline-btn" onClick={logout}><LogOut size={15}/>{t.logout}</button></> :
          <button className="primary-btn small" onClick={()=>document.getElementById("auth")?.scrollIntoView({behavior:"smooth"})}>{t.login}</button>}
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span/> BILIM — KELAJAK KALITI</div>
          <h1>Har bir kitob —<br/><em>yangi bir olam.</em></h1>
          <p>Bilim olish, kashf etish va o‘sish uchun zamonaviy elektron kutubxonangiz.</p>
          <div className="hero-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/><kbd>⌕</kbd></div>
          <div className="hero-stats"><span><b>{books.length}+</b> kitob</span><span><b>3</b> til</span><span><b>24/7</b> ochiq</span></div>
        </div>
        <div className="hero-art"><div className="glow"/><div className="book-stack"><div className="book book-one"><span>ILM</span></div><div className="book book-two"><span>HIKMAT</span></div><div className="book book-three"><span>BILIM</span></div></div><div className="floating-note">✦ Bilim bilan yuksal!</div></div>
      </section>

      <div className="layout">
        <aside className={mobileMenu?"sidebar show":"sidebar"}>
          <div className="side-title">{t.library}</div>
          <button className={section==="all"?"side-link active":"side-link"} onClick={()=>{setSection("all");setMobileMenu(false)}}><Library size={17}/>{t.all}</button>
          <button className={section==="favorites"?"side-link active":"side-link"} onClick={()=>{setSection("favorites");setMobileMenu(false)}}><Heart size={17}/>{t.favorites}</button>
          <button className={section==="trending"?"side-link active":"side-link"} onClick={()=>{setSection("trending");setMobileMenu(false)}}><Flame size={17}/>{t.trending}</button>
          <button className={section==="my"?"side-link active":"side-link"} onClick={()=>{setSection("my");setMobileMenu(false)}}><BookMarked size={17}/>{t.myLibrary}</button>
          <div className="side-title gap-top">{t.genres}</div>
          <button className={category==="all"?"side-link active":"side-link"} onClick={()=>setCategory("all")}>{t.all}</button>
          <button className={category==="Bolalar"?"side-link active":"side-link"} onClick={()=>setCategory("Bolalar")}>🧒 {t.children}</button>
          <button className={category==="Kattalar"?"side-link active":"side-link"} onClick={()=>setCategory("Kattalar")}>📚 {t.adults}</button>
          <div className="side-title gap-top">BOSHQA</div>
          <button className="side-link" onClick={()=>document.getElementById("request")?.scrollIntoView({behavior:"smooth"})}>📥 {t.requests}</button>
          <button className="side-link" onClick={()=>setMessage("BILIM UCHUN — kitoblarni topish, saqlash va onlayn o‘qish platformasi.")}><Info size={17}/>{t.help}</button>
          {isAdmin && <button className="side-link admin-link" onClick={()=>setShowAdmin(!showAdmin)}><Shield size={17}/>{t.admin}</button>}
          <div className="sidebar-bottom">{isDemo && <span className="demo-pill">● {t.demo}</span>}<small>© 2026 BILIM UCHUN</small></div>
        </aside>

        <section className="content">
          <div className="section-heading"><div><div className="eyebrow">TANLANG VA MUTOLAA QILING</div><h2>{section==="favorites"?t.favorites:section==="trending"?t.trending:section==="my"?t.myLibrary:"Kitoblar olami"}</h2></div><button className="mobile-menu" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><span className="result-count">{filtered.length} ta kitob</span></div>
          {message && <div className="notice" role="status">{message}<button onClick={()=>setMessage("")}><X size={15}/></button></div>}
          <div className="book-grid">
            {filtered.map(book=><article className="book-card" key={book.id}>
              <div className="cover" onClick={()=>openBook(book)} style={book.cover_url?{backgroundImage:`linear-gradient(180deg,transparent,#101827aa),url("${book.cover_url}")`}:{}}>
                {!book.cover_url && <><span className="cover-symbol">✦</span><span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span></>}
                <span className="age-tag">{book.age_group}</span>
                <button className={favorites.includes(book.id)?"heart-btn saved":"heart-btn"} onClick={e=>{e.stopPropagation();toggleFavorite(book)}}><Heart size={17} fill={favorites.includes(book.id)?"currentColor":"none"}/></button>
              </div>
              <div className="book-info"><span className="genre">{book.genre}</span><h3>{book.title}</h3><p>{book.author}</p><button className="read-btn" onClick={()=>openBook(book)}>{t.open} <span>↗</span></button></div>
            </article>)}
          </div>
          {filtered.length===0 && <div className="empty"><BookOpen size={34}/><p>{t.noBooks}</p></div>}
        </section>
      </div>

      <section className="lower-grid">
        <div className="panel request-panel" id="request"><div className="eyebrow">SIZ IZLAGAN KITOB</div><h2>{t.requests}</h2><p>Kerakli kitobni topa olmadingizmi? Bizga xabar bering.</p><form onSubmit={sendRequest}><input value={requestText} onChange={e=>setRequestText(e.target.value)} placeholder={t.requestPlaceholder}/><button className="primary-btn">{t.send}</button></form></div>
        <div className="panel auth-panel" id="auth"><div className="eyebrow">SHAXSIY KUTUBXONA</div><h2>{session?t.welcome:t.login}</h2>
          {session ? <p>{session.user.email} — tizimga kirgansiz.</p> : <form onSubmit={handleAuth}>
            <div className="auth-tabs"><button type="button" className={authMode==="login"?"selected":""} onClick={()=>setAuthMode("login")}>{t.login}</button><button type="button" className={authMode==="signup"?"selected":""} onClick={()=>setAuthMode("signup")}>{t.signup}</button></div>
            {authMode==="signup" && <div className="two-input"><input required placeholder={t.first} value={auth.first} onChange={e=>setAuth({...auth,first:e.target.value})}/><input required placeholder={t.last} value={auth.last} onChange={e=>setAuth({...auth,last:e.target.value})}/></div>}
            <input required type="email" placeholder={t.email} value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})}/>
            <input required type="password" minLength="8" placeholder={t.password+" (kamida 8 belgi)"} value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})}/>
            <button className="primary-btn" disabled={loading}>{loading?"Kutilmoqda...":authMode==="login"?t.login:t.signup}</button>
          </form>}
          {isDemo && <p className="muted-note">{t.setup}</p>}
        </div>
      </section>

      {showAdmin && isAdmin && <section className="panel admin-panel"><div className="section-heading"><div><div className="eyebrow">BOSHQARUV</div><h2>{t.admin}</h2></div><button className="icon-btn" onClick={()=>setShowAdmin(false)}><X/></button></div>
        <form className="admin-form" onSubmit={addBook}>
          <input required placeholder={t.title} value={newBook.title} onChange={e=>setNewBook({...newBook,title:e.target.value})}/>
          <input required placeholder={t.author} value={newBook.author} onChange={e=>setNewBook({...newBook,author:e.target.value})}/>
          <input placeholder={t.genre} value={newBook.genre} onChange={e=>setNewBook({...newBook,genre:e.target.value})}/>
          <select value={newBook.age_group} onChange={e=>setNewBook({...newBook,age_group:e.target.value})}><option>Bolalar</option><option>Kattalar</option></select>
          <input placeholder={t.cover} value={newBook.cover_url} onChange={e=>setNewBook({...newBook,cover_url:e.target.value})}/>
          <input placeholder={t.file} value={newBook.file_url} onChange={e=>setNewBook({...newBook,file_url:e.target.value})}/>
          <textarea placeholder={t.description} value={newBook.description} onChange={e=>setNewBook({...newBook,description:e.target.value})}/>
          <button className="primary-btn"><Plus size={16}/>{t.submit}</button>
        </form>
        <p className="muted-note">{t.roleNote}</p>
      </section>}
    </main>

    <footer><div className="brand footer-brand"><span className="brand-mark"><BookOpen size={20}/></span><span>BILIM <b>UCHUN</b><small>ILM — ENG KATTA BOYLIK</small></span></div><span>© 2026 BILIM UCHUN. Barcha huquqlar himoyalangan.</span></footer>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="reader-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="genre">{selected.genre}</span><h2>{selected.title}</h2><p>{selected.author}</p></div><button className="icon-btn" onClick={()=>setSelected(null)}><X/></button></div>
      {selected.file_url ? <iframe title={selected.title} src={selected.file_url} className="reader-frame"/> : <div className="reader-placeholder"><BookOpen size={42}/><h3>Kitob fayli hali biriktirilmagan</h3><p>Admin PDF yoki EPUB fayl havolasini qo‘shgach, shu yerda ochiladi.</p></div>}
    </div></div>}
  </div>;
}
