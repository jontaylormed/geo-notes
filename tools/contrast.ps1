# Color contrast (WCAG 2.1), used by build.ps1 to check every palette pair.

function Get-Luminance([string]$hex) {
  $h = $hex.TrimStart('#')
  $c = foreach ($i in 0, 2, 4) {
    $v = [Convert]::ToInt32($h.Substring($i, 2), 16) / 255
    if ($v -le 0.03928) { $v / 12.92 } else { [math]::Pow(($v + 0.055) / 1.055, 2.4) }
  }
  0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2]
}

function Get-Contrast([string]$fg, [string]$bg) {
  $a = Get-Luminance $fg; $b = Get-Luminance $bg
  ([math]::Max($a, $b) + 0.05) / ([math]::Min($a, $b) + 0.05)
}