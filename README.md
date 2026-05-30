# HostelHub: Modern Hostel Management System

HostelHub is a robust, responsive, and centralized platform designed to digitize and streamline hostel management. Say goodbye to messy spreadsheets and paper records, and say hello to seamless operations.

## Features Included

- **Centralized Dashboard**: Get a birds-eye view of your properties, total students, families, and available capacities.
- **Infrastructure Management**:
  - Add and manage multiple Hostels/Properties.
  - Drill down into specific Floors.
  - Allocate distinct Units: from simple rooms to complex hierarchical Sections (Halls with Sub-rooms).
  - Specify room types (Students vs. Private Families) and maximum capacity.
- **Resident Management**:
  - Securely register residents with details like Aadhar Number, Phone, Occupation, and Joining Date.
  - Setup custom payment cycles (monthly or custom days).
- **Financial Tracking**: 
  - Dedicated modules for tracking ongoing Expenses.
  - Logging and monitoring Payments from residents.
- **Staff Overview**: Register staff and track salaries.
- **Resident Hub (New)**: 
  - A built-in public interface (`/student-form`) mimicking a Google Form.
  - Allows residents to securely mark their daily attendance (with reasons for absence) and submit complaints.
  - Submitted forms automatically surface to the administrator's **Student Desk**.

## Tech Stack

- **Framework**: React via Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **UI Components**: Radix UI (shadcn/ui style components)

## Getting Started

Follow these instructions to run the project on your local machine for development and testing.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone or Open the Repository:**
   Ensure you are in the project root directory.

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to the address shown in your terminal (usually `http://localhost:8080`).

### Navigating the App
- **Admin Dashboard**: Accessible from the root/login screen. Use this to manage all property details.
- **Student Form**: Direct your residents to the `/student-form` route. Any complaints or attendance records submitted here will instantly reflect in the **Student Desk** section of the admin dashboard.

---

*Note: For the purpose of this assignment setup, the Student Form (Attendance and Complaints) utilizes browser Local Storage to seamlessly demonstrate data flow without requiring a backend API configuration.*
