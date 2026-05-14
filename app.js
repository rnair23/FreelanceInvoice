// ===========================
// APP ORCHESTRATOR
// utils/app.js
// ===========================

(function () {
  // ---- Init State ----
  State.init();

  // ---- Build Forms ----
  FormBuilder.buildFromSection(document.getElementById('fromFields'));
  FormBuilder.buildToSection(document.getElementById('toFields'));
  FormBuilder.buildInvoiceMeta(document.getElementById('invoiceMetaFields'));
  LineItems.render(document.getElementById('lineItemsContainer'));
  GSTCalculator.buildGSTFields(document.getElementById('gstFields'));
  FormBuilder.buildPaymentSection(document.getElementById('paymentFields'));

  // ---- Initial Render ----
  InvoiceRenderer.render();

  // ---- Reactive Updates ----
  State.subscribe(() => {
    InvoiceRenderer.render();
  });

  // ---- Line Items Re-render on state change ----
  let prevItemCount = State.get().items.length;
  State.subscribe((s) => {
    if (s.items.length !== prevItemCount) {
      prevItemCount = s.items.length;
      LineItems.render(document.getElementById('lineItemsContainer'));
      document.getElementById('addItemBtn').addEventListener('click', LineItems.addItem);
    }
  });

  // ---- Add Item Button ----
  document.getElementById('addItemBtn').addEventListener('click', LineItems.addItem);

  // ---- Download PDF ----
  document.getElementById('downloadBtn').addEventListener('click', PDFExport.download);
  document.getElementById('generateBtn').addEventListener('click', () => {
    InvoiceRenderer.render();
    PDFExport.download();
  });

  // ---- Preview Toggle (mobile) ----
  document.getElementById('previewBtn').addEventListener('click', () => {
    const panel = document.getElementById('previewPanel');
    const form = document.getElementById('formPanel');
    if (panel.style.display === 'none') {
      panel.style.display = '';
      form.style.display = 'none';
    } else {
      panel.style.display = 'none';
      form.style.display = '';
    }
  });

  // ---- Step Navigation ----
  window.goToStep = function (n) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-tab').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('step-' + n);
    if (target) target.classList.add('active');
    const tab = document.querySelector(`.step-tab[data-step="${n}"]`);
    if (tab) tab.classList.add('active');
    InvoiceRenderer.render();
  };

  document.querySelectorAll('.step-tab').forEach(tab => {
    tab.addEventListener('click', () => goToStep(parseInt(tab.dataset.step)));
  });

})();
