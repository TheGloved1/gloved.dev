import { tool } from 'ai';
import JSZip from 'jszip';
import { z } from 'zod';
import { upload } from '../utils';

export const uploadFile = tool({
  description: 'Upload a file to return a downloadable link',
  parameters: z
    .object({
      fileName: z.string().describe('The file name including file extension (can include slashes to create directories)'),
      fileContent: z.string().describe('The file content to upload'),
    })
    .describe('The file content to upload'),
  async execute({ fileContent, fileName }) {
    const response = await upload(new File([fileContent], fileName));
    return { fileUrl: response };
  },
});

export const uploadZipFile = tool({
  description: 'Upload multiple files as a zip to return a downloadable link',
  parameters: z
    .object({
      zipName: z.string().describe('The name of the zip file without extension'),
      files: z
        .array(
          z
            .object({
              fileName: z
                .string()
                .describe('The file name including file extension (can include slashes to create directories)'),
              fileContent: z.string().describe('The file content'),
            })
            .describe('The file content to upload'),
        )
        .describe('The files to upload'),
    })
    .describe('The name of the zip file, and the files to upload'),
  async execute({ zipName, files }) {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.fileName, file.fileContent);
    }
    const content: Buffer<ArrayBufferLike> = await zip.generateAsync({ type: 'nodebuffer' });
    const file = new File([content], `${zipName}.zip`, { type: 'application/zip' });
    const response = await upload(file);
    return { fileUrl: response };
  },
});
