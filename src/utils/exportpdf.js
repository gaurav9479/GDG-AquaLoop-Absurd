import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportDashboardPDF(elementId) {
  const input = document.getElementById(elementId);
  if (!input) return;

  const canvas = await html2canvas(input, {
    scale: 2,
    backgroundColor: "#020617",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
  pdf.save("water-sample-report.pdf");
}
