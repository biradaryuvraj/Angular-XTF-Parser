// app.component.ts
import { Component } from '@angular/core';
import { SharedService } from './shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imageURL: string | undefined;

  constructor(private sharedService: SharedService) {
    this.sharedService.imageURL$.subscribe((imageURL) => {
      this.imageURL = imageURL;
      console.log('Received updated Image URL:', this.imageURL);
    });
  }

  ngOnInit() {
    console.log('Initial Image URL:', this.imageURL);
  }
}
