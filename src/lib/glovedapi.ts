// Custom SDK for api.gloved.dev
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { tryCatch, type Result } from './utils';

export const GLOVED_API_URL = 'https://api.gloved.dev';

// ============================================================================
// Types
// ============================================================================

export interface RouteInfo {
  path: string;
  name: string;
  description?: string;
  returns?: string;
  subpaths?: RouteInfo[];
}

export interface RootResponse {
  routes: RouteInfo[];
}

export interface FileInfo {
  name: string;
  isTemp: boolean;
  createdAt: string;
  size: number;
  ext: string;
}

export interface GalleryFileInfo {
  name: string;
  createdAt: string;
  size: number;
}

export interface BlobUploadResponse {
  url: string;
}

export interface PageVisitsResponse {
  visits: number;
  visitorIds: string[];
}

export interface ListFilesOptions {
  gallery?: boolean;
  convert?: boolean;
}

export interface GlovedApiOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

// ============================================================================
// GlovedApi SDK Class
// ============================================================================

/**
 * The GlovedApi class provides methods for interacting with the
 * Gloved API. Use the constructor to create an instance with
 * a custom base URL and default headers.
 *
 * @param options - An object containing options for the API
 * instance.
 * @property options.baseUrl - The base URL for the API.
 * @property options.defaultHeaders - An object containing default
 * headers to include in all API requests.
 * @property options.timeout - Request timeout in milliseconds (default: 30000).
 */
export class GlovedApi {
  readonly baseUrl: string;
  private client: AxiosInstance;

  constructor(options: GlovedApiOptions = {}) {
    this.baseUrl = options.baseUrl || GLOVED_API_URL;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Accept: 'application/json',
        ...options.defaultHeaders,
      },
      timeout: options.timeout ?? 30000,
    });
  }

  // --------------------------------------------------------------------------
  // Base Request Helpers
  // --------------------------------------------------------------------------

  private async apiRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.request<T>({
        ...config,
        url: endpoint,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || `API request failed: ${error.response?.status}`;
        throw new Error(message);
      }
      throw error;
    }
  }

  private async apiRequestBlob(endpoint: string, config: AxiosRequestConfig = {}): Promise<Blob> {
    try {
      const response = await this.client.request<Blob>({
        ...config,
        url: endpoint,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || `API request failed: ${error.response?.status}`;
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * Builds a query string from the given options.
   * @param options - An object containing query parameters.
   * @returns A string query string.
   * @example
   * const query = buildQueryParams({ foo: 'bar', baz: true });
   * console.log(query); // Output: "?foo=bar&baz=true"
   */
  private buildQueryParams(options: Record<string, any>): string {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    return params.toString() ? `?${params.toString()}` : '';
  }

  // --------------------------------------------------------------------------
  // Root API
  // --------------------------------------------------------------------------

  /**
   * Retrieves the root endpoint information.
   * @returns A Result containing the root response or an error.
   */
  async getRoot(): Promise<Result<RootResponse>> {
    return tryCatch(this.apiRequest<RootResponse>('/'));
  }

  // --------------------------------------------------------------------------
  // Admin IPs API
  // --------------------------------------------------------------------------

  /**
   * Retrieves the list of admin IP addresses.
   * @returns A Result containing an array of admin IP addresses or an error.
   */
  async getAdminIps(): Promise<Result<string[]>> {
    return tryCatch(this.apiRequest<string[]>('/admin-ips'));
  }

  // --------------------------------------------------------------------------
  // Blob API
  // --------------------------------------------------------------------------

  /**
   * Uploads a file to the blob storage server and returns the URL of the uploaded image.
   * @param file The file to be uploaded.
   * @param config Optional Axios request configuration.
   * @returns A Result containing the upload response or an error.
   */
  async uploadBlob(file: File, config?: AxiosRequestConfig): Promise<Result<BlobUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return tryCatch(
      this.apiRequest<BlobUploadResponse>('/blob/upload', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      }),
    );
  }

  /**
   * Retrieves a blob by its ID.
   * @param fileId The unique identifier for the blob.
   * @returns A Result containing the blob or an error.
   */
  async getBlob(fileId: string): Promise<Result<Blob>> {
    return tryCatch(this.apiRequestBlob(`/blob/${encodeURIComponent(fileId)}`));
  }

  /**
   * Generates a URL for retrieving a blob by its ID.
   * @param fileId The unique identifier for the blob.
   * @returns The URL for retrieving the blob.
   */
  getBlobUrl(fileId: string): string {
    return `${this.baseUrl}/blob/${encodeURIComponent(fileId)}`;
  }

  // --------------------------------------------------------------------------
  // Files API
  // --------------------------------------------------------------------------

  /**
   * Lists files in the gallery or regular file storage.
   * @param options - Optional parameters for filtering and conversion.
   * @returns A Result containing an array of file information or an error.
   */
  async listFiles(options: ListFilesOptions = {}): Promise<Result<FileInfo[]>> {
    const params = new URLSearchParams();
    if (options.gallery) params.append('gallery', 'true');
    if (options.convert) params.append('convert', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return tryCatch(this.apiRequest<FileInfo[]>(`/files/${query}`));
  }

  /**
   * Deletes a file from the server (can still be fetched with this.downloadFile() function).
   * @param filename The name of the file to delete.
   * @param isTemp Whether the file is in the temporary storage.
   * @returns A Result containing the filename of the deleted file or an error.
   */
  async deleteFile(filename: string, isTemp?: boolean): Promise<Result<string>> {
    const params = this.buildQueryParams({ temp: isTemp });
    return tryCatch(
      this.apiRequest<string>(`/files/delete/${encodeURIComponent(filename)}${params}`, {
        method: 'POST',
      }),
    );
  }

  /**
   * Permanently deletes a file from the server.
   * @param filename The name of the file to delete.
   * @param isTemp Whether the file is in the temporary storage.
   * @returns A Result containing the filename of the deleted file or an error.
   */
  async permanentDeleteFile(filename: string, isTemp?: boolean): Promise<Result<string>> {
    const params = this.buildQueryParams({ temp: isTemp });
    return tryCatch(
      this.apiRequest<string>(`/files/permanent-delete/${encodeURIComponent(filename)}${params}`, {
        method: 'POST',
      }),
    );
  }

  /**
   * Downloads a file from the server.
   * @param filename The name of the file to download.
   * @param config Optional Axios request configuration.
   * @returns A Result containing the downloaded file as a blob or an error.
   */
  async downloadFile(filename: string, config?: AxiosRequestConfig): Promise<Result<Blob>> {
    return tryCatch(this.apiRequestBlob(`/files/download/${encodeURIComponent(filename)}`, config));
  }

  /**
   * Uploads a file to the server.
   * @param file Either a File object or a FormData object containing the file.
   * @param config Optional Axios request configuration.
   * @returns A Result containing the filename of the uploaded file or an error.
   */
  async uploadFile(file: File | FormData, config?: AxiosRequestConfig): Promise<Result<string>> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    return tryCatch(
      this.apiRequest<string>('/files/upload', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      }),
    );
  }

  /**
   * Views a file from the server.
   * @param filename The name of the file to view.
   * @param config Optional Axios request configuration.
   * @returns A Result containing the viewed file as a blob or an error.
   */
  async viewFile(filename: string, config?: AxiosRequestConfig): Promise<Result<Blob>> {
    return tryCatch(this.apiRequestBlob(`/files/view/${encodeURIComponent(filename)}`, config));
  }

  /**
   * Generates a URL for viewing a file.
   * @param filename The name of the file to view.
   * @returns The URL for viewing the file.
   */
  getFileViewUrl(filename: string): string {
    return `${this.baseUrl}/files/view/${encodeURIComponent(filename)}`;
  }

  /**
   * Generates a URL for downloading a file.
   * @param filename The name of the file to download.
   * @returns The URL for downloading the file.
   */
  getFileDownloadUrl(filename: string): string {
    return `${this.baseUrl}/files/download/${encodeURIComponent(filename)}`;
  }

  // --------------------------------------------------------------------------
  // Gallery API
  // --------------------------------------------------------------------------

  /**
   * Lists all gallery items.
   * @returns A Result containing an array of gallery file information or an error.
   */
  async listGallery(): Promise<Result<GalleryFileInfo[]>> {
    return tryCatch(this.apiRequest<GalleryFileInfo[]>('/gallery'));
  }

  /**
   * Retrieves a gallery item by filename.
   * @param filename The name of the gallery item to retrieve.
   * @param config Optional Axios request configuration.
   * @returns A Result containing the gallery item as a blob or an error.
   */
  async getGalleryItem(filename: string, config?: AxiosRequestConfig): Promise<Result<Blob>> {
    return tryCatch(this.apiRequestBlob(`/gallery/get/${encodeURIComponent(filename)}`, config));
  }

  /**
   * Generates a URL for retrieving a gallery item.
   * @param filename The name of the gallery item to retrieve.
   * @returns The URL for retrieving the gallery item.
   */
  getGalleryItemUrl(filename: string): string {
    return `${this.baseUrl}/gallery/get/${encodeURIComponent(filename)}`;
  }

  /**
   * Uploads a gallery item to the server.
   * @param file The gallery item to upload.
   * @param config Optional Axios request configuration.
   * @returns A Result containing the filename of the uploaded gallery item or an error.
   */
  async uploadGalleryItem(file: File, config?: AxiosRequestConfig): Promise<Result<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return tryCatch(
      this.apiRequest<string>('/gallery/upload', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      }),
    );
  }

  /**
   * Deletes a gallery item by filename.
   * @param filename The name of the gallery item to delete.
   * @param config Optional Axios request configuration.
   * @returns A Result containing void or an error.
   */
  async deleteGalleryItem(filename: string, config?: AxiosRequestConfig): Promise<Result<void>> {
    return tryCatch(
      this.apiRequest<void>(`/files/delete/${encodeURIComponent(filename)}?gallery=true`, {
        method: 'DELETE',
        ...config,
      }),
    );
  }

  // --------------------------------------------------------------------------
  // Page Visits API
  // --------------------------------------------------------------------------

  /**
   * Tracks a page visit for a specific visitor.
   * @param id The unique ID of the visitor.
   * @returns A Result containing the page visits response or an error.
   */
  async trackPageVisit(id: string): Promise<Result<PageVisitsResponse>> {
    return tryCatch(this.apiRequest<PageVisitsResponse>(`/page-visits/${encodeURIComponent(id)}`));
  }

  // --------------------------------------------------------------------------
  // System Prompt API
  // --------------------------------------------------------------------------

  /**
   * Retrieves the system prompt.
   * @returns A Result containing the system prompt or an error.
   */
  async getSystemPrompt(): Promise<Result<string>> {
    return tryCatch(this.apiRequest<string>('/system-prompt'));
  }
}

// ============================================================================
// Default Instance (for simple use cases)
// ============================================================================

const glovedApi = new GlovedApi();
export default glovedApi;
