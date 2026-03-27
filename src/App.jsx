import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ChefHat, Trash2, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, ExternalLink, LogIn, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { id: 1, name: 'Maggi', price: 30, image: '/maggi.png', desc: 'Classic comfort noodles with secret spice mix.' },
  { id: 2, name: 'Omelette', price: 59, image: '/omelette.png', desc: 'Fluffy eggs with fresh veggies and herbs.' },
  { id: 3, name: 'Tea', price: 10, image: '/tea.png', desc: 'Authentic desi masala chai for the soul.' },
];

const App = () => {
  const [view, setView] = useState('menu'); // 'menu' | 'chef-login' | 'chef-dashboard' | 'order-placed' | 'processing'
  const [cart, setCart] = useState([]);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders') || '[]'));
  const [lastOrder, setLastOrder] = useState(null);
  const [loginError, setLoginError] = useState(false);
  const passwordRef = useRef(null);

  // Sync orders with localStorage
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  const handlePayNow = () => {
    if (total === 0) return;
    
    // Generate a unique transaction reference
    const transactionId = 'T' + Date.now();
    
    // Dynamic UPI link with auto-populated amount and unique transaction ID
    const upiLink = `upi://pay?pa=8931040270@ptaxis&pn=GastroGo&tr=${transactionId}&am=${total}&cu=INR&tn=Order_${transactionId}`;
    
    // Trigger UPI app selection
    window.location.href = upiLink;

    // Transition to processing view wait for manual confirmation
    setView('processing');
  };

  const handleChefLogin = (e) => {
    e.preventDefault();
    if (password === 'chef123') {
      setView('chef-dashboard');
      setLoginError(false);
    } else {
      setLoginError(true);
      if (passwordRef.current) passwordRef.current.focus();
    }
  };

  const markCompleted = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Prepared' } : o));
  };

  // Views components
  const MenuView = () => (
    <div className="container animate-fade-in">
      <header style={{ padding: '40px 0', borderBottom: '1px solid rgba(255,140,0,0.2)', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)' }}>GastroGo</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Delicious quick bites at your command.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="button-secondary" onClick={() => setView('chef-login')}>
            <ChefHat size={20} /> Chef Login
          </button>
        </div>
      </header>

      <div className="grid">
        {MENU_ITEMS.map((item) => (
          <div key={item.id} className="order-card glass-morphism">
            <img src={item.image} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ fontSize: '1.5rem' }}>{item.name}</h3>
                <span style={{ fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 600 }}>₹{item.price}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>{item.desc}</p>
              <button className="button-primary" style={{ width: '100%' }} onClick={() => addToCart(item)}>
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProcessingView = () => {
    const upiID = '8931040270@ptaxis';
    // Adding mcc=5812 (Restaurants) and mode=02 (Secure intent) to improve Paytm/GPay trust
    const upiBase = `pa=${upiID}&pn=GastroGo&mcc=5812&mode=02&am=${total}&cu=INR&tn=Order_${Date.now()}`;
    const upiLink = `upi://pay?${upiBase}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
    
    // Automatic trigger to open the payment app immediately
    useEffect(() => {
      const timer = setTimeout(() => {
        window.location.href = upiLink;
      }, 500);
      return () => clearTimeout(timer);
    }, [upiLink]);

    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 15 }}>Launching Payment...</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 30, maxWidth: 400 }}>
          Your payment app should open automatically. Use the QR below if blocked.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, width: '100%', maxWidth: 800 }}>
          {/* Method 1: App Links */}
          <div className="glass-morphism" style={{ padding: 30, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 15 }}>
            <h3 style={{ marginBottom: 10, fontSize: '1.2rem' }}>Method 1: Quick Links</h3>
            <button className="button-primary" style={{ justifyContent: 'center', padding: '16px', background: '#4285F4' }} onClick={() => window.location.href = upiLink}>
              Try Google Pay Again
            </button>
            <button className="button-primary" style={{ justifyContent: 'center', padding: '16px', background: '#00BAF2' }} onClick={() => window.location.href = `paytmmp://pay?${upiBase}`}>
              Try Paytm Again
            </button>
            
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Copy UPI ID for manual pay:</p>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <code style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{upiID}</code>
                <button onClick={() => { navigator.clipboard.writeText(upiID); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>COPY</button>
              </div>
            </div>
          </div>

          {/* Method 2: QR Code */}
          <div className="glass-morphism" style={{ padding: 30, borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: 20, fontSize: '1.2rem' }}>Method 2: Scan QR</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 15, fontWeight: 600 }}>Trusted Method (No Alerts)</p>
            <div style={{ background: 'white', padding: 15, borderRadius: 16, marginBottom: 15 }}>
              <img src={qrUrl} alt="Payment QR Code" style={{ width: 180, height: 180, display: 'block' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Save/Screenshot and scan to pay wirelessly</p>
          </div>
        </div>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 15, width: '100%', maxWidth: 350 }}>
          <button className="button-primary" style={{ justifyContent: 'center', padding: '18px', background: 'var(--accent-gradient)' }} onClick={() => {
             const newOrder = {
              id: '#' + Math.floor(Math.random() * 9000 + 1000),
              items: [...cart],
              total,
              status: 'Paid',
              timestamp: new Date().toLocaleString()
            };
            setOrders([newOrder, ...orders]);
            setLastOrder(newOrder);
            setCart([]);
            setView('order-placed');
          }}>
            I have completed payment <CheckCircle size={20} />
          </button>
          <button className="button-secondary" onClick={() => setView('menu')}>
            Cancel Order
          </button>
        </div>
      </div>
    );
  };

  const ConfirmedView = () => (
    <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
        <CheckCircle size={100} color="#00ff00" style={{ marginBottom: 30 }} />
      </motion.div>
      <h1 style={{ fontSize: '3rem', marginBottom: 15 }}>Order Placed!</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: 40 }}>
        Order ID: <strong>{lastOrder?.id}</strong>. We've started preparing your food.
      </p>
      <button className="button-primary" onClick={() => setView('menu')} style={{ margin: '0 auto' }}>
        Order More
      </button>
    </div>
  );

  const ChefLoginView = () => {
    useEffect(() => {
      if (passwordRef.current) passwordRef.current.focus();
    }, []);

    return (
      <div className="container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleChefLogin} className="glass-morphism" style={{ padding: 40, borderRadius: 24, width: '100%', maxWidth: 400 }}>
          <button type="button" onClick={() => { setView('menu'); setLoginError(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginBottom: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h2 style={{ marginBottom: 30 }}>Chef Login</h2>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 10, fontSize: '0.9rem' }}>Password</label>
            <input 
              ref={passwordRef}
              type="password" 
              value={password} 
              onChange={(e) => { setPassword(e.target.value); setLoginError(false); }} 
              placeholder="chef123" 
              style={{ width: '100%', borderColor: loginError ? '#ff4444' : 'var(--glass-border)' }} 
            />
            {loginError && <p style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: 10 }}>Incorrect password. Please try again.</p>}
          </div>
          <button className="button-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Enter Kitchen <LogIn size={18} />
          </button>
        </form>
      </div>
    );
  };

  const ChefDashboard = () => (
    <div className="container" style={{ padding: '40px 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Utensils color="var(--accent)" /> Chef's Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage orders and kitchen flow.</p>
        </div>
        <button className="button-secondary" onClick={() => setView('menu')}>Logout</button>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        {orders.length === 0 ? (
          <div className="glass-morphism" style={{ padding: 60, textAlign: 'center', borderRadius: 24 }}>
            <p style={{ color: 'var(--text-secondary)' }}>No orders yet. Sit back and relax!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass-morphism" style={{ padding: 30, borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', items: 'center', gap: 15, marginBottom: 10 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Order {order.id}</span>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')} • ₹{order.total} • {order.timestamp}
                </div>
              </div>
              <div>
                {order.status !== 'Prepared' && (
                  <button className="button-primary" onClick={() => markCompleted(order.id)}>
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', paddingBottom: view === 'menu' && cart.length > 0 ? 120 : 40 }}>
      {view === 'menu' && <MenuView />}
      {view === 'chef-login' && <ChefLoginView />}
      {view === 'chef-dashboard' && <ChefDashboard />}
      {view === 'processing' && <ProcessingView />}
      {view === 'order-placed' && <ConfirmedView />}

      {/* Persistent Cart Bar */}
      <AnimatePresence>
        {view === 'menu' && cart.length > 0 && (
          <motion.div 
            initial={{ y: 200 }} 
            animate={{ y: 0 }} 
            exit={{ y: 200 }}
            className="glass-morphism" 
            style={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              width: '100%', 
              padding: '16px 24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderRadius: '20px 20px 0 0',
              zIndex: 3000,
              boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
              borderBottom: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Grand Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>₹{total}</span>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{cart.reduce((acc, i) => acc + i.qty, 0)} Items</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selected snack(s)</span>
              </div>
            </div>
            <button className="button-primary" style={{ padding: '16px 48px', fontSize: '1.2rem', borderRadius: 16 }} onClick={handlePayNow}>
              Order Now <CreditCard size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default App;
