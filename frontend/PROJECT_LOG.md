# Pickolo Project Log & Feature Tracker

This document tracks all implemented features, their functionalities, and the required test cases to ensure integrity.

## 1. Core Platform (App Level)
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Pickolo Rebranding** | ✅ Active | - Check for "pickolo." text in Header/Footer.<br>- Verify green logo is default.<br>- No mentions of "Pickleheads" in UI. |
| **Next.js Migration** | ✅ Active | - Build succeeds (`npm run build`).<br>- Hot reloading active.<br>- Hydration guards on all dynamic pages. |
| **Backend Sync** | ✅ Active | - Database schema matches frontend models (display_name, currency, google_maps_url). |

## 2. Manager Experience
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Venue Analytics** | ✅ Active | - Displayed directly on Facility Page.<br>- Shows total bookings, active players, and revenue. |
| **Advanced Session Creator** | ✅ Active | - Manager can select multiple courts.<br>- Manager can select multiple days of the week.<br>- Manager can select multiple 1-hour slots.<br>- Batch publish generates all permutations. |
| **Slot Management** | ✅ Active | - Manager can view which user reserved a private slot.<br>- Manager can cancel a user's reservation. |
| **Open Play Management** | ✅ Active | - Manager can delete an Open Play session.<br>- Manager can update scores (validated against 11-win-by-2 rule). |
| **Facility Settings** | ✅ Active | - Manager can set opening/closing times.<br>- Manager can set Currency (USD, EUR, etc).<br>- Manager can add Google Maps URL (overrides lat/long). |

## 3. Player Experience
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Profile Personalization** | ✅ Active | - Player can update `display_name`.<br>- Header updates instantly via `storage` event listener.<br>- Player can change skill level (Beg/Int/Exp). |
| **Court Discovery** | ✅ Active | - Player can search facilities by name/city.<br>- Google Maps URL opens in new tab if provided. |
| **Booking System** | ✅ Active | - 1-hour slots selectable in grid.<br>- Player can reserve available slots.<br>- Player can **unreserve** their own slots. |
| **Personal Schedule** | ✅ Active | - "My Sessions" shows upcoming reservations and joined games. |

## 4. Community Features
| Feature | Status | Test Cases |
| :--- | :--- | :--- |
| **Leaderboard** | ✅ Active | - Community page ranks players by points/wins. |
| **Open Play Participation** | ✅ Active | - Players can join sessions via shared links.<br>- Participants list updates in real-time.<br>- Players can see all other participants in a session. |

---
*Last Updated: March 15, 2026*
