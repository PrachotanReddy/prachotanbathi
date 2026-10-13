#!/usr/bin/env python3
"""Create local background-video variants; ordinary builds do not need FFmpeg."""
import argparse
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg'))
parser.add_argument('--source', type=Path, default=root / 'output/source/forest_day.mp4',
                    help='Original forest video (kept outside the published assets)')
args = parser.parse_args()
if not args.ffmpeg:
    parser.error('Install FFmpeg or pass --ffmpeg /path/to/ffmpeg')
if not args.source.is_file():
    parser.error('Original video not found; pass --source /path/to/forest_day.mp4')

source = args.source
destination = root / 'public/forest'
destination.mkdir(parents=True, exist_ok=True)
variants = {
    '': 'scale=1600:900',
    '-mobile': 'crop=810:1440,scale=576:1024',
}
for suffix, framing in variants.items():
    output = destination / f'forest-motion{suffix}.mp4'
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
                    '-an', '-vf', f'{framing},fps=24', '-c:v', 'libx264', '-preset', 'slow',
                    '-crf', '28', '-pix_fmt', 'yuv420p', '-threads', '4', '-movflags', '+faststart',
                    '-map_metadata', '-1', str(output)], check=True)
    poster = destination / f'forest-motion{suffix}.webp'
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(output),
                    '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', str(poster)], check=True)
    print(f'{output.name}: {output.stat().st_size / 1024 / 1024:.2f} MiB', flush=True)
