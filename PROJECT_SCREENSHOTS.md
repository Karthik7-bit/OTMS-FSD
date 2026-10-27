# Organ Transplant Management System (OTMS)
## Project Figures & Screenshots Gallery

This document contains the complete collection of high-resolution screenshots for the **Organ Transplant Management System (OTMS)**, formatted for direct inclusion into academic project reports, viva presentations, and technical documentation.

---

### Figure 1: User Login and 1-Click RBAC Role Selector

> **Description:** The redesigned authentication interface featuring interactive 1-click Role-Based Access Control (RBAC) preset buttons for Doctors, Administrators, Recipients (Patients), and Donors. Automatically pre-populates official credentials (`doctor@otms.com`, `admin@otms.com`, etc.) and displays permission previews, eliminating login friction.

![Figure 1: User Login and 1-Click RBAC Role Selector](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_1_User_Login_and_1-Click_RBAC_Role_Selector.png)

*Direct Image Link:* [`Figure_1_User_Login_and_1-Click_RBAC_Role_Selector.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_1_User_Login_and_1-Click_RBAC_Role_Selector.png)

---

### Figure 2: Role-Based Clinical Dashboard

> **Description:** The personalized clinical dashboard displayed upon authorized login. Dynamically renders quick action cards and medical management modules tailored to the user's role (Transplant Doctor / System Administrator / Patient / Donor).

![Figure 2: Role-Based Clinical Dashboard](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_2_Role-Based_Clinical_Dashboard.png)

*Direct Image Link:* [`Figure_2_Role-Based_Clinical_Dashboard.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_2_Role-Based_Clinical_Dashboard.png)

---

### Figure 3: Real-Time Organ Inventory with Viability Tracking

> **Description:** Centralized inventory table displaying all harvested organs across partner hospitals. Tracks organ types (Kidney, Liver, Lung, Heart), ABO/Rh blood groups, retrieval facilities, ischemic preservation expiry dates, and real-time availability states (`AVAILABLE`, `ALLOCATED`).

![Figure 3: Real-Time Organ Inventory with Viability Tracking](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_3_Real-Time_Organ_Inventory_with_Viability_Tracking.png)

*Direct Image Link:* [`Figure_3_Real-Time_Organ_Inventory_with_Viability_Tracking.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_3_Real-Time_Organ_Inventory_with_Viability_Tracking.png)

---

### Figure 4: Matching Engine Candidate Scoring and Filter Tabs

> **Description:** The algorithmic decision-support interface. Displays candidate recipients evaluated for a selected donor organ, ranked by composite compatibility score (Blood Match 50% + Urgency 30% + Clinical Priority 20%). Includes status filter tabs (**All**, **Pending**, **Accepted**, **Rejected**) with live count badges and zero duplicate records.

![Figure 4: Matching Engine Candidate Scoring and Filter Tabs](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_4_Matching_Engine_Candidate_Scoring_and_Filter_Tabs.png)

*Direct Image Link:* [`Figure_4_Matching_Engine_Candidate_Scoring_and_Filter_Tabs.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_4_Matching_Engine_Candidate_Scoring_and_Filter_Tabs.png)

---

### Figure 5: Backend Container Orchestration (docker compose ps)

> **Description:** Terminal console execution output of `docker compose ps` verifying that all 4 microservice containers (`otms-client`, `otms-mongo`, `otms-redis`, and `otms-server`) are concurrently running with active health checks on mapped ports (`5173`, `5000`, `27017`, `6379`).

![Figure 5: Backend Container Orchestration (docker compose ps)](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_5_Backend_Container_Orchestration_docker_compose_ps.png)

*Direct Image Link:* [`Figure_5_Backend_Container_Orchestration_docker_compose_ps.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_5_Backend_Container_Orchestration_docker_compose_ps.png)

---

### Figure 6: JWT Authentication Response (POST /api/auth/login)

> **Description:** Backend API REST response for `POST /api/auth/login`. Returns HTTP 200 OK along with a signed JSON Web Token (JWT) containing encrypted claims (`userId`, `role`) and user profile payload.

![Figure 6: JWT Authentication Response (POST /api/auth/login)](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_6_JWT_Authentication_Response_POST_api_auth_login.png)

*Direct Image Link:* [`Figure_6_JWT_Authentication_Response_POST_api_auth_login.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_6_JWT_Authentication_Response_POST_api_auth_login.png)

---

### Figure 7: Algorithmic Candidate Matching Output (POST /api/matches/run)

> **Description:** Backend JSON response for `POST /api/matches/run`. Details algorithmic scoring breakdown across candidate recipients, outputting computed values for `compatibilityScore`, `bloodGroupScore`, `urgencyScore`, and `medicalPriorityScore`.

![Figure 7: Algorithmic Candidate Matching Output (POST /api/matches/run)](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_7_Algorithmic_Candidate_Matching_Output_POST_api_matches_run.png)

*Direct Image Link:* [`Figure_7_Algorithmic_Candidate_Matching_Output_POST_api_matches_run.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_7_Algorithmic_Candidate_Matching_Output_POST_api_matches_run.png)

---

### Figure 8: Atomic Allocation and Lock Confirmation (POST /api/matches/:id/allocate)

> **Description:** Backend confirmation response for `POST /api/matches/:id/allocate`. Confirms atomic multi-document transaction execution (`prisma.$transaction`) that locks the organ, approves the recipient, rejects competing candidates, and updates the patient's waitlist record simultaneously.

![Figure 8: Atomic Allocation and Lock Confirmation (POST /api/matches/:id/allocate)](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_8_Atomic_Allocation_and_Lock_Confirmation_POST_api_matches_id_allocate.png)

*Direct Image Link:* [`Figure_8_Atomic_Allocation_and_Lock_Confirmation_POST_api_matches_id_allocate.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_8_Atomic_Allocation_and_Lock_Confirmation_POST_api_matches_id_allocate.png)

---

## Summary File Mapping

| Figure Number & Title | File Name in `screenshots/` |
| :--- | :--- |
| **Figure 1: User Login and 1-Click RBAC Role Selector** | [`Figure_1_User_Login_and_1-Click_RBAC_Role_Selector.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_1_User_Login_and_1-Click_RBAC_Role_Selector.png) |
| **Figure 2: Role-Based Clinical Dashboard** | [`Figure_2_Role-Based_Clinical_Dashboard.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_2_Role-Based_Clinical_Dashboard.png) |
| **Figure 3: Real-Time Organ Inventory with Viability Tracking** | [`Figure_3_Real-Time_Organ_Inventory_with_Viability_Tracking.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_3_Real-Time_Organ_Inventory_with_Viability_Tracking.png) |
| **Figure 4: Matching Engine Candidate Scoring and Filter Tabs** | [`Figure_4_Matching_Engine_Candidate_Scoring_and_Filter_Tabs.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_4_Matching_Engine_Candidate_Scoring_and_Filter_Tabs.png) |
| **Figure 5: Backend Container Orchestration (docker compose ps)** | [`Figure_5_Backend_Container_Orchestration_docker_compose_ps.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_5_Backend_Container_Orchestration_docker_compose_ps.png) |
| **Figure 6: JWT Authentication Response (POST /api/auth/login)** | [`Figure_6_JWT_Authentication_Response_POST_api_auth_login.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_6_JWT_Authentication_Response_POST_api_auth_login.png) |
| **Figure 7: Algorithmic Candidate Matching Output (POST /api/matches/run)** | [`Figure_7_Algorithmic_Candidate_Matching_Output_POST_api_matches_run.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_7_Algorithmic_Candidate_Matching_Output_POST_api_matches_run.png) |
| **Figure 8: Atomic Allocation and Lock Confirmation (POST /api/matches/:id/allocate)** | [`Figure_8_Atomic_Allocation_and_Lock_Confirmation_POST_api_matches_id_allocate.png`](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/screenshots/Figure_8_Atomic_Allocation_and_Lock_Confirmation_POST_api_matches_id_allocate.png) |
