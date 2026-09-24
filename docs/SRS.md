# Software Requirements Specification (SRS)

## Smart Bar Operations Platform: Laptop Loan & Repair Management System

## 1. Introductio

### 1.1 Purpose

This document specifies the software requirements for the modernised **Smart Bar Operations Platform**. The system unifies university laptop loan management, student hardware repair tracking, and automated service desk communications into a single web application. It addresses critical concurrency bugs, manual data-entry bottlenecks, and security vulnerabilities present in the legacy implementation.

### 1.2 Problem Statement & Motivation

The existing operational platform suffers from multiple technical and operational limitations:

- **Concurrency & Session Failures:** Operating the system across multiple browser tabs causes draft state overwrites due to shared session storage.
- **Security Vulnerabilities:** Device passwords and credentials are submitted in plain text and recorded on paper sticky notes. The local system is accessed via raw IP addresses with self-signed SSL warnings.
- **Manual Overhead:** Reception staff manually enter hardware serial numbers, power supply unit (PSU) details, and fault logs while students wait at the desk.
- **Lack of Real-Time Reactivity:** Staff must manually refresh browser pages to observe status transitions (e.g., from `New - pending_inactive` to `Arrived - pending_active`).
- **Disjointed Student Experience:** Students lack a unified self-service portal to pre-register repairs, monitor queue progress, approve repair quotes, or request loan extensions.

### 1.3 Scope

The platform provides role-based interfaces for **Students**, **Receptionists / Desk Assistants**, and **Hardware Technicians**. Core functionality includes:

- Automated laptop loan workflows (intake, barcode scanning, extension caps, damage checks, drive wipe flagging).
- End-to-end repair tracking (pre-booking, intake inspection, diagnostics, parts quotation, service surveys).
- A foundation for walk-up Smart Bar ticketing and performance reporting.

## 2. System Architecture & Tech Stack

![Awaiting Image]

- **Frontend:** Next.js (App Router, React, TypeScript), FullCalendar/React-Big-Calendar, `@zxing/browser` for camera/scanner integration.
- **Backend:** Spring Boot 3, Spring Data JPA, Spring Security, Jakarta Mail.
- **Database:** PostgreSQL 16 with relational integrity constraints and optimistic locking.

## 3. User Roles and Personas

| Role                         | Access Scope                             | Primary Actions                                                                                                                      |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Student**                  | Public / Self-Service Portal (`/portal`) | Book repair appointments, pre-fill device faults, track repair progress, approve/rejects repair quotes, request loan extensions.     |
| **Receptionist / Assistant** | Front Desk Interface (`/desk`)           | View daily calendar, intake repair devices, inspect loan returns, scan barcodes, check locker access conditions, complete handovers. |
| **Technician**               | Workshop Workbench (`/workshop`)         | Triage repair queue, log diagnostic notes, build parts quotes, allocate devices to secure lockers/shelves, mark repairs ready.       |
| **Administrator**            | Management Console (`/admin`)            | Manage asset fleet, adjust loan configurations, view turnaround metrics, override fee liabilities.                                   |

## 4. Functional Requirements

### 4.1 Laptop Loan Lifecycle Management

- **FR-L01: Loan Eligbility & Cooling-Off Period**
  - The system shall restrict loan creation to valid students (excluding staff and associate accounts).
  - The system shall automatically enforce a mandatory 7-day cooling-off period following the return of a loan device before that student may initiate a new loan.
- **FR-L02: Loan Duration & Extensions**
  - Initial checkout duration shall be set to exactly 30 days.
  - Students may submit online extension requests; total cumulative loan time shall not exceed 120 days.
  - Extensions shall only be permitted after the student has physically collected the device.
- **FR-L03: Barcode Checkout**
  - The desk interface shall support scanning device asset barcodes to assign a machine to a collection appointment.
- **FR-L04: Return Inspection Checklist**
  - Processing a returned laptop shall require the receptionist to complete a conditional checklist: Screen intact (Yes/No), Device turns on (Yes/No), Casing intact (Yes/No), and Missing items (Case, Charger, Laptop).
- **FR-L05: Drive Sanitisation Queue**
  - Upon return submission, the asset status shall immediately transition to `NEEDS_WIPE`, preventing reassignment until formatted and re-imaged.
- **FR-L06: Automated Overdue & Replacement Fines**
  - An automated job shall execute daily at 00:00 UTC to flag loans exceeding the due date.
  - The system shall dispatch a warning email granting 7 days to return the asset.
  - If unreturned after 7 days overdue, a standard replacement charge liability of £852.00 shall be logged on the student's record.

### 4.2 Hardware Repair Workflow

- **FR-R01: Scope Restriction & Pre-Intake**
  - The system shall limit repair registrations to personal student laptops and desktops (software support only for Surface devices; strictly no university-owned assets or laptop bags accepted).
  - Students can pre-fill device brand, model, operating system, and symptom descriptions prior to their drop-off slot.
- **FR-R02: Desk Intake & Visual Inspection**
  - The receptionist shall verify student ID, confirm device serial number, capture PSU (charger) serial number, and record physical condition notes (scratches, cracks, missing screws).
  - If liquid/water damage is reported, the system shall display an alert instructing staff to skip the power-on-test.
- **FR-R03: Secure Credential Vaulting**
  - Customer OS passwords shall be stored in an encrypted vault field accessible only to assigned workshop technicians, eliminating plaintext display and sticky notes.
- **FR-R04: Label Generation**
  - The desk UI shall generate standadized, CSS-paged printable labels optimized for Brother thermal label printers (29mm width) containing the Booking ID and device serial numbers.
- **FR-R05: Quotation & Billing Gates**
  - Software repairs shall be set automatically to £0.00 (free of charge).
  - Hardware repairs requiring billable components shall generate an itemised quote sent via email for student acceptance/rejection.
  - Storage locker and shelf locations shall remain hidden on the receptionist's collection screen if an exit charge is unpaid, displaying immediately once marked `PAID` or `FREE`.

### 4.3 Front Desk Calendar & Queues

- **FR-D01: Calendar View**
  - The desk homepage shall display an interactive calendar showing daily appointments categorised as `Drop Repair`, `Collect Repair`, `Pending Loan Collection`, or `Processed Appointment`.
- **FR-D02: Real-Time Status Updates**
  - The interface shall leverage Server-Sent Events (SSE) to transition ticket badges (e.g., from `New - pending_inactive` to `Arrived - pending_active`, and `Collection - awaiting_collection` to `Archived`) without requiring manual page reloads.

### 4.4 Automated Notifications

- **FR-N01: Drop-off Welcome:** Dispatched when a repair is confirmed into the queue.
- **FR-N02: Quote Ready:** Dispatched when parts costs are submitted by a technician.
- **FR-N03: Ready for Collection:** Dispatched when a completed device is assigned to a locker.

## 5. Non-Functional Requirements

- **NFR-01: Concurrency Control:** The system must prevent silent data overwrites across multiple browser tabs by implementing JPA Optimistic Locking (`@Version`). Conflicting simultaneous writes must return an `HTTP 409 Conflict`.
- **NFR-02: Security & Authentication:** Staff and student routes must be protected using JWT-based Role-Based Access Control (RBAC), mimicking institutional SSO without hardcoded credentials.
- **NFR-03: Performance:** The desk appointment calendar must render scheduled slots within <= 800 ms for a daily volume of up to 500 active records.
- **NFR-04: Usability:** Barcode scan inputs myst auto-submit on terminating newline characters emitted by hardware USB scanners to prevent manual button clicks.

## 6. Data Model & Entity Relationship (Relational)

![Insert ERD]

## 7. Project Implementation Milestones

### Milestone 1: Domain Core & Concurrency Safe API

- Setup PostgreSQL schema & Spring Boot 3 structure
- Implement Spring Security with JWT & mock SSO role switcher
- Build Loan and Repair CRUD endpoints with JPA @Version locking

### Milestone 2: Reception Desk SPA & Scanning

- Develop Next.js /desk route with daily calendar grid
- Implement barcode scanning modal and Brother label print layout
- Add loan check-out, checklist return, and sanitisation queue

### Milestone 3: Student Self-Service & Quotes

- Develop /portal interface for booking slots and tracking tickets
- Build technician diagnistic view, quote builder, and mock payment gate
- Connect automated email notification triggers via Spring Mail

### Milestone 4:l Testing, Automation & Polish

- Implement daily @Scheduled cron tasks for overdue fine processing
- Configure Server-Sent Events (SSE) for live calendar updates
- Finalise user acceptance testing and API documentation via Swagger/OpenAPI
