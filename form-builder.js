// ===========================
// FORM BUILDER COMPONENT
// components/form-builder.js
// ===========================

const FormBuilder = (() => {

  function field({ label, id, type = 'text', placeholder = '', stateKey, required = false, options = null }) {
    const el = document.createElement('div');
    el.className = 'field';

    let input;
    if (options) {
      input = document.createElement('select');
      input.id = id;
      const def = document.createElement('option');
      def.value = ''; def.textContent = 'Select...';
      input.appendChild(def);
      options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = type;
      input.id = id;
      input.placeholder = placeholder;
    }

    if (required) input.required = true;

    // Bind to state
    if (stateKey) {
      const keys = stateKey.split('.');
      const section = State.get()[keys[0]];
      if (section && keys[1] in section) {
        input.value = section[keys[1]] || '';
      }
      input.addEventListener('input', () => State.set(stateKey, input.value));
      input.addEventListener('change', () => State.set(stateKey, input.value));
    }

    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = label;

    el.appendChild(lbl);
    el.appendChild(input);
    return el;
  }

  function group(fields, full = false) {
    const div = document.createElement('div');
    div.className = 'field-group' + (full || fields.length === 1 ? ' full' : '');
    fields.forEach(f => div.appendChild(field(f)));
    return div;
  }

  function textareaField({ label, id, placeholder = '', stateKey, rows = 3 }) {
    const el = document.createElement('div');
    el.className = 'field full';
    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = label;
    const ta = document.createElement('textarea');
    ta.id = id;
    ta.placeholder = placeholder;
    ta.rows = rows;
    if (stateKey) {
      const keys = stateKey.split('.');
      const section = State.get()[keys[0]];
      if (section && keys[1] in section) ta.value = section[keys[1]] || '';
      ta.addEventListener('input', () => State.set(stateKey, ta.value));
    }
    el.appendChild(lbl);
    el.appendChild(ta);
    return el;
  }

  function buildFromSection(container) {
    container.innerHTML = '';
    const s = State.get();

    container.appendChild(group([
      { label: 'Full Name / Business Name *', id: 'from-name', stateKey: 'from.name', placeholder: 'Your Name or Company' },
      { label: 'Email', id: 'from-email', type: 'email', stateKey: 'from.email', placeholder: 'you@example.com' }
    ]));
    container.appendChild(group([
      { label: 'Phone', id: 'from-phone', stateKey: 'from.phone', placeholder: '+91 98765 43210' },
      { label: 'PAN Number', id: 'from-pan', stateKey: 'from.pan', placeholder: 'ABCDE1234F' }
    ]));
    container.appendChild(group([
      { label: 'GSTIN (optional)', id: 'from-gstin', stateKey: 'from.gstin', placeholder: '22ABCDE1234F1Z5' }
    ], true));
    container.appendChild(group([
      { label: 'Address', id: 'from-address', stateKey: 'from.address', placeholder: 'Street Address' }
    ], true));
    container.appendChild(group([
      { label: 'City', id: 'from-city', stateKey: 'from.city', placeholder: 'Bengaluru' },
      { label: 'State', id: 'from-state', stateKey: 'from.state', options: Helpers.GST_STATES }
    ]));
    container.appendChild(group([
      { label: 'Pincode', id: 'from-pin', stateKey: 'from.pincode', placeholder: '560001' }
    ], true));
  }

  function buildToSection(container) {
    container.innerHTML = '';

    container.appendChild(group([
      { label: 'Client Name / Company *', id: 'to-name', stateKey: 'to.name', placeholder: 'Client Business' },
      { label: 'Client Email', id: 'to-email', type: 'email', stateKey: 'to.email', placeholder: 'client@company.com' }
    ]));
    container.appendChild(group([
      { label: 'Client Phone', id: 'to-phone', stateKey: 'to.phone', placeholder: '+91 99999 99999' },
      { label: 'Client GSTIN', id: 'to-gstin', stateKey: 'to.gstin', placeholder: '22ABCDE5678G1Z9' }
    ]));
    container.appendChild(group([
      { label: 'Address', id: 'to-address', stateKey: 'to.address', placeholder: 'Street Address' }
    ], true));
    container.appendChild(group([
      { label: 'City', id: 'to-city', stateKey: 'to.city', placeholder: 'Mumbai' },
      { label: 'State', id: 'to-state', stateKey: 'to.state', options: Helpers.GST_STATES }
    ]));
    container.appendChild(group([
      { label: 'Pincode', id: 'to-pin', stateKey: 'to.pincode', placeholder: '400001' }
    ], true));
  }

  function buildInvoiceMeta(container) {
    container.innerHTML = '';

    container.appendChild(group([
      { label: 'Invoice Number *', id: 'inv-number', stateKey: 'invoice.number', placeholder: 'INV-001' },
      { label: 'Currency', id: 'inv-currency', stateKey: 'invoice.currency', options: ['INR', 'USD', 'EUR', 'GBP'] }
    ]));
    container.appendChild(group([
      { label: 'Invoice Date *', id: 'inv-date', type: 'date', stateKey: 'invoice.date' },
      { label: 'Due Date', id: 'inv-due', type: 'date', stateKey: 'invoice.dueDate' }
    ]));
    container.appendChild(group([
      { label: 'Place of Supply', id: 'inv-pos', stateKey: 'invoice.placeOfSupply', options: Helpers.GST_STATES }
    ], true));
  }

  function buildPaymentSection(container) {
    container.innerHTML = '';

    container.appendChild(group([
      { label: 'Bank Name', id: 'bank-name', stateKey: 'payment.bankName', placeholder: 'HDFC Bank' },
      { label: 'Account Name', id: 'bank-accname', stateKey: 'payment.accountName', placeholder: 'Your Name' }
    ]));
    container.appendChild(group([
      { label: 'Account Number', id: 'bank-accnum', stateKey: 'payment.accountNumber', placeholder: '00001234567890' },
      { label: 'IFSC Code', id: 'bank-ifsc', stateKey: 'payment.ifsc', placeholder: 'HDFC0001234' }
    ]));
    container.appendChild(group([
      { label: 'UPI ID (optional)', id: 'bank-upi', stateKey: 'payment.upi', placeholder: 'yourname@upi' }
    ], true));
    container.appendChild(textareaField({
      label: 'Terms & Conditions', id: 'pay-terms', stateKey: 'payment.terms',
      placeholder: 'Payment due within 30 days...', rows: 2
    }));
    container.appendChild(textareaField({
      label: 'Notes', id: 'pay-notes', stateKey: 'payment.notes',
      placeholder: 'Thank you for your business!', rows: 2
    }));
  }

  return { buildFromSection, buildToSection, buildInvoiceMeta, buildPaymentSection };
})();
