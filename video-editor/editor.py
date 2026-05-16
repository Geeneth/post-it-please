import os
from moviepy import (
    VideoFileClip,
    ImageClip,
    CompositeVideoClip,
    concatenate_videoclips,
    vfx,
)


def render_video(
    main_video_path: str,
    overlay_image_path: str,
    outro_video_path: str,
    output_folder: str,
    status_callback=None,
) -> str:
    """
    Render the final video by compositing an overlay image onto the main video
    and appending an outro with a crossfade transition.

    Returns the path to the output file.
    """

    def update_status(message: str):
        if status_callback:
            status_callback(message)

    update_status("Loading main video...")
    main_clip = VideoFileClip(main_video_path)

    update_status("Loading outro video...")
    outro_clip = VideoFileClip(outro_video_path)

    update_status("Processing overlay image...")
    overlay_width = 600

    overlay = (
        ImageClip(overlay_image_path)
        .with_effects([vfx.Resize(width=overlay_width)])
        .with_duration(main_clip.duration)
    )

    # Position in the lower-left zone of a 1080×1920 phone frame,
    # matching the green target area (~14 % from left, ~56 % from top).
    x_pos = int(main_clip.w * 0.20)   # ≈ 151 px for 1080-wide video
    y_pos = int(main_clip.h * 0.60)   # ≈ 1075 px for 1920-tall video
    overlay = overlay.with_position((x_pos, y_pos))

    update_status("Compositing overlay onto main video...")
    composited_main = CompositeVideoClip([main_clip, overlay])

    update_status("Building crossfade transition...")
    # Crossfade: outro fades in over the last second of the main clip.
    # Both clips must be the same size; resize outro to match if needed.
    if outro_clip.size != main_clip.size:
        outro_clip = outro_clip.with_effects([vfx.Resize(main_clip.size)])

    composited_main = composited_main.with_effects([vfx.CrossFadeOut(duration=1)])
    outro_clip = outro_clip.with_effects([vfx.CrossFadeIn(duration=1)])

    update_status("Concatenating clips...")
    final_clip = concatenate_videoclips(
        [composited_main, outro_clip], method="compose"
    )

    output_filename = os.path.join(
        output_folder,
        f"output_{os.path.splitext(os.path.basename(main_video_path))[0]}.mp4",
    )

    update_status("Rendering final video (this may take a while)...")
    final_clip.write_videofile(
        output_filename,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=os.path.join(output_folder, "temp_audio.m4a"),
        remove_temp=True,
        logger=None,
    )

    main_clip.close()
    outro_clip.close()
    composited_main.close()
    final_clip.close()

    return output_filename
