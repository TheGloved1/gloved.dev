'use client';
import ErrorAlert from '@/components/ErrorAlert';
import FileFilters from '@/components/FileFilters';
import FileItem from '@/components/FileItem';
import UploadZone from '@/components/UploadZone';
import Loading from '@/components/loading';
import { env } from '@/env';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocalStorage } from '@/hooks/use-local-storage';
import glovedApi, { type FileInfo } from '@/lib/glovedapi';
import { fuzzySearch, tryCatch } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosProgressEvent } from 'axios';
import { AlertTriangle, FolderOpen, RefreshCcw, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { Button } from './ui/button';

const fetchFiles = async () => {
  const result = await glovedApi.listFiles();
  if (result.error) throw result.error;
  return result.data;
};

const deleteFileApi = async (filename: string, isTemp: boolean) => {
  await glovedApi.deleteFile(filename, isTemp);
};

const permanentDeleteFileApi = async (filename: string, isTemp: boolean) => {
  await glovedApi.permanentDeleteFile(filename, isTemp);
};

const uploadFileApi = async (
  file: File,
  isTemp: boolean,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal,
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('temp', isTemp.toString());
  await glovedApi.uploadFile(formData, {
    signal: signal,
    onUploadProgress,
  });
};

export default function FileUploader(): React.JSX.Element {
  const correctPassword = env.NEXT_PUBLIC_FILE_MANAGER_PASSKEY;
  const queryClient = useQueryClient();

  const [passwordEntered, setPasswordEntered] = useLocalStorage<boolean>('fileUploaderPasswordEntered', false);
  const [alert, setAlert] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isTemp, setIsTemp] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [uploadRequestController, setUploadRequestController] = useState<AbortController | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg'].includes(extension || '')) {
      return 'images';
    }
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension || '')) {
      return 'videos';
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension || '')) {
      return 'documents';
    }

    return 'other';
  };

  const filesQuery = useQuery({ queryKey: ['files'], queryFn: fetchFiles, initialData: [] });

  // Filter files based on search query and active filters
  const filteredFiles = React.useMemo(() => {
    let filtered = fuzzySearch(filesQuery.data, debouncedSearchQuery, ['name']);

    // Apply additional filters
    if (activeFilters.length === 0) {
      // No filters active, show all files
      return filtered;
    }

    filtered = filtered.filter((file) => {
      // Check if file matches any active filter
      const fileType = getFileType(file.name);

      if (activeFilters.includes('permanent') && !file.isTemp) {
        return true;
      }
      if (activeFilters.includes('temporary') && file.isTemp) {
        return true;
      }
      if (activeFilters.includes('images') && fileType === 'images') {
        return true;
      }
      if (activeFilters.includes('videos') && fileType === 'videos') {
        return true;
      }
      if (activeFilters.includes('documents') && fileType === 'documents') {
        return true;
      }

      return false;
    });

    return filtered;
  }, [filesQuery.data, debouncedSearchQuery, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: ({ filename, isTemp }: { filename: string; isTemp: boolean }) => deleteFileApi(filename, isTemp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setFileToDelete(null);
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: ({ filename, isTemp }: { filename: string; isTemp: boolean }) => permanentDeleteFileApi(filename, isTemp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setFileToDelete(null);
    },
  });

  const handleCancelUpload = () => {
    if (uploadRequestController) {
      uploadRequestController.abort();
      setUploadProgress(0);
      setUploadRequestController(null);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const controller = new AbortController();
      setUploadRequestController(controller);

      return uploadFileApi(
        file,
        isTemp,
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
        controller.signal,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploadProgress(0);
      setUploadRequestController(null);
    },
  });

  useEffect(() => {
    if (alert === '') return;
    const timer = setTimeout(() => {
      setAlert('');
    }, 2500);
    return () => clearTimeout(timer);
  }, [alert]);

  async function handleDelete(permanent: boolean = false): Promise<void> {
    if (!fileToDelete) return;
    if (!passwordEntered) {
      const password = prompt(`Enter passkey to delete files`)?.trim();
      if (!password) {
        return;
      }
      if (password === correctPassword) {
        setPasswordEntered(true);
      } else {
        setAlert('Incorrect passkey');
        setFileToDelete(null);
        return;
      }
    }

    if (permanent) {
      const { error } = await tryCatch(
        permanentDeleteMutation.mutateAsync({ filename: fileToDelete.name, isTemp: fileToDelete.isTemp }),
      );
      if (error) {
        setAlert(error.message);
        return;
      }
    } else {
      const { error } = await tryCatch(
        deleteMutation.mutateAsync({ filename: fileToDelete.name, isTemp: fileToDelete.isTemp }),
      );
      if (error) {
        setAlert(error.message);
        return;
      }
    }
    setAlert('');
    setFileToDelete(null);
  }

  async function uploadFile(file: File, isTemp: boolean): Promise<void> {
    try {
      uploadMutation.mutate(file);
      setAlert('');
    } catch (error) {
      console.error('An error occurred while uploading file:', error);
      setAlert('An error occurred while uploading file');
    }
  }

  return (
    <>
      <div className='container mx-auto max-w-6xl space-y-6 p-4'>
        {/* Header */}
        <div className='space-y-2 text-center'>
          <div className='flex items-center justify-center gap-3'>
            <FolderOpen className='h-8 w-8 text-primary' />
            <h1 className='text-3xl font-bold text-foreground'>GlovedFiles</h1>
          </div>
          <p className='text-muted-foreground'>File sharing with temporary and permanent storage options</p>
        </div>

        {/* Upload Section */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <div className='space-y-4'>
            <h2 className='flex items-center gap-2 text-xl font-semibold'>
              <Upload className='h-5 w-5' />
              Upload Files
            </h2>
            <UploadZone
              onUpload={uploadFile}
              uploadProgress={uploadProgress}
              isUploading={uploadMutation.isPending}
              onCancelUpload={handleCancelUpload}
            />
          </div>

          {/* Stats Section */}
          <div className='space-y-4'>
            <h2 className='flex items-center gap-2 text-xl font-semibold'>
              <RefreshCcw className='h-5 w-5' />
              File Statistics
            </h2>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-lg border p-4'>
                <div className='text-2xl font-bold text-primary'>{filesQuery.data.filter((f) => !f.isTemp).length}</div>
                <div className='text-sm text-muted-foreground'>Permanent Files</div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='text-2xl font-bold text-orange-600'>{filesQuery.data.filter((f) => f.isTemp).length}</div>
                <div className='text-sm text-muted-foreground'>Temporary Files</div>
              </div>
            </div>
            <Button
              variant='outline'
              onClick={() => queryClient.invalidateQueries({ queryKey: ['files'] })}
              className='w-full'
            >
              <RefreshCcw className='mr-2 h-4 w-4' />
              Refresh Files
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <FileFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilters}
          files={filesQuery.data}
        />

        {/* Files List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='flex items-center gap-2 text-xl font-semibold'>
              <FolderOpen className='h-5 w-5' />
              Files
            </h2>
            <div className='text-sm text-muted-foreground'>
              Showing {filteredFiles.length} of {filesQuery.data.length} files
            </div>
          </div>

          {filesQuery.isLoading && <Loading />}

          {filesQuery.isError && (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
              <div className='flex items-center gap-2 text-destructive'>
                <AlertTriangle className='h-5 w-5' />
                <span>An error occurred while fetching files.</span>
              </div>
            </div>
          )}

          {!filesQuery.isLoading && !filesQuery.isError && filteredFiles.length > 0 && (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredFiles.map((file) => (
                <FileItem key={file.name} file={file} onDelete={setFileToDelete} />
              ))}
            </div>
          )}

          {!filesQuery.isLoading && !filesQuery.isError && filteredFiles.length === 0 && (
            <div className='rounded-lg border border-dashed p-8 text-center'>
              <FolderOpen className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-4 text-lg font-semibold'>No files found</h3>
              <p className='mt-2 text-muted-foreground'>
                {debouncedSearchQuery ? `No files match "${debouncedSearchQuery}"` : 'No files have been uploaded yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {alert !== '' && <ErrorAlert>{alert}</ErrorAlert>}
      {fileToDelete && (
        <DeleteConfirmDialog
          fileName={fileToDelete.name}
          onConfirm={() => handleDelete()}
          onPermDelete={() => handleDelete(true)}
          onCancel={() => setFileToDelete(null)}
        />
      )}
    </>
  );
}
