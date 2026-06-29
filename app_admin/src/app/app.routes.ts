import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TripAddComponent } from './components/trip-add/trip-add';
import { TripEditComponent } from './components/trip-edit/trip-edit';
import { TripListComponent } from './components/trip-list/trip-list';

export const routes: Routes = [
  { path: '', redirectTo: 'trips', pathMatch: 'full' },
  { path: 'trips', component: TripListComponent },
  { path: 'trips/add', component: TripAddComponent },
  { path: 'trips/edit/:tripId', component: TripEditComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
