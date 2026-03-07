'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  File, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onUpload: (file: File, isTemp: boolean) => void;
  uploadProgress: number;
  isUploading: boolean;
  onCancelUpload: () => void;
  className?: string;
}

interface DragState {
  isDragActive: boolean;
  isDragReject: boolean;
}

export default function UploadZone({ 
  onUpload, 
  uploadProgress, 
  isUploading, 
  onCancelUpload,
  className 
}: UploadZoneProps): React.JSX.Element {
  const [isTemp, setIsTemp] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragActive: false,
    isDragReject: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const hasFiles = Array.from(items).some(item => item.kind === 'file');
      setDragState({
        isDragActive: hasFiles,
        isDragReject: !hasFiles
      });
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragActive: false, isDragReject: false });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({ isDragActive: false, isDragReject: false });
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onUpload(file, isTemp);
    }
  }, [onUpload, isTemp]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onUpload(file, isTemp);
    }
  }, [onUpload, isTemp]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancelUpload();
  }, [onCancelUpload]);

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = bytes;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const isValidFile = (file: File): boolean => {
    // Add file validation logic here if needed
    return file.size > 0;
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
          dragState.isDragActive && !dragState.isDragReject && 'border-primary bg-primary/5',
          dragState.isDragReject && 'border-destructive bg-destructive/5',
          !dragState.isDragActive && !dragState.isDragReject && 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to upload"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleButtonClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select file to upload"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            dragState.isDragActive && !dragState.isDragReject ? 'bg-primary text-primary-foreground' :
            dragState.isDragReject ? 'bg-destructive text-destructive-foreground' :
            'bg-muted text-muted-foreground'
          )}>
            {dragState.isDragReject ? (
              <X className="h-6 w-6" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {dragState.isDragActive ? 'Drop file here' : 'Upload file'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {dragState.isDragReject 
                ? 'Only files are allowed'
                : 'Drag and drop a file here, or click to select'
              }
            </p>
          </div>
          
          {!isUploading && (
            <Button 
              onClick={handleButtonClick}
              variant="outline"
              className="mt-2"
            >
              <File className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          )}
        </div>
      </div>

      {/* Temporary File Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="temp-file" className="text-sm font-medium">
            Temporary File
          </Label>
          <p className="text-xs text-muted-foreground">
            Files will be automatically deleted after 24 hours
          </p>
        </div>
        <Switch
          id="temp-file"
          checked={isTemp}
          onCheckedChange={setIsTemp}
          disabled={isUploading}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-destructive hover:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && !isUploading && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
