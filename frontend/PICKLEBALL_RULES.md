# Pickleball Game Context & Rules

This document serves as a foundational reference for the Pickolo project to ensure all scoring and session logic adheres to official pickleball standards.

## 1. The Core Rules
*   **Winning:** Games are typically played to 11 points, and a team must win by 2.
*   **Scoring:** Only the serving team can score a point.
*   **Double Bounce Rule:** When the ball is served, the receiving team must let it bounce before returning, and then the serving team must let it bounce before returning. After that, volleying is permitted.
*   **The Kitchen (Non-Volley Zone):** Players cannot volley while standing in the 7-foot zone on both sides of the net.

## 2. Match Scoring Logic for Pickolo
*   **Input Validation:** When a manager or player updates a score, the system should ideally validate that at least one team has reached 11 (or 15/21 in tournament modes) and the lead is at least 2.
*   **Standard Format:** Score is represented as Team A - Team B (e.g., 11-9).

## 3. Open Play Formats
*   **Round Robin:** Players rotate partners and opponents.
*   **King of the Court:** Winners stay and move up, losers move down.
*   **Challenge Court:** Waiting players challenge the winners.

## 4. Engineering Impact
*   **Score Component:** Must allow incremental updates.
*   **Analytics:** Should track "Points For" vs "Points Against" to calculate skill level adjustments.
