// ===========================
// STATE MANAGEMENT MODULE
// utils/state.js
// ===========================

const State = (() => {
  let _state = {
    from: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstin: '',
      pan: '',
    },
    to: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstin: '',
    },
    invoice: {
      number: '',
      date: '',
      dueDate: '',
      currency: 'INR',
      placeOfSupply: '',
    },
    items: [],
    gst: {
      type: 'intra',      // 'intra' (CGST+SGST) or 'inter' (IGST)
      rate: 18,           // percentage
      reverseCharge: false,
    },
    payment: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      ifsc: '',
      upi: '',
      notes: '',
      terms: 'Payment due within 30 days of invoice date.',
    },
  };

  const _listeners = [];

  function get() {
    return _state;
  }

  function set(path, value) {
    const keys = path.split('.');
    let obj = _state;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    _notify();
  }

  function setSection(section, data) {
    _state[section] = { ..._state[section], ...data };
    _notify();
  }

  function subscribe(fn) {
    _listeners.push(fn);
  }

  function _notify() {
    _listeners.forEach(fn => fn(_state));
  }

  function init() {
    // Defaults
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 30);

    _state.invoice.date = today.toISOString().split('T')[0];
    _state.invoice.dueDate = due.toISOString().split('T')[0];
    _state.invoice.number = 'INV-' + String(Date.now()).slice(-6);

    // Default one item
    _state.items = [
      { id: Date.now(), name: '', description: '', qty: 1, rate: 0, amount: 0 }
    ];
  }

  return { get, set, setSection, subscribe, init };
})();
