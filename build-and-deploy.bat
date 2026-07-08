@echo off
cd /d "%~dp0"
echo Compilando frontend para PocketBase local...
call npx tsc -b
if %errorlevel% neq 0 (
  echo Error en TypeScript.
  pause
  exit /b %errorlevel%
)
call npx vite build --base=/
if %errorlevel% neq 0 (
  echo Error en build.
  pause
  exit /b %errorlevel%
)

echo Copiando a pocketbase/pb_public/...
if exist pocketbase\pb_public (
  rmdir /S /Q pocketbase\pb_public
)
mkdir pocketbase\pb_public
xcopy /E /Y /I dist\* pocketbase\pb_public\

echo ✅ Listo. Frontend desplegado a pocketbase/pb_public/
pause