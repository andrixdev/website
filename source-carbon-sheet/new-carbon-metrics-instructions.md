# Prompt: Add Sobriety Metrics Section & Automated Data Pipeline

**Task:** Add a second "Sobriety Metrics" section in `index.html` dynamically populated via a new PHP cron script and JS parser.

---

## 1. Context & Requirements

### HTML / LESS Structure
- **Location:** Create a second "Sobriety metrics" section directly below the existing one in `index.html` (lines 512–574) for side-by-side comparison. Retain the "Last update" notice.
- **Styling:** Maintain the color scheme from the existing section.
- **DOM Naming:** Ensure clean, semantic DOM nodes using descriptive `kebab-case` IDs matching the meaning of their contents.
- **Build Note:** Do **not** compile LESS or attempt UI verification (an IDE plugin compiles LESS automatically).

---

## 2. Data Model Specification

*(Reference Image: `[/source-carbon-sheet/carbon-sheet]`)*

| Row | Spreadsheet Field Name | Description / Usage |
| :--- | :--- | :--- |
| **Row 2 (A2)** | Metrics | Metric Name |
| **Row 3 (A3)** | Unit | Metric Unit |
| **Row 4 (A4)** | Weekly average | Weekly Average Value |
| **Row 5 (A5)** | Factor to kg eqCO2 | Conversion Factor |
| **Row 6 (A6)** | Factor information | Factor Source / Details |
| **Row 7 (A7)** | Weekly carbon | Weekly Carbon Equivalent |

- **Data Columns:** Columns `B` through `P` contain all metric entries across rows 2 through 7.
- **Total Metric:** Cell `A12` ("TOTAL WEEKLY CARBON") maps to cell `B12` (sum of Row 7 values).

---

## 3. UI / UX Specifications

1. **Primary Display Elements (in order, generous spacing):**
   - **Total Footprint:** Total weekly carbon footprint positioned alongside a prominent Font Awesome green leaf icon (use the existing version of Font Awesome in the project).
   - **Detailed Metrics:** Grid/list of metrics featuring Name (Row 2), Weekly Average (Row 4), and Unit (Row 3).

2. **Interactive Elements:**
   - **Hover Tooltip:** On hovering over any metric, display a tooltip with:
     - Conversion factor to kg eqCO2 (Row 5)
     - Factor source information (Row 6)
     - Weekly carbon equivalent (Row 7)

---

## 4. Backend & Data Pipeline

- **New Cron Script:** `\website-cron\carbon_impact_cron.php`
- **Pattern Reference:** Model execution structure on `\website-cron\human_algorithm_cron.php`.
- **Output Target:** Save outputted JSON payload to `/../website/data/carbon-metrics-latest-data.json`.

---

## 5. Frontend Integration

- **Target File:** `about.js`
- **Pattern Reference:** Model JSON parser & DOM component methods on `more.js`.
- **Refactoring:** Refactor common utilities between `about.js` and `more.js` if beneficial to minimize code duplication.

---

## 6. Deliverables Required

- Modified `index.html` (with secondary metrics section).
- New / updated LESS styles using existing section color variables.
- New `website-cron/carbon_impact_cron.php` file.
- Updated `about.js` (and `more.js` if refactored).
