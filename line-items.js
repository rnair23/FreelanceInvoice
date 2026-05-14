// ===========================
// LINE ITEMS COMPONENT
// components/line-items.js
// ===========================

const LineItems = (() => {

  function render(container) {
    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'line-items-table';

    // Header
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:30%">Item / Service</th>
          <th style="width:22%">Description</th>
          <th style="width:10%">Qty</th>
          <th style="width:18%">Rate (₹)</th>
          <th style="width:15%">Amount</th>
          <th style="width:5%"></th>
        </tr>
      </thead>
      <tbody id="lineItemsBody"></tbody>
    `;

    container.appendChild(table);

    const tbody = table.querySelector('#lineItemsBody');
    const items = State.get().items;
    items.forEach(item => tbody.appendChild(_createRow(item)));
  }

  function _createRow(item) {
    const tr = document.createElement('tr');
    tr.className = 'line-item-row';
    tr.dataset.id = item.id;

    tr.innerHTML = `
      <td><input type="text" placeholder="e.g. Web Design" value="${Helpers.escHtml(item.name)}" data-field="name" /></td>
      <td><input type="text" placeholder="Optional" value="${Helpers.escHtml(item.description)}" data-field="description" /></td>
      <td><input type="number" min="0" step="0.01" value="${item.qty}" data-field="qty" /></td>
      <td><input type="number" min="0" step="0.01" value="${item.rate}" data-field="rate" /></td>
      <td><div class="line-item-total">${Helpers.formatCurrency(item.qty * item.rate)}</div></td>
      <td><button class="btn-remove-row" title="Remove">×</button></td>
    `;

    // Bind events
    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => _updateItem(item.id, input.dataset.field, input.value, tr));
    });

    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      _removeItem(item.id);
    });

    return tr;
  }

  function _updateItem(id, field, value, tr) {
    const items = State.get().items;
    const item = items.find(i => i.id === id);
    if (!item) return;

    item[field] = (field === 'qty' || field === 'rate') ? parseFloat(value) || 0 : value;
    item.amount = item.qty * item.rate;

    // Update total cell
    const totalCell = tr.querySelector('.line-item-total');
    if (totalCell) totalCell.textContent = Helpers.formatCurrency(item.amount);

    State.setSection('items', items); // trigger update
  }

  function _removeItem(id) {
    const items = State.get().items.filter(i => i.id !== id);
    if (items.length === 0) {
      Helpers.showToast('At least one item is required.');
      return;
    }
    State.get().items = items;
    State._notify && State._notify(); // fallback
    // Force re-render via state
    State.set('gst.rate', State.get().gst.rate); // dirty trigger
  }

  function addItem() {
    const newItem = { id: Helpers.uid(), name: '', description: '', qty: 1, rate: 0, amount: 0 };
    State.get().items.push(newItem);
    const tbody = document.getElementById('lineItemsBody');
    if (tbody) tbody.appendChild(_createRow(newItem));
    // Trigger re-render of preview
    State.set('gst.rate', State.get().gst.rate);
  }

  function getSubtotal() {
    return State.get().items.reduce((sum, i) => sum + (i.qty * i.rate), 0);
  }

  return { render, addItem, getSubtotal };
})();
