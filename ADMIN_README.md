# Wall of Humanity - Admin Panel

## Overview
The admin panel allows administrators to review, approve, and reject wall submissions before they appear on the public map.

## Access
- Navigate to `admin.html` in your browser
- Or click the "Admin Panel" button in the top-right corner of the main page

## Features

### 1. Tab Navigation
- **Pending Submissions**: View all submissions awaiting review
- **Approved Walls**: View all approved submissions that appear on the map
- **Rejected Walls**: View all rejected submissions

### 2. Submission Management
Each submission card displays:
- Wall name and status
- Location details (address, city, coordinates)
- Contributor information
- Submission timestamp
- Action buttons

### 3. Actions Available

#### For Pending Submissions:
- **View Details**: Opens a modal with full submission information and map location
- **Approve**: Changes status to "approved" - the wall will now appear on the public map
- **Reject**: Changes status to "rejected" - the wall will not appear on the public map

#### For Approved/Rejected Submissions:
- **View Details**: Opens a modal with full submission information and map location

### 4. Submission Details Modal
When viewing details, you can see:
- Complete submission information
- Interactive map showing the exact location
- Timestamps for submission and review
- All contributor details

## Database Structure

The admin panel works with the following Firestore collection structure:

```javascript
{
  id: "auto-generated",
  name: "Wall Name",
  address: "Street Address",
  city: "City Name",
  lat: 20.5937,
  lng: 78.9629,
  anonymous: false,
  contributorName: "Contributor Name",
  contributorSocial: "Instagram Handle",
  status: "pending" | "approved" | "rejected",
  timestamp: "Firebase Timestamp",
  reviewedAt: "Firebase Timestamp (when status changed)"
}
```

## Status Flow
1. **Pending**: Initial status when a wall is submitted
2. **Approved**: Admin approves the submission - appears on public map
3. **Rejected**: Admin rejects the submission - does not appear on public map

## Security Considerations

⚠️ **Important**: This admin panel currently has no authentication. In a production environment, you should:

1. Implement Firebase Authentication
2. Add role-based access control
3. Restrict admin functions to authorized users only
4. Consider using Firebase Security Rules to protect admin operations

## Usage Instructions

1. **Review Pending Submissions**:
   - Navigate to the "Pending Submissions" tab
   - Review each submission's details
   - Use "View Details" to see the exact location on a map

2. **Approve Submissions**:
   - Click "Approve" on submissions that meet your criteria
   - Approved walls will immediately appear on the public map

3. **Reject Submissions**:
   - Click "Reject" on submissions that don't meet your criteria
   - Rejected walls will not appear on the public map

4. **Monitor Activity**:
   - Use the "Approved Walls" and "Rejected Walls" tabs to track decisions
   - All actions are timestamped for audit purposes

## Technical Notes

- The admin panel automatically refreshes content when status changes
- Map integration uses Leaflet.js for location visualization
- All Firebase operations are real-time and update immediately
- The interface is responsive and works on mobile devices

## Troubleshooting

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration in `firebase.js`
3. Ensure you have proper Firestore permissions
4. Check that your Firestore collection is named "walls"
