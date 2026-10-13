# #Hashtag — Master Product Roadmap & Implementation Plan

A comprehensive, phase-by-phase engineering roadmap to develop **#Hashtag** into a premier visual social platform and photo-sharing community (comparable to Unsplash, Pinterest, and VSCO).

---

## 📌 Status Legend
- `[x]` **Completed & Verified**
- `[/]` **In Progress**
- `[ ]` **Planned / Upcoming**

---

## 🏆 Milestone 0: Core Foundation & Platform Infrastructure (Completed)
- [x] **Modern UI Revamp**: Unsplash-style responsive multi-column Masonry Grid, semi-transparent sticky header (`backdrop-blur-md`), and sticky hashtag pill bar.
- [x] **Backend & Database Setup**: Express REST API on port `5000`, Prisma ORM with SQLite database, and CORS configuration.
- [x] **Authentication Engine**: JWT authentication (`/api/auth/register`, `/api/auth/login`), split-screen auth UI with Creator vs Explorer personas, live password strength meter, and 24-photo mosaic wall.
- [x] **Creator Upload Studio**: Drag-and-drop upload modal with live preview, hashtag tagging, camera EXIF extraction, and multipart upload to local `/uploads`.
- [x] **Admin Command Center (`/Admin`)**: Telemetry overview, real-time KPI metrics, photo moderation (Feature / Unfeature / Delete), and user role management.
- [x] **Authentic Database Telemetry**:
  - [x] Wiped artificial mock seed numbers.
  - [x] Real database-persisted **Likes** (`Like` table) with instant toggle and user association.
  - [x] Real database-persisted **Downloads** (`Download` table) with resolution tagging (`small`, `medium`, `original`).
  - [x] Real **Views** tracking with session `useRef` guard (infinite loop eliminated).
- [x] **User Profile System (`/profile/:username` & `/profile`)**:
  - [x] Cover banner backdrop, customizable avatar, role pills (`Super Admin`, `Verified Creator`, `Explorer`).
  - [x] Real performance cards (Uploaded count, Total views, Total downloads, Total likes).
  - [x] Two tabs: Uploaded Photos grid (with owner delete controls) and Favorited/Liked Photos grid.
  - [x] Edit Profile modal (display name, avatar URL, bio).

---

## 🚀 Milestone 1: Custom Collections & Moodboards ("Save to Folder")
*Goal: Allow users to organize photos into themed collections (Pinterest / Unsplash style).*

```mermaid
flowchart LR
    Photo[Photo on Feed/Modal] -->|Click Bookmark| Modal[Add to Collection Modal]
    Modal -->|Select Existing| Save[Link Photo to Collection]
    Modal -->|Create New| NewCol[Create Collection Form]
    NewCol --> Save
    Save --> Profile[Displayed in Profile 'Collections' Tab]
    Profile --> ColPage[Dedicated Collection View Page]
```

### Tasks:
- [x] **Database Schema**:
  - [x] Add `Collection` model (`id`, `userId`, `title`, `description`, `isPrivate`, `createdAt`, `updatedAt`).
  - [x] Add `CollectionPhoto` join model (`collectionId`, `photoId`, `addedAt`).
  - [x] Run Prisma migration / sync (`prisma db push` & `seed.js`).
- [x] **Backend Endpoints (`server/src/routes/collections.js`)**:
  - [x] `GET /api/collections` (fetch public collections with previews).
  - [x] `GET /api/collections/:id` (fetch single collection with photos).
  - [x] `POST /api/collections` (create collection).
  - [x] `POST /api/collections/:id/photos` (add photo to collection).
  - [x] `DELETE /api/collections/:id/photos/:photoId` (remove photo from collection).
  - [x] `DELETE /api/collections/:id` (delete entire collection).
  - [x] `GET /api/collections/my/status` (query saved status for quick modal toggling).
  - [x] `GET /api/collections/user/:username` (fetch user profile moodboards).
- [x] **Frontend Components**:
  - [x] Build `AddToCollectionModal.js` (triggered by bookmark button on cards and in `PhotoModal`).
  - [x] Add a **"Collections"** tab to `ProfilePage.js` with collage cards and "+ New Collection" creator.
  - [x] Build `CollectionDetailPage.js` (`/collections/:id`) with collection banner, curator profile, and photo masonry grid.
  - [x] Build `CollectionsExplorePage.js` (`/collections`) to discover community moodboards.
  - [x] Added "Collections" navigation link to Navbar and mobile drawer.

---

## 🔍 Milestone 2: Pro Filters, Smart Sorting & Color Discovery
*Goal: Enhance discovery for designers, developers, and photo enthusiasts.*

### Tasks:
- [x] **Orientation Filters**:
  - [x] Filter by `All Formats`, `Landscape (16:9)`, `Portrait (9:16)`, `Square (1:1)` in upgraded `HashtagBar.js`.
- [x] **Smart Sorting Dropdown**:
  - [x] Sort by: `Latest Submissions`, `Most Liked & Trending`, `Most Viewed`, and `Most Downloaded`.
- [x] **Related Photos Engine ("More Like This")**:
  - [x] Backend endpoint `GET /api/photos/:id/related` matching shared hashtags, category, and creator.
  - [x] Interactive "More Like This" recommendation cards in `PhotoModal.js` with instant in-modal preview and smooth auto-scroll.
- [ ] **Color Discovery**:
  - [ ] Color picker swatch pill bar (Red, Green, Blue, Dark/Monochrome, Warm, Pastel).
  - [ ] Filter photos matching dominant color palettes.

---

## 👥 Milestone 3: Social Graph & Community Interaction
*Goal: Deepen community connection between creators and visual explorers.*

```mermaid
flowchart TD
    UserA[Creator / Explorer] -->|Follows| UserB[Photographer]
    UserA -->|Leaves Feedback| Comment[Photo Comment Thread]
    UserB -->|Receives Alert| Notif[Notification Bell in Navbar]
    UserA -->|Views Feed| Feed[Dedicated 'Following' Feed]
```

### Tasks:
- [x] **Follow System**:
  - [x] `Follow` model in SQLite / Prisma schema (`followerId`, `followingId`, `createdAt`).
  - [x] Endpoints: `POST /api/users/:id/follow` (toggle follow/unfollow), `GET /api/users/:username` (computes live `followersCount`, `followingCount`, and `isFollowing`).
  - [x] Connect the "Follow Creator" button on `ProfilePage.js` to live database records with follower/following stats counters.
- [x] **Dedicated "Following Feed"**:
  - [x] Homepage tab switcher: `Explore (Global)` vs `Following (My Network)`.
  - [x] Backend `GET /api/photos?feed=following` querying followed creators' photos.
  - [x] Friendly empty states for unauthenticated visitors and new users.
- [x] **Comments & Gear Discussions**:
  - [x] `Comment` model (`id`, `photoId`, `userId`, `content`, `createdAt`, `updatedAt`).
  - [x] Backend endpoints: `GET /api/photos/:id/comments`, `POST /api/photos/:id/comments`, `DELETE /api/photos/:id/comments/:commentId`.
  - [x] Comment thread component under photo details in `PhotoModal.js` with instant comment posting, creator avatars, and owner deletion.
- [x] **Live Notification Center**:
  - [x] `Notification` model in SQLite / Prisma schema (`id`, `userId`, `actorId`, `type`, `photoId`, `content`, `isRead`, `createdAt`).
  - [x] Notification bell icon in `Navbar.js` with real-time unread badge counter, auto-polling, and dropdown alerts for likes, comments, follows, and booking leads.
  - [x] 1-click "Mark all as read" and click-through navigation to creator profiles / photos.

---

## 💼 Milestone 4: Creator Economy & Lead Generation
*Goal: Provide tangible incentives and income opportunities for photographers.*

### Tasks:
- [x] **"Hire Photographer" Booking Modal**:
  - [x] `BookingInquiry` model in SQLite / Prisma schema (`id`, `creatorId`, `senderId`, `senderName`, `senderEmail`, `projectType`, `shootDate`, `location`, `budget`, `message`, `status`).
  - [x] Clean booking inquiry request modal (`HireCreatorModal.js`) on creator profiles (`ProfilePage.js`) with date picker, project type selector, budget, location, and creative brief.
  - [x] Generates direct real-time lead notifications for the creator.
- [ ] **Creator Tip Jar ("Buy Me a Coffee")**:
  - [ ] Optional creator donation link (BuyMeACoffee, Stripe, PayPal) displayed on profile and photo download screens.
- [ ] **Creator Analytics Studio**:
  - [ ] Private insights dashboard for photographers: 30-day views graph, top downloaded photos, and geographic reach.

---

## 🛠️ Milestone 5: Media Pipeline & Storage Optimization
*Goal: Transition from local disk storage to production cloud infrastructure.*

### Tasks:
- [ ] **Cloud Media Integration**:
  - Integrate Cloudinary or AWS S3 / Supabase Storage for permanent cloud CDN media delivery.
  - Auto-generate WebP variants (`thumbnail ~400px`, `display ~1920px`, `original`).
- [ ] **In-Browser Social & Wallpaper Cropper**:
  - Allow users to download pre-cropped formats: `Original`, `iPhone Wallpaper (9:16)`, `Twitter Banner (3:1)`, or `Square (1:1)`.

---

## 🌐 Milestone 6: Production Hardening & Cloud Deployment (Live)
*Goal: Ship the production build with enterprise security and high availability.*

### Tasks:
- [ ] **Security & OAuth**:
  - 1-click Google / GitHub OAuth login.
  - Rate limiting on API routes and secure HTTP headers (Helmet).
- [x] **Production Build & Cloud Deployments**:
  - [x] Production environment variables configured (`REACT_APP_API_URL`).
  - [x] Frontend deployment pipeline live on Vercel: `https://hashtag-photos.vercel.app`
  - [x] Backend REST API and SQLite service live on Render: `https://hashtag-api-622m.onrender.com`

---

## 📅 Recommended Immediate Next Sprints

```
Sprint 1: Collections & Moodboards (Milestone 1)
   ├── Step 1.1: Database schema & Prisma migration for Collections
   ├── Step 1.2: Backend REST endpoints (/api/collections)
   ├── Step 1.3: "Add to Collection" modal in UI
   └── Step 1.4: Collections tab on Profile and Collection View page

Sprint 2: Pro Filters & Smart Sorting (Milestone 2)
   ├── Step 2.1: Orientation & sorting dropdowns on Navbar
   └── Step 2.2: "More Like This" recommendations in PhotoModal
```
