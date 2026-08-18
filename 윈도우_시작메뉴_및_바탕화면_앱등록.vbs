Set oWS = CreateObject("WScript.Shell")
strPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "index.html")
strUrl = "file:///" & Replace(strPath, "\", "/")

' 1. Desktop Shortcut
desktopPath = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(desktopPath & "\동래고 교사 시간표.lnk")
oLink.TargetPath = "msedge.exe"
oLink.Arguments = "--app=""" & strUrl & """"
oLink.Description = "2026학년도 동래고등학교 교사 주간 시간표 & 공강지도 시스템"
oLink.WorkingDirectory = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
oLink.Save

' 2. Start Menu Shortcut
programsPath = oWS.SpecialFolders("Programs")
Set oStartLink = oWS.CreateShortcut(programsPath & "\동래고 교사 시간표.lnk")
oStartLink.TargetPath = "msedge.exe"
oStartLink.Arguments = "--app=""" & strUrl & """"
oStartLink.Description = "2026학년도 동래고등학교 교사 주간 시간표 & 공강지도 시스템"
oStartLink.WorkingDirectory = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
oStartLink.Save

MsgBox "동래고등학교 교사 시간표가 윈도우 시작 메뉴 및 바탕화면에 성공적으로 등록되었습니다!" & vbCrLf & vbCrLf & "이제 윈도우 시작 메뉴나 바탕화면 아이콘을 누르면 단독 앱으로 실행됩니다.", 64, "동래고 시간표 앱 등록 완료"