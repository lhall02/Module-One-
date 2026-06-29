import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component stubs to satisfy routing imports when actual component files are missing.
// Replace these with real component imports when components are available.
export class TripListComponent {}
export class TripAddComponent {}
export class TripEditComponent {}

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