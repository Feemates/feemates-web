import { apiClient } from '@/lib/api-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { AxiosError, AxiosProgressEvent } from 'axios';

interface FileUploadResponse {
  id: number;
  key: string;
}

interface DeleteFilePayload {
  file_id: number;
}

interface UploadFileOptions {
  onProgress?: (progress: number) => void;
}

const uploadFile = async (file: File, options?: UploadFileOptions): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/file-upload/upload', formData, {
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (options?.onProgress && progressEvent.total) {
        // Calculate the percentage
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        options.onProgress(percentCompleted);
      }
    },
  });
};

const deleteFile = async (payload: DeleteFilePayload): Promise<void> => {
  return apiClient.delete(`/file/${payload.file_id}`);
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: (params: { file: File; options?: UploadFileOptions }) =>
      uploadFile(params.file, params.options),
    onError: (error: AxiosError) => {
      toast.error(error);
    },
    retry: 1, // Only retry once for file uploads
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationFn: deleteFile,
    onError: (error: AxiosError) => {
      toast.error(error);
    },
    retry: 1,
  });
};
