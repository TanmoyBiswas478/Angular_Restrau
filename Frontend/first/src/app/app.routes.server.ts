import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server render modes.
 *
 * This app authenticates using sessionStorage, which exists ONLY in the
 * browser. Any page rendered on the server therefore looks "logged out": the
 * component's ngOnInit sees no user and bounces to /login (the 302 you saw when
 * refreshing /profile).
 *
 * Client rendering fixes this: the server just serves a static app shell and
 * the browser — where sessionStorage IS available — does the routing, runs the
 * guards, and loads the data. Refreshing a protected page now stays put.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Client }
];

/*
 * OPTIONAL — keep your PUBLIC pages prerendered (faster first paint) and only
 * client-render the private ones. Swap the block above for this if you want it:
 *
 * export const serverRoutes: ServerRoute[] = [
 *   { path: 'profile',         renderMode: RenderMode.Client },
 *   { path: 'dashboard',       renderMode: RenderMode.Client },
 *   { path: 'my-orders',       renderMode: RenderMode.Client },
 *   { path: 'chef/dashboard',  renderMode: RenderMode.Client },
 *   { path: 'admin/dashboard', renderMode: RenderMode.Client },
 *   { path: 'inventory',       renderMode: RenderMode.Client },
 *   { path: 'deliveries',      renderMode: RenderMode.Client },
 *   { path: 'employees',       renderMode: RenderMode.Client },
 *   { path: 'admin-settings',  renderMode: RenderMode.Client },
 *   { path: 'membership',      renderMode: RenderMode.Client },
 *   { path: '**',              renderMode: RenderMode.Prerender }, // public pages
 * ];
 */