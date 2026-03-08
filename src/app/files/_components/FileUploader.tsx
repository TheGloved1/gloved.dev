'use client';
import FileFilters from '@/app/files/_components/FileFilters';
import FileItem from '@/app/files/_components/FileItem';
import PaginationControls from '@/app/files/_components/PaginationControls';
import UploadZone from '@/app/files/_components/UploadZone';
import ErrorAlert from '@/components/ErrorAlert';
import Loading from '@/components/loading';
import { env } from '@/env';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useResponsiveItemsPerPage } from '@/hooks/use-responsive-items-per-page';
import glovedApi, { type FileInfo } from '@/lib/glovedapi';
import { animationDelay, fuzzySearch, tryCatch } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosProgressEvent } from 'axios';
import { motion } from 'framer-motion';
import { AlertTriangle, FolderOpen, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteConfirmDialog } from '../../../components/DeleteConfirmDialog';
import { Button } from '../../../components/ui/button';

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);
  const itemsPerPage = useResponsiveItemsPerPage();

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

  // Reset to page 1 when filters or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeFilters]);

  // Calculate pagination
  const paginationData = React.useMemo(() => {
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    return {
      totalPages,
      paginatedFiles,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filteredFiles.length),
    };
  }, [filteredFiles, currentPage, itemsPerPage]);

  // Adjust current page if it exceeds total pages
  React.useEffect(() => {
    if (currentPage > paginationData.totalPages && paginationData.totalPages > 0) {
      setCurrentPage(paginationData.totalPages);
    }
  }, [currentPage, paginationData.totalPages]);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    filesQuery.refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
      <div className='w-full space-y-8 p-4'>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
          <div className='flex items-center justify-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
              <FolderOpen className='h-6 w-6 text-fuchsia-400' />
            </div>
            <h1 className='font-display glitch-text text-4xl font-bold uppercase tracking-tight text-white'>GlovedFiles</h1>
          </div>
          <p className='font-mono-industrial mt-4 text-sm text-white/50'>
            File sharing with temporary and permanent storage options
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-6'
        >
          <div className='space-y-4'>
            <UploadZone
              onUpload={uploadFile}
              uploadProgress={uploadProgress}
              isUploading={uploadMutation.isPending}
              onCancelUpload={handleCancelUpload}
            />
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <FileFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterChange={setActiveFilters}
            files={filesQuery.data}
          />
        </motion.div>

        {/* Files List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='space-y-6'
        >
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-row items-center gap-4'>
              <h2 className='font-display flex items-center gap-3 text-2xl font-bold uppercase tracking-wide text-white'>
                <div className='flex h-8 w-8 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <FolderOpen className='h-4 w-4 text-fuchsia-400' />
                </div>
                Files
              </h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleRefresh}
                className='brutal-shadow-sm border border-white/10 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5, ease: 'easeIn' }}
                >
                  <RefreshCw className='h-4 w-4' />
                </motion.div>
              </Button>
            </div>

            {/* Pagination display */}
            <div className='flex flex-1 scale-75 justify-start md:flex-none md:justify-center lg:scale-100'>
              <PaginationControls
                currentPage={currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <div className='font-mono-industrial text-sm text-white/50'>
              {filteredFiles.length > 0 ?
                <>
                  Showing {paginationData.startIndex}-{paginationData.endIndex} of {filteredFiles.length} files
                </>
              : <>No files to show</>}
            </div>
          </div>

          {filesQuery.isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex justify-center py-12'>
              <Loading />
            </motion.div>
          )}

          {filesQuery.isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='border border-red-500/30 bg-red-500/5 p-4'
            >
              <div className='flex items-center gap-3 text-red-400'>
                <AlertTriangle className='glow-line h-5 w-5' />
                <span className='font-mono-industrial'>An error occurred while fetching files.</span>
              </div>
            </motion.div>
          )}

          {!filesQuery.isLoading && !filesQuery.isError && paginationData.paginatedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='flex flex-wrap gap-6'
            >
              {paginationData.paginatedFiles.map((file, index) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: parseFloat(animationDelay(index, paginationData.paginatedFiles.length)) }}
                  className='w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]'
                >
                  <FileItem file={file} onDelete={setFileToDelete} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!filesQuery.isLoading && !filesQuery.isError && filteredFiles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='border border-white/10 bg-white/5 p-12 text-center'
            >
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-white/10 bg-white/5'>
                <FolderOpen className='h-8 w-8 text-white/30' />
              </div>
              <h3 className='font-display text-lg font-bold uppercase tracking-wide text-white'>No files found</h3>
              <p className='font-mono-industrial mt-2 text-sm text-white/50'>
                {debouncedSearchQuery ? `No files match "${debouncedSearchQuery}"` : 'No files have been uploaded yet'}
              </p>
            </motion.div>
          )}
        </motion.div>
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
