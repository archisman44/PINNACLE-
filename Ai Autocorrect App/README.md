
# AI Text Corrector

A web application that uses the [LanguageTool API](https://languagetool.org/) to detect and correct grammar, spelling, and stylistic errors in user-provided English text. The application features a modern, responsive UI built with React, TypeScript, and Tailwind CSS.

![AI Text Corrector Screenshot (Placeholder - replace with actual screenshot)](https://via.placeholder.com/800x500.png?text=AI+Text+Corrector+UI+Screenshot)
*(Replace the placeholder image link above with an actual screenshot of your application)*

## ✨ Features

*   **Grammar & Spell Check**: Leverages the powerful LanguageTool API for accurate suggestions.
*   **Clear Output Format**: Displays:
    *   📝 **Original Text**: The user's input.
    *   ✅ **Corrected Text Only**: The final corrected version of the text.
    *   📘 **Explanation**: A detailed breakdown of the changes made and suggestions.
*   **Modern UI**:
    *   Clean, dark-themed interface with a gradient background.
    *   Responsive design for various screen sizes.
*   **Interactive Elements**:
    *   Text input area for user text.
    *   "Correct My Text" button to process the input.
    *   "Clear" button to reset the input and results.
    *   Typing animation for the corrected text display.
*   **User Feedback**:
    *   Loading state indicator while processing.
    *   Toast notifications for errors (e.g., empty input, API issues).
*   **Accessibility**: ARIA attributes used for better accessibility.

## 🛠️ Technology Stack

*   **Frontend**:
    *   [React](https://reactjs.org/) (v19) with Hooks
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/) (via CDN)
*   **API**:
    *   [LanguageTool API (v2/check)](https://languagetool.org/http-api/swagger-ui/#!/default/post_check) - No API key required for basic use.
*   **Module System**: ES Modules (ESM) via `esm.sh` for React imports.

## 📁 Project Structure

```
.
├── README.md
├── index.html                # Main HTML entry point, includes CDN links and import map
├── index.tsx                 # React application entry point
├── App.tsx                   # Main application component (state management, API calls, layout)
├── metadata.json             # Application metadata
├── constants.ts              # Application constants (e.g., API URLs)
├── types.ts                  # TypeScript type definitions
├── components/               # Reusable UI components
│   ├── Button.tsx
│   ├── ResultDisplay.tsx
│   ├── TextInputArea.tsx
│   ├── Toast.tsx
│   └── icons/                # SVG icon components
│       ├── CloseIcon.tsx
│       └── LoadingSpinnerIcon.tsx
└── services/                 # Service layer for API interactions
    └── languageToolService.ts  # Logic for LanguageTool API calls and data processing
```

## 🚀 Getting Started

This project is designed to run directly in a browser without a complex build setup, thanks to the use of CDNs and ESM.

### Prerequisites

*   A modern web browser that supports ES Modules.
*   A local web server to serve the `index.html` file (due to ES Module security restrictions when opening HTML files directly from the filesystem).

### Running Locally

1.  **Clone the repository (or download the files):**
    ```bash
    # If you have git
    git clone <repository_url>
    cd <repository_directory>
    # Otherwise, ensure all files are in the same directory.
    ```

2.  **Serve the `index.html` file:**
    You can use any simple HTTP server. Here are a few options:

    *   **Using `npx http-server` (if you have Node.js/npm):**
        ```bash
        npx http-server .
        ```
        This will typically serve the site at `http://localhost:8080`.

    *   **Using Python's built-in HTTP server:**
        *   For Python 3:
            ```bash
            python -m http.server
            ```
        *   For Python 2:
            ```bash
            python -m SimpleHTTPServer
            ```
        This will typically serve the site at `http://localhost:8000`.

    *   **Using VS Code Live Server Extension:**
        If you are using Visual Studio Code, you can install the "Live Server" extension, right-click on `index.html` in the explorer, and choose "Open with Live Server".

3.  **Open in Browser:**
    Navigate to the local URL provided by your HTTP server (e.g., `http://localhost:8080` or `http://localhost:8000`) in your web browser.

## 📖 How to Use

1.  **Enter Text**: Type or paste the English text you want to correct into the input area.
2.  **Correct**: Click the "Correct My Text" button.
3.  **View Results**:
    *   The "📝 Original Text" section will show your input.
    *   The "✅ Corrected Text Only" section will display the corrected version of your text.
    *   The "📘 Explanation" section will provide details about the corrections made, including highlighting the corrected text and summarizing the changes.
4.  **Clear**: Click the "Clear" button to reset the input field and all results.
5.  **Errors**: If an error occurs (e.g., network issue, API problem), a toast notification will appear at the bottom-right of the screen.

## ⚙️ Configuration

*   **LanguageTool API URL**: Defined in `constants.ts` (`LANGUAGETOOL_API_URL`). The public endpoint is used by default.
*   **Hugging Face Constants**: `HF_API_KEY` and `HF_API_URL` are present in `constants.ts` but are not actively used by the current LanguageTool-based implementation. They are remnants from previous iterations or for potential future use.

##✅ **Test Examples**
📝 Original Text: She go to school every day
✅ Corrected Text: She goes to school every day

📝 Original Text: I has a car
✅ Corrected Text: I have a car

📝 Original Text: He don’t know the answer
✅ Corrected Text: He doesn’t know the answer

📝 Original Text: The cat eat the food quickly
✅ Corrected Text: The cat eats the food quickly

📝 Original Text: They was at the party last night
✅ Corrected Text: They were at the party last night

📝 Original Text: I am agree with your point
✅ Corrected Text: I agree with your point

📝 Original Text: She didn’t went to the store
✅ Corrected Text: She didn’t go to the store

📝 Original Text: Where you is going?
✅ Corrected Text: Where are you going?

📝 Original Text: It raining when we left
✅ Corrected Text: It was raining when we left

📝 Original Text: He cooking dinner right now
✅ Corrected Text: He is cooking dinner right now



## 📜 License

This project is open-source. Feel free to use, modify, and distribute as you see fit. (You may want to add a specific license like MIT if you intend to share this publicly).

---

Happy Writing!
```
