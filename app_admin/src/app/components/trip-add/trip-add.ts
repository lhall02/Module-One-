import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Trip } from '../../models/trip';
import { TripDataService } from '../../services/trip-data.service';

@Component({
  selector: 'app-trip-add',
  templateUrl: './trip-add.component.html'
})
export class TripAddComponent {
  trip: Trip = {
    name: '',
    code: '',
    length: '',
    start: '',
    resort: '',
    perPerson: 0,
    image: '',
    description: ''
  };

  saving = false;

  constructor(private tripService: TripDataService, private router: Router) {}

  save(): void {
    this.saving = true;
    this.tripService.addTrip(this.trip).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/trips']);
      },
      error: () => {
        this.saving = false;
        alert('Add trip failed. Check required fields and unique trip code.');
      }
    });
  }
}