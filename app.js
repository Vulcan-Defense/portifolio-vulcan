document.addEventListener('DOMContentLoaded', () => {
  const printButton = document.getElementById('btn-print-pdf');
  if (printButton) {
    printButton.addEventListener('click', () => {
      window.print();
    });
  }
});