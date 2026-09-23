import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import './App.css';

const storeName = 'Smarthome Supermarket';
const API_BASE = process.env.REACT_APP_API_BASE || '/api';
const defaultCategories = ['Beverages', 'Food', 'Household', 'Personal Care', 'Electronics', 'Stationary', 'Clothing'];

const startingProducts = [
  { id: 1, name: 'Fresh Milk 1L', sku: 'GV-MILK-001', category: 'Dairy', price: 180, stock: 18, capacity: 60 },
  { id: 2, name: 'Pishori Rice 5kg', sku: 'GV-RICE-502', category: 'Grains', price: 1680, stock: 42, capacity: 70 },
  { id: 3, name: 'Brown Bread', sku: 'GV-BREAD-104', category: 'Bakery', price: 95, stock: 9, capacity: 45 },
  { id: 4, name: 'Tomato Sauce 500g', sku: 'GV-SAUCE-221', category: 'Pantry', price: 260, stock: 27, capacity: 50 },
  { id: 5, name: 'Cooking Oil 2L', sku: 'GV-OIL-830', category: 'Pantry', price: 620, stock: 61, capacity: 80 },
  { id: 6, name: 'Banana Pack', sku: 'GV-BANANA-077', category: 'Produce', price: 150, stock: 14, capacity: 55 },
  { id: 7, name: 'Sugar 2kg', sku: 'GV-SUGAR-210', category: 'Pantry', price: 340, stock: 72, capacity: 90 },
  { id: 8, name: 'Bath Soap', sku: 'GV-SOAP-012', category: 'Home Care', price: 85, stock: 24, capacity: 80 },
];

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout' },
  { id: 'stock', label: 'Stock Available', icon: 'boxes' },
  { id: 'stock-alerts', label: 'Stock Alerts', icon: 'bell' },
  { id: 'add-stock', label: 'Add Stock', icon: 'plus' },
  { id: 'sell', label: 'Selling', icon: 'cart' },
  { id: 'receipt', label: 'Receipts', icon: 'receipt' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'sales-history', label: 'Sales History', icon: 'receipt' },
];

const stockLinks = [
  { id: 'sell', label: 'Sell stock', icon: 'cart' },
  { id: 'add-stock', label: 'Add stock', icon: 'plus' },
  { id: 'stock', label: 'View stock', icon: 'boxes' },
  { id: 'stock-alerts', label: 'Stock Alert', icon: 'bell' },
];

const iconPaths = {
  layout: ['M3 3h8v8H3z', 'M13 3h8v5h-8z', 'M13 10h8v11h-8z', 'M3 13h8v8H3z'],
  cart: ['M4 5h2l2.2 10.4a2 2 0 0 0 2 1.6h6.9a2 2 0 0 0 1.9-1.4L21 9H7.1', 'M10 21h.1', 'M18 21h.1'],
  boxes: ['M4 7l8-4 8 4-8 4z', 'M4 7v10l8 4 8-4V7', 'M12 11v10'],
  plus: ['M12 5v14', 'M5 12h14'],
  receipt: ['M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 16v-5', 'M12 16V8', 'M16 16v-9'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-1.9-.2 7.8 7.8 0 0 1-1.7.7 1.7 1.7 0 0 0-1.2 1.5v.2H11v-.2a1.7 1.7 0 0 0-1.2-1.5 7.8 7.8 0 0 1-1.7-.7 1.7 1.7 0 0 0-1.9.2l-.2.1-2-3.4.1-.1a1.7 1.7 0 0 0 .3-1.9 8.2 8.2 0 0 1-.3-1.9A1.7 1.7 0 0 0 2.8 12h-.2V8h.2a1.7 1.7 0 0 0 1.6-1.1c.1-.7.2-1.3.4-1.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 1.9.2c.5-.3 1.1-.5 1.7-.7A1.7 1.7 0 0 0 11 .2V0h2v.2a1.7 1.7 0 0 0 1.2 1.5c.6.2 1.2.4 1.7.7a1.7 1.7 0 0 0 1.9-.2l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9c.2.6.3 1.2.4 1.9A1.7 1.7 0 0 0 21.2 8h.2v4h-.2a1.7 1.7 0 0 0-1.6 1.1c-.1.7-.2 1.3-.4 1.9z'],
  camera: ['M4 7h3l1.5-2h7L17 7h3v12H4z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  print: ['M7 8V3h10v5', 'M7 17H5a2 2 0 0 1-2-2v-4h18v4a2 2 0 0 1-2 2h-2', 'M7 14h10v7H7z'],
  lock: ['M7 11V8a5 5 0 0 1 10 0v3', 'M5 11h14v10H5z'],
  palette: ['M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3.1 1.6 1.6 0 0 1 1.1-2.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z', 'M7.5 11h.1', 'M9.5 7.5h.1', 'M14.5 7.5h.1'],
  type: ['M4 6V4h16v2', 'M12 4v16', 'M8 20h8'],
  bell: ['M12 3a5 5 0 0 1 5 5v3.2c0 1.5.6 2.9 1.7 3.9l1.3 1.2H4l1.3-1.2A5.4 5.4 0 0 0 7 11.2V8a5 5 0 0 1 5-5z', 'M10 20a2 2 0 0 0 4 0'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  check: ['M5 12l4 4L19 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-up': ['M6 15l6-6 6 6'],
  eye: ['M2 12s3-7 10-7 10 7-3 7-10 7-10-7z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  'eye-off': ['M9.9 4.2A9.9 9.9 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.6 3.6', 'M6.6 6.6A18 18 0 0 0 2 12s3 7 10 7a9.9 9.9 0 0 0 5.4-1.6', 'M3 3l18 18'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M22 6 12 13 2 6'],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
  sun: ['M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42', 'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z'],
};

function Icon({ name, size = 20 }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {iconPaths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function formatMoney(amount) {
  return `KSh ${Number(amount).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

function normalizeSale(sale) {
  const parsedTimestamp = typeof sale.timestamp === 'number' ? sale.timestamp : Date.parse(sale.timestamp);
  const timestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : Date.now();
  const date = new Date(timestamp);

  return {
    ...sale,
    timestamp,
    dateLabel: `${date.toLocaleDateString('en-KE')} · ${date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
  };
}

function getStockState(product) {
  const percentage = product.capacity ? (product.stock / product.capacity) * 100 : 0;
  const runningOut = product.stock <= 6;

  if (runningOut || percentage <= 25) {
    return { label: 'Low', className: 'low', percentage };
  }

  if (percentage <= 60) {
    return { label: 'Average', className: 'average', percentage };
  }

  return { label: 'High', className: 'high', percentage };
}

function playScanBeep() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.16);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.18);
}

function App() {
  const scannerRef = useRef(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetForm, setResetForm] = useState({ password: '', confirm: '' });
  const [resetError, setResetError] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedToken = window.localStorage.getItem('smarthome-token');
      const saved = savedToken ? window.localStorage.getItem('smarthome-user') : null;
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem('smarthome-token') || '');
  const [products, setProducts] = useState(startingProducts);
  const [cart, setCart] = useState([]);
  const [scanCode, setScanCode] = useState('');
  const [saleDetails, setSaleDetails] = useState({ buyer: '', server: '' });
  const [message, setMessage] = useState('Ready for the next customer.');
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [receipt, setReceipt] = useState(null);
  const [activePage, setActivePage] = useState(() => {
    try {
      const saved = window.localStorage.getItem('smarthome-active-page');
      return saved || 'dashboard';
    } catch (error) {
      return 'dashboard';
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(() => (
    typeof window === 'undefined' ? true : window.innerWidth > 900
  ));
  const [isMobileLayout, setIsMobileLayout] = useState(() => (
    typeof window === 'undefined' ? false : window.innerWidth <= 900
  ));
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stockMenuOpen, setStockMenuOpen] = useState(true);
  const [stockCategory, setStockCategory] = useState('All');
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [historyRange, setHistoryRange] = useState('day');
  const [salesHistory, setSalesHistory] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '' });
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    capacity: '',
  });
  const [reportType, setReportType] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    if (user?.name) {
      setSaleDetails((current) => ({ ...current, server: user.name }));
    }
  }, [user]);
  const canSubmitProduct = productForm.name.trim().length > 0
    && Number(productForm.price) > 0
    && Number(productForm.stock) >= 0
    && Number(productForm.capacity) > 0;

  const stockCounts = useMemo(() => {
    return products.reduce(
      (counts, product) => {
        counts[getStockState(product).className] += 1;
        return counts;
      },
      { low: 0, average: 0, high: 0 }
    );
  }, [products]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalStock = products.reduce((sum, item) => sum + item.stock, 0);
  const totalCapacity = products.reduce((sum, item) => sum + item.capacity, 0);
  const lowStockItems = products.filter((product) => product.stock > 0 && (product.stock <= 6 || getStockState(product).className === 'low'));
  const categories = useMemo(() => ['All', ...new Set([...defaultCategories, ...products.map((product) => product.category)])], [products]);
  const visibleStockProducts = stockCategory === 'All'
    ? products
    : products.filter((product) => product.category === stockCategory);
  const notificationCount = lowStockItems.length + products.filter((product) => product.stock <= 0).length;
  const outOfStockItems = products.filter((product) => product.stock <= 0);
  const alertItems = [...outOfStockItems, ...lowStockItems].slice(0, 5);
  const stockAlertItems = [...outOfStockItems, ...lowStockItems];

  const salesSummary = useMemo(() => {
    const now = Date.now();
    const rangeMs = historyRange === 'day' ? 24 * 60 * 60 * 1000 : historyRange === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const filteredSales = salesHistory.filter((sale) => now - sale.timestamp <= rangeMs);
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const customersServed = filteredSales.length;
    const lastSale = filteredSales[0];

    return {
      totalSales,
      customersServed,
      orders: filteredSales.length,
      lastSale,
    };
  }, [historyRange, salesHistory]);

  function showToast(text, type = 'success') {
    window.clearTimeout(toastTimerRef.current);
    setToast({ text, type });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    let previousMobile = window.innerWidth <= 900;
    setIsMobileLayout(previousMobile);
    setDrawerOpen(!previousMobile);

    function syncLayout() {
      const mobile = window.innerWidth <= 900;
      setIsMobileLayout(mobile);
      if (mobile !== previousMobile) {
        setDrawerOpen(!mobile);
        previousMobile = mobile;
      }
    }

    window.addEventListener('resize', syncLayout);
    return () => window.removeEventListener('resize', syncLayout);
  }, []);

  useEffect(() => {
    document.title = receipt ? `${storeName} Receipt ${receipt.ticket}` : `${storeName} Dashboard`;
  }, [receipt]);

  useEffect(() => {
    try {
      window.localStorage.setItem('smarthome-active-page', activePage);
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [activePage]);

  useEffect(() => {
    if (!authToken) {
      setProducts(startingProducts);
      setSalesHistory([]);
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadSessionData() {
      try {
        const authResponse = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!authResponse.ok) {
          throw new Error('Your session has expired.');
        }

        const authData = await authResponse.json();
        const [productsResponse, salesResponse] = await Promise.all([
          fetch(`${API_BASE}/products`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          fetch(`${API_BASE}/sales`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        if (!productsResponse.ok || !salesResponse.ok) {
          throw new Error('Unable to load dashboard data.');
        }

        const [productsData, salesData] = await Promise.all([
          productsResponse.json(),
          salesResponse.json(),
        ]);

        if (cancelled) {
          return;
        }

        setUser(authData.user);
        setAuthToken(authToken);
        setProducts(Array.isArray(productsData) ? productsData : startingProducts);
        setSalesHistory(Array.isArray(salesData) ? salesData.map(normalizeSale) : []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        window.localStorage.removeItem('smarthome-token');
        window.localStorage.removeItem('smarthome-user');
        setUser(null);
        setAuthToken('');
        setProducts(startingProducts);
        setSalesHistory([]);
        setMessage(error.message || 'Unable to restore your session.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSessionData();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    if (!profileOpen && !notificationOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      const profileArea = document.querySelector('.profile-area');
      const headerActions = document.querySelector('.header-actions');
      const clickedInsideProfile = profileArea && profileArea.contains(event.target);
      const clickedInsideHeader = headerActions && headerActions.contains(event.target);

      if (!clickedInsideProfile && !clickedInsideHeader && !event.target.closest('.notify-button')) {
        setProfileOpen(false);
      }

      if (!clickedInsideHeader && !event.target.closest('.notify-button')) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [profileOpen, notificationOpen]);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
      stopScanner();
    };
  }, []);

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }

      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    } catch (error) {
      setMessage('Scanner stopped.');
    } finally {
      scannerRef.current = null;
      setCameraOpen(false);
    }
  }

  function findProductByCode(code) {
    return products.find((item) => item.sku.toLowerCase() === code.trim().toLowerCase());
  }

  function scanProductCode(code) {
    const product = findProductByCode(code);

    if (!product) {
      setMessage(`No goods found for code ${code}.`);
      return false;
    }

    const added = addToCart(product);
    if (added) {
      playScanBeep();
      setMessage(`${product.name} scanned. Price: ${formatMoney(product.price)}.`);
    }

    return added;
  }

  async function startScanner() {
    try {
      setCameraOpen(true);
      setMessage('Starting QR scanner...');

      setTimeout(async () => {
        try {
          const scanner = new Html5Qrcode('qr-reader');
          scannerRef.current = scanner;
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (scanProductCode(decodedText)) {
                setScanCode('');
                stopScanner();
              }
            },
            () => {}
          );
          setMessage('QR scanner is active. Point it at the goods QR code.');
        } catch (error) {
          setCameraOpen(false);
          setMessage('QR scanner could not start. Allow camera permission or type the SKU instead.');
        }
      }, 50);
    } catch (error) {
      setCameraOpen(false);
      setMessage('QR scanner could not start. Allow camera permission or type the SKU instead.');
    }
  }

  function addToCart(product, quantity = 1) {
    if (product.stock <= 0) {
      setMessage(`${product.name} is out of stock.`);
      return false;
    }

    const inCart = cart.find((item) => item.id === product.id)?.quantity || 0;
    if (inCart + quantity > product.stock) {
      setMessage(`Only ${product.stock} ${product.name} available.`);
      return false;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [...current, { ...product, quantity }];
    });
    setMessage(`${product.name} added to cart.`);
    return true;
  }

  function handleScan(event) {
    event.preventDefault();
    if (!scanCode.trim()) {
      setMessage('Scan a QR code or type an item SKU.');
      return;
    }

    if (scanProductCode(scanCode)) {
      setScanCode('');
    }
  }

  function updateCartQuantity(productId, quantity) {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== productId));
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product || quantity > product.stock) {
      setMessage('Quantity cannot be higher than available stock.');
      return;
    }

    setCart((current) =>
      current.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  }

  async function checkout() {
    if (!cart.length) {
      setMessage('Add items before generating a receipt.');
      return;
    }

    const payload = {
      buyer: saleDetails.buyer.trim() || 'Walk-in Customer',
      server: user?.name || saleDetails.server.trim() || 'Signed-in user',
      total: Number(cartTotal.toFixed(2)),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to complete the sale.');
      }

      const servedAt = new Date(data.timestamp);
      const nextReceipt = {
        ticket: data.ticket,
        servedAt: servedAt.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: servedAt.toLocaleDateString('en-KE'),
        server: data.server || payload.server,
        buyer: data.buyer || payload.buyer,
        items: data.items || cart,
        total: data.total,
      };

      setProducts((current) =>
        current.map((product) => {
          const soldItem = (data.items || cart).find((item) => item.id === product.id);
          return soldItem ? { ...product, stock: Math.max(0, product.stock - soldItem.quantity) } : product;
        })
      );
      setSalesHistory((current) => [normalizeSale(data), ...current]);
      setReceipt(nextReceipt);
      setCart([]);
      setActivePage('receipt');
      setMessage('Sale completed. Stock deducted and receipt generated.');
    } catch (error) {
      setMessage(error.message || 'Unable to complete the sale.');
    }
  }

  async function addProduct(event) {
    event.preventDefault();
    const nextProduct = {
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      category: productForm.category.trim() || 'General',
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      capacity: Number(productForm.capacity),
    };

    if (!nextProduct.name || nextProduct.price <= 0 || nextProduct.stock < 0 || nextProduct.capacity <= 0) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(nextProduct),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add product.');
      }

      setProducts((current) => [data, ...current]);
      setProductForm({ name: '', sku: '', category: '', price: '', stock: '', capacity: '' });
      showToast(`${data.name} added to stock.`);
    } catch (error) {
      showToast(error.message || 'Unable to add product.', 'error');
    }
  }


  async function restockProduct(productId, amount) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    const nextStock = Math.max(0, product.stock + amount);
    await updateProductStock(productId, nextStock);
  }

  async function updateProductStock(productId, newStock) {
    const numeric = Number(newStock);
    if (!Number.isFinite(numeric) || !Number.isInteger(numeric) || numeric < 0) {
      setMessage('Stock quantity must be a whole number of zero or more.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ stock: numeric }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update stock.');
      }

      setProducts((current) =>
        current.map((item) => (item.id === productId ? data : item))
      );
      setMessage('Stock quantity updated successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to update stock.');
    }
  }

  function changePassword(event) {
    event.preventDefault();
    if (!passwordForm.current || passwordForm.next.length < 6) {
      setMessage('Enter current password and a new password with at least 6 characters.');
      return;
    }

    setPasswordForm({ current: '', next: '' });
    setMessage('Password changed for this demo session.');
  }

  function switchAuthMode(mode) {
    setAuthMode(mode);
    setAuthError('');
    setAuthNotice('');
    setAuthForm({ name: '', email: '', password: '' });
    setShowPassword(false);
  }

  function enterResetMode() {
    setResetMode(true);
    setResetEmail('');
    setResetToken('');
    setResetForm({ password: '', confirm: '' });
    setResetError('');
    setResetNotice('');
  }

  function exitResetMode() {
    setResetMode(false);
    setResetEmail('');
    setResetToken('');
    setResetForm({ password: '', confirm: '' });
    setResetError('');
    setResetNotice('');
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setIsAuthLoading(true);

    const payload = {
      name: authForm.name.trim(),
      email: authForm.email.trim(),
      password: authForm.password,
    };

    try {
      if (!payload.email || !payload.password || (authMode === 'signup' && !payload.name)) {
        throw new Error('Enter all required login details.');
      }

      if (payload.password.length < 6) {
        throw new Error('Password must contain at least 6 characters.');
      }

      const endpoint = authMode === 'signup' ? 'signup' : 'login';
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : {};

      if (!contentType.includes('application/json')) {
        throw new Error('Server API is unavailable. Check that the backend is deployed and database env vars are set.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      if (authMode === 'signup') {
        setAuthForm({ name: '', email: payload.email, password: '' });
        setAuthMode('login');
        setAuthNotice('Account created. Sign in to continue.');
        showToast('Account created successfully.', 'success');
        return;
      }

      window.localStorage.setItem('smarthome-token', data.token);
      window.localStorage.setItem('smarthome-user', JSON.stringify(data.user));
      setAuthToken(data.token);
      setUser(data.user);
      setAuthForm({ name: '', email: '', password: '' });
      setAuthError('');
      setActivePage('dashboard');
      showToast(`Welcome, ${data.user.name}.`, 'success');
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleRequestReset(event) {
    if (event) {
      event.preventDefault();
    }
    setResetError('');
    setResetNotice('');
    setIsResetLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send reset link.');
      }

      if (data.token) {
        setResetToken(data.token);
        setResetNotice('Reset link generated. Paste it below to continue.');
      } else {
        setResetNotice('If an account exists, a reset link has been sent.');
      }
    } catch (error) {
      setResetError(error.message || 'Unable to send reset link.');
    } finally {
      setIsResetLoading(false);
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault();
    setResetError('');
    setResetNotice('');

    if (resetForm.password !== resetForm.confirm) {
      setResetError('New passwords do not match.');
      return;
    }

    if (resetForm.password.length < 6) {
      setResetError('Password must contain at least 6 characters.');
      return;
    }

    setIsResetLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: resetForm.password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset password.');
      }

      setResetNotice(data.message || 'Password has been reset.');
      setResetToken('');
      setResetForm({ password: '', confirm: '' });
      setResetEmail('');
      setTimeout(() => setResetMode(false), 1500);
    } catch (error) {
      setResetError(error.message || 'Unable to reset password.');
    } finally {
      setIsResetLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem('smarthome-token');
    window.localStorage.removeItem('smarthome-user');
    window.localStorage.removeItem('smarthome-active-page');
    setAuthToken('');
    setUser(null);
    setAuthMode('login');
    setResetMode(false);
    setAuthForm({ name: '', email: '', password: '' });
    setAuthNotice('');
    setProfileOpen(false);
    setNotificationOpen(false);
    setProducts(startingProducts);
    setSalesHistory([]);
    setReceipt(null);
    setActivePage('dashboard');
    setMessage('Ready for the next customer.');
    showToast('Logged out successfully', 'success');
  }

  function goToPage(pageId) {
    setActivePage(pageId);
    setProfileOpen(false);
    setNotificationOpen(false);
    if (window.innerWidth <= 900) {
      setDrawerOpen(false);
    }
  }

  function generateReport(type) {
    const timestamp = new Date().toLocaleString();
    const reportData = {
      storeName,
      title: type === 'stock' ? 'Stock Report' : 'Sales Report',
      timestamp,
      type,
      data: type === 'stock' ? products : salesHistory
    };
    setGeneratedReport(reportData);
  }

  function downloadReport() {
    if (!generatedReport) return;
    const pdf = new jsPDF();
    const margin = 18;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 22;

    pdf.setFillColor(194, 65, 12);
    pdf.rect(0, 0, pageWidth, 12, 'F');
    pdf.setTextColor(43, 29, 19);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(generatedReport.storeName, margin, y);
    y += 9;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(generatedReport.title, margin, y);
    y += 7;
    pdf.setFontSize(9);
    pdf.setTextColor(124, 90, 67);
    pdf.text(`Generated ${generatedReport.timestamp}`, margin, y);
    y += 14;

    const rows = generatedReport.type === 'stock'
      ? generatedReport.data.map((product) => [
        product.name,
        product.sku,
        product.category,
        formatMoney(product.price),
        `${product.stock}/${product.capacity}`,
        getStockState(product).label,
      ])
      : generatedReport.data.map((sale) => [
        `Sale #${sale.id}`,
        sale.date || sale.dateLabel || 'Date unavailable',
        sale.server || 'Unknown server',
        `${sale.items.length} item${sale.items.length === 1 ? '' : 's'}`,
        formatMoney(sale.total),
      ]);

    pdf.setFillColor(255, 244, 235);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 18, 3, 3, 'F');
    pdf.setTextColor(154, 59, 10);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${rows.length} record${rows.length === 1 ? '' : 's'}`, margin + 6, y + 11);
    y += 28;

    if (rows.length === 0) {
      pdf.setTextColor(124, 90, 67);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('No data available yet', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Complete an inventory update or sale to populate this report.', margin, y + 8);
    } else {
      const headers = generatedReport.type === 'stock'
        ? ['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status']
        : ['Reference', 'Date', 'Server', 'Items', 'Total'];
      const columnWidth = (pageWidth - margin * 2) / headers.length;
      pdf.setFillColor(249, 115, 22);
      pdf.rect(margin, y - 6, pageWidth - margin * 2, 9, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      headers.forEach((header, index) => pdf.text(header, margin + index * columnWidth + 2, y));
      y += 9;
      rows.forEach((row, rowIndex) => {
        if (y > pageHeight - 18) {
          pdf.addPage();
          y = 22;
        }
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(255, 250, 245);
          pdf.rect(margin, y - 6, pageWidth - margin * 2, 10, 'F');
        }
        pdf.setTextColor(43, 29, 19);
        pdf.setFontSize(7.5);
        row.forEach((value, index) => {
          const text = String(value).slice(0, index === 0 ? 24 : 18);
          pdf.text(text, margin + index * columnWidth + 2, y);
        });
        y += 10;
      });
    }

    pdf.setFontSize(8);
    pdf.setTextColor(124, 90, 67);
    pdf.text('Smarthome Supermarket', margin, pageHeight - 10);
    pdf.save(`${generatedReport.storeName.replace(/\s+/g, '_')}_${generatedReport.type}_report.pdf`);
  }

  if (!user) {
    if (isLoading && authToken) {
      return (
        <div className="app-root">
          <main className="app auth-shell">
            <div className="auth-card">
              <div className="auth-brand">
                <span className="brand-icon"><Icon name="cart" /></span>
                <div>
                  <strong>{storeName}</strong>
                  <small>Smart retail dashboard</small>
                </div>
              </div>
              <div className="auth-form">
                <p>Loading your session...</p>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="app-root">
        {toast && (
          <div className={`toast toast-${toast.type}`} role="status">
            <Icon name={toast.type === 'error' ? 'bell' : 'check'} size={18} />
            <span>{toast.text}</span>
            <span className="toast-progress" />
          </div>
        )}
        <main className="app auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-icon"><Icon name="cart" /></span>
            <div>
              <strong>{storeName}</strong>
              <small>Smart retail dashboard</small>
            </div>
          </div>

          {!resetMode ? (
            <>
              <div className="auth-tabs">
                <button className={authMode === 'login' ? 'active' : ''} onClick={() => switchAuthMode('login')}>Login</button>
                <button className={authMode === 'signup' ? 'active' : ''} onClick={() => switchAuthMode('signup')}>Sign up</button>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <label>
                    <span>Full name</span>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                      placeholder="Store manager"
                    />
                  </label>
                )}

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                    placeholder="your.email@example.com"
                  />
                </label>

                <label className="password-field">
                  <span>Password</span>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                      placeholder="Enter password"
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((show) => !show)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                    </button>
                  </div>
                </label>

                <button type="submit" className={`auth-submit ${isAuthLoading ? 'loading' : ''}`} disabled={isAuthLoading}>
                  {isAuthLoading ? (authMode === 'login' ? 'Signing in...' : 'Creating account...') : (authMode === 'login' ? 'Login to dashboard' : 'Create account')}
                </button>
              </form>

              {authNotice && <p className="auth-notice" role="status">{authNotice}</p>}
              {authError && <p className="auth-error" role="alert">{authError}</p>}

              {authMode === 'login' && (
                <p className="auth-footer-link">
                  <button type="button" onClick={enterResetMode} className="link-button">
                    Forgot your password?
                  </button>
                </p>
              )}
            </>
          ) : resetToken ? (
            <form className="auth-form" onSubmit={handleResetSubmit}>
              <p className="auth-notice">Enter a new password for your account.</p>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  value={resetForm.password}
                  onChange={(event) => setResetForm({ ...resetForm, password: event.target.value })}
                  placeholder="At least 6 characters"
                  autoFocus
                />
              </label>
              <label>
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={resetForm.confirm}
                  onChange={(event) => setResetForm({ ...resetForm, confirm: event.target.value })}
                  placeholder="Repeat new password"
                />
              </label>
              <button type="submit" className={`auth-submit ${isResetLoading ? 'loading' : ''}`} disabled={isResetLoading}>
                {isResetLoading ? 'Resetting password...' : 'Reset password'}
              </button>
              {resetError && <p className="auth-error" role="alert">{resetError}</p>}
              {resetNotice && <p className="auth-notice" role="status">{resetNotice}</p>}
              <p className="auth-footer-link">
                <button type="button" onClick={exitResetMode} className="link-button">
                  Back to login
                </button>
              </p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRequestReset}>
              <p className="auth-notice">Enter your email to receive a password reset link.</p>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder="your.email@example.com"
                  autoFocus
                />
              </label>
              <button type="submit" className={`auth-submit ${isResetLoading ? 'loading' : ''}`} disabled={isResetLoading}>
                {isResetLoading ? 'Sending link...' : 'Send reset link'}
              </button>
              {resetError && <p className="auth-error" role="alert">{resetError}</p>}
              {resetNotice && <p className="auth-notice" role="status">{resetNotice}</p>}
              <p className="auth-footer-link">
                <button type="button" onClick={exitResetMode} className="link-button">
                  Back to login
                </button>
              </p>
            </form>
          )}

        </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          <Icon name={toast.type === 'error' ? 'bell' : 'check'} size={18} />
          <span>{toast.text}</span>
          <span className="toast-progress" />
        </div>
      )}

      {!user ? (
        <main className="app auth-shell">
          <div className="auth-card">
            {!resetMode ? (
              <>
                <div className="auth-brand">
                  <span className="brand-icon"><Icon name="cart" /></span>
                  <div>
                    <strong>{storeName}</strong>
                    <small>Smart retail dashboard</small>
                  </div>
                </div>

                <div className="auth-tabs">
                  <button className={authMode === 'login' ? 'active' : ''} onClick={() => switchAuthMode('login')}>Login</button>
                  <button className={authMode === 'signup' ? 'active' : ''} onClick={() => switchAuthMode('signup')}>Sign up</button>
                </div>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === 'signup' && (
                    <label>
                      <span>Full name</span>
                      <input
                        type="text"
                        value={authForm.name}
                        onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                        placeholder="Store manager"
                      />
                    </label>
                  )}

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </label>

                  <label className="password-field">
                    <span>Password</span>
                    <div className="password-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authForm.password}
                        onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                        placeholder="Enter password"
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((show) => !show)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                      </button>
                    </div>
                  </label>

                  <button type="submit" className={`auth-submit ${isAuthLoading ? 'loading' : ''}`} disabled={isAuthLoading}>
                    {isAuthLoading ? (authMode === 'login' ? 'Signing in...' : 'Creating account...') : (authMode === 'login' ? 'Login to dashboard' : 'Create account')}
                  </button>
                </form>

                {authNotice && <p className="auth-notice" role="status">{authNotice}</p>}
                {authError && <p className="auth-error" role="alert">{authError}</p>}

                {authMode === 'login' && (
                  <p className="auth-footer-link">
                    <button type="button" onClick={enterResetMode} className="link-button">
                      Forgot your password?
                    </button>
                  </p>
                )}
              </>
            ) : resetToken ? (
              <form className="auth-form" onSubmit={handleResetSubmit}>
                <p className="auth-notice">Enter a new password for your account.</p>
                <label>
                  <span>New password</span>
                  <input
                    type="password"
                    value={resetForm.password}
                    onChange={(event) => setResetForm({ ...resetForm, password: event.target.value })}
                    placeholder="At least 6 characters"
                    autoFocus
                  />
                </label>
                <label>
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={resetForm.confirm}
                    onChange={(event) => setResetForm({ ...resetForm, confirm: event.target.value })}
                    placeholder="Repeat new password"
                  />
                </label>
                <button type="submit" className={`auth-submit ${isResetLoading ? 'loading' : ''}`} disabled={isResetLoading}>
                  {isResetLoading ? 'Resetting password...' : 'Reset password'}
                </button>
                {resetError && <p className="auth-error" role="alert">{resetError}</p>}
                {resetNotice && <p className="auth-notice" role="status">{resetNotice}</p>}
                <p className="auth-footer-link">
                  <button type="button" onClick={exitResetMode} className="link-button">
                    Back to login
                  </button>
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRequestReset}>
                <p className="auth-notice">Enter your email to receive a password reset link.</p>
                <label>
                  <span>Email address</span>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    placeholder="your.email@example.com"
                    autoFocus
                  />
                </label>
                <button type="submit" className={`auth-submit ${isResetLoading ? 'loading' : ''}`} disabled={isResetLoading}>
                  {isResetLoading ? 'Sending link...' : 'Send reset link'}
                </button>
                {resetError && <p className="auth-error" role="alert">{resetError}</p>}
                {resetNotice && <p className="auth-notice" role="status">{resetNotice}</p>}
                <p className="auth-footer-link">
                  <button type="button" onClick={exitResetMode} className="link-button">
                    Back to login
                  </button>
                </p>
              </form>
            )}

          </div>
        </main>
      ) : (
        <main className={`app ${theme} ${drawerOpen ? 'drawer-open' : 'drawer-closed'} ${isMobileLayout ? 'is-mobile' : 'is-desktop'} font-${font.toLowerCase()}`}>
          {isLoading && (
            <div className="loading-overlay" aria-live="polite" aria-label="Loading supermarket app">
              <div className="loading-glass">
                <div className="loading-spinner" />
                <span>Loading</span>
              </div>
            </div>
          )}

      <header className="topbar">
        <div className="top-left">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setDrawerOpen((open) => !open)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            title={drawerOpen ? 'Close menu' : 'Open menu'}
          >
            <Icon name={drawerOpen ? 'close' : 'menu'} />
          </button>
          <div>
            <h1>{storeName}</h1>
          </div>
        </div>
        <div className="header-actions">
          <div className="notification-wrap">
            <button
              className="notify-button"
              onClick={() => setNotificationOpen((open) => !open)}
              title={notificationCount > 0 ? `${notificationCount} stock alerts` : 'No stock alerts'}
              aria-label="Notifications"
            >
              <Icon name="bell" size={18} />
              {notificationCount > 0 && <span className="notify-badge">{notificationCount}</span>}
            </button>
            {notificationOpen && (
              <div className="notification-panel" role="dialog" aria-label="System notifications">
                <div className="notification-head">
                  <strong>System notifications</strong>
                  <button type="button" className="notification-close" onClick={() => setNotificationOpen(false)}>Close</button>
                </div>
                {alertItems.length > 0 ? (
                  alertItems.map((item) => {
                    const notificationText = item.stock <= 0
                      ? `${item.name} is out of stock.`
                      : item.stock === 1
                        ? `${item.name} has only 1 unit left.`
                        : `${item.name} is running low. ${item.stock} units remaining.`;

                    return (
                      <div key={item.id} className="notification-item">
                        <span className="notification-dot" />
                        <div>
                          <strong>Stock alert</strong>
                          <small>{notificationText}</small>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="notification-empty">No stock alerts right now.</div>
                )}
              </div>
            )}
          </div>
          <div className="profile-area">
            <button className="profile-button" onClick={() => setProfileOpen((open) => !open)} title="Profile menu">
              <span><Icon name="user" /></span>
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <button onClick={() => goToPage('profile')}><Icon name="user" /> Profile</button>
                <button onClick={() => goToPage('settings')}><Icon name="settings" /> Settings</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="content-shell">
        {drawerOpen && isMobileLayout && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <aside className={`sidebar ${drawerOpen ? 'is-open' : 'is-collapsed'}`}>
          <button
            className="drawer-toggle"
            onClick={() => setDrawerOpen((open) => !open)}
            title="Toggle menu"
          >
            <Icon name={drawerOpen ? 'close' : 'menu'} />
          </button>
          <div className="brand" onClick={() => goToPage('dashboard')} title="Go to dashboard" style={{ cursor: 'pointer' }}>
            <span className="brand-icon"><Icon name="cart" /></span>
            <div>
              <strong>{storeName}</strong>
              <small>Supermarket System</small>
            </div>
          </div>
          <nav>
            {pages.filter((page) => page.id === 'dashboard').map((page) => (
              <button
                className={activePage === page.id ? 'active' : ''}
                key={page.id}
                onClick={() => goToPage(page.id)}
                title={page.label}
              >
                <span><Icon name={page.icon} /></span>
                <b>{page.label}</b>
              </button>
            ))}

            <div className={`drawer-section ${stockMenuOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="drawer-section-title"
                onMouseEnter={() => setStockMenuOpen(true)}
                onClick={() => setStockMenuOpen((open) => !open)}
                aria-expanded={stockMenuOpen}
              >
                <span className="drawer-title-content"><Icon name="boxes" /><b>Stock</b></span>
                <span className={`drawer-chevron ${stockMenuOpen ? 'open' : ''}`}><Icon name={stockMenuOpen ? 'chevron-up' : 'chevron-down'} size={14} /></span>
              </button>
              <div className="drawer-subnav">
                {stockLinks.map((page) => (
                  <button
                    className={activePage === page.id ? 'active' : ''}
                    key={page.id}
                    onClick={() => {
                      goToPage(page.id);
                      setStockMenuOpen(true);
                    }}
                    title={page.label}
                  >
                    <span><Icon name={page.icon} /></span>
                    <b>{page.label}</b>
                  </button>
                ))}
              </div>
            </div>

            {pages.filter((page) => page.id !== 'dashboard' && page.id !== 'sell' && page.id !== 'stock' && page.id !== 'add-stock' && page.id !== 'stock-alerts').map((page) => (
              <button
                className={activePage === page.id ? 'active' : ''}
                key={page.id}
                onClick={() => goToPage(page.id)}
                title={page.label}
              >
                <span><Icon name={page.icon} /></span>
                <b>{page.label}</b>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-button" onClick={handleLogout}>
              <Icon name="lock" /> Logout
            </button>
          </div>
        </aside>

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={20} />
        </button>

        <section className="workspace">
          <section className="status-strip">
            <div className="status-left">
              <div className="stock-key">
                <span><i className="low-dot"></i> Low</span>
                <span><i className="average-dot"></i> Average</span>
                <span><i className="high-dot"></i> High</span>
              </div>
              <span className="status-welcome">Welcome, {user?.name || 'User'}</span>
            </div>
            <strong>{message}</strong>
          </section>

          {activePage === 'dashboard' && (
          <>
            <section className="metrics">
              <article className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon high-dot"></span>
                  <span className="metric-trend"><Icon name="boxes" size={16} /></span>
                </div>
                <p>Total units</p>
                <strong>{totalStock}</strong>
              </article>
              <article className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon average-dot"></span>
                  <span className="metric-trend"><Icon name="chart" size={16} /></span>
                </div>
                <p>Capacity used</p>
                <strong>{Math.round((totalStock / totalCapacity) * 100)}%</strong>
              </article>
              <article onClick={() => goToPage('stock')} className="metric-card clickable-metric">
                <div className="metric-header">
                  <span className="metric-icon low-dot"></span>
                  <span className="metric-trend"><Icon name="lock" size={16} /></span>
                </div>
                <p>Low stock goods</p>
                <strong>{stockCounts.low}</strong>
              </article>
              <article className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon high-dot"></span>
                  <span className="metric-trend"><Icon name="receipt" size={16} /></span>
                </div>
                <p>Last receipt</p>
                <strong>{receipt ? formatMoney(receipt.total) : formatMoney(0)}</strong>
              </article>
            </section>

            <section className="dashboard-grid">
              <div className="panel inventory-overview-panel">
                <div className="panel-heading">
                  <div>
                    <p>Inventory overview</p>
                    <h2>Stock at a glance</h2>
                  </div>
                </div>
                <div className="overview-grid">
                  <article>
                    <span className="overview-icon"><Icon name="boxes" size={18} /></span>
                    <div><strong>{products.length}</strong><small>Products</small></div>
                  </article>
                  <article>
                    <span className="overview-icon"><Icon name="cart" size={18} /></span>
                    <div><strong>{products.filter((product) => product.stock > 0).length}</strong><small>In stock</small></div>
                  </article>
                  <article>
                    <span className="overview-icon"><Icon name="bell" size={18} /></span>
                    <div><strong>{stockAlertItems.length}</strong><small>Need attention</small></div>
                  </article>
                  <article>
                    <span className="overview-icon"><Icon name="chart" size={18} /></span>
                    <div><strong>{formatMoney(products.reduce((sum, product) => sum + product.price * product.stock, 0))}</strong><small>Stock value</small></div>
                  </article>
                </div>
                <button className="panel-action" onClick={() => goToPage('stock-alerts')}>
                  <Icon name="bell" size={17} /> View stock alerts
                  {stockAlertItems.length > 0 && <span className="panel-action-count">{stockAlertItems.length}</span>}
                </button>
              </div>
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p>Other dashboard tools</p>
                    <h2>Store operations</h2>
                  </div>
                </div>
                <div className="tool-grid">
                  <button onClick={() => goToPage('sell')}><span className="tool-icon"><Icon name="cart" /></span> Start selling</button>
                  <button onClick={() => goToPage('add-stock')}><span className="tool-icon"><Icon name="plus" /></span> Add new goods</button>
                  <button onClick={() => goToPage('receipt')}><span className="tool-icon"><Icon name="receipt" /></span> View receipt</button>
                  <button onClick={() => goToPage('reports')}><span className="tool-icon"><Icon name="chart" /></span> View reports</button>
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === 'sell' && (
          <section className="panel selling-panel">
            <div className="panel-heading">
              <div>
                <p>Point of sale</p>
                <h2>Scan QR/barcode and sell goods</h2>
              </div>
              <button onClick={cameraOpen ? stopScanner : startScanner}>
                <Icon name="camera" />
                {cameraOpen ? 'Stop camera' : 'Open scanner'}
              </button>
            </div>

            {cameraOpen && (
              <div className="scanner-wrap">
                <div className="scanner-box">
                  <div id="qr-reader"></div>
                  <span>QR only</span>
                </div>
                <p className="scanner-note">Scan window only. No photos or videos are saved.</p>
              </div>
            )}

            <form className="scan-form" onSubmit={handleScan}>
              <input
                value={scanCode}
                onChange={(event) => setScanCode(event.target.value)}
                placeholder="Example: GV-MILK-001"
              />
              <button type="submit"><Icon name="cart" /> Scan item</button>
            </form>

            <div className="sale-details">
              <input
                value={saleDetails.buyer}
                onChange={(event) => setSaleDetails({ ...saleDetails, buyer: event.target.value })}
                placeholder="Buyer name"
              />
              <input
                value={user?.name || saleDetails.server}
                readOnly
                aria-label="Server name"
                placeholder="Signed-in user"
              />
            </div>

            <div className="quick-products">
              {products.map((product) => (
                <button key={product.id} onClick={() => addToCart(product)}>
                  <span>{product.name}</span>
                  <small>{product.sku} | {formatMoney(product.price)}</small>
                </button>
              ))}
            </div>

            <Cart cart={cart} cartTotal={cartTotal} onQuantity={updateCartQuantity} onCheckout={checkout} />
          </section>
        )}

        {activePage === 'stock' && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p>Available goods</p>
                <h2>Stock indicators per item capacity</h2>
              </div>
              <div className="heading-actions">
                <label>
                  Category
                  <select value={stockCategory} onChange={(event) => setStockCategory(event.target.value)}>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <button onClick={() => goToPage('add-stock')}><Icon name="plus" /> Add stock</button>
                <button onClick={() => goToPage('stock-alerts')}><Icon name="bell" /> View alerts</button>
              </div>
            </div>
            <ProductList products={visibleStockProducts} onSell={addToCart} onRestock={restockProduct} onUpdateStock={updateProductStock} detailed />
          </section>
        )}

        {activePage === 'stock-alerts' && (
          <section className="panel stock-alerts-panel">
            <div className="panel-heading">
              <div>
                <p>Inventory control</p>
                <h2>Stock alerts</h2>
              </div>
              <button onClick={() => goToPage('stock')}><Icon name="boxes" /> View all stock</button>
            </div>

            {products.length === 0 ? (
              <div className="all-clear stock-empty-state">
                <span className="all-clear-icon"><Icon name="boxes" size={24} /></span>
                <strong>No goods have been stocked yet.</strong>
                <small>Add your first product to start tracking inventory and stock alerts.</small>
                <button onClick={() => goToPage('add-stock')}><Icon name="plus" /> Add first product</button>
              </div>
            ) : stockAlertItems.length > 0 ? (
              <div className="alert-grid">
                {stockAlertItems.map((product) => {
                  const state = getStockState(product);
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <article className={`alert-card ${isOutOfStock ? 'out-of-stock' : ''}`} key={product.id}>
                      <span className="alert-icon"><Icon name="bell" size={20} /></span>
                      <div className="alert-content">
                        <div className="alert-title">
                          <strong>{product.name}</strong>
                          <span className={`badge ${state.className}`}>{isOutOfStock ? 'Out of stock' : 'Low stock'}</span>
                        </div>
                        <small>{product.sku} · {product.category}</small>
                        <div className="alert-meter" aria-label={`${state.percentage}% stocked`}>
                          <span style={{ width: `${Math.min(Math.max(state.percentage, 0), 100)}%` }} />
                        </div>
                        <p>
                          {isOutOfStock
                            ? 'This item has no units available.'
                            : `${product.stock} units remaining. Restock before sales are affected.`}
                        </p>
                      </div>
                      <button
                        className="alert-action"
                        onClick={() => {
                          setStockCategory(product.category);
                          goToPage('stock');
                        }}
                      >
                        Review stock
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="all-clear">
                <span className="all-clear-icon"><Icon name="boxes" size={24} /></span>
                <strong>All products are sufficiently stocked.</strong>
                <small>There are no low-stock or out-of-stock items right now.</small>
              </div>
            )}
          </section>
        )}

        {activePage === 'add-stock' && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p>Inventory entry</p>
                <h2>Add goods to supermarket stock</h2>
              </div>
            </div>
            <form className="stock-form" onSubmit={addProduct}>
              <input placeholder="Item name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
              <input placeholder="QR/SKU code (optional)" value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
              <select
                value={productForm.category}
                onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
              >
                <option value="">Select category</option>
                {categories.filter((category) => category !== 'All').map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input type="number" placeholder="Price in KSh" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
              <input type="number" placeholder="Stock quantity" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
              <input type="number" placeholder="Item capacity" value={productForm.capacity} onChange={(event) => setProductForm({ ...productForm, capacity: event.target.value })} />
              <button type="submit" disabled={!canSubmitProduct}><Icon name="plus" /> Add item to stock</button>
            </form>
          </section>
        )}

        {activePage === 'receipt' && (
          <section className="panel receipt-panel">
            <div className="panel-heading">
              <div>
                <p>Customer receipt</p>
                <h2>{storeName} receipt</h2>
              </div>
              <button onClick={() => window.print()}><Icon name="print" /> Print receipt</button>
            </div>
            {receipt ? (
              <div className="receipt">
                <div className="receipt-head">
                  <strong>{storeName}</strong>
                  <small>Welcome, thank you for shopping with us.</small>
                  <small>Location: {receipt.location}</small>
                  <small>Ticket: {receipt.ticket}</small>
                  <small>Date: {receipt.date} | Served at: {receipt.servedAt}</small>
                  <small>Server: {receipt.server}</small>
                  <small>Buyer: {receipt.buyer}</small>
                </div>
                {receipt.items.map((item) => (
                  <p key={item.id}>
                    <span>{item.quantity} x {item.name}</span>
                    <b>{formatMoney(item.quantity * item.price)}</b>
                  </p>
                ))}
                <h3>
                  <span>Total paid</span>
                  <strong>{formatMoney(receipt.total)}</strong>
                </h3>
              </div>
            ) : (
              <EmptyState
                icon="receipt"
                title="No receipt yet"
                message="Complete a sale and your customer receipt will appear here, ready to print."
                action="Start selling"
                onAction={() => goToPage('sell')}
              />
            )}
          </section>
        )}

        {activePage === 'reports' && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p>Reports</p>
                <h2>Generate and download reports</h2>
              </div>
            </div>
            
            {!generatedReport ? (
              <div className="report-generator">
                <div className="report-options">
                  <label>
                    <span className="label-icon"><Icon name="chart" /> Report Type</span>
                    <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                      <option value="">Select report type...</option>
                      <option value="stock">Stocked Goods Report</option>
                      <option value="sold">Sold Goods Report</option>
                    </select>
                  </label>
                </div>
                <button 
                  className="generate-report-btn"
                  onClick={() => reportType && generateReport(reportType)}
                  disabled={!reportType}
                >
                  <Icon name="receipt" /> Generate Report
                </button>
              </div>
            ) : (
              <div className="report-viewer">
                <div className="report-header">
                  <div>
                    <strong>{generatedReport.storeName}</strong>
                    <p>{generatedReport.title}</p>
                    <small>Generated: {generatedReport.timestamp}</small>
                  </div>
                  <div className="report-actions">
                    <button onClick={() => setGeneratedReport(null)} className="cancel-edit">
                      <Icon name="close" /> Close
                    </button>
                    <button onClick={downloadReport}>
                      <Icon name="print" /> Save as PDF
                    </button>
                  </div>
                </div>
                <div className="report-content">
                  <h3>{generatedReport.type === 'stock' ? 'Stocked Goods' : 'Sold Goods'}</h3>
                  {generatedReport.type === 'stock' ? (
                    <div className="report-table">
                      {generatedReport.data.length === 0 ? (
                        <EmptyState
                          icon="boxes"
                          title="No stock data yet"
                          message="Add goods to inventory before generating a stocked-goods report."
                          action="Add stock"
                          onAction={() => goToPage('add-stock')}
                        />
                      ) : generatedReport.data.map((product) => {
                        const state = getStockState(product);
                        return (
                          <div key={product.id} className="report-row">
                            <div>
                              <strong>{product.name}</strong>
                              <small>{product.sku}</small>
                            </div>
                            <div>
                              <small>{product.category}</small>
                              <strong>{formatMoney(product.price)}</strong>
                            </div>
                            <div>
                              <small>Stock</small>
                              <strong>{product.stock}/{product.capacity}</strong>
                            </div>
                            <div>
                              <small>Status</small>
                              <strong className={`stock-status-${state.level}`}>{state.label}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="report-table">
                      {generatedReport.data.length === 0 ? (
                        <EmptyState
                          icon="chart"
                          title="No sales to report"
                          message="Complete your first sale to see totals, servers, and order details in this report."
                          action="Start selling"
                          onAction={() => goToPage('sell')}
                        />
                      ) : (
                        generatedReport.data.map((sale) => (
                          <div key={sale.id} className="report-row">
                            <div>
                              <strong>Sale #{sale.id}</strong>
                              <small>{sale.date}</small>
                            </div>
                            <div>
                              <small>Server</small>
                              <strong>{sale.server}</strong>
                            </div>
                            <div>
                              <small>Items</small>
                              <strong>{sale.items.length}</strong>
                            </div>
                            <div>
                              <small>Total</small>
                              <strong>{formatMoney(sale.total)}</strong>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activePage === 'sales-history' && (
          <section className="panel sales-panel">
            <div className="panel-heading">
              <div>
                <p>Sales overview</p>
                <h2>Sales history</h2>
              </div>
              <div className="history-range">
                {['day', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    className={historyRange === range ? 'active' : ''}
                    onClick={() => setHistoryRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="summary-grid">
              <article>
                <p>Total sales</p>
                <strong>{formatMoney(salesSummary.totalSales)}</strong>
              </article>
              <article>
                <p>Orders</p>
                <strong>{salesSummary.orders}</strong>
              </article>
              <article>
                <p>Customers served</p>
                <strong>{salesSummary.customersServed}</strong>
              </article>
            </div>
            <div className="history-list">
              {salesHistory.filter((sale) => {
                const now = Date.now();
                const rangeMs = historyRange === 'day' ? 24 * 60 * 60 * 1000 : historyRange === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
                return now - sale.timestamp <= rangeMs;
              }).slice(0, 8).map((sale) => (
                <div className="history-row" key={sale.ticket}>
                  <div>
                    <strong>{sale.ticket}</strong>
                    <small>{sale.dateLabel}</small>
                  </div>
                  <div>
                    <strong>{sale.buyer}</strong>
                    <small>{sale.server}</small>
                  </div>
                  <span>{formatMoney(sale.total)}</span>
                </div>
              ))}
              {salesHistory.filter((sale) => {
                const now = Date.now();
                const rangeMs = historyRange === 'day' ? 24 * 60 * 60 * 1000 : historyRange === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
                return now - sale.timestamp <= rangeMs;
              }).length === 0 && (
                <EmptyState
                  icon="chart"
                  title={`No sales this ${historyRange}`}
                  message="Sales will appear here after a completed checkout. Try another date range or start a new sale."
                  action="Start selling"
                  onAction={() => goToPage('sell')}
                />
              )}
            </div>
          </section>
        )}

        {activePage === 'profile' && (
          <section className="panel profile-page">
            <div className="panel-heading">
              <div>
                <p>User profile</p>
                <h2>Manager account</h2>
              </div>
            </div>
            <div className="profile-card">
              <span><Icon name="user" size={28} /></span>
              <div>
                <strong>{user?.name || 'Store Manager'}</strong>
                <small>{user?.email}</small>
                <small>{storeName}</small>
                <small>Role: {user?.role || 'staff'}</small>
              </div>
            </div>
          </section>
        )}

        {activePage === 'settings' && (
          <section className="panel settings-page">
            <div className="panel-heading">
              <div>
                <p>Account settings</p>
                <h2>Password, theme, and font type</h2>
              </div>
            </div>
            <form className="settings-form" onSubmit={changePassword}>
              <input type="password" placeholder="Current password" value={passwordForm.current} onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })} />
              <input type="password" placeholder="New password" value={passwordForm.next} onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })} />
              <button type="submit"><Icon name="lock" /> Change password</button>
            </form>
            <div className="settings-form">
              <label>
                <span className="label-icon"><Icon name="palette" /> Theme</span>
                <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                  <option value="light">Light green</option>
                  <option value="dark">Dark counter</option>
                </select>
              </label>
              <label>
                <span className="label-icon"><Icon name="type" /> Font type</span>
                <select value={font} onChange={(event) => setFont(event.target.value)}>
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Mono">Mono</option>
                </select>
              </label>
            </div>
          </section>
        )}
      </section>
    </div>
        </main>
      )}
    </div>
  );
}

function EmptyState({ icon, title, message, action, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon"><Icon name={icon} size={26} /></span>
      <strong>{title}</strong>
      <p>{message}</p>
      {action && onAction && (
        <button type="button" onClick={onAction}>
          <Icon name={icon === 'receipt' ? 'cart' : 'plus'} size={17} /> {action}
        </button>
      )}
    </div>
  );
}

function Cart({ cart, cartTotal, onQuantity, onCheckout }) {
  return (
    <>
      <div className="cart">
        <h3>Current cart</h3>
        {cart.length === 0 ? (
          <p className="empty">No items scanned yet.</p>
        ) : (
          cart.map((item) => (
            <div className="cart-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>{formatMoney(item.price)} each</small>
              </div>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.quantity}
                onChange={(event) => onQuantity(item.id, Number(event.target.value))}
              />
              <b>{formatMoney(item.price * item.quantity)}</b>
            </div>
          ))
        )}
      </div>
      <div className="checkout-row">
        <strong>Total {formatMoney(cartTotal)}</strong>
        <button onClick={onCheckout}><Icon name="receipt" /> Generate receipt</button>
      </div>
    </>
  );
}

function ProductList({ products, onSell, onRestock, onUpdateStock, detailed = false }) {
  if (!products.length) {
    return (
      <div className="all-clear stock-empty-state">
        <span className="all-clear-icon"><Icon name="boxes" size={32} /></span>
        <strong>No stock available</strong>
        <small>There are no products in this category yet.</small>
      </div>
    );
  }

  return (
    <div className="inventory-table">
      {products.map((product) => {
        const state = getStockState(product);

        return (
          <article key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <small>{product.category} | {product.sku}</small>
              {detailed && (
                <div className="capacity-bar">
                  <span style={{ width: `${Math.min(state.percentage, 100)}%` }}></span>
                </div>
              )}
            </div>
            <span className={`badge ${state.className}`}>{state.label}</span>
            <div className="stock-quantity">
              <strong>{product.stock}</strong>
              <small>Cap {product.capacity}</small>
            </div>
            <small>{formatMoney(product.price)}</small>
            <div className="row-actions">
              <button onClick={() => onSell(product)}><Icon name="cart" size={16} /> Sell</button>
              <button onClick={() => onRestock(product.id, 1)}><Icon name="plus" size={16} /> +1</button>
              {typeof onUpdateStock === 'function' && (
                <StockEditor product={product} onUpdateStock={onUpdateStock} />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StockEditor({ product, onUpdateStock }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(product.stock));

  if (!isEditing) {
    return (
      <button
        type="button"
        className="stock-edit-button"
        onClick={() => {
          setDraft(String(product.stock));
          setIsEditing(true);
        }}
      >
        <Icon name="settings" size={14} /> Edit
      </button>
    );
  }

  return (
    <div className="stock-editor">
      <input
        type="number"
        value={draft}
        min="0"
        max={product.capacity}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="stock-editor-actions">
        <button type="button" onClick={() => {
          onUpdateStock(product.id, draft);
          setIsEditing(false);
        }}>Save</button>
        <button type="button" className="cancel-edit" onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}

export default App;
