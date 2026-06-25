const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
  async generateExcelReport(data, reportName) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    
    if (data.length > 0) {
      // Define columns based on first object keys
      sheet.columns = Object.keys(data[0]).map(key => ({ header: key.toUpperCase(), key, width: 20 }));
      sheet.addRows(data);
    }

    const dir = path.join(__dirname, '../../../../public/reports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filename = `${reportName}_${Date.now()}.xlsx`;
    const filePath = path.join(dir, filename);
    await workbook.xlsx.writeFile(filePath);
    
    return `/reports/${filename}`;
  }

  async generatePDFReport(title, content) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const dir = path.join(__dirname, '../../../../public/reports');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(dir, filename);
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(content);
      
      doc.end();
      
      stream.on('finish', () => resolve(`/reports/${filename}`));
      stream.on('error', reject);
    });
  }
}

module.exports = new ReportGenerator();
