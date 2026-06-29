import { Component, OnInit } from '@angular/core';
import { Trip } from '../../models/trip';
import { TripDataService } from '../../services/trip-data.service';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html'
})
export class TripListComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;
  error = '';

  constructor(private tripService: TripDataService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getTrips().subscribe({
      next: (data: Trip[]) => {
        this.trips = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load trips.';
        this.loading = false;
      }
    });
  }

  handleDeleted(): void {
    this.loadTrips();
  }
}