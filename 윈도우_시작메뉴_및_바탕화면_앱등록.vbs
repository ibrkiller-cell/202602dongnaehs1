Set oWS = CreateObject("WScript.Shell")
strDir = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
strPath = strDir & "index.html"
strIcon = strDir & "icons\app-icon.ico"
strUrl = "file:///" & Replace(strPath, "\", "/")

' 1. Desktop Shortcut
desktopPath = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(desktopPath & "\동래고 교사 시간표.lnk")
oLink.TargetPath = "msedge.exe"
oLink.Arguments = "--app=""" & strUrl & """"
oLink.IconLocation = strIcon & ",0"
oLink.Description = "2026학년도 동래고등학교 교사 주간 시간표 & 공강지도 시스템"
oLink.WorkingDirectory = strDir
oLink.Save

' 2. Start Menu Shortcut
programsPath = oWS.SpecialFolders("Programs")
Set oStartLink = oWS.CreateShortcut(programsPath & "\동래고 교사 시간표.lnk")
oStartLink.TargetPath = "msedge.exe"
oStartLink.Arguments = "--app=""" & strUrl & """"
oStartLink.IconLocation = strIcon & ",0"
oStartLink.Description = "2026학년도 동래고등학교 교사 주간 시간표 & 공강지도 시스템"
oStartLink.WorkingDirectory = strDir
oStartLink.Save