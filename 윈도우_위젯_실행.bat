@echo off
chcp 65001 > nul
set "CURRENT_DIR=%~dp0"
set "WIDGET_HTML=%CURRENT_DIR%widget.html"
set "ICON_FILE=%CURRENT_DIR%icons\app-icon.ico"

start msedge.exe --app="file:///%WIDGET_HTML:\=/%" --window-size=360,620
