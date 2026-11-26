# Builds the hosted Geometric Interactive Notes tool: one self-contained HTML file (no outside
# requests), plus a test page that runs the engine tests in a browser.
# Run:  powershell -ExecutionPolicy Bypass -File build.ps1

$root = $PSScriptRoot
$src = Join-Path $root 'src'
$outDir = $root
$utf8 = New-Object Text.UTF8Encoding $false
. (Join-Path $root 'tools\contrast.ps1')
function Read-Src([string]$name) { [IO.File]::ReadAllText((Join-Path $src $name), $utf8) }

$geom = Read-Src 'geom.js'; $notation = Read-Src 'notation.js'; $algebra = Read-Src 'algebra.js'; $tasks = Read-Src 'tasks.js'
$style = Read-Src 'style.css'; $template = Read-Src 'template.html'
$app = $template.Replace('/*STYLE*/', $style).Replace('/*GEOM*/', $geom).Replace('/*NOTATION*/', $notation).Replace('/*ALGEBRA*/', $algebra).Replace('/*TASKS*/', $tasks).Replace('/*DIAGRAM*/', (Read-Src 'diagram.js')).Replace('/*UI*/', (Read-Src 'ui.js'))

$tests = @"
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Geometric Interactive Notes tests</title></head>
<body style="font-family:system-ui,sans-serif;max-width:900px;margin:16px auto;padding:0 16px;">
<h1 style="font-size:1.3rem;">Geometric Interactive Notes engine tests</h1>
<div id="results">Running...</div>
<style>$style</style>
<svg id="svg" style="display:block;width:342px;max-width:none;" aria-hidden="true"></svg>
<script>$geom</script>
<script>$notation</script>
<script>$algebra</script>
<script>$tasks</script>
<script>$(Read-Src 'diagram.js')</script>
<script>$(Read-Src 'tests.js')</script>
</body></html>
"@

[void](New-Item -ItemType Directory -Force $outDir)
[IO.File]::WriteAllText((Join-Path $outDir 'index.html'), $app, $utf8)
[IO.File]::WriteAllText((Join-Path $outDir 'tests.html'), $tests, $utf8)
"Wrote index.html ($([math]::Round($app.Length / 1KB)) KB) and tests.html"

# The tool must not reach the network or store anything.
$bad = [regex]::Matches($app, 'https?://|fetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.sendBeacon|<link |src="') | ForEach-Object { $_.Value } | Sort-Object -Unique
if ($bad) { "PRIVACY CHECK FAILED: $($bad -join ', ')" } else { 'Privacy check passed: no network, storage, cookies or outside files.' }

# Contrast: text 4.5:1; figure strokes, marks and focus rings 3:1 against the diagram background.
$vars = @{}
foreach ($m in [regex]::Matches($style, '--([\w-]+):\s*(#[0-9a-fA-F]{6})')) { $vars[$m.Groups[1].Value] = $m.Groups[2].Value }
$pairs = @(
  @('text', 'cream', 4.5), @('text', 'card', 4.5), @('text', 'paper', 4.5), @('text', 'panel', 4.5), @('muted', 'card', 4.5), @('muted', 'cream', 4.5)
  @('accent', 'card', 4.5), @('title', 'cream', 4.5), @('heading', 'card', 4.5), @('heading', 'paper', 4.5), @('paper', 'primary', 4.5)
  @('warn', 'warn-bg', 4.5), @('ok', 'ok-bg', 4.5), @('bad', 'bad-bg', 4.5)
  @('figure', 'paper', 3), @('hl', 'paper', 3), @('drawn', 'paper', 3), @('accent', 'paper', 3), @('border', 'paper', 3)
  @('heading', 'plane', 4.5), @('figure', 'plane', 3), @('border', 'plane', 3), @('hl', 'hl-halo', 3), @('heading', 'hl-halo', 4.5), @('text', 'accent-bg', 4.5), @('heading', 'accent-bg', 4.5), @('title', 'accent-bg', 4.5)
)
$contrastFail = @()
foreach ($c in $pairs) {
  $r = Get-Contrast $vars[$c[0]] $vars[$c[1]]
  if ($r -lt $c[2]) { $contrastFail += "--$($c[0]) on --$($c[1]) is $([math]::Round($r, 2)), needs $($c[2])" }
}
if ($contrastFail) { $contrastFail | ForEach-Object { "CONTRAST FAILED: $_" } } else { "Contrast check passed: $($pairs.Count) pairs." }

# Button, summary and heading text: Title Case, and no arrows.
# Built from code points so this file stays ASCII (PowerShell 5.1 misreads other characters).
$mathKeys = '[' + [char]0x2220 + [char]0x2225 + [char]0x22a5 + [char]0xb0 + [char]0x2312 + [char]0x2299 + '=]'
$arrows = '[' + [char]0x2190 + '-' + [char]0x21ff + [char]0xbb + [char]0x203a + ']'
$small = 'a|an|and|as|at|but|by|for|in|of|on|or|the|to|is'
$caseFail = @()
foreach ($m in [regex]::Matches(($template + (Read-Src 'ui.js')), '<(button|summary|h2)[^>]*>([A-Za-z][^<$]*)</')) {
  $text = $m.Groups[2].Value.Trim()
  if ($text -match $mathKeys -or $text -cmatch '^[a-z]$') { continue }   # math keys: m, angle, degree signs, the variable x
  $words = $text -split '\s+'
  for ($i = 0; $i -lt $words.Count; $i++) {
    $w = $words[$i] -replace '[^A-Za-z]', ''
    if (-not $w) { continue }
    if ($i -gt 0 -and $w -cmatch "^($small)$") { continue }
    if ($w -cnotmatch '^[A-Z0-9]') { $caseFail += "'$text'"; break }
  }
  if ($text -match $arrows) { $caseFail += "'$text' has an arrow" }
}
if ($caseFail) { $caseFail | Sort-Object -Unique | ForEach-Object { "TITLE CASE FAILED: $_" } } else { 'Title Case check passed.' }

# PowerShell 5.1 reads scripts saved without a byte-order mark as ANSI, so any character outside
# ASCII in a .ps1 file is silently garbled. Every build script must stay ASCII.
$nonAscii = Get-ChildItem $root, (Join-Path $root 'tools') -Filter *.ps1 |
  Where-Object { [IO.File]::ReadAllBytes($_.FullName) | Where-Object { $_ -gt 127 } | Select-Object -First 1 } | ForEach-Object { $_.Name }
if ($nonAscii) { "ASCII CHECK FAILED: $($nonAscii -join ', ') (use HTML entities or [char] codes)" } else { 'ASCII check passed: every .ps1 file is plain ASCII.' }

if ($bad -or $contrastFail -or $caseFail -or $nonAscii) { exit 1 }
