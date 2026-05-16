import threading
import tkinter as tk
from tkinter import filedialog, messagebox

import customtkinter as ctk

from editor import render_video

# ── Theme ──────────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Colours ────────────────────────────────────────────────────────────────────
BG_COLOR = "#1a1a2e"
CARD_COLOR = "#16213e"
ACCENT = "#0f3460"
TEXT_MUTED = "#8892a4"
STATUS_READY = "#8892a4"
STATUS_PROCESSING = "#f0a500"
STATUS_SUCCESS = "#4caf50"
STATUS_ERROR = "#f44336"


class VideoEditorApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Post-It Please — Video Editor")
        self.geometry("640x520")
        self.resizable(False, False)
        self.configure(fg_color=BG_COLOR)

        _assets = "/Users/geenethkulatunge/Documents/Projects/stanotomy/videos/assets"
        self._main_video_path = tk.StringVar(value=f"{_assets}/test-main.mov")
        self._overlay_image_path = tk.StringVar(value=f"{_assets}/test-overlay.jpg")
        self._outro_video_path = tk.StringVar(value=f"{_assets}/test-outro.mov")
        self._output_folder_path = tk.StringVar(
            value="/Users/geenethkulatunge/Documents/Projects/stanotomy/videos/sandbox"
        )

        self._build_ui()

    # ── UI construction ─────────────────────────────────────────────────────────

    def _build_ui(self):
        # Header
        header = ctk.CTkLabel(
            self,
            text="Video Editor",
            font=ctk.CTkFont(size=26, weight="bold"),
            text_color="#e0e0e0",
        )
        header.pack(pady=(28, 4))

        subtitle = ctk.CTkLabel(
            self,
            text="Compose, overlay, and export your video automatically",
            font=ctk.CTkFont(size=13),
            text_color=TEXT_MUTED,
        )
        subtitle.pack(pady=(0, 20))

        # File selection card
        card = ctk.CTkFrame(self, fg_color=CARD_COLOR, corner_radius=14)
        card.pack(padx=40, pady=(0, 16), fill="x")

        self._add_file_row(card, "Main Video", self._main_video_path, "video", 0)
        self._add_file_row(card, "Overlay Image", self._overlay_image_path, "image", 1)
        self._add_file_row(card, "Outro Video", self._outro_video_path, "video", 2)
        self._add_folder_row(card, "Output Folder", self._output_folder_path, 3)

        # Render button
        self._render_btn = ctk.CTkButton(
            self,
            text="Render Video",
            font=ctk.CTkFont(size=15, weight="bold"),
            height=46,
            corner_radius=10,
            fg_color="#0f3460",
            hover_color="#1a4a8a",
            command=self._on_render,
        )
        self._render_btn.pack(padx=40, pady=(4, 16), fill="x")

        # Status label
        self._status_label = ctk.CTkLabel(
            self,
            text="● Ready",
            font=ctk.CTkFont(size=13),
            text_color=STATUS_READY,
        )
        self._status_label.pack(pady=(0, 20))

    def _add_file_row(
        self,
        parent: ctk.CTkFrame,
        label: str,
        variable: tk.StringVar,
        kind: str,
        row: int,
    ):
        row_frame = ctk.CTkFrame(parent, fg_color="transparent")
        row_frame.pack(padx=20, pady=(12, 4), fill="x")

        ctk.CTkLabel(
            row_frame,
            text=label,
            width=110,
            anchor="w",
            font=ctk.CTkFont(size=13),
            text_color="#c8cdd6",
        ).pack(side="left")

        entry = ctk.CTkEntry(
            row_frame,
            textvariable=variable,
            placeholder_text="No file selected…",
            height=34,
            corner_radius=8,
            fg_color="#0d1b2a",
            border_color=ACCENT,
        )
        entry.pack(side="left", fill="x", expand=True, padx=(8, 8))

        if kind == "video":
            file_types = [("Video files", "*.mp4 *.mov *.avi *.mkv"), ("All files", "*.*")]
        else:
            file_types = [("Image files", "*.png *.jpg *.jpeg *.webp"), ("All files", "*.*")]

        ctk.CTkButton(
            row_frame,
            text="Browse",
            width=78,
            height=34,
            corner_radius=8,
            fg_color=ACCENT,
            hover_color="#1a4a8a",
            command=lambda v=variable, ft=file_types: self._browse_file(v, ft),
        ).pack(side="left")

    def _add_folder_row(
        self,
        parent: ctk.CTkFrame,
        label: str,
        variable: tk.StringVar,
        row: int,
    ):
        row_frame = ctk.CTkFrame(parent, fg_color="transparent")
        row_frame.pack(padx=20, pady=(4, 14), fill="x")

        ctk.CTkLabel(
            row_frame,
            text=label,
            width=110,
            anchor="w",
            font=ctk.CTkFont(size=13),
            text_color="#c8cdd6",
        ).pack(side="left")

        entry = ctk.CTkEntry(
            row_frame,
            textvariable=variable,
            placeholder_text="No folder selected…",
            height=34,
            corner_radius=8,
            fg_color="#0d1b2a",
            border_color=ACCENT,
        )
        entry.pack(side="left", fill="x", expand=True, padx=(8, 8))

        ctk.CTkButton(
            row_frame,
            text="Browse",
            width=78,
            height=34,
            corner_radius=8,
            fg_color=ACCENT,
            hover_color="#1a4a8a",
            command=lambda v=variable: self._browse_folder(v),
        ).pack(side="left")

    # ── File dialog helpers ─────────────────────────────────────────────────────

    def _browse_file(self, variable: tk.StringVar, file_types: list):
        path = filedialog.askopenfilename(filetypes=file_types)
        if path:
            variable.set(path)

    def _browse_folder(self, variable: tk.StringVar):
        path = filedialog.askdirectory()
        if path:
            variable.set(path)

    # ── Status helpers ──────────────────────────────────────────────────────────

    def _set_status(self, text: str, color: str):
        self._status_label.configure(text=f"● {text}", text_color=color)

    def _set_ui_enabled(self, enabled: bool):
        state = "normal" if enabled else "disabled"
        self._render_btn.configure(state=state)

    # ── Render logic ────────────────────────────────────────────────────────────

    def _on_render(self):
        main_video = self._main_video_path.get().strip()
        overlay_image = self._overlay_image_path.get().strip()
        outro_video = self._outro_video_path.get().strip()
        output_folder = self._output_folder_path.get().strip()

        missing = [
            name
            for name, val in [
                ("Main Video", main_video),
                ("Overlay Image", overlay_image),
                ("Outro Video", outro_video),
                ("Output Folder", output_folder),
            ]
            if not val
        ]

        if missing:
            messagebox.showerror(
                "Missing Fields",
                f"Please provide the following:\n• " + "\n• ".join(missing),
            )
            return

        self._set_ui_enabled(False)
        self._set_status("Processing…", STATUS_PROCESSING)

        thread = threading.Thread(
            target=self._render_worker,
            args=(main_video, overlay_image, outro_video, output_folder),
            daemon=True,
        )
        thread.start()

    def _render_worker(
        self,
        main_video: str,
        overlay_image: str,
        outro_video: str,
        output_folder: str,
    ):
        try:
            output_path = render_video(
                main_video_path=main_video,
                overlay_image_path=overlay_image,
                outro_video_path=outro_video,
                output_folder=output_folder,
                status_callback=lambda msg: self.after(
                    0, self._set_status, msg, STATUS_PROCESSING
                ),
            )
            self.after(
                0,
                self._set_status,
                f"Success — saved to: {output_path}",
                STATUS_SUCCESS,
            )
        except Exception as exc:
            self.after(
                0,
                self._set_status,
                f"Error: {exc}",
                STATUS_ERROR,
            )
        finally:
            self.after(0, self._set_ui_enabled, True)


# ── Entry point ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = VideoEditorApp()
    app.mainloop()
