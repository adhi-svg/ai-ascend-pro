# Technician Notification Demo Guide

## How to Test the Demo

### Step 1: Navigate to Login
- Go to http://localhost:5173/
- Click "Technician" on the role selection screen

### Step 2: Login as Technician
- Use any phone number and password (they're mocked)
- Click "Login"

### Step 3: See the Notification Pop-up
You will instantly see a pop-up notification with:

**Example 1: Anuj Verma (t1)**
- 🔔 **Title**: "New Job Invitation!"
- **Customer**: Rajesh Kumar
- **Phone**: +91-9876543210
- **Service**: Electrical
- **Distance**: 1.2 km
- **Issue**: Broken light switch in bedroom
- **Amount**: ₹99
- **Details**: "The main bedroom light switch is not working properly..."

**Example 2: Riya Mehta (t2)**
- **Customer**: Priya Kapoor
- **Service**: Plumbing
- **Issue**: Leaking kitchen tap
- **Amount**: ₹120

### Step 4: Interact with Notification
- ✓ **Accept Booking**: Click "Accept Booking" to accept the job
  - Notification disappears
  - Job moves to "Job Invitations" section
  - Status changes to "accepted"

- **Dismiss**: Click "Dismiss" to close without accepting
  - Notification disappears
  - Job still appears in invitations (status remains "waiting")

### Step 5: View Job in Dashboard
After accepting or dismissing:
- The job invitation appears in the "📩 Job Invitations" section
- Click "All Requests" to see all jobs
- Job details include customer info, service type, and amount

## Demo Technicians Available
1. **Anuj Verma** (t1) - Electrical expert, gets "Broken light switch" booking
2. **Riya Mehta** (t2) - Plumber, gets "Leaking kitchen tap" booking

## What's Happening Behind the Scenes
1. When technician logs in → demo bookings are loaded
2. System finds first "waiting" status job for that technician
3. Notification popup appears with full booking details
4. Notification auto-dismisses after 8 seconds (with progress bar)
5. Technician can accept immediately from notification
6. Job appears in invitations list

## Features Demonstrated
✅ Real-time notification on login
✅ Full customer information in notification
✅ Accept/Reject actions
✅ Job moves to invitations dashboard
✅ Auto-dismiss with timer
✅ Smooth animations and transitions
