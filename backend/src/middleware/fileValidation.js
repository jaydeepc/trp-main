const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  
  // PDFs
  'application/pdf',
  
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // CSV
  'text/csv',
  'application/csv',
  
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  // Text
  'text/plain',
  
  // CAD 
  'application/x-autocad',
  'application/dwg',
  'application/dxf',
  
  // SolidWorks
  'application/x-solidworks',
  'application/sldasm',
  'application/sldprt',
  'application/slddrw',
  
  // ZIP files (for multiple file uploads)
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_FILES = 10; // Maximum 10 files per upload

const validateFiles = (req, res, next) => {
  try {
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        message: 'Please upload at least one file'
      });
    }

    // Check number of files
    if (req.files.length > MAX_FILES) {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: `Maximum ${MAX_FILES} files allowed per upload. You uploaded ${req.files.length} files.`
      });
    }

    // Validate each file
    const errors = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          file: file.originalname,
          error: 'File too large',
          message: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
        continue;
      }

      // Check MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        errors.push({
          file: file.originalname,
          error: 'Invalid file type',
          message: `File type ${file.mimetype} not supported. Please upload images, PDFs, Excel, CSV, or Word documents.`
        });
        continue;
      }

      // Check if file has content
      if (file.size === 0) {
        errors.push({
          file: file.originalname,
          error: 'Empty file',
          message: 'File appears to be empty'
        });
        continue;
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'File validation failed',
        message: 'Some files did not pass validation',
        validationErrors: errors,
        validFiles: req.files.length - errors.length,
        totalFiles: req.files.length
      });
    }

    // All files valid, log and proceed
    console.log(`✅ File validation passed: ${req.files.length} file(s)`);
    req.files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(2)}KB)`);
    });

    next();

  } catch (error) {
    console.error('❌ File validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'File validation failed',
      message: error.message
    });
  }
};

const getSupportedFormats = () => {
  return {
    images: ['JPEG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF'],
    documents: ['PDF', 'Word (.doc, .docx)', 'Text'],
    spreadsheets: ['Excel (.xls, .xlsx)', 'CSV'],
    cad: ['AutoCAD (DWG, DXF)'],
    maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    maxFiles: MAX_FILES
  };
};

module.exports = {
  validateFiles,
  getSupportedFormats,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES
};
