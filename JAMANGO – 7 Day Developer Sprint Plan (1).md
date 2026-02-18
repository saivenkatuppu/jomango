🚀 **JAMANGO** **–** **7** **Day** **Developer** **Sprint** **Plan**

🎯 **Goal**

Launch a working hyperlocal mango commerce platform with:

> ● Customer ordering website
>
> ● Admin dashboard
>
> ● Inventory management
>
> ● Delivery slot system
>
> ● Stall POS sync
>
> ● Payment integration
>
> ● WhatsApp automation

MVP. Clean. Functional. Stable.

🏗 **FINAL** **TECH** **STACK** **(Freeze** **This)**

Frontend:

> ● Next.js
>
> ● Tailwind CSS

Backend:

> ● Node.js + Express
>
> ● PostgreSQL
>
> ● Prisma ORM

Infra:

> ● Vercel (frontend)
>
> ● AWS EC2 / Railway (backend)
>
> ● Supabase (optional DB hosting)
>
> ● Razorpay
>
> ● WhatsApp Business API (WATI / Meta Cloud API)

📦 **CORE** **MODULES** **TO** **BUILD**

> 1\. Customer Website
>
> 2\. Authentication (OTP login)
>
> 3\. Product & Inventory System
>
> 4\. Order Management
>
> 5\. Slot Booking System
>
> 6\. Admin Dashboard
>
> 7\. Delivery Management
>
> 8\. Stall POS Web App
>
> 9\. CRM Automation Hooks

🗓 **DAY-BY-DAY** **EXECUTION** **PLAN**

🟢 **DAY** **1** **–** **Architecture** **+** **Database**

**Tasks:**

> ● Finalize feature list (no scope creep)
>
> ● Create ER diagram
>
> ● Setup repo + environment
>
> ● Setup DB schema

**Database** **Tables**

Users Addresses Apartments Products Inventory Orders Order_Items
Delivery_Slots Stalls Stall_Sales

> Delivery_Assignments Coupons Subscriptions

**Output:**

> ● DB ready
>
> ● Backend skeleton running
>
> ● Frontend skeleton deployed

🟢 **DAY** **2** **–** **Customer** **Website** **(Frontend)**

**Build:**

> ● Home page
>
> ● Product listing
>
> ● Product detail
>
> ● Cart system
>
> ● Checkout page
>
> ● Login via OTP

**Backend** **APIs:**

> ● Register/Login
>
> ● Get Products
>
> ● Create Cart
>
> ● Create Order (Pending)

**Output:**

Customer can browse and place order (without payment yet)

🟢 **DAY** **3** **–** **Payments** **+** **Slot** **System**

**Integrate:**

> ● Razorpay payment gateway
>
> ● COD logic
>
> ● Webhook for payment confirmation

**Build** **Slot** **Engine:**

> ● Delivery zones
>
> ● Daily slot capacity
>
> ● Auto block slot when limit reached

**Output:**

Customer can:

> ● Select delivery slot
>
> ● Pay online
>
> ● Order confirmed

🟢 **DAY** **4** **–** **Admin** **Dashboard**

Build Admin Panel (Protected route)

Features:

> ● Add/Edit products
>
> ● Update inventory (variety wise)
>
> ● View all orders
>
> ● Filter by apartment
>
> ● Filter by slot
>
> ● Update order status
>
> ● Sales analytics summary

Must include:

> ● Inventory deduction after order confirmation
>
> ● Low stock alert

Output:

> Founder can operate entire system from dashboard

🟢 **DAY** **5** **–** **Delivery** **Management** **+** **Stall**
**System**

**Delivery** **Module:**

> ● Assign delivery boy
>
> ● View slot-wise orders
>
> ● Mark delivered
>
> ● Track failed delivery

**Stall** **POS** **Web** **App:**

> ● Simple login
>
> ● Select product
>
> ● Enter quantity
>
> ● Payment mode
>
> ● Capture phone number
>
> ● Auto sync to backend

Output:

> Stalls + Online sales both syncing to same inventory

🟢 **DAY** **6** **–** **CRM** **+** **Automation**

Integrate:

> ● WhatsApp API

Automations:

> ● Order confirmation
>
> ● Payment confirmation
>
> ● Delivery reminder
>
> ● Subscription reminder
>
> ● Referral code generation

Add:

> ● Coupon system
>
> ● Referral tracking

Output:

> Automated growth layer activated

🟢 **DAY** **7** **–** **Testing** **+** **Launch**

**Full** **System** **Testing:**

> ● Payment test
>
> ● Inventory deduction
>
> ● Slot overflow testing
>
> ● Stall sync testing
>
> ● Order cancellation
>
> ● Refund logic

**Deploy** **Production**

> ● Setup domain
>
> ● SSL
>
> ● Backup policy
>
> ● Monitoring alerts

**Soft** **Launch:**

> ● 2 Apartments
>
> ● 1 Stall
>
> ● 50 orders test

🔥 **MVP** **FEATURES** **SUMMARY**

Customer:

> ● Browse mango varieties
>
> ● Select slot
>
> ● Pay online or COD
>
> ● Subscription option
>
> ● Referral code

Admin:

> ● Inventory control
>
> ● Stall sales tracking
>
> ● Order dashboard
>
> ● Delivery allocation

Delivery:

> ● Slot-wise route view
>
> ● Status update

Stall:

> ● Real-time inventory sync
>
> ● Phone capture
