# Admin Panel Documentation

The Admin Panel is a centralized, data-driven management interface for the Statistics Programming Club website. It allows administrators to modify site content without directly editing JSON files in the codebase.

## 🚀 Getting Started

### Access
The admin panel is located at `/admin`. 
*Note: Ensure you are running the development server (`npm run dev`) to access the panel and use the "Save" feature.*

### General Interface
- **Sidebar**: Switch between different data editors (Executives, Projects, Events, Courses, Achievements).
- **Mode Toggle**: 
    - **GUI Editor**: A user-friendly form-based interface for quick edits.
    - **JSON Editor**: A raw text editor with syntax highlighting and line-numbering for advanced structural changes.
- **Top Actions**:
    - **Load**: Import a `.json` file from your local machine.
    - **Copy**: Copy the current state of the database to the clipboard.
    - **Export**: Download the current state as a `.json` file.
    - **Save**: (Development Mode Only) Write changes directly to the project's `public/resources/data/` directory.

---

## 🛠 Editor Guides

### 1. Executives Editor
Manages the club's leadership and committee history.
- **Committee Management**: 
    - Add new academic sessions (e.g., `2027-28`).
    - Set the **Active Committee Session** which determines which members appear on the main site.
- **Member Profiles**:
    - Edit personal details: Name, Student ID, Role, Bio, and Avatar initial.
    - **Icon Link**: Provide a URL to a member's photo.
    - **Social Handles**: Add multiple social links (GitHub, LinkedIn, etc.) using the "Add Link" button.
    - **Featured**: Toggle the "Gets featured banner" to highlight specific members.
- **Reordering**: Use the drag handle (⠿) to change the display order of committees and members.

### 2. Projects Editor
Manages the club's technical projects and publications.
- **Fields**: Edit project titles, descriptions, status (`active`, `completed`, `research`, `publication`), and year.
- **Contributors**: Enter student IDs as a comma-separated list.
- **Tech Tags**: Add technologies used (e.g., `Python, Next.js`) as a comma-separated list.
- **Links**: Add URLs for code repositories and live demos/DOIs.

### 3. Events Editor
Schedules and manages club activities.
- **Global Notice**: Edit the footer notice displayed under the events list on the live site.
- **Event Details**: Manage titles, dates, times, locations, and audience restrictions.
- **Validation**: The panel prevents setting event dates in the past.
- **Expired Events**: When loading, the panel automatically filters out expired events and notifies the admin.

### 4. Courses Editor
Manages the syllabus and professional certifications.
- **Type**: Distinguish between a full `course` and a `certificate`.
- **Details**: Edit provider names, titles, years, and syllabus links.

### 5. Achievements Editor
Records the club's competitive programming successes.
- **Medal Tally Strip**: Manage the high-level count (e.g., "12 Gold Medals") displayed at the top of the achievements page.
- **Achievement Entries**: 
    - Assign a **Tier** (`gold`, `silver`, `bronze`, `special`, `community`) to control the displayed medal icon.
    - Record the event name, category, year, and team members (Student IDs).

---

## 🏗 Technical Architecture

### Content-as-Data Pattern
The admin panel follows a "Content-as-Data" architecture. Instead of hardcoded paths, it uses a **Registry System**.

1. **Registry**: The file `public/resources/data/database.json` maps editor types (e.g., `executives`) to their actual file paths (e.g., `resources/data/executives.json`).
2. **Resolution Flow**:
    - The panel attempts to fetch `database.json`.
    - If successful, it uses the paths defined there.
    - If the registry fails to load or a specific key is missing, it uses a hardcoded `FALLBACK_DATABASE` constant.
3. **Data Loading**: Data is fetched via the browser's `fetch` API with a timestamp cache-buster (`?t=...`) to ensure the most recent data is always loaded.

### Saving Mechanism
The "Save" button triggers a `POST` request to `/api/save-data`.
- **Security**: This endpoint is strictly limited to `process.env.NODE_ENV === 'development'`.
- **Process**: The API reads the registry $\rightarrow$ resolves the absolute path on the server $\rightarrow$ validates the JSON $\rightarrow$ writes to the filesystem using `fs.writeFile`.

## ⚠️ Important Notes
- **JSON Syntax**: When using the JSON Editor, ensure the syntax is valid. The editor provides line-specific error messages to help you locate typos.
- **Backup**: It is highly recommended to **Export** your data before making significant structural changes.
