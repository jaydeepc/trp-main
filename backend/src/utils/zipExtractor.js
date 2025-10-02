const AdmZip = require('adm-zip');
const { ALLOWED_MIME_TYPES } = require('../middleware/fileValidation');

const MIME_TO_EXTENSION = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif'],
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'application/csv': ['.csv'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/x-autocad': ['.dwg'],
  'application/dwg': ['.dwg'],
  'application/dxf': ['.dxf'],
  'application/x-solidworks': ['.sldasm', '.sldprt', '.slddrw'],
  'application/sldasm': ['.sldasm'],
  'application/sldprt': ['.sldprt'],
  'application/slddrw': ['.slddrw']
};

const EXTENSION_TO_MIME = {};
ALLOWED_MIME_TYPES.forEach(mimeType => {
  const extensions = MIME_TO_EXTENSION[mimeType];
  if (extensions) {
    extensions.forEach(ext => {
      EXTENSION_TO_MIME[ext] = mimeType;
    });
  }
});

const EXTRACTABLE_EXTENSIONS = Object.keys(EXTENSION_TO_MIME);

const getFileExtension = (filename) => {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
};

const isExtractableFile = (filename) => {
  const ext = getFileExtension(filename);
  return EXTRACTABLE_EXTENSIONS.includes(ext);
};

const getMimeTypeFromExtension = (filename) => {
  const ext = getFileExtension(filename);
  return EXTENSION_TO_MIME[ext] || 'application/octet-stream';
};

const extractZipContents = async (zipBuffer, originalZipName) => {
  try {
    console.log(`📦 Extracting ZIP file: ${originalZipName}`);
    
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    const extractedFiles = [];
    const skippedFiles = [];
    
    for (const entry of zipEntries) {
      if (entry.isDirectory) {
        continue;
      }

      const filename = entry.entryName;
      
      if (isExtractableFile(filename)) {
        const fileBuffer = entry.getData();
        const mimeType = getMimeTypeFromExtension(filename);
        
        extractedFiles.push({
          buffer: fileBuffer,
          originalname: filename,
          mimetype: mimeType,
          size: fileBuffer.length,
          source: 'zip',
          zipSource: originalZipName
        });
        
        console.log(`   ✅ Extracted: ${filename} (${mimeType}, ${(fileBuffer.length / 1024).toFixed(2)}KB)`);
      } else {
        skippedFiles.push(filename);
        console.log(`   ⏭️  Skipped: ${filename} (unsupported format)`);
      }
    }
    
    console.log(`📦 ZIP extraction complete: ${extractedFiles.length} files extracted, ${skippedFiles.length} skipped`);
    
    return {
      success: true,
      files: extractedFiles,
      extractedCount: extractedFiles.length,
      skippedCount: skippedFiles.length,
      skippedFiles: skippedFiles
    };
    
  } catch (error) {
    console.error('❌ ZIP extraction error:', error);
    throw new Error(`Failed to extract ZIP file: ${error.message}`);
  }
};

const processZipFiles = async (files) => {
  const processedFiles = [];
  const zipResults = [];
  
  for (const file of files) {
    const isZip = file.mimetype === 'application/zip' || 
                  file.mimetype === 'application/x-zip-compressed' ||
                  file.mimetype === 'application/x-zip';
    
    if (isZip) {
      const result = await extractZipContents(file.buffer, file.originalname);
      zipResults.push({
        zipName: file.originalname,
        ...result
      });
      processedFiles.push(...result.files);
    } else {
      processedFiles.push(file);
    }
  }
  
  return {
    files: processedFiles,
    zipResults: zipResults,
    totalFiles: processedFiles.length
  };
};

module.exports = {
  extractZipContents,
  processZipFiles,
  isExtractableFile,
  getMimeTypeFromExtension,
  EXTRACTABLE_EXTENSIONS
};
