@echo off
setlocal
set ROOT_DIR=%~dp0..\..\..\..
set VSROOT_DIR=%~dp0..\..
start "Open Browser" /B "%ROOT_DIR%\node.exe" "%VSROOT_DIR%\out\server-cli.js" "code-server" "1.96.2" "08cbdfbdf11925e8a14ee03de97b942bba7e8a94" "code-server.cmd" "--openExternal" "%*"
endlocal
