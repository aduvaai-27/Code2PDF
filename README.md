# CodePrism

**Transform your code into beautiful, VS Code-style PDF snapshots**

Made with JavaScript | MIT License | PRs Welcome

---

## About

CodePrism is a powerful, client-side web application that converts your code into stunning, print-ready PDFs with authentic VS Code syntax highlighting. Perfect for documentation, portfolios, code reviews, and sharing beautiful code snippets.

---

## Features

**Dual Theme System**
- Page Theme – Controls the editor and UI appearance (Dark/Light)
- PDF Theme – Controls the exported PDF style (Match App / VS Code Dark / VS Code Light)

**Syntax Highlighting for 17+ Languages**
- C, C++, Java, Python, JavaScript, TypeScript
- Rust, Go, C#, HTML, CSS, SQL
- JSON, Bash, Kotlin, Swift, Ruby, PHP

**Professional PDF Output**
- Toggle line numbers on/off
- Customizable filename and document title
- Optional metadata header with date and language badge
- Print-optimized with proper margins
- Preserves formatting exactly as seen in preview

**Rich Customization**
- Language selection dropdown
- Custom filename input
- Custom title input
- Line numbers toggle
- Header visibility toggle
- Independent UI and PDF theme controls

---

## Quick Start

1. Open index.html in any modern web browser
2. Paste your code into the editor area
3. Select your programming language
4. Choose your preferred PDF theme
5. Click Preview to see the result
6. Click Export PDF to save your code snapshot

No installation, no servers, no data upload – everything runs locally in your browser.

---

## Use Cases

| Use Case | Description |
|----------|-------------|
| Documentation | Create beautiful printable code references |
| Portfolio | Showcase code snippets in professional format |
| Code Reviews | Share formatted code with team members |
| Learning | Create study guides with syntax-highlighted examples |
| Blog Posts | Generate high-quality code images for articles |
| Assignments | Submit clean, formatted code for academic work |
| Technical Books | Include consistent code formatting in manuscripts |

---

## Technology Stack

The application consists of:
- UI Theme controls for editor and interface appearance
- PDF Theme controls for preview and export styling
- Custom regex-based syntax tokenizer engine
- HTML/CSS renderer with VS Code style theming
- Browser Print API for Save as PDF functionality

---

## Color Schemes

**VS Code Dark Theme**
- Background: #1e1e1e
- Text: #d4d4d4
- Keywords: #569cd6
- Strings: #ce9178
- Comments: #6a9955
- Numbers: #b5cea8

**VS Code Light Theme**
- Background: #ffffff
- Text: #1e1e1e
- Keywords: #0000ff
- Strings: #a31515
- Comments: #008000
- Numbers: #098658

---

## System Requirements

- Browser: Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript: Enabled
- Internet: Required only for Google Fonts (optional fallback included)
- Storage: None – runs entirely in browser memory
- Privacy: 100% client-side – your code never leaves your device

---

## Code Examples

**C++**
```
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodePrism!" << endl;
    return 0;
}
```

**Python**
```
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

**JavaScript**
```
const greet = (name) => {
    console.log(`Hello, ${name}!`);
};

greet('CodePrism');
```

---

## Privacy & Security

- No Server Upload – All processing happens locally in your browser
- No Tracking – Zero analytics or telemetry
- No External APIs – Self-contained application
- Local Storage Only – Only theme preferences are saved
- Open Source – Fully transparent codebase

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF doesn't match preview | Ensure correct PDF theme is selected; enable "Background graphics" in print settings |
| Syntax highlighting not working | Verify language selection; refresh page if issues persist |
| Preview not updating | Click Preview again after changing options |
| Export not working | Allow pop-ups for this site; check browser console |
| Colors look different | Use "Save as PDF" instead of physical printer |

---

## Version History

**v1.0.0**
- Initial release
- Support for 17+ programming languages
- Dual theme system (UI and PDF)
- VS Code style syntax highlighting
- Print-optimized PDF export
- Live preview functionality

---

## Contributing

Contributions, issues, and feature requests are welcome!

Steps to contribute:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

Distributed under the MIT License.

---

## Acknowledgments

- VS Code for the beautiful color schemes
- JetBrains Mono for the excellent coding font
- Inter for the clean UI typography
- Outfit for the modern header font

---

## Support

- Issues: GitHub Issues
- Email: support@codeprism.dev

---

## Tips & Tricks

- Use descriptive titles – They appear prominently in the PDF header
- Select the correct language – Ensures accurate syntax highlighting
- Always preview first – Verify formatting before exporting
- Save as PDF – Use the print dialog's "Save as PDF" option for best results
- Experiment with themes – Match the PDF style to your documentation needs

---

**Made with 🔮 by CodePrism**

*Transform your code into art*
