// ===========================
// GST CALCULATOR COMPONENT
// components/gst-calculator.js
// ===========================

const GSTCalculator = (() => {

  function buildGSTFields(container) {
    container.innerHTML = '';

    const gst = State.get().gst;

    // Type Toggle (Intra / Inter state)
    const toggle = document.createElement('div');
    toggle.className = 'gst-type-toggle';
    toggle.innerHTML = `
      <button class="gst-type-btn ${gst.type === 'intra' ? 'active' : ''}" data-type="intra">
        Intra-state<br><small>CGST + SGST</small>
      </button>
      <button class="gst-type-btn ${gst.type === 'inter' ? 'active' : ''}" data-type="inter">
        Inter-state<br><small>IGST</small>
      </button>
    `;
    toggle.querySelectorAll('.gst-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggle.querySelectorAll('.gst-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.set('gst.type', btn.dataset.type);
      });
    });
    container.appendChild(toggle);

    // Rate Selector
    const rateDiv = document.createElement('div');
    rateDiv.className = 'field-group';

    const rateField = document.createElement('div');
    rateField.className = 'field';
    rateField.innerHTML = `<label>GST Rate (%)</label>`;
    const rateSelect = document.createElement('select');
    Helpers.GST_RATES.forEach(r => {
      const o = document.createElement('option');
      o.value = r;
      o.textContent = r + '%';
      if (r === gst.rate) o.selected = true;
      rateSelect.appendChild(o);
    });
    rateSelect.addEventListener('change', () => State.set('gst.rate', parseFloat(rateSelect.value)));
    rateField.appendChild(rateSelect);

    // Reverse charge checkbox
    const rcField = document.createElement('div');
    rcField.className = 'field';
    rcField.innerHTML = `
      <label>Reverse Charge</label>
      <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem;">
        <input type="checkbox" id="reverseCharge" ${gst.reverseCharge ? 'checked' : ''} style="width:auto;margin:0;" />
        <label for="reverseCharge" style="font-family:var(--font-body);font-size:0.85rem;text-transform:none;letter-spacing:0;color:var(--ink);">
          Applicable
        </label>
      </div>
    `;
    rcField.querySelector('#reverseCharge').addEventListener('change', e => {
      State.set('gst.reverseCharge', e.target.checked);
    });

    rateDiv.appendChild(rateField);
    rateDiv.appendChild(rcField);
    container.appendChild(rateDiv);
  }

  function calculate() {
    const { gst } = State.get();
    const subtotal = LineItems.getSubtotal();
    const gstAmount = subtotal * (gst.rate / 100);

    let taxes = [];
    if (gst.type === 'intra') {
      taxes = [
        { name: 'CGST', rate: gst.rate / 2, amount: gstAmount / 2 },
        { name: 'SGST/UTGST', rate: gst.rate / 2, amount: gstAmount / 2 },
      ];
    } else {
      taxes = [
        { name: 'IGST', rate: gst.rate, amount: gstAmount },
      ];
    }

    return {
      subtotal,
      taxes,
      totalTax: gstAmount,
      grandTotal: subtotal + gstAmount,
    };
  }

  return { buildGSTFields, calculate };
})();
