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
echo  6^) Extract FIRST frame only
echo  7^) Extract LAST frame only
echo  8^) Extract frame at specific FRAME NUMBER
echo  9^) Extract frame at TIMESTAMP
echo 10^) Split video into smaller clips
echo 11^) Extract audio from video
echo 12^) Exit
echo.
set /p choice=Select an option [1-12]: 

if "%choice%"=="1" goto extract_frames
if "%choice%"=="2" goto trim_frames
if "%choice%"=="3" goto trim_timestamp
if "%choice%"=="4" goto join_videos
if "%choice%"=="5" goto images_to_video
if "%choice%"=="6" goto first_frame
if "%choice%"=="7" goto last_frame
if "%choice%"=="8" goto frame_number
if "%choice%"=="9" goto frame_timestamp
if "%choice%"=="10" goto split_video
if "%choice%"=="11" goto extract_audio
if "%choice%"=="12" goto end_script

echo Invalid choice.
pause
goto menu

:extract_frames
cls
set /p input=Input video: 
set /p outdir=Output folder: 
set /p prefix=Filename prefix [frame_]: 
set /p ext=Image extension [png/jpg] (default png): 
if "%prefix%"=="" set prefix=frame_
if "%ext%"=="" set ext=png
if not exist "%outdir%" mkdir "%outdir%"
set maxnum=0
for %%F in ("%outdir%\%prefix%*.%ext%") do (
    set "name=%%~nF"
    set "num=!name:%prefix%=!"
    set /a n=1!num! - 100000 2>nul
    if !n! GTR !maxnum! set maxnum=!n!
)
set /a startnum=maxnum+1
echo Starting new extraction at frame number: %startnum%
ffmpeg -y -i "%input%" -start_number %startnum% "%outdir%\%prefix%%%05d.%ext%"
pause
goto menu

:trim_frames
cls
set /p input=Input video: 
set /p start=Start frame: 
set /p end=End frame: 
set /p output=Output file: 
ffmpeg -y -i "%input%" -vf "trim=start_frame=%start%:end_frame=%end%,setpts=PTS-STARTPTS" "%output%"
pause
goto menu

:trim_timestamp
cls
set /p input=Input video: 
set /p start=Start time: 
set /p end=End time: 
set /p output=Output file: 
ffmpeg -y -i "%input%" -ss %start% -to %end% -c:v libx264 -c:a aac "%output%"
pause
goto menu

:join_videos
cls
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
cls
echo Example pattern: frames\frame_%%05d.png
set /p pattern=Image pattern: 
set /p fps=FPS: 
set /p output=Output file: 
if "%fps%"=="" set fps=30
ffmpeg -y -framerate %fps% -i "%pattern%" -c:v libx264 -pix_fmt yuv420p "%output%"
pause
goto menu

:first_frame
cls
set /p input=Input video: 
set /p output=Output image: 
ffmpeg -y -i "%input%" -frames:v 1 "%output%"
pause
goto menu

:last_frame
cls
set /p input=Input video: 
set /p output=Output image: 
ffmpeg -y -sseof -0.1 -i "%input%" -frames:v 1 "%output%"
pause
goto menu

:frame_number
cls
echo Note: frame numbers start at 0.
set /p input=Input video: 
set /p framenum=Frame number: 
set /p output=Output image: 
ffmpeg -y -i "%input%" -vf "select=eq(n\,%framenum%)" -vframes 1 "%output%"
pause
goto menu

:frame_timestamp
cls
echo Example timestamp: 00:00:05.500
set /p input=Input video: 
set /p time=Timestamp: 
set /p output=Output image: 
ffmpeg -y -ss %time% -i "%input%" -frames:v 1 "%output%"
pause
goto menu

:split_video
cls
echo Segment length must be entered in seconds.
echo Examples: 30 = 30 seconds, 300 = 5 minutes, 900 = 15 minutes
echo.
set /p input=Input video: 
set /p segment=Segment length in seconds: 
set /p outdir=Output folder: 
set /p prefix=Output filename prefix [clip_]: 
set /p ext=Output extension [mp4]: 
if "%prefix%"=="" set prefix=clip_
if "%ext%"=="" set ext=mp4
if not exist "%outdir%" mkdir "%outdir%"
ffmpeg -y -i "%input%" -c copy -map 0 -segment_time %segment% -f segment -reset_timestamps 1 "%outdir%\%prefix%%%03d.%ext%"
pause
goto menu

:extract_audio
cls
echo ==========================================
echo          Extract Audio from Video
echo ==========================================
echo.
echo Choose output extension based on what you want:
echo   mp3 = compressed audio
echo   wav = uncompressed audio
echo   m4a = copy common AAC audio without re-encoding when possible
echo.
set /p input=Input video: 
set /p output=Output audio file (e.g. audio.mp3): 

echo.
echo Extracting audio...
echo.

ffmpeg -y -i "%input%" -vn "%output%"

pause
goto menu

:end_script
exit
