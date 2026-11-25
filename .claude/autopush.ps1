# Auto-sync: pull the latest from GitHub, commit any local changes, push.
# Run by the Claude Code "Stop" hook after each reply (see .claude/settings.json).
# Never fails loudly: it must not block Claude.
$ErrorActionPreference = 'Continue'
$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) { $git = 'C:\Program Files\Git\cmd\git.exe' }
if (-not (Test-Path $git)) { Write-Output 'autopush: git not found, skipped'; exit 0 }
Set-Location (Split-Path -Parent $PSScriptRoot)
& $git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) { exit 0 }

& $git add -A
& $git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  & $git commit -q -m "Update $stamp (auto-sync from $env:COMPUTERNAME)"
}
# bring in changes made on another device, then push
& $git pull --rebase --autostash -q 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { & $git rebase --abort 2>&1 | Out-Null; Write-Output 'autopush: pull had conflicts, resolve manually; not pushed'; exit 0 }
& $git push -q origin HEAD 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Output 'autopush: synced with GitHub' } else { Write-Output 'autopush: push failed (sign in to GitHub?)' }
exit 0
