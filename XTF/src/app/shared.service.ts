// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private imageURLSubject = new BehaviorSubject<string | undefined>(undefined);
  imageURL$ = this.imageURLSubject.asObservable();

  setImage(imageURL: string) {
    this.imageURLSubject.next(imageURL);
    console.log('Image URL set:', imageURL);
  }

  getImage(): string | undefined {
    // The component should subscribe to the imageURL$ observable to receive updates
    console.log('Getting Image URL.');
    return this.imageURLSubject.getValue();
  }
}
