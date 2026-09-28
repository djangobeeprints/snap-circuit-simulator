# Snap Circuits Simulator

A classroom circuit simulator inspired by Snap Circuits Jr. and SC-300, sized for interactive whiteboards like the Promethean ActivPanel.

> **Educational experiment.** This is an independent classroom project made for learning. It is not affiliated with, sponsored by, or endorsed by Elenco Electronics or the Snap Circuits® brand. Circuits are simplified and may not behave exactly like real parts.

## Access

The page asks for a class password. The app is stored **encrypted** in `index.html` (AES-256-GCM, with the key derived from the password through PBKDF2-SHA256 using 600,000 iterations). The password and the readable app code are not in this repository.

## Updating the app

The readable source lives only in `src/app.html` on the maintainer's machine, and `.gitignore` keeps it out of git. After editing it:

```bash
node build.mjs        # asks for the class password, then writes index.html
git add index.html && git commit -m "Update app" && git push
```

Keep a backup of `src/app.html`, because it can't be recovered from this repository without the password.
