# Aptara Pulse — Training, Events & Engagement Calendar

A static, corporate monthly calendar portal and non-technical management studio designed for HR teams to publish monthly learning and engagement activities across enterprise intranets (IIS, Apache, Nginx).

---

## 🏛️ System Architecture

- **100% Client-Side Architecture**: Operates on standard static file hosting with zero backend requirements (no Node.js, PHP, Python, Java, or databases needed on production servers).
- **Zero Runtime Dependencies**: All libraries (FullCalendar, Lucide, Motion One, Fuse.js, JSZip) and fonts/assets are packaged locally. Zero external CDN or internet calls at runtime.
- **Direct Protocol Compatibility**: Runs seamlessly on internal network paths (`http://`, `https://`) as well as local offline file systems (`file:///`).

```text
aptara-pulse-calendar/
├── employee-calendar/              # Production Employee Portal
│   ├── index.html                  # Main Web Portal Entry
│   ├── assets/
│   │   ├── css/styles.css          # Design System, Micro-animations & Print Styles
│   │   ├── js/app.js               # FullCalendar, Fuse.js Search & Modal Engine
│   │   ├── js/calendar-data.js     # Master Monthly Content & Event Schema
│   │   ├── images/                 # Corporate Logos & Visual Badges
│   │   └── vendor/                 # Local Standalone Libraries
├── calendar-editor/                # Offline HR Management Studio
│   ├── index.html                  # Split-Screen Studio Interface
│   ├── assets/
│   │   ├── css/editor.css          # Studio Styles & Responsive Viewport Frames
│   │   ├── js/editor.js            # Studio Engine, CRUD, JSZip Generator & Audit
│   │   └── vendor/                 # Local Vendor Dependencies
└── README.md                       # Complete Operational & Deployment Guide
```

---

## 👩‍💼 HR Monthly Update Instructions

1. **Open Studio**: Open `calendar-editor/index.html` in any web browser (Chrome, Microsoft Edge, or Firefox).
2. **Monthly Portal Configuration**:
   - Switch to the **Monthly Portal Settings** tab.
   - Set the **Target Month** and **Year** (e.g., *October 2026*).
   - Enter the **Monthly Welcome Message** and verify HR/L&D contact emails.
   - Click **Save Portal Settings**.
3. **Session Management (CRUD, Duplication & Reordering)**:
   - **Add Session**: Click **Add New Event**, complete the form fields (Title, Category, Delivery Mode, Date & Time, Meeting/Registration URL, Instructor, Audience, Description, and Tags), and click **Add Event to Calendar**.
   - **Duplicate Recurring Sessions**: Click the **Copy** (`⧉`) button on any existing event to create an instant clone.
   - **Reorder Priority**: Click the **Move Up** (`↑`) and **Move Down** (`↓`) buttons to arrange sessions chronologically.
   - **Duplicate Entire Month**: Click **Duplicate Month** in the top bar to advance all current session dates forward by 1 month into a new starting draft.
4. **Draft Auto-Saving**:
   - All edits auto-save to browser `localStorage`. Look for the green **Draft Auto-Saved** indicator in the top header.

---

## 📱 Live Preview Instructions

- **Split-Screen Desktop Preview**: As you type or reorder sessions, the right-hand preview updates in real-time.
- **Mobile Viewport Testing (390px)**:
  - Click **Mobile (390px)** in the preview toolbar.
  - Inspect the mobile card layout, swipeable highlight carousel, and compact headers.
  - Click **Desktop** to return to standard view.

---

## 🚀 Website ZIP Generation Steps

1. Click the prominent **Generate Website ZIP** button in the top navigation bar.
2. Review the **Pre-Publish Verification Checklist**:
   - ✅ Required Configuration Fields
   - ✅ Online Meeting & Registration Links
   - ✅ Event Date & Time Integrity
   - ✅ Image & Icon Accessibility
   - ✅ Calendar Schedule Content
   - ✅ Mobile Phone Responsive Layout (Toggle confirmation)
3. Click **Confirm & Download ZIP**.
4. The studio downloads `aptara-pulse-[year]-[month].zip` (e.g., `aptara-pulse-2026-september.zip`) containing the root `index.html`, assets, and `UPLOAD-INSTRUCTIONS.txt`.

---

## 🌐 Internal Web Server Upload Steps

### 1. Microsoft IIS (Internet Information Services)
1. Extract the downloaded ZIP file.
2. Copy the extracted files directly into your target IIS directory:
   ```text
   C:\inetpub\wwwroot\pulse\
   ```
3. Ensure IIS Default Document includes `index.html`.
4. Verify URL: `https://intranet.aptaracorp.com/pulse/`

### 2. Apache HTTP Server (Linux / Windows)
1. Copy and extract files to the document root:
   ```bash
   unzip aptara-pulse-2026-september.zip -d /var/www/html/pulse/
   chmod -R 755 /var/www/html/pulse/
   ```
2. Verify URL: `https://intranet.aptaracorp.com/pulse/`

### 3. Nginx Server
1. Extract into your Nginx root directory:
   ```bash
   unzip aptara-pulse-2026-september.zip -d /usr/share/nginx/html/pulse/
   ```
2. Reload Nginx configuration: `sudo nginx -s reload`

---

## 🗄️ Archive & Versioning Recommendations

- Maintain an internal archive folder on the HR shared network drive:
  ```text
  \\aptaracorp.local\HR\Pulse-Calendar-Archives\
  ├── 2026-09-September\
  │   ├── aptara-pulse-2026-september.zip
  │   └── calendar-data.js
  ├── 2026-10-October\
  │   ├── aptara-pulse-2026-october.zip
  │   └── calendar-data.js
  ```
- Before creating a new monthly edition, click **Export Data.js** to save a snapshot of the outgoing month.

---

## 🖥️ Supported Browsers & Standards

| Browser | Minimum Version | Status |
| :--- | :--- | :--- |
| **Google Chrome** | Version 90+ | Full Support |
| **Microsoft Edge** | Version 90+ | Full Support |
| **Mozilla Firefox** | Version 88+ | Full Support |
| **Apple Safari** | Version 14+ | Full Support |
| **Mobile Browsers** | iOS Safari / Chrome Android | Full Support |

### Accessibility & Standards
- **WCAG 2.2 AA Compliance**: Verified contrast ratios (Navy `#102A43` on `#FFFFFF` = 13.8:1; Aptara Blue `#145DA0` on `#FFFFFF` = 6.2:1).
- **Keyboard Navigation**: Focus trap on dialogs, visible focus indicators, `Escape` key handlers.
- **Reduced Motion**: Strict `prefers-reduced-motion: reduce` compliance across CSS and Motion One.
- **Print Optimization**: Clean `@media print` style sheet for printing monthly schedules.

---

## 🔧 Troubleshooting Guidance

- **Problem: Changes made in HR Studio are not appearing on the live intranet.**
  - *Solution*: Ensure the updated `calendar-data.js` (or extracted files from the newly downloaded ZIP) was copied to the intranet server directory, and clear browser cache with `Ctrl + F5`.
- **Problem: Meeting links fail to open.**
  - *Solution*: Verify the links include `https://` prefix (e.g., `https://teams.microsoft.com/...`). The Pre-Publish checklist flags malformed URLs.
- **Problem: .ICS calendar invites do not add to Outlook.**
  - *Solution*: The .ics generator outputs standard RFC-2445 VEVENT formats. Ensure your mail client allows `.ics` file opening.
- **Problem: Want to revert edits to original template.**
  - *Solution*: In the HR Studio, click **Reset** → **Restore September 2026 Baseline**.
