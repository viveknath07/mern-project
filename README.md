# ShopKart

Full-stack e-commerce app built across Lab-01 to Lab-03: authentication (Lab-02) plus product catalog & discovery (Lab-03).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT + httpOnly cookie auth — MVC structure
- **Frontend:** React 19, React Router 7, Axios, Vite

## Setup

### 1. Backend

```bash
cd backend
npm install
npm run dev        # runs on http://localhost:8080
```

Set your MongoDB connection in `backend/.env`:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=shopkart_secret_key
```

To use MongoDB Atlas instead, put your `mongodb+srv://...` URI in `MONGO_URI`
(and whitelist your IP under Atlas → Network Access).

Seed the catalog with 10 sample products:

```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # opens on http://localhost:5173
```

## Features

- Register / Login / Logout / Profile / Change password (JWT cookie auth)
- Product listing page with dynamic cards (`/products`)
- Live search (debounced), category filter, price sort
- Product details page (`/products/:id`)
- Loading, error and empty states everywhere data is fetched

## API

Base URL: `http://localhost:8080` (the Vite dev server proxies `/api/*` to it)

### Auth

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/customers/register` | – | Create account |
| POST | `/customers/login` | – | Login (sets cookie) |
| GET | `/customers/me` | ✓ | Current profile |
| POST | `/customers/logout` | ✓ | Clear cookie |
| PATCH | `/customers/change-password` | ✓ | Change password |

### Products

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/products` | Create product (201; 400 on validation errors) |
| GET | `/products` | List products with `{ success, count, products }` |
| GET | `/products/:id` | Single product (400 invalid id, 404 not found) |

Query parameters on `GET /products`:

- `search=keyboard` — case-insensitive match on product name
- `category=Electronics` — exact category filter
- `sort=price_asc` / `sort=price_desc` — sort by price (bonus)

Examples:

```
GET /products?search=phone
GET /products?category=Electronics
GET /products?search=phone&category=Electronics
GET /products?sort=price_asc
```

Create product body:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

Validation: all fields required, `price > 0`, `stock >= 0`, `createdAt` automatic.

## Project Structure

```text
backend/
├── controllers/        # customer + product controllers
├── models/             # customer + product Mongoose schemas
├── routes/             # customer + product routers
├── middlewares/        # isAuthenticated (JWT cookie)
├── utils/              # generateToken, seedProducts
└── index.js

frontend/src/
├── pages/              # Login, Register, Home, Products, ProductDetails
├── components/         # Navbar, ProductCard, SearchBar, route guards
├── context/            # AuthContext
├── services/api.js     # axios instance + product service functions
└── main.jsx / App.jsx  # routes
```

## Frontend Routes

| Route | Page |
|---|---|
| `/login` | Login |
| `/register` | Register |
| `/home` | Home (protected) |
| `/products` | Product listing (protected) |
| `/products/:id` | Product details (protected) |

> Note: the frontend calls `/api/products` etc. and the Vite dev server rewrites
> `/api/*` → backend, so page routes like `/products` never collide with API paths.
# mern-project
# mern-project
