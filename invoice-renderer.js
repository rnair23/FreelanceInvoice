// ===========================
// INVOICE RENDERER COMPONENT
// components/invoice-renderer.js
// ===========================

const InvoiceRenderer = (() => {

  function render() {
    const s = State.get();
    const calc = GSTCalculator.calculate();
    const currency = s.invoice.currency || 'INR';
    const fmt = (n) => Helpers.formatCurrency(n, currency);

    const sheet = document.getElementById('invoiceSheet');
    if (!sheet) return;

    // Tax breakdown rows
    const taxRows = calc.taxes.map(t => `
      <tr>
        <td>${Helpers.escHtml(t.name)} @ ${t.rate}%</td>
        <td class="num">${fmt(calc.subtotal)}</td>
        <td class="num">${t.rate}%</td>
        <td class="num">${fmt(t.amount)}</td>
      </tr>
    `).join('');

    // Line item rows
    const itemRows = s.items.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div>${Helpers.escHtml(item.name) || '<em style="color:#aaa">Item name</em>'}</div>
          ${item.description ? `<div class="item-desc">${Helpers.escHtml(item.description)}</div>` : ''}
        </td>
        <td class="num">${item.qty}</td>
        <td class="num">${fmt(item.rate)}</td>
        <td class="num">${fmt(item.qty * item.rate)}</td>
      </tr>
    `).join('');

    // GST badge in header
    const gstinBadge = s.from.gstin
      ? `<div class="gstin-badge">GSTIN: ${Helpers.escHtml(s.from.gstin)}</div>`
      : '';

    // Reverse charge notice
    const rcNote = s.gst.reverseCharge
      ? `<div style="font-size:0.78rem;color:var(--accent-dark);margin-top:0.5rem;">
           ⚠ Reverse Charge Applicable: Tax to be paid by recipient.
         </div>` : '';

    // Bank details
    const bankDetails = [
      s.payment.bankName && `<b>Bank:</b> ${Helpers.escHtml(s.payment.bankName)}`,
      s.payment.accountName && `<b>A/C Name:</b> ${Helpers.escHtml(s.payment.accountName)}`,
      s.payment.accountNumber && `<b>A/C No:</b> ${Helpers.escHtml(s.payment.accountNumber)}`,
      s.payment.ifsc && `<b>IFSC:</b> ${Helpers.escHtml(s.payment.ifsc)}`,
      s.payment.upi && `<b>UPI:</b> ${Helpers.escHtml(s.payment.upi)}`,
    ].filter(Boolean).join('<br>');

    // Client GSTIN
    const clientGstin = s.to.gstin
      ? `<div class="gstin-tag">GSTIN: ${Helpers.escHtml(s.to.gstin)}</div>` : '';

    // Tax type label
    const taxTypeLabel = s.gst.type === 'intra' ? 'CGST + SGST' : 'IGST';

    sheet.innerHTML = `
      <!-- Top accent bar via CSS ::before -->
      
      <div class="inv-header">
        <div class="inv-brand">
          <h1>${Helpers.escHtml(s.from.name) || 'Your Business Name'}</h1>
          <p>${Helpers.escHtml(s.from.email) || ''} ${s.from.phone ? '· ' + Helpers.escHtml(s.from.phone) : ''}</p>
          <p>${[s.from.address, s.from.city, s.from.state, s.from.pincode].filter(Boolean).map(Helpers.escHtml).join(', ')}</p>
          ${gstinBadge}
          ${s.from.pan ? `<div class="gstin-badge" style="background:var(--blue-light);color:var(--blue);border-color:var(--blue);">PAN: ${Helpers.escHtml(s.from.pan)}</div>` : ''}
        </div>
        <div class="inv-meta">
          <h2>TAX INVOICE</h2>
          <div class="inv-meta-row"><span>Invoice No:</span><strong>${Helpers.escHtml(s.invoice.number)}</strong></div>
          <div class="inv-meta-row"><span>Date:</span><strong>${Helpers.formatDate(s.invoice.date)}</strong></div>
          ${s.invoice.dueDate ? `<div class="inv-meta-row"><span>Due Date:</span><strong>${Helpers.formatDate(s.invoice.dueDate)}</strong></div>` : ''}
          ${s.invoice.placeOfSupply ? `<div class="inv-meta-row"><span>Place of Supply:</span><strong>${Helpers.escHtml(s.invoice.placeOfSupply)}</strong></div>` : ''}
          ${s.gst.reverseCharge ? `<div class="inv-meta-row" style="color:var(--accent)"><span>Reverse Charge:</span><strong>Yes</strong></div>` : ''}
        </div>
      </div>

      <!-- Parties -->
      <div class="inv-parties">
        <div class="inv-party">
          <div class="inv-party-label">Bill From</div>
          <h3>${Helpers.escHtml(s.from.name) || '—'}</h3>
          <p>${[s.from.address, s.from.city, s.from.state, s.from.pincode].filter(Boolean).map(Helpers.escHtml).join(', ') || '—'}</p>
        </div>
        <div class="inv-party">
          <div class="inv-party-label">Bill To</div>
          <h3>${Helpers.escHtml(s.to.name) || '—'}</h3>
          <p>${[s.to.address, s.to.city, s.to.state, s.to.pincode].filter(Boolean).map(Helpers.escHtml).join(', ') || '—'}</p>
          ${clientGstin}
        </div>
      </div>

      <!-- Items Table -->
      <table class="inv-items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th style="text-align:right">Qty</th>
            <th style="text-align:right">Rate</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Amount in Words -->
      <div class="inv-amount-words">
        <strong>Amount in words: </strong>${Helpers.numberToWords(Math.round(calc.grandTotal))}
      </div>

      <!-- Totals -->
      <div class="inv-totals">
        <div class="inv-totals-box">
          <div class="inv-total-row subtotal">
            <span>Subtotal</span><span>${fmt(calc.subtotal)}</span>
          </div>
          ${calc.taxes.map(t => `
            <div class="inv-total-row tax">
              <span>${t.name} (${t.rate}%)</span><span>${fmt(t.amount)}</span>
            </div>
          `).join('')}
          <div class="inv-total-row grand">
            <span>Total (${currency})</span><span>${fmt(calc.grandTotal)}</span>
          </div>
        </div>
      </div>

      <!-- GST Tax Breakdown Table -->
      ${calc.totalTax > 0 ? `
      <div class="inv-tax-breakdown">
        <div class="inv-tax-title">GST Tax Breakdown (${taxTypeLabel})</div>
        <table class="inv-tax-table">
          <thead>
            <tr>
              <th>Tax Type</th>
              <th>Taxable Value</th>
              <th>Rate</th>
              <th>Tax Amount</th>
            </tr>
          </thead>
          <tbody>
            ${taxRows}
            <tr style="font-weight:600;">
              <td>Total</td>
              <td style="text-align:right">${fmt(calc.subtotal)}</td>
              <td style="text-align:right">${s.gst.rate}%</td>
              <td style="text-align:right">${fmt(calc.totalTax)}</td>
            </tr>
          </tbody>
        </table>
        ${rcNote}
      </div>` : ''}

      <!-- Footer -->
      <div class="inv-footer">
        <div class="inv-bank">
          <h4>Payment Details</h4>
          <p>${bankDetails || 'No bank details provided.'}</p>
        </div>
        <div class="inv-notes">
          ${s.payment.terms ? `<h4>Terms</h4><p>${Helpers.escHtml(s.payment.terms)}</p>` : ''}
          ${s.payment.notes ? `<h4 style="margin-top:0.75rem">Notes</h4><p>${Helpers.escHtml(s.payment.notes)}</p>` : ''}
        </div>
      </div>

      <!-- Signature -->
      <div class="inv-signature">
        <div>
          <div style="margin-bottom:1.5rem;font-size:0.78rem;color:var(--ink-faint);">Authorised Signature</div>
          <div class="inv-sig-line">${Helpers.escHtml(s.from.name) || 'Name'}</div>
        </div>
      </div>
    `;
  }

  return { render };
})();
