# Makeup Comparison Workbench

A small offline workspace for comparing two makeup images and deciding what to practice. Open local images, reveal before and after with a divider, zoom both images, label the comparison, and export your observations as JSON.

The tool has no dependencies, backend, account, uploads, or analytics. It is useful with ordinary photographs or previews from any tool. It does not generate makeup previews or analyze a face.

## Use

1. Download this repository and open `index.html` in a modern browser. A static web host works too; no build is needed.
2. Choose two PNG, JPEG, or WebP images, up to 20 MiB and 36 megapixels each. Reuse the same person, crop, pose, and lighting where possible. Images with different proportions are fitted without stretching and show a warning; the tool does not align them automatically.
3. Drag across the image or use the labeled comparison slider. Arrow keys move the slider; Home reveals after and End reveals before. Both images can be zoomed from the center to 150% or 200%.
4. Write what changed, whether the comparison is fair, and one small thing to practice. **Export notes** downloads a JSON file with your chosen labels, observations, display settings and image dimensions.

Nothing is saved automatically. Refreshing or closing the page clears the session. **Clear workspace** asks before discarding images and notes. Exported notes cannot be imported back into this version; they can be read in a text editor.

## Privacy

Images are opened with browser object URLs and remain on your device. No image data, original filenames, file paths, or notes are sent to a server. There is no local storage or cookie use. The exported file contains notes and image dimensions, not images or original filenames. Avoid putting private information in your labels or notes if you intend to share the export.

When opened from a website, the hosting service receives the ordinary request for the page and its static files, and may retain its usual access logs. The tool itself makes no network requests after those files load. Its Content Security Policy blocks network connections. Choosing the external guide link opens another website in a new tab, subject to that site's privacy practices. For completely offline use, download the files first.

## Compare fairly

Check face shape, crop, lighting, exposure and skin texture before comparing a makeup detail. If a generated preview changes them, record that uncertainty and try another comparison. A photo cannot establish a foundation match, comfort, wear, or how a product will look in different lighting. This is an educational styling aid, not a medical or diagnostic tool or a measurement of model accuracy.

For a practical workflow, see [how to compare AI makeup previews](https://lookslate.com/guides/how-to-compare-ai-makeup-previews). Lookslate maintains this project; that reference is not an independent endorsement. The workbench can be used without visiting Lookslate.

## Files and hosting

- `index.html`: accessible page and content security policy.
- `styles.css`: responsive layout with light and dark system themes.
- `app.js`: local image loading, divider, zoom and JSON export.
- `LICENSE`: MIT license for this project's original source.

Serve these three application files together at a static host. No dependency installation, package manager, compilation, or server-side code is needed. A content security policy in a hosting response header must permit the same local script, stylesheet and blob image sources as this page.

## License

The original HTML, CSS, JavaScript and documentation in this project are MIT licensed. No sample portraits are redistributed. Users retain responsibility for having permission to use their chosen images; the software license grants no rights to those images or to linked website content.
