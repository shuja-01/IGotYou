# AGENT.md - "I Got You!" Food Suitability & Health Advisor

## 1. Project Overview & Objective
Build a full-stack React web application named **"I Got You!"** designed for Vercel deployment. The app allows users to create personal profiles, record health/medical conditions via a checklist, and search/browse commercial food items (e.g., Uncle Chipps, Dutch Lady Milk, Parle-G) to get instant evaluations on whether a product is safe, requires moderation, or is harmful based on their health profile.

---

## 2. Tech Stack & Infrastructure
* **Frontend/Framework:** Next.js (React 19 / App Router) with Tailwind CSS + Lucide Icons + Shadcn UI patterns.
* **Database & Auth:** Supabase (PostgreSQL with built-in Auth & Row-Level Security) or Firebase/Neon Postgres. Supabase is preferred for Vercel compatibility and free-tier scale.
* **Deployment Target:** Vercel (Edge/Serverless compatible, zero manual build steps).
* **State Management:** React Context API or Zustand.

---

## 3. Data Schema & Architecture

### A. Profiles Table (`profiles` / `users`)
* `id` (UUID, Primary Key, linked to Auth)
* `email` (String)
* `full_name` (String)
* `conditions` (Array of Strings / JSONB)
  * Default selectable options:
    * `diabetes_type_2` (Diabetes / High Blood Sugar)
    * `hypertension` (High Blood Pressure)
    * `hypotension` (Low Blood Pressure)
    * `high_cholesterol` (Hyperlipidemia)
    * `uric_acid_gout` (High Uric Acid / Gout)
    * `lactose_intolerance` (Lactose Sensitivity)
    * `gluten_sensitivity` (Celiac / Gluten Sensitivity)
* `created_at` (Timestamp)

### B. Products Table (`products`)
* `id` (UUID / Serial, Primary Key)
* `name` (String, e.g., "Uncle Chipps Spicy Treat")
* `brand` (String, e.g., "Uncle Chipps", "Dutch Lady", "Britannia", "Nestlé")
* `category` (String, e.g., "Beverages", "Snacks", "Dairy", "Biscuits", "Dishes")
* `image_url` (String)
* `nutrition_per_100g` (JSONB):
  * `calories` (Number)
  * `sugar_g` (Number)
  * `sodium_mg` (Number)
  * `saturated_fat_g` (Number)
  * `trans_fat_g` (Number)
  * `cholesterol_mg` (Number)
  * `contains_lactose` (Boolean)
  * `contains_gluten` (Boolean)
  * `purine_level` ("low" | "medium" | "high")
* `harmful_tags` (Array of Strings: `["high_sugar", "high_sodium", "high_saturated_fat", "lactose", "gluten"]`)

### C. Evaluation Engine Logic
A rule-based evaluation function that compares user conditions against product attributes:
* **Diabetes:** Trigger warning if `sugar_g > 10g` or `harmful_tags` contains `high_sugar`.
* **High BP (Hypertension):** Trigger warning if `sodium_mg > 400mg` or `harmful_tags` contains `high_sodium`.
* **Low BP (Hypotension):** Flag high-caffeine / excessive dehydrating snacks, note safe sodium levels.
* **High Cholesterol:** Trigger warning if `saturated_fat_g > 5g` or `trans_fat_g > 0.5g`.
* **Lactose Intolerance:** Trigger warning if `contains_lactose` is `true`.
* **Output Status:** 
  * 🟢 **Safe / Good to Go** (No matching condition triggers)
  * 🟡 **Consume with Caution** (Borderline values, recommends portion size limit)
  * 🔴 **Harmful / Avoid** (Matches active user condition flags)

---

## 4. UI/UX Flow & Key Pages

### 1. Auth & Onboarding Flow (`/onboarding` or Modal)
* Interactive checklist asking: *"Do you have any of the following health conditions?"*
* Clean checkboxes with clear descriptions.
* Saves selections immediately to user profile in DB.

### 2. Product Explorer / Dashboard (`/products` or `/`)
* **Header / Status Pill:** Shows active user conditions with a quick "Edit Profile" button.
* **Country Selector:** Switch between 🇮🇳 India, 🇲🇾 Malaysia, 🇸🇬 Singapore, 🇮🇩 Indonesia.
* **Search & Filter Bar:** Search by brand, name, or category with real-time debounced query.
* **Product & Dish Card Grid:**
  * Product image, brand name, and title.
  * Personalized dynamic badge: **Safe**, **Caution**, or **Harmful**.
  * Quick-view trigger for details.

### 3. Product Detail View (`/products/[id]` or Slide-over Drawer)
* Full nutritional facts table.
* **"Why this affects you" section:** Highlight specific ingredients/nutrients that conflict with the user's selected conditions.
* Quantity recommendation guidelines.

---

## 5. Seed Dataset Requirements (At least 50 Products)
Agent must create a seed script `seed_products.json` containing **at least 50 common real-world packaged items**, including:
1. **Snacks & Chips:** Uncle Chipps, Lay's Classic, Kurkure Masala Munch, Doritos, Pringles, Haldiram's Bhujia, Bingo Mad Angles, etc.
2. **Biscuits & Cookies:** Parle-G, Oreo, Britannia Bourbon, Sunfeast Dark Fantasy, Good Day Butter, Marie Gold, Monaco, digestive cookies.
3. **Dairy & Milk Drinks:** Dutch Lady Full Cream Milk, Dutch Lady Low Fat, Amul Taaza, Amul Gold, Yakult, Epigamia Greek Yogurt, Nestlé Nespray, Milo Ready-to-Drink.
4. **Soft Drinks & Juices:** Coca-Cola, Diet Coke, Tropicana Orange Juice, Real Mixed Fruit, Red Bull, Sprite.
5. **Instant Foods & Cereals:** Maggi 2-Minute Noodles, Kellogg's Corn Flakes, Quaker Oats, Knorr Soups, Top Ramen.
6. **Chocolates & Spreads:** Cadbury Dairy Milk, KitKat, Nutella, Peanut Butter (Smooth/Unsweetened).
7. **Countrywise Traditional Dishes:** Nasi Lemak, Chole Bhature, Samosa, Hainanese Chicken Rice, Nasi Goreng, Rendang, Satay, Laksa, Dosa, Bak Kut Teh.

---

## 6. Implementation Steps for the Agent

1. **Project Scaffolding:**
   - Initialize Next.js project with Tailwind and required icons.
   - Configure Supabase / local mock DB fallback for standalone offline development.
2. **Database Migration & Seeding:**
   - Create tables for users, profiles, and products.
   - Execute seed script with detailed commercial products & dishes.
3. **Logic Implementation:**
   - Implement `/lib/healthRules.ts` to compute suitability scores and highlight harmful ingredients dynamically.
4. **UI Construction:**
   - Build Profile Selection Screen, Product Grid, Search Filter, and Product Detail Modal.
5. **End-to-End Testing:**
   - Test diabetic profile querying high-sugar biscuit (must flag **Harmful**).
   - Test hypertensive profile querying high-sodium chips (must flag **Harmful**).
   - Test healthy/unselected profile (must flag **Safe**).
   - Ensure responsive mobile and desktop layout.

---

## 7. Daily Calorie & Macro Calculator Specification

### A. Input Parameters
* **Age** (Years, 10–100)
* **Gender** (Male / Female)
* **Height** (cm or ft/inches)
* **Weight** (kg or lbs)
* **Activity Level:**
  * Sedentary (x1.2)
  * Lightly Active (x1.375)
  * Moderately Active (x1.55)
  * Very Active (x1.725)
  * Extra Active (x1.9)
* **Goal:**
  * Maintain Weight
  * Mild Weight Loss (-250 kcal/day)
  * Weight Loss (-500 kcal/day)
  * Muscle / Weight Gain (+500 kcal/day)

### B. Scientific Formula (Mifflin-St Jeor)
$$\text{BMR (Male)} = 10 \times \text{weight} + 6.25 \times \text{height} - 5 \times \text{age} + 5$$
$$\text{BMR (Female)} = 10 \times \text{weight} + 6.25 \times \text{height} - 5 \times \text{age} - 161$$
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$

### C. Recommended Output Targets
* **Daily Calories Target** (kcal)
* **Protein Target** (g) — $1.8\text{g} - 2.2\text{g}$ per kg
* **Fats Target** (g) — $25\%$ of calories
* **Carbohydrates Target** (g) — Remaining calories
* **Water Intake Target** (Liters) — $35\text{ml}$ per kg bodyweight
* **Max Daily Sodium Limit** (mg) — 2,000mg max
* **Max Daily Added Sugar Limit** (g) — 25g (women) / 36g (men)