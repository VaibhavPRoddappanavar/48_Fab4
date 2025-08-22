import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

// Define types for the report data
interface ReportIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  category: string;
}

interface ReportData {
  overallScore: number;
  scanUrl: string;
  scanTime: string;
  categories: {
    [key: string]: {
      score: number;
      issues: ReportIssue[];
    };
  };
}

const addFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.pages.length - 1;
  const mutedColor = '#94A3B8'; // slate-400

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 35, doc.internal.pageSize.getHeight() - 10);
    doc.text('Cyberscan Report', 14, doc.internal.pageSize.getHeight() - 10);
  }
};

export const generatePdf = (reportData: ReportData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Colors
  const primaryColor = '#10B981'; // emerald-500
  const textColor = '#FFFFFF';
  const mutedColor = '#94A3B8'; // slate-400
  const backgroundColor = '#0F172A'; // slate-900
  const cardColor = '#1E293B'; // slate-800
  const borderColor = '#334155'; // slate-700

  // Fonts
  const font = 'Helvetica';

  // --- COVER PAGE ---
  doc.setFillColor(backgroundColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

  // Border
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(1.5);
  doc.rect(5, 5, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10);

  // Title
  doc.setFont(font, 'bold');
  doc.setFontSize(32);
  doc.setTextColor(textColor);
  doc.text('Security Scan Report', doc.internal.pageSize.getWidth() / 2, 100, { align: 'center' });

  // Underline
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(60, 105, doc.internal.pageSize.getWidth() - 60, 105);

  doc.setFontSize(20);
  doc.setFont(font, 'normal');
  doc.text(`URL: ${reportData.scanUrl}`, doc.internal.pageSize.getWidth() / 2, 125, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(mutedColor);
  doc.text(`Scan Date: ${new Date(reportData.scanTime).toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 135, { align: 'center' });

  // --- SUMMARY PAGE ---
  doc.addPage();
  doc.setFillColor(backgroundColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

  // Page Header
  doc.setFontSize(24);
  doc.setFont(font, 'bold');
  doc.setTextColor(textColor);
  doc.text('Scan Summary', 14, 25);

  // Overall Score Card
  doc.setDrawColor(borderColor);
  doc.setFillColor(cardColor);
  doc.roundedRect(14, 35, doc.internal.pageSize.getWidth() - 28, 30, 3, 3, 'FD');
  
  doc.setFontSize(18);
  doc.setTextColor(textColor);
  doc.text('Overall Health Score', 20, 52);

  doc.setFontSize(28);
  doc.setFont(font, 'bold');
  doc.setTextColor(primaryColor);
  doc.text(String(reportData.overallScore), doc.internal.pageSize.getWidth() - 50, 55);

  // Category Scores
  let yPos = 80;
  doc.setFontSize(18);
  doc.setFont(font, 'bold');
  doc.setTextColor(textColor);
  doc.text('Category Breakdown', 14, yPos);
  yPos += 15;

  Object.entries(reportData.categories).forEach(([key, category]) => {
    doc.setDrawColor(borderColor);
    doc.setFillColor(cardColor);
    doc.roundedRect(14, yPos, doc.internal.pageSize.getWidth() - 28, 20, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text(key.charAt(0).toUpperCase() + key.slice(1), 20, yPos + 13);
    
    doc.setFontSize(16);
    doc.setFont(font, 'bold');
    doc.setTextColor(primaryColor);
    doc.text(String(category.score), doc.internal.pageSize.getWidth() - 40, yPos + 13);
    
    yPos += 25;
  });

  // --- ISSUES PAGES ---
  Object.entries(reportData.categories).forEach(([key, category]) => {
    if (category.issues.length > 0) {
      doc.addPage();
      doc.setFillColor(backgroundColor);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

      doc.setFontSize(24);
      doc.setFont(font, 'bold');
      doc.setTextColor(textColor);
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)} Issues`, 14, 25);

      const tableData = category.issues.map(issue => [
        issue.title,
        issue.severity.toUpperCase(),
        issue.description,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Title', 'Severity', 'Description']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#FFFFFF',
          fontStyle: 'bold',
        },
        styles: {
          font: font,
          fillColor: cardColor,
          textColor: textColor,
          lineColor: borderColor,
        },
        alternateRowStyles: {
          fillColor: backgroundColor,
        },
      });
    }
  });

  addFooter(doc);

  doc.save(`Cyberscan-Report-${reportData.scanUrl.replace(/https?:\/\//, '')}.pdf`);
};
