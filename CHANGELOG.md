# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-02-10

### Added

- **Hearts Support:** Added a dedicated scorecard for the classic card game _Hearts_.
  - **"Shoot the Moon" Logic:** implemented a specialized checkbox that automatically assigns 0 points to the active player and 26 points to all opponents when checked.
  - **Round Tracking:** Supports standard round-by-round scoring for 3 to 6 players.
  - **Leader Highlighting:** Automatically highlights the player with the lowest score (the current leader) in real-time.

## [1.1.0] - 2026-02-09

### Changed

- **Scorecard Reliability:** Improved the performance of scorecards for Golf, Yahtzee, Phase 10, and Simple Score. Calculations for totals and winners are now smoother and less prone to glitches.
- **Yahtzee Improvements:** Reorganized the Yahtzee game behind the scenes to make it faster and more stable.

### Fixed

- **Accessibility:** Fixed an issue with score input popups to make them friendlier for keyboard users and screen readers (removed forced auto-focusing that could trap navigation).
- **Winner Calculation:** Resolved a potential issue where the "Winner" announcement could trigger unexpectedly or cause the screen to stutter during game completion.

## [1.0.0] - 2025-08-19

### Added

- **Initial Launch:** Official release of Tally Pad!
- **Game Support:** Launched with dedicated digital scorecards for 5 popular games:
  - **Yahtzee:** Automated scoring for upper/lower sections and bonuses.
  - **Phase 10:** Track phases completed and total scores per round.
  - **Golf:** Traditional scorecard with par tracking.
  - **Putt-Putt:** Simplified scoring for mini-golf outings.
  - **Simple Score:** A flexible generic counter for any round-based game.
- **Core Features:**
  - Create games and add unlimited players.
  - Save game history to revisit past results.
  - "Finish Game" mode to automatically calculate and display the winner.
  - Mobile-responsive design for keeping score on the go.
