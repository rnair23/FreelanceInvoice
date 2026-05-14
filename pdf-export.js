// ===========================
// PDF EXPORT COMPONENT
// components/pdf-export.js
// ===========================

const PDFExport = (() => {

  function download() {
    const sheet = document.getElementById('invoiceSheet');
    if (!sheet) return;

    // Check for html2pdf.js
    if (typeof html2pdf === 'undefined') {
      _loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', () => {
        _exportPDF(sheet);
      });
    } else {
      _exportPDF(sheet);
    }
  }

  function _exportPDF(sheet) {
    const s = State.get();
    const filename = `Invoice_${s.invoice.number || 'draft'}_${s.to.name || 'client'}.pdf`
      .replace(/[^a-zA-Z0-9_\-.]/g, '_');

    Helpers.showToast('Generating PDF…');

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };

    html2pdf().set(opt).from(sheet).save().then(() => {
      Helpers.showToast('✓ PDF downloaded!');
    }).catch(err => {
      console.error(err);
      Helpers.showToast('PDF failed. Try printing instead.');
    });
  }

  function printInvoice() {
    window.print();
  }

  function _loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = () => Helpers.showToast('Could not load PDF library. Check your connection.');
    document.head.appendChild(s);
  }

  return { download, printInvoice };
})();
