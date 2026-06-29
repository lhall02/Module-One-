import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Trip } from '../../models/trip';
import { TripDataService } from '../../services/trip-data';

@Component({
  selector: 'app-trip-edit',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trip-edit.html'
})
export class TripEditComponent implements OnInit {
  tripId = '';
  trip: Trip | null = null;
  loading = true;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('tripId') || '';
    this.tripService.getTrip(this.tripId).subscribe({
      next: (data: Trip) => {
        // convert date to YYYY-MM-DD if needed
        const start = data.start ? String(data.start).substring(0, 10) : '';
        this.trip = { ...data, start };
        this.loading = false;
      },
      error: () => {
        alert('Could not load trip.');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.trip) return;
    this.saving = true;

    this.tripService.updateTrip(this.tripId, this.trip).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/trips']);
      },
      error: () => {
        this.saving = false;
        alert('Update failed.');
      }
    });
  }
}
