import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'splash',
    loadChildren: () =>
      import('./pages/common/splash/splash.module').then(
        (m) => m.SplashPageModule
      ),
  },
  {
    path: 'activation',
    loadChildren: () =>
      import('./pages/common/activation/activation.module').then(
        (m) => m.ActivationPageModule
      ),
  },
  {
    path: 'choosemode',
    loadChildren: () =>
      import('./pages/common/choosemode/choosemode.module').then(
        (m) => m.ChoosemodePageModule
      ),
  },
  {
    path: 'offline-settings',
    loadChildren: () =>
      import('./pages/offline/settings/settings.module').then(
        (m) => m.SettingsPageModule
      ),
  },
  {
    path: 'offline-dashboard',
    loadChildren: () =>
      import('./pages/offline/dashboard/dashboard.module').then(
        (m) => m.DashboardPageModule
      ),
  },
  {
    path: 'offline-room-details',
    loadChildren: () =>
      import('./pages/offline/room-details/room-details.module').then(
        (m) => m.RoomDetailsPageModule
      ),
  },
  {
    path: 'offline-department',
    loadChildren: () =>
      import('./pages/offline/department/department.module').then(
        (m) => m.DepartmentPageModule
      ),
  },
  {
    path: 'offline-department-edit/:id',
    loadChildren: () =>
      import('./pages/offline/department-edit/department-edit.module').then(
        (m) => m.DepartmentEditPageModule
      ),
  },
  {
    path: 'offline-department-add',
    loadChildren: () =>
      import('./pages/offline/department-add/department-add.module').then(
        (m) => m.DepartmentAddPageModule
      ),
  },
  {
    path: 'offline-events-calendar',
    loadChildren: () =>
      import('./pages/offline/events-calendar/events-calendar.module').then(
        (m) => m.EventsCalendarPageModule
      ),
  },
  {
    path: 'offline-event-add-modal',
    loadChildren: () =>
      import('./pages/offline/event-add-modal/event-add-modal.module').then(
        (m) => m.EventAddModalPageModule
      ),
  },
  {
    path: 'offline-event-edit-modal',
    loadChildren: () =>
      import('./pages/offline/event-edit-modal/event-edit-modal.module').then(
        (m) => m.EventEditModalPageModule
      ),
  },
  {
    path: 'offline-change-password',
    loadChildren: () =>
      import('./pages/offline/change-password/change-password.module').then(
        (m) => m.ChangePasswordPageModule
      ),
  },
  {
    path: 'offline-dashboard-available',
    loadChildren: () =>
      import(
        './pages/offline/dashboard-available/dashboard-available.module'
      ).then((m) => m.DashboardAvailablePageModule),
  },
  {
    path: 'offline-dashboard-pending',
    loadChildren: () =>
      import('./pages/offline/dashboard-pending/dashboard-pending.module').then(
        (m) => m.DashboardPendingPageModule
      ),
  },
  {
    path: 'offline-dashboard-occupied',
    loadChildren: () =>
      import(
        './pages/offline/dashboard-occupied/dashboard-occupied.module'
      ).then((m) => m.DashboardOccupiedPageModule),
  },
  {
    path: 'offline-event-list-modal',
    loadChildren: () =>
      import('./pages/offline/event-list-modal/event-list-modal.module').then(
        (m) => m.EventListModalPageModule
      ),
  },
  {
    path: 'offline-event-book-modal',
    loadChildren: () =>
      import('./pages/offline/event-book-modal/event-book-modal.module').then(
        (m) => m.EventBookModalPageModule
      ),
  },
  {
    path: 'offline-event-extend-modal',
    loadChildren: () =>
      import(
        './pages/offline/event-extend-modal/event-extend-modal.module'
      ).then((m) => m.EventExtendModalPageModule),
  },
  {
    path: 'online-room-details',
    loadChildren: () =>
      import('./pages/online/room-details/room-details.module').then(
        (m) => m.RoomDetailsPageModule
      ),
  },
  {
    path: 'online-dashboard',
    loadChildren: () =>
      import('./pages/online/dashboard/dashboard.module').then(
        (m) => m.DashboardPageModule
      ),
  },
  {
    path: 'online-dashboard-available',
    loadChildren: () =>
      import(
        './pages/online/dashboard-available/dashboard-available.module'
      ).then((m) => m.DashboardAvailablePageModule),
  },
  {
    path: 'online-dashboard-occupied',
    loadChildren: () =>
      import(
        './pages/online/dashboard-occupied/dashboard-occupied.module'
      ).then((m) => m.DashboardOccupiedPageModule),
  },
  {
    path: 'online-dashboard-pending',
    loadChildren: () =>
      import('./pages/online/dashboard-pending/dashboard-pending.module').then(
        (m) => m.DashboardPendingPageModule
      ),
  },
  {
    path: 'online-change-password',
    loadChildren: () =>
      import('./pages/online/change-password/change-password.module').then(
        (m) => m.ChangePasswordPageModule
      ),
  },
  {
    path: 'online-department',
    loadChildren: () =>
      import('./pages/online/department/department.module').then(
        (m) => m.DepartmentPageModule
      ),
  },
  {
    path: 'online-department-add',
    loadChildren: () =>
      import('./pages/online/department-add/department-add.module').then(
        (m) => m.DepartmentAddPageModule
      ),
  },
  {
    path: 'online-department-edit/:id',
    loadChildren: () =>
      import('./pages/online/department-edit/department-edit.module').then(
        (m) => m.DepartmentEditPageModule
      ),
  },
  {
    path: 'online-event-add-modal',
    loadChildren: () =>
      import('./pages/online/event-add-modal/event-add-modal.module').then(
        (m) => m.EventAddModalPageModule
      ),
  },
  {
    path: 'online-event-book-modal',
    loadChildren: () =>
      import('./pages/online/event-book-modal/event-book-modal.module').then(
        (m) => m.EventBookModalPageModule
      ),
  },
  {
    path: 'online-event-edit-modal',
    loadChildren: () =>
      import('./pages/online/event-edit-modal/event-edit-modal.module').then(
        (m) => m.EventEditModalPageModule
      ),
  },
  {
    path: 'online-event-extend-modal',
    loadChildren: () =>
      import(
        './pages/online/event-extend-modal/event-extend-modal.module'
      ).then((m) => m.EventExtendModalPageModule),
  },
  {
    path: 'online-event-list-modal',
    loadChildren: () =>
      import('./pages/online/event-list-modal/event-list-modal.module').then(
        (m) => m.EventListModalPageModule
      ),
  },
  {
    path: 'online-events-calendar',
    loadChildren: () =>
      import('./pages/online/events-calendar/events-calendar.module').then(
        (m) => m.EventsCalendarPageModule
      ),
  },
  {
    path: 'online-settings',
    loadChildren: () =>
      import('./pages/online/settings/settings.module').then(
        (m) => m.SettingsPageModule
      ),
  },
  {
    path: 'change-logo-modal',
    loadChildren: () =>
      import('./pages/common/change-logo-modal/change-logo-modal.module').then(
        (m) => m.ChangeLogoModalPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
