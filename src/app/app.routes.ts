import { Routes } from '@angular/router';
import { LeadCrmComponent } from './lead-crm/lead-crm.component';

export const routes: Routes = [
    { path: '', component: LeadCrmComponent },
    { path: '**', redirectTo: '' }
];
