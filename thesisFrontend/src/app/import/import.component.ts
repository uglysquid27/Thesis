import { Component, ElementRef, ViewChild } from '@angular/core';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/svg+xml',
];

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  allowedFileTypes = ALLOWED_FILE_TYPES;

  isUploading = false;
  fileUrl!: string | null;
  uploadFile!: File | null;

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
    // logic to upload file
  }
}
