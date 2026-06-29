import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  private baseUrl = '/api/trips';

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.baseUrl);
  }

  getTrip(tripId: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/${tripId}`);
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.baseUrl, trip);
  }

  updateTrip(tripId: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.baseUrl}/${tripId}`, trip);
  }

  deleteTrip(tripId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${tripId}`);
  }
}