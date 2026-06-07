# Curriculum Vitae (CV) Feature Documentation

The CV feature allows each executive to have a dedicated, professionally formatted "Official Record" page. It is designed to be data-driven, meaning the layout and content are controlled entirely via JSON files, allowing for easy updates and customization without modifying the code.

## 🚀 Overview

- **Route**: `/cv?id=<student_id>` (e.g., `/cv?id=22774444`)
- **Data Source**: JSON files located in `public/resources/data/` (or `public/resources/data/new/`) or fetched from an external URL.
- **Configuration**: Linked via the `cv_link` property in `public/resources/data/executives.json`.

---

## 🛠 Configuration

### 1. Linking a CV to an Executive
To enable a CV page for an executive, add the `cv_link` property to their object in `public/resources/data/executives.json`.

**Example (Local File):**
```json
{
  "name": "Elon Musk",
  "student_id": "2020001",
  "cv_link": "/cv" 
}
```
*The value `/cv` tells the system to look for a file named `cv.json` in the data directory.*

**Example (External URL):**
```json
{
  "name": "Bill Gates",
  "student_id": "22774444",
  "cv_link": "https://raw.githubusercontent.com/username/repo/refs/heads/main/cv.json" 
}
```
*Any value starting with `http` will be fetched as a remote JSON file.*

---

## 📋 JSON Schema & Data Structure

### Core Profile Fields
These fields are used in the header metadata block of the CV document.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full name of the executive. |
| `role` | String | Professional title (e.g., "Intern Researcher"). |
| `location` | String | City and Country (e.g., "Chittagong, Bangladesh"). |
| `email` | String | Contact email address. |
| `github` | String | GitHub profile URL or username. |

*(Note: Unlike the legacy SPA version, the React CV UI does not support or render a `phone` field.)*

---

## 🏛 Standard Sections

These sections have specialized layout columns (Sidebar vs. Main Content) in the UI.

### 1. Sidebar Sections

#### 🎓 Education (`education`)
An array of objects specifying degrees, institutions, and years.
```json
"education": [
  {
    "degree": "B.Sc. in Statistics",
    "institution": "University of Chittagong, Bangladesh",
    "year": "Jan ’22 - May ’26",
    "cgpa": "3.75/4.0",
    "rank": "10/120"
  }
]
```

#### 📜 Certifications (`certifications`)
An array of entries. Supports both simple strings and structured objects (for linking).
```json
"certifications": [
  {
    "title": "Advanced Research Methodology",
    "link": "https://example.com/certificate-id?=1564964611"
  }
]
```

#### 🌐 Languages (`languages`)
A simple array of strings.
```json
"languages": ["Bengali", "English"]
```

---

## 🎨 Dynamic Custom Sections

The CV page is designed to be highly extensible. **Any key** in the JSON that is an **array** and not one of the standard fields (`name`, `role`, `location`, `email`, `github`, `education`, `certifications`, `languages`, `experience`) will be automatically rendered in the main column.

### How it works:
1.  **Title Generation**: The JSON key is converted from `snake_case` to `Title Case` (e.g., `technical_skills` $\rightarrow$ `// Technical Skills`).
2.  **Item Rendering**: Each item in the array is rendered using a standard layout block structure.

#### Visual Layout Hierarchy Schema:
```text
+--------------------------------------------------------+
| // Category Name                                       |  <- Section label spacing & accent color
+--------------------------------------------------------+
| Title                                            Dates |  <- Title (bold, dark) & Dates (right-aligned, muted)
| Subtitle                                               |  <- Secondary/company details (accent color)
|                                                        |
| • Bullet Item 1                                        |  <- Standard bullet list (vertical alignment)
|   - Nested Child Bullet A                              |  <- Indented nested bullets
|                                                        |
| Comma Item 1, Comma Item 2, Comma Item 3               |  <- Inline list (flow wrap, comma-separated)
+--------------------------------------------------------+
```

#### Detailed Field Rendering Table:

| Field/Property | Type | Required? | UI Placement | CSS Class & Styling Details |
| :--- | :--- | :--- | :--- | :--- |
| **Category Name** | Object Key (String) | Yes (Implicit) | Section Header, above all child items in the block | `.cvSectionLabel`<br>- Prefixed with `// `<br>- Converted from `snake_case` to `Title Case` (e.g., `technical_skills` $\rightarrow$ `// Technical Skills`) |
| `title` | String | No | Top-left of the entry header | `.cvExpRole`<br>- High font weight, bold, dark primary color |
| `dates` | String | No | Top-right of the entry header (aligned opposite of `title` on desktop) | `.cvExpDates`<br>- Muted text style |
| `subtitle` | String | No | Directly below the header row | `.cvExpCompany`<br>- Secondary/accent color, medium weight |
| `bullets` | Array (Strings / Objects) | No | Main body of the entry | `.cvBullets`, `.cvBulletGroup`, `.cvBulletMain`<br>- Vertical bullet list format<br>- Supports `{ "text": "...", "children": [...] }` for nested indented lists (`.cvBulletChildren` / `.cvBulletChild`) |
| `commas` | Array (Strings / Objects) | No | Main body of the entry (below `bullets` if both exist) | `.cvCommaList`, `.cvCommaItem`<br>- Inline flow layout (flex wrap)<br>- Items separated by commas (automatically omits the trailing comma on the final element) |

**Example of Custom Sections:**
```json
"projects": [
  {
    "title": "Brain Tumor Schematic Segmentation",
    "subtitle": "U-Net & CNN Variants",
    "bullets": [
      "Implemented image segmentation techniques for brain tumor detection using deep learning architectures.",
      "Utilized U-Net and CNN variants for precise pixel-wise segmentation tasks.",
      "Applied preprocessing, augmentation, and evaluation metrics for model optimization and validation."
    ]
  },
  {
    "title": "Road Lane Detection Using Mask R-CNN",
    "subtitle": "Mask R-CNN with a ResNet-101 backbone",
    "bullets": [
      "Developed a deep learning pipeline using Mask R-CNN with a ResNet-101 backbone on a custom COCO-format dataset.",
      "Implemented instance segmentation for detecting and classifying seven categories of road lane markings.",
      "Improved segmentation accuracy for complex road environments and lane structures."
    ]
  }
],
"technical_skills": [
  {
    "subtitle": "Programming Languages",
    "commas": ["Python", "R", "LaTeX", "PostgreSQL"]
  }
]
```

---

### 2. Main Content Sections

#### 💼 Experience (`experience`)
The core professional record. Supports nested bullets to describe project details.
```json
"experience": [
  {
    "title": "Intern Researcher",
    "dates": "May 2025 – July 2025",
    "subtitle": "Datakothon Research Lab",
    "bullets": [
      {
        "text": "Project 1: Predicting Breast Cancer Mortality Trends Using Socioeconomic Indicators and Risk Factor Data with a Machine Learning Based Methodology",
        "children": [
          "Developed an end-to-end machine learning pipeline combining CatBoost, Random Forest, and LSTM to forecast breast cancer mortality trends across diverse socio-economic contexts.",
          "Implemented advanced preprocessing techniques (feature selection, anomaly detection, power transformation) and applied post-hoc bias correction to enhance model accuracy and reliability.",
          "Conducted SHAP analysis to interpret feature contributions, providing actionable insights into socio-economic drivers of breast cancer mortality for evidence-based policy planning."
        ]
      },
      {
        "text": "Project 2: Machine Learning Framework for Water Quality Prediction in Karnaphuli River Basin",
        "children": [
          "Predicted salinity levels in the Karnaphuli River Basin to inform local water-management strategies.",
          "Developed and validated hybrid ML models (XGBoost, AdaBoost, Stacking ensemble, ANN) to predict river water salinity using secondary data from CUET’s Department of Civil Engineering.",
          "Achieved high predictive accuracy with cross-validated metrics: ANN (R² = 0.98, RMSE = 0.84), Stacking Model (R² = 0.96, RMSE = 1.31), XGBoost (R² = 0.95, RMSE = 1.33), and AdaBoost (R² = 0.95, RMSE = 1.38)."
        ]
      }
    ]
  }
]
```

---

## 📱 Responsive Behavior
- **Desktop**: Displays a modern two-column layout with a sidebar on the left for Education/Certs/Languages and a main column on the right for Experience and Custom sections.
- **Mobile**: Collapses into a single column, ordering the header/avatar first, sidebar content next, and main content last for optimized mobile readability.

---

## 🎨 Navigation & UI Integration

To keep the academic record presentation clean and distraction-free:
1. **Fullscreen Viewport**: The CV page utilizes the global `LayoutContext` to trigger fullscreen mode. This hides the default website sidebar, mobile navigation header, and background glows, providing a clean viewport.
2. **Fixed Header Top Bar**: Renders a fixed top bar on scroll containing:
   * A "← Back to Homepage" link.
   * The club's standard sliding theme switch (dark/light toggle).
3. **Bottom Profile Redirection**: The CV document ends with an accent-colored **"View Profile ↗"** button that takes the visitor directly back to the student's dynamic or default profile view (`/profile?id=<student_id>`). This button incorporates the site's signature card hover effects (lifts by `-3px`, top accent line expansion, and background highlighting).
