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
echo 10^) Exit
echo.
set /p choice=Select an option [1-10]: 

if "%choice%"=="1" goto extract_frames
if "%choice%"=="2" goto trim_frames
if "%choice%"=="3" goto trim_timestamp
if "%choice%"=="4" goto join_videos
if "%choice%"=="5" goto images_to_video
if "%choice%"=="6" goto first_frame
if "%choice%"=="7" goto last_frame
if "%choice%"=="8" goto frame_number
if "%choice%"=="9" goto frame_timestamp
if "%choice%"=="10" goto end_script

echo Invalid choice.
pause
goto menu

:extract_frames
cls
echo ==========================================
echo          Extract All Frames
echo ==========================================
echo.
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

echo Starting at frame %startnum%

ffmpeg -y -i "%input%" -start_number %startnum% "%outdir%\%prefix%%%05d.%ext%"
pause
goto menu

:first_frame
cls
echo ==========================================
echo          Extract 1st Frame
echo ==========================================
echo.
set /p input=Input video: 
set /p output=Output image: 
ffmpeg -y -i "%input%" -frames:v 1 "%output%"
pause
goto menu

:last_frame
cls
echo ==========================================
echo          Extract Last Frame
echo ==========================================
echo.
set /p input=Input video: 
set /p output=Output image: 
ffmpeg -y -sseof -0.1 -i "%input%" -frames:v 1 "%output%"
pause
goto menu

:frame_number
cls
echo ==========================================
echo          Extract nth Frame
echo ==========================================
echo.
echo Extract specific frame number
set /p input=Input video: 
set /p framenum=Frame number: 
set /p output=Output image: 

ffmpeg -y -i "%input%" -vf "select=eq(n\,%framenum%)" -vframes 1 "%output%"
pause
goto menu

:frame_timestamp
cls
echo ==========================================
echo          Extract Frame at Timestamp
echo ==========================================
echo.
echo Extract frame at timestamp (HH:MM:SS)
set /p input=Input video: 
set /p time=Timestamp: 
set /p output=Output image: 

ffmpeg -y -ss %time% -i "%input%" -frames:v 1 "%output%"
pause
goto menu

:trim_frames
cls
echo ==========================================
echo          Trim by Frame Range
echo ==========================================
echo.
set /p input=Input video: 
set /p start=Start frame: 
set /p end=End frame: 
set /p output=Output file: 
ffmpeg -y -i "%input%" -vf "trim=start_frame=%start%:end_frame=%end%,setpts=PTS-STARTPTS" "%output%"
pause
goto menu

:trim_timestamp
cls
echo ==========================================
echo          Trim by Timestamp
echo ==========================================
echo.
echo Enter timestamps like 00:00:05 or 00:00:05.500
echo.
set /p input=Input video: 
set /p start=Start time: 
set /p end=End time: 
set /p output=Output file: 
ffmpeg -y -i "%input%" -ss %start% -to %end% -c:v libx264 -c:a aac "%output%"
pause
goto menu

:join_videos
cls
echo ==========================================
echo            Join Two Videos
echo ==========================================
echo.
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
echo ==========================================
echo          Create Video from Images
echo ==========================================
echo.
echo Example pattern: frames\frame_%%05d.png
echo.
set /p pattern=Image pattern: 
set /p fps=FPS: 
set /p output=Output file: 
if "%fps%"=="" set fps=30
ffmpeg -y -framerate %fps% -i "%pattern%" -c:v libx264 -pix_fmt yuv420p "%output%"
pause
goto menu

:end_script
exit
