import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Trip } from '../../models/trip';
import { TripDataService } from '../../services/trip-data';

@Component({
  selector: 'app-trip-card',
  imports: [RouterLink],
  templateUrl: './trip-card.html'
})
export class TripCardComponent {
  @Input() trip!: Trip;
  @Output() deleted = new EventEmitter<void>();

  deleting = false;

  constructor(private tripService: TripDataService) {}

  onDelete(): void {
    if (!this.trip._id) return;
    if (!confirm(`Delete "${this.trip.name}"?`)) return;

    this.deleting = true;
    this.tripService.deleteTrip(this.trip._id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleted.emit();
      },
      error: () => {
        this.deleting = false;
        alert('Delete failed.');
      }
    });
  }
}
