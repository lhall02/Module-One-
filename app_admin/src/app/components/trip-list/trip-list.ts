import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Trip } from '../../models/trip';
import { TripDataService } from '../../services/trip-data';
import { TripCardComponent } from '../trip-card/trip-card';

@Component({
  selector: 'app-trip-list',
  imports: [CommonModule, RouterLink, TripCardComponent],
  templateUrl: './trip-list.html'
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
