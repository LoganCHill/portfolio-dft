# JavaScript Architecture

This directory contains the core JavaScript logic for the portfolio website. The code is organized into a modular, class-based architecture to promote separation of concerns, reusability, and maintainability.

## Core Modules & Managers

These are the main classes that orchestrate the interactive demos and components on the page.

*   **`HealthCardManager.js`**: Manages the "Public Health Tracker" demo. It handles fetching health data, populating the region selection dropdown, and launching the details modal.
*   **`AphasiaSurveyManager.js`**: Controls the entire "Aphasia Category Judgement" survey. It initializes the SurveyJS model, manages the survey's lifecycle within a modal, handles custom navigation, and displays completion results.
*   **`pathfinder.js`**: Contains all the logic for the A* Pathfinding Visualizer, including grid creation, algorithm implementation, and user interaction (drawing walls, moving nodes).
*   **`ModalManager.js`**: A reusable utility class for handling the basic open/close functionality of modal dialogs.

## Charting Components

These modules are specifically for the "Public Health Tracker" chart.

*   **`OverlayChart.js`**: A dedicated class to manage the Chart.js instance within the health tracker modal. It handles creating, updating, and rendering the line chart based on user selections.
*   **`metricFetcher.js`**: Responsible for fetching and processing the health metric data used by the chart and summary cards.
*   **`healthCardComponent.js`**: (If used) A component for rendering individual summary cards for each region.

## Custom SurveyJS Widgets

This project extends SurveyJS with custom question types to meet the specific needs of the cognitive assessment demo.

*   **`talsaProbe.js`**: A custom widget that presents a question with "yes" and "no" button choices, designed for the category judgment task.
*   **`talsaImage.js`**: A widget that displays a sequence of two images with a timed delay, used as the stimulus for the `talsaProbe` question.
*   **`talsaWordCloud.js`**: A widget for displaying a word cloud, likely used for instructional or feedback purposes within the survey.

## Utilities

*   **`cacheFetch.js`**: (If used) A utility for fetching data with client-side caching to improve performance and reduce redundant API calls.

## Third-Party Libraries

*   **`webflow.js`**: The standard JavaScript library provided by Webflow, which handles the site's core interactions and animations.
*   **`lz-string.js`**: A library for data compression, likely used to handle saved state or complex data within the browser.