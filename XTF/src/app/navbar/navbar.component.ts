import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared.service';
import { saveAs } from 'file-saver'; // Import saveAs

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  Import() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.xtf, .XTF'; // Accept both xtf and XTF file formats
    inputElement.onchange = (event: Event) => {
      if (event.target instanceof HTMLInputElement && event.target.files) {
        const file = event.target.files[0];
        if (!file) {
          console.error('No file selected.');
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const backendUrl = 'http://localhost:5000'; // Replace with your Python backend URL
  
        console.log('Uploading file to the backend...');
  
        this.http.post<any>(`${backendUrl}/api/process_xtf`, formData).toPromise()
          .then(
            (response: { imageURL: any; error: any; }) => {
              console.log('Backend response:', response); // Log the entire response from the backend
              // Handle the response from the backend
              if (response.imageURL) {
                // Emit the image URL using the shared service
                this.sharedService.setImage(response.imageURL);
                console.log('Image processing successful. Image URL:', response.imageURL);
              } else {
                console.error('Error processing file:', response.error);
              }
            },
            (error: any) => {
              console.error('Error processing file:', error);
            }
          );
      } else {
        console.error('No file selected.');
      }
    };
    inputElement.click();
  }

  NewProject() {
    // Implement the functionality for creating a new project
    // Open a new window with a blank project page
    window.open('/new-project', '_blank');
  }

  saveAs() {
    const imageURL = this.sharedService.getImage();
    if (imageURL) {
      const fileName = prompt('Enter the file name (without extension):', 'image');
      if (fileName !== null && fileName.trim() !== '') {
        const fileType = prompt('Enter the file type (e.g., png, jpg, jpeg, webp):', 'png');
        if (fileType !== null && fileType.trim() !== '') {
          const fileExtension = `.${fileType}`;
          const completeFileName = `${fileName}${fileExtension}`;
          this.http.get(imageURL, { responseType: 'blob' }).subscribe((imageBlob: Blob) => {
            const file = new File([imageBlob], completeFileName);
            saveAs(file); // Save the image file using file-saver
          });
        } else {
          console.error('Invalid file type.');
        }
      } else {
        console.error('Invalid file name.');
      }
    } else {
      console.error('No image to save.');
    }
  }
}