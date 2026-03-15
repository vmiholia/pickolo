# Pickolo Project Log & Feature Tracker

This document tracks all implemented features, their functionalities, and the required test cases to ensure integrity.

## 1. Core Platform (App Level)
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Pickolo Rebranding** | ✅ Active | - Check for "pickolo." text in Header/Footer.<br>- Verify green logo is default.<br>- No mentions of "Pickleheads" in UI. |
| **Next.js Migration** | ✅ Active | - Build succeeds (`npm run build`).<br>- Hot reloading active.<br>- Hydration guards on all dynamic pages. |
| **Shared Layout** | ✅ Active | - Header/Footer consistent across all routes. |

## 2. Manager Experience
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Venue Management** | ✅ Active | - Dashboard shows only venues managed by current user.<br>- "Manage" button links to detailed venue settings. |
| **Court Configuration** | ✅ Active | - Manager can add courts with custom names.<br>- Default names follow `#1`, `#2` pattern. |
| **Operating Hours** | ✅ Active | - Manager can set opening and closing times.<br>- Booking grid slots update based on these hours. |
| **Location Settings** | ✅ Active | - Support for Lat/Long and direct Google Maps URL.<br>- URL takes precedence for the external map link. |
| **Open Play Hosting** | ✅ Active | - Manager can publish sessions to specific courts/slots.<br>- Manager can set skill levels for sessions. |
| **Score Management** | ✅ Active | - Manager can update match scores for finished sessions. |

## 3. Player Experience
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Court Discovery** | ✅ Active | - Player can search facilities by name/city.<br>- Map coordinates/URL are clickable to open Google Maps. |
| **Booking System** | ✅ Active | - 1-hour slots selectable in grid.<br>- Player can reserve available slots.<br>- Player can **unreserve** their own slots. |
| **Personal Schedule** | ✅ Active | - "My Sessions" shows upcoming reservations and joined games. |
| **Social Sharing** | ✅ Active | - "Copy Link" works for Facilities and Open Play sessions. |
| **Profile & Stats** | ✅ Active | - Player can update display name (used instead of login ID).<br>- Player can change skill level (Beg/Int/Exp).<br>- Stats show points, wins, and win rate. |

## 4. Community Features
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Leaderboard** | ✅ Active | - Community page ranks players by points/wins. |
| **Open Play Participation** | ✅ Active | - Players can join sessions via shared links.<br>- Participants list updates in real-time. |

---
*Last Updated: March 15, 2026*
