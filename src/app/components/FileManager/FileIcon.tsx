import {
  FileIcon as DefaultFileIcon,
  FileText,
  Image,
  FileVideo2,
  FileAudio2,
  File as FilePdf,
  Archive,
  FileCode2,
  FolderIcon,
} from 'lucide-react';

interface FileIconProps {
  type: 'file' | 'folder';
  filename?: string;
  className?: string;
}

const getFileType = (filename: string): string => {
  const extension = filename?.split('.').pop()?.toLowerCase() || '';
  
  // Common file types
  const fileTypes: Record<string, string> = {
    // Images
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    
    // Documents
    pdf: 'pdf',
    doc: 'text',
    docx: 'text',
    txt: 'text',
    rtf: 'text',
    md: 'text',
    
    // Audio
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio',
    
    // Video
    mp4: 'video',
    mov: 'video',
    avi: 'video',
    webm: 'video',
    
    // Archives
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    tar: 'archive',
    gz: 'archive',
    
    // Code
    js: 'code',
    jsx: 'code',
    ts: 'code',
    tsx: 'code',
    html: 'code',
    css: 'code',
    scss: 'code',
    json: 'code',
    py: 'code',
    java: 'code',
    cpp: 'code',
    c: 'code',
    php: 'code',
    rb: 'code',
  };

  return fileTypes[extension] || 'default';
};

export function FileIcon({ type, filename = '', className = '' }: FileIconProps) {
  if (type === 'folder') {
    return <FolderIcon className={`text-blue-500 ${className}`} />;
  }

  const fileType = getFileType(filename);
  const iconProps = { className: `text-gray-500 ${className}` };

  switch (fileType) {
    case 'image':
      return <Image {...iconProps} className={`text-green-500 ${className}`} />;
    case 'text':
      return <FileText {...iconProps} className={`text-yellow-500 ${className}`} />;
    case 'pdf':
      return <FilePdf {...iconProps} className={`text-red-500 ${className}`} />;
    case 'video':
      return <FileVideo2 {...iconProps} className={`text-purple-500 ${className}`} />;
    case 'audio':
      return <FileAudio2 {...iconProps} className={`text-pink-500 ${className}`} />;
    case 'archive':
      return <Archive {...iconProps} className={`text-orange-500 ${className}`} />;
    case 'code':
      return <FileCode2 {...iconProps} className={`text-indigo-500 ${className}`} />;
    default:
      return <DefaultFileIcon {...iconProps} />;
  }
} 