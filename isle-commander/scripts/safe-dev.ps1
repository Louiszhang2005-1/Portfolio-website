param(
  [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 3000 }),
  [int]$NodeMemoryMb = $(if ($env:DEV_NODE_MEMORY_MB) { [int]$env:DEV_NODE_MEMORY_MB } else { 1536 }),
  [int]$TreeMemoryLimitMb = $(if ($env:DEV_TREE_MEMORY_LIMIT_MB) { [int]$env:DEV_TREE_MEMORY_LIMIT_MB } else { 2300 }),
  [int]$MinimumFreeMemoryMb = $(if ($env:DEV_MIN_FREE_MEMORY_MB) { [int]$env:DEV_MIN_FREE_MEMORY_MB } else { 1500 }),
  [int]$SmokeTestSeconds = $(if ($env:DEV_SMOKE_TEST_SECONDS) { [int]$env:DEV_SMOKE_TEST_SECONDS } else { 0 })
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

function Get-FreeMemoryMb {
  $os = Get-CimInstance Win32_OperatingSystem
  return [int][math]::Round($os.FreePhysicalMemory / 1024)
}

function Get-ProcessTreeIds {
  param([int]$RootProcessId)

  $ids = New-Object System.Collections.Generic.List[int]
  $queue = New-Object System.Collections.Generic.Queue[int]
  $queue.Enqueue($RootProcessId)

  while ($queue.Count -gt 0) {
    $currentId = $queue.Dequeue()
    if ($ids.Contains($currentId)) {
      continue
    }

    $ids.Add($currentId)
    Get-CimInstance Win32_Process -Filter "ParentProcessId = $currentId" |
      ForEach-Object { $queue.Enqueue([int]$_.ProcessId) }
  }

  return $ids.ToArray()
}

function Stop-ProcessTree {
  param([int]$RootProcessId)

  $ids = Get-ProcessTreeIds -RootProcessId $RootProcessId
  [array]::Reverse($ids)

  foreach ($id in $ids) {
    Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
  }
}

function Stop-NodeListenerOnPort {
  param([int]$PortNumber)

  $listeners = Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue
  foreach ($listener in $listeners) {
    $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    if ($null -eq $process) {
      continue
    }

    if ($process.ProcessName -ne "node") {
      throw "Port $PortNumber is already used by $($process.ProcessName) (PID $($process.Id)). Close it or set PORT to another value."
    }

    Write-Host "Stopping old Node dev server on port $PortNumber (PID $($process.Id))..."
    Stop-ProcessTree -RootProcessId $process.Id
  }
}

function Set-NodeMemoryLimit {
  param([int]$MemoryMb)

  $existing = $env:NODE_OPTIONS
  if ($existing) {
    $existing = ($existing -replace "--max-old-space-size=\d+", "").Trim()
  }

  $env:NODE_OPTIONS = "$existing --max-old-space-size=$MemoryMb".Trim()
}

$freeMemory = Get-FreeMemoryMb
if ($freeMemory -lt $MinimumFreeMemoryMb) {
  throw "Only $freeMemory MB RAM is free. Safe dev needs at least $MinimumFreeMemoryMb MB free before starting."
}

$nextBin = Join-Path $ProjectRoot "node_modules\next\dist\bin\next"
if (-not (Test-Path $nextBin)) {
  throw "Next.js is not installed in this workspace. Run npm install from $ProjectRoot first."
}

Stop-NodeListenerOnPort -PortNumber $Port

Set-NodeMemoryLimit -MemoryMb $NodeMemoryMb
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:CHOKIDAR_USEPOLLING = "false"
$env:WATCHPACK_POLLING = "false"

Write-Host "Starting safe Next dev server on http://127.0.0.1:$Port"
Write-Host "Node heap cap: $NodeMemoryMb MB; process tree cap: $TreeMemoryLimitMb MB; stop threshold for free RAM: $MinimumFreeMemoryMb MB"

$arguments = @(
  "`"$nextBin`"",
  "dev",
  "--webpack",
  "--hostname",
  "127.0.0.1",
  "--port",
  "$Port"
)

$devProcess = Start-Process -FilePath "node" -ArgumentList $arguments -WorkingDirectory $ProjectRoot -NoNewWindow -PassThru
$startedAt = Get-Date

try {
  while (-not $devProcess.HasExited) {
    Start-Sleep -Seconds 3

    $processIds = Get-ProcessTreeIds -RootProcessId $devProcess.Id
    $processes = Get-Process -Id $processIds -ErrorAction SilentlyContinue
    $totalBytes = ($processes | Measure-Object -Property PrivateMemorySize64 -Sum).Sum
    $treeMemoryMb = [int][math]::Round($totalBytes / 1MB)
    $freeMemory = Get-FreeMemoryMb

    if ($treeMemoryMb -gt $TreeMemoryLimitMb) {
      Write-Warning "Next dev is using $treeMemoryMb MB, above the $TreeMemoryLimitMb MB safety limit. Stopping it before Windows gets unstable."
      Stop-ProcessTree -RootProcessId $devProcess.Id
      exit 137
    }

    if ($freeMemory -lt $MinimumFreeMemoryMb) {
      Write-Warning "Only $freeMemory MB RAM is free. Stopping Next dev before Windows gets unstable."
      Stop-ProcessTree -RootProcessId $devProcess.Id
      exit 137
    }

    if ($SmokeTestSeconds -gt 0 -and ((Get-Date) - $startedAt).TotalSeconds -ge $SmokeTestSeconds) {
      Write-Host "Smoke test complete. Stopping safe dev server..."
      Stop-ProcessTree -RootProcessId $devProcess.Id
      exit 0
    }
  }

  exit $devProcess.ExitCode
}
finally {
  if ($devProcess -and -not $devProcess.HasExited) {
    Stop-ProcessTree -RootProcessId $devProcess.Id
  }
}
