import { Component, ElementRef, ViewChild } from '@angular/core';
import { CountService } from '../service/CountService';

const ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'text/x-csv',
  'text/plain'
];
@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  constructor(private service: CountService){}

  allowedFileTypes = ALLOWED_FILE_TYPES;

  isUploading = false;
  fileUrl!: string | null;
  uploadFile!: File | null;
  errorMessage: string | null = null;
  uploadStatus: string | null = null;

  handleChange(event: any) {
    const file = event.target.files[0] as File;
    this.fileUrl = URL.createObjectURL(file);
    this.uploadFile = file;
  }

  handleRemovesFile() {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }

    this.uploadFile = null;
    this.fileUrl = null;
  }

  handleUploadFile() {
    if (!this.uploadFile) {
      this.errorMessage = 'No file selected for upload.';
      return;
    }

    this.isUploading = true;
    this.uploadStatus = 'Uploading...';

    this.service.uploadFile(this.uploadFile).subscribe(
      response => {
        this.isUploading = false;
        this.uploadStatus = 'File uploaded successfully';
        this.handleRemovesFile();
      },
      error => {
        this.isUploading = false;
        this.uploadStatus = 'Error uploading file.';
        console.error('Upload error:', error);
      }
    );
  }
}
