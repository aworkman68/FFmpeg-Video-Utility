@echo off
setlocal EnableExtensions EnableDelayedExpansion
title FFmpeg Video Utility

:menu
cls
echo ==========================================
echo            FFmpeg Video Utility
echo ==========================================
echo.
echo  1^) Extract all frames from a video
echo  2^) Trim a video by frame range
echo  3^) Trim a video by timestamp
echo  4^) Join two video clips
echo  5^) Create a video from images
echo  6^) Exit
echo.
set /p choice=Select an option [1-6]: 

if "%choice%"=="1" goto extract_frames
if "%choice%"=="2" goto trim_frames
if "%choice%"=="3" goto trim_timestamp
if "%choice%"=="4" goto join_videos
if "%choice%"=="5" goto images_to_video
if "%choice%"=="6" goto end_script

echo Invalid choice.
pause
goto menu

:extract_frames
set /p input=Input video: 
set /p outdir=Output folder: 
if not exist "%outdir%" mkdir "%outdir%"
ffmpeg -y -i "%input%" "%outdir%\frame_%%05d.png"
pause
goto menu

:trim_frames
set /p input=Input video: 
set /p start=Start frame: 
set /p end=End frame: 
set /p output=Output file: 
ffmpeg -y -i "%input%" -vf "trim=start_frame=%start%:end_frame=%end%,setpts=PTS-STARTPTS" "%output%"
pause
goto menu

:trim_timestamp
set /p input=Input video: 
set /p start=Start time: 
set /p end=End time: 
set /p output=Output file: 
ffmpeg -y -i "%input%" -ss %start% -to %end% -c:v libx264 -c:a aac "%output%"
pause
goto menu

:join_videos
set /p v1=First video: 
set /p v2=Second video: 
set /p output=Output file: 
(
echo file '%v1%'
echo file '%v2%'
) > list.txt
ffmpeg -y -f concat -safe 0 -i list.txt -c copy "%output%"
del list.txt
pause
goto menu

:images_to_video
set /p pattern=Image pattern: 
set /p fps=FPS: 
set /p output=Output file: 
ffmpeg -y -framerate %fps% -i "%pattern%" -c:v libx264 -pix_fmt yuv420p "%output%"
pause
goto menu

:end_script
exit
