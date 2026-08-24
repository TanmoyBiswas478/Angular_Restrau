# New Roles Setup — Delivery Executive, Store Manager, Kitchen Assistant

This adds the 3 remaining staff portals to the food-ordering app. The other 3 roles
(Admin, Chef, Customer) are untouched.

---

## 1. Backend setup (run inside `foodie-backend/`)

```bash
# a) Apply the new migrations (safe & idempotent — guarded by hasColumn/hasTable)
php artisan migrate

# b) Seed the 3 demo staff accounts + a "Main Branch" store
php artisan db:seed --class=NewRolesSeeder
```

If routes look cached on your server, refresh them:

```bash
php artisan route:clear
php artisan config:clear
```

### What the migrations do
- `..._add_new_role_fields_safely.php`
  - `employees.availability` (default `Offline`) — Delivery Executive Online/Offline toggle
  - `employees.store_id` (nullable) — Store Manager branch foundation
  - `deliverys.driver_eid` (nullable) — reliable delivery assignment by employee ID
- `..._create_stores_table.php`
  - creates `stores` (id, name, code, address, phone, manager_eid, status) and seeds one **Main Branch / MAIN** row

Both are re-runnable: existing columns/tables are skipped, so no data is lost.

---

## 2. Demo logins (password is `1234` for all)

| Role                | Email                 | EID    | Lands on                        |
|---------------------|-----------------------|--------|---------------------------------|
| Delivery Executive  | delivery@foodie.test  | EID201 | `/delivery/dashboard`           |
| Store Manager       | manager@foodie.test   | EID202 | `/store-manager/dashboard`      |
| Kitchen Assistant   | kitchen@foodie.test   | EID203 | `/kitchen-assistant/dashboard`  |

All three log in through the **normal** login page (not the admin portal).

---

## 3. What each portal does

**Delivery Executive** (`/delivery/dashboard`)
- Online/Offline availability toggle (must be Online to accept orders)
- "Available" tab: unassigned orders any online partner can accept
- "My Deliveries" tab: orders assigned to this partner (by EID)
- Update status: Out for Delivery → Delivered
- Stat cards: active / delivered / available counts

**Store Manager** (`/store-manager/dashboard`)
- Sales summary (total & today's revenue / orders)
- Operations (pending deliveries, delivered today)
- Staff counts (total / active)
- Inventory health (total / low-stock / out-of-stock)
- Recent orders panel + low-stock watch panel
- Action tiles jump to Inventory, Staff, Deliveries
- Multi-branch ready: a `stores` table exists; single "Main Branch" is used for now

**Kitchen Assistant** (`/kitchen-assistant/dashboard`)
- View / search kitchen stock (shares the same `kitchenstocks` table as the Chef)
- Deduct used stock (with quantity validation; can't go below zero)
- Send restock requests to Admin (mirrors the Chef's request flow)
- Assistant can only deduct/request — cannot add new ingredients (that stays with the Chef)

---

## 4. API endpoints added (`routes/api.php`)

```
GET  delivery-partner/available
GET  delivery-partner/{eid}/assigned
GET  delivery-partner/{eid}/me
PUT  delivery-partner/accept/{id}
PUT  delivery-partner/status/{id}
PUT  delivery-partner/{eid}/availability

GET  store-manager/summary
GET  stores
POST stores

GET  kitchen-assistant/stocks
PUT  kitchen-assistant/deduct/{id}
PUT  kitchen-assistant/request/{id}
```

---

## 5. Files added / changed

**Backend — new**
- `app/Http/Controllers/Api/DeliveryPartnerController.php`
- `app/Http/Controllers/Api/StoreManagerController.php`
- `app/Http/Controllers/Api/KitchenAssistantController.php`
- `app/Models/Store.php`
- `database/migrations/2026_08_24_100000_add_new_role_fields_safely.php`
- `database/migrations/2026_08_24_100100_create_stores_table.php`
- `database/seeders/NewRolesSeeder.php`

**Backend — edited**
- `app/Http/Controllers/Api/LoginController.php` — now issues a session for every staff role (previously only Admin/Chef/Customer could log in)
- `app/Models/Employee.php` — added `availability`, `store_id` to `$fillable`
- `app/Models/Delivery.php` — added `driver_eid` to `$fillable`
- `routes/api.php` — imports + 12 routes above

**Frontend — new** (`Frontend/first/src/app/`)
- `services/delivery-partner.ts`, `services/store-manager.ts`, `services/kitchen-assistant.ts`
- `pages/delivery-executive/` (ts/html/css)
- `pages/store-manager/` (ts/html/css)
- `pages/kitchen-assistant/` (ts/html/css)

**Frontend — edited**
- `app.routes.ts` — 3 new protected routes
- `components/navbar/navbar.ts` — role-aware nav links (Kitchen Assistant checked before Chef)
- `pages/login/login.ts` — role-aware redirect after login
- `login.guard.ts` — role-aware redirect for already-logged-in users

---

## 6. Quick smoke test

1. `php artisan migrate && php artisan db:seed --class=NewRolesSeeder`
2. Start Laravel (`php artisan serve` / your ngrok setup) and the Angular app (`ng serve`).
3. Log in as each demo account above and confirm you land on the right dashboard.
4. Delivery: toggle Online → accept an available order → mark Delivered.
5. Kitchen Assistant: deduct a stock item → send a restock request.
6. Store Manager: confirm the summary numbers load.
