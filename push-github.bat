@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在提交代码到GitHub...

git config user.name "bengbeng9518"
git config user.email "your-email@example.com"

git branch -M main

git remote remove origin 2>nul
git remote add origin https://github.com/bengbeng9518/ai-risk-assessment.git

git commit -m "first commit - AI职业风险评估系统"

echo.
echo 正在推送到GitHub...
git push -u origin main

echo.
echo 完成！
pause
