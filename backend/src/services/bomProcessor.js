const XLSX = require('xlsx');

class BOMProcessor {
  constructor() {
    this.supportedFormats = ['.xlsx', '.xls', '.csv'];
  }

  // Convert ANY CSV/Excel file to JSON (like Python csv.DictReader)
  async convertToJSON(fileBuffer, fileName, fileType) {
    try {
      console.log(`📊 Converting file to JSON: ${fileName}`);
      
      let jsonData = null;
      
      if (fileType === '.csv') {
        jsonData = this.processCSV(fileBuffer);
      } else if (fileType === '.xlsx' || fileType === '.xls') {
        jsonData = this.processExcel(fileBuffer);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      console.log(`✅ File conversion successful: ${jsonData.length} rows extracted`);
      return jsonData;
      
    } catch (error) {
      console.error('File conversion error:', error);
      throw new Error(`Failed to convert file: ${error.message}`);
    }
  }

  // Process Excel files (.xlsx, .xls) - exactly like csv.DictReader
  processExcel(fileBuffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row (like csv.DictReader)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Use first row as headers
        defval: '', // Default value for empty cells
        blankrows: false // Skip blank rows
      });
      
      if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
      }
      
      // Convert array of arrays to array of objects (like csv.DictReader)
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      const structuredData = rows.map((row) => {
        const rowData = {};
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex] || '';
        });
        return rowData;
      });
      
      return structuredData;
      
    } catch (error) {
      throw new Error(`Excel processing failed: ${error.message}`);
    }
  }

  // Process CSV files - exactly like csv.DictReader
  processCSV(fileBuffer) {
    try {
      const csvText = fileBuffer.toString('utf-8');
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        throw new Error('No data found in CSV file');
      }
      
      // Parse CSV (like csv.DictReader)
      const headers = this.parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(line => this.parseCSVLine(line));
      
      const structuredData = rows.map((row) => {
        const rowData = {};
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex] || '';
        });
        return rowData;
      });
      
      return structuredData;
      
    } catch (error) {
      throw new Error(`CSV processing failed: ${error.message}`);
    }
  }

  // Simple CSV line parser
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
}

module.exports = new BOMProcessor();
