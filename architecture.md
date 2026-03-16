# Project Architecture and Knowledge Base
## Teoberbic Senior Capstone Project

### Overview
This project is a full-stack web application designed to track, manage, and analyze fashion brands, their collections, products, and social media presence. It aggregates data using web scraping, stores historical product data (such as price history), and provides data visualization and analytics on the frontend. 

### Tech Stack & Languages
#### Languages
- **JavaScript (ES6+)**: Used across both the frontend and backend.
- **HTML5/CSS3**: Used for structuring and styling the frontend UI.

#### Frontend (Client-Side)
- **Framework**: React.js (v19)
- **Build Tool**: Vite
- **Routing**: React Router DOM (v7) for client-side routing.
- **Charting/Analytics**: Recharts (v3.7) for rendering price history and analytics charts.
- **Icons**: Lucide React.
- **Styling**: Vanilla CSS (`App.css`, `index.css`) with responsive design.

#### Backend (Server-Side)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM (v8.19) for schema definition and queries.
- **Web Scraping**: Apify Client (v2.21) used to extract data from Shopify stores and social media.
- **Task Scheduling**: Node-cron (v4.2) for running daily automated background jobs (e.g., scraping new products).
- **HTTP Client**: Axios for making external API requests.
- **Environment Management**: dotenv.
- **Logging/Utility**: Morgan (logging), Cookie-Parser, Http-Errors.

---

### System Architecture

The project follows a standard decoupled Client-Server architecture:

1. **Frontend Presentation Layer**: A Single Page Application (SPA) built with React that communicates with the backend via RESTful APIs. It manages its own routing and state.
2. **Backend API Layer**: An Express server that exposes REST endpoints (`/brands`, `/collections`, `/products`, `/analytics`, `/social-posts`). It handles business logic, triggers manual scrapes, and processes data.
3. **Data Layer**: MongoDB stores normalized documents for Brands, Collections, Products, and Social Posts.
4. **Background Worker / Scraper Layer**: Scheduled cron jobs (`jobs/cron.js`) utilize Apify to scrape external Shopify websites and social platforms, periodically updating the MongoDB database with new products or price changes.

---

### Key Data Models (Schema)

- **Brand**: Represents a clothing brand. Contains metadata, website URLs, and social media handles.
- **Collection**: Represents a specific release or season from a brand. Associated with a parent Brand. 
- **Product**: Represents an individual clothing item. Contains references to its Brand and Collection, Shopify ID, title, handle, tags, product type, current price, currency, images, and a `priceHistory` array to track price fluctuations over time.
- **SocialPost**: Represents a social media post related to a brand, storing media URLs, captions, and platform information.

---

### Core Features

#### 1. Brand & Collection Management
- **Brand Registry**: Add, view, and manage different brands.
- **Brand Details & Analytics**: View a specific brand's basic info, average product prices, and associated collections.
- **Brand Comparison**: A dedicated `BrandComparer` page allows side-by-side comparison of multiple brands' metrics.

#### 2. Product Tracking & Price History
- **Product Catalog**: Browse all scraped products or filter by brand/collection.
- **Detailed Product Views**: individual product pages showing image carousels, tags, categories, and direct links to the original store.
- **Price Tracking**: Visualizes how a product's price has changed over time using an interactive chart powered by Recharts (`ProductDetails.jsx`).
- **Automated Categorization**: Custom scripts automatically categorize products (e.g., identifying "Tees" and tagging their `product_type` as "t-shirt").
- **Metadata Editing**: UI support for editing tags, product types, and other metadata on the detail pages. Live USD conversion display alongside native currency prices.

#### 3. Automated Data Aggregation (Scraping)
- **Shopify Integration**: Scrapes product catalogs directly from Shopify-powered storefronts using Apify.
- **Cron Jobs**: Automated daily background jobs refresh product listings and update prices.
- **Manual Triggers**: Backend routes and CLI scripts (`manualScrape.js`) permit manual bypassing of cron schedules to trigger immediate scrapes for specific brands or social media posts.

#### 4. Social Media Feed
- **Social Dashboard**: A centralized feed displaying social posts from tracked brands.
- **Instagram Embeds**: Dedicated components (`InstagramEmbed.jsx`) to natively render Instagram content.

#### 5. Data Analytics
- **Aggregated Metrics**: Backend `/analytics` routes calculate average prices across entire brands or specific categories (like t-shirts or hoodies).
- **Frontend Visualization**: Charts provide quick insights into brand pricing strategies and product distributions.
