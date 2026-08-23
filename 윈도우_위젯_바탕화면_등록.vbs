Set oWS = CreateObject("WScript.Shell")
Set oFSO = CreateObject("Scripting.FileSystemObject")

scriptDir = oFSO.GetParentFolderName(WScript.ScriptFullName)
widgetPath = scriptDir & "\widget.html"
iconPath = scriptDir & "\icons\app-icon.ico"

' 1. 바탕화면 바로가기 생성
desktopPath = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(desktopPath & "\🏫 한국고 시간표 위젯.lnk")
oLink.TargetPath = "msedge.exe"
oLink.Arguments = "--app=""file:///" & Replace(widgetPath, "\", "/") & """ --window-size=360,780"
If oFSO.FileExists(iconPath) Then
    oLink.IconLocation = iconPath & ",0"
End If
oLink.Description = "한국고등학교 교사 시간표 윈도우 미니 위젯"
oLink.Save

' 2. 윈도우 시작 메뉴 바로가기 생성
programsPath = oWS.SpecialFolders("Programs")
Set oStartLink = oWS.CreateShortcut(programsPath & "\한국고 시간표 위젯.lnk")
oStartLink.TargetPath = "msedge.exe"
oStartLink.Arguments = "--app=""file:///" & Replace(widgetPath, "\", "/") & """ --window-size=360,620"
If oFSO.FileExists(iconPath) Then
    oStartLink.IconLocation = iconPath & ",0"
End If
oStartLink.Description = "한국고등학교 교사 시간표 윈도우 미니 위젯"
oStartLink.Save

MsgBox "한국고 시간표 바탕화면 위젯이 바탕화면 및 시작 메뉴에 등록되었습니다!" & vbCrLf & vbCrLf & "바탕화면의 [🏫 한국고 시간표 위젯] 아이콘을 더블클릭하시면 컴팩트한 미니 위젯으로 실행됩니다.", 64, "위젯 등록 완료"
